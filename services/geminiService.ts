import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LessonPlanConfig, Quiz } from "../types";

// Initialize the client
// CRITICAL: process.env.API_KEY is handled by the environment, do not ask user for it.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a lesson plan stream based on teacher inputs.
 */
export const streamLessonPlan = async (
  config: LessonPlanConfig,
  onChunk: (text: string) => void
) => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Create a comprehensive lesson plan for a ${config.gradeLevel} ${config.subject} class.
    Topic: ${config.topic}
    Duration: ${config.duration}
    Focus Area: ${config.focus}

    Structure the lesson plan with the following sections using Markdown:
    1. Lesson Objectives
    2. Materials Needed
    3. Warm-up Activity (${Math.floor(parseInt(config.duration || '60') * 0.15)} min)
    4. Main Instruction (${Math.floor(parseInt(config.duration || '60') * 0.4)} min)
    5. Guided Practice (${Math.floor(parseInt(config.duration || '60') * 0.25)} min)
    6. Assessment/Wrap-up (${Math.floor(parseInt(config.duration || '60') * 0.2)} min)
    
    Make it engaging, practical, and clear.
  `;

  try {
    const response = await ai.models.generateContentStream({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert educational consultant and curriculum developer specializing in creating engaging, standards-aligned lesson plans.",
      },
    });

    for await (const chunk of response) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Error streaming lesson plan:", error);
    throw error;
  }
};

/**
 * Generates a structured quiz in JSON format.
 */
export const generateQuiz = async (topic: string, grade: string, count: number): Promise<Quiz> => {
  const model = "gemini-2.5-flash";

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A creative title for the quiz" },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of 4 possible answers" 
            },
            correctAnswer: { type: Type.STRING, description: "The exact string match of the correct option" },
            explanation: { type: Type.STRING, description: "Brief explanation of why this answer is correct" }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    },
    required: ["title", "questions"]
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Create a ${count}-question multiple choice quiz about "${topic}" for ${grade} students.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as Quiz;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};

/**
 * Generates a visual aid image for the classroom.
 */
export const generateVisualAid = async (prompt: string): Promise<string> => {
  // Using the image generation model
  const model = "gemini-2.5-flash-image"; 

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        // Nano banana models do not support responseMimeType or responseSchema
        // The aspect ratio defaults to 1:1, let's keep it simple.
      }
    });

    // Iterate to find the image part
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Checks homework submission against an assignment description (Text based).
 */
export const checkHomework = async (assignment: string, studentWork: string): Promise<string> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    You are a helpful teacher's assistant.
    
    Assignment/Question:
    ${assignment}
    
    Student Submission:
    ${studentWork}
    
    Please grade this submission. Provide:
    1. A brief summary of the work.
    2. Strengths.
    3. Areas for improvement.
    4. An estimated grade (A-F) or score (0-100) based on quality.
    
    Keep the tone encouraging but constructive. Format with Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Could not generate feedback.";
  } catch (error) {
    console.error("Error checking homework:", error);
    throw error;
  }
};

/**
 * Grades a student's answer sheet from an image scan, optionally comparing against an answer key file.
 */
export const gradeAnswerSheet = async (
  studentImage: { dataUri: string, mimeType: string },
  assignmentContext: string,
  answerKey?: { dataUri: string, mimeType: string }
): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const promptText = `
    You are an expert teacher's assistant helping to grade a student's physical answer sheet.
    
    Assignment Context / Notes:
    ${assignmentContext}
    
    Instructions:
    1. If an 'Answer Key' document is provided, use it as the ground truth.
    2. Transcribe the handwritten text found in the 'Student Submission' image to verify legibility (briefly).
    3. Evaluate the student's answers against the Answer Key (if provided) or general knowledge (if not).
    4. Check for spelling, grammar, and key concepts.
    5. Assign a grade (e.g., A-F or 0-100).
    6. Provide constructive feedback.
    
    Output in clean Markdown.
  `;

  try {
    const parts: any[] = [];

    // 1. Add Answer Key if provided (PDF or Image)
    if (answerKey) {
      const keyBase64 = answerKey.dataUri.split(',')[1];
      parts.push({
        inlineData: {
          mimeType: answerKey.mimeType,
          data: keyBase64
        }
      });
      parts.push({ text: "Above is the Answer Key Document." });
    }

    // 2. Add Student Submission (Image)
    const studentBase64 = studentImage.dataUri.split(',')[1];
    parts.push({
      inlineData: {
        mimeType: studentImage.mimeType,
        data: studentBase64
      }
    });
    parts.push({ text: "Above is the Student Submission." });

    // 3. Add Prompt Text
    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model,
      contents: { parts }
    });
    
    return response.text || "Could not analyze the submission.";
  } catch (error) {
    console.error("Error grading answer sheet:", error);
    throw error;
  }
};

/**
 * Checks text for plagiarism using Google Search grounding.
 */
export const checkPlagiarism = async (text: string) => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Analyze the following text for plagiarism.
    
    Text to analyze:
    "${text}"

    Tasks:
    1. Search the internet to see if this text or significant parts of it appear online.
    2. Provide a "Plagiarism Risk Score" (Low, Medium, High) based on how much content matches online sources.
    3. Briefly summarize the findings.
    4. If the text seems original, explicitly state that.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title || "Web Source"
      }));

    // Remove duplicates based on URI
    const uniqueSources = Array.from(new Map(sources.map((item: any) => [item.uri, item])).values());

    return {
      analysis: response.text || "Analysis complete.",
      sources: uniqueSources as { uri: string, title: string }[]
    };
  } catch (error) {
    console.error("Error checking plagiarism:", error);
    throw error;
  }
};

/**
 * Compares two student assignments to check for peer plagiarism/duplication.
 */
export const compareAssignments = async (text1: string, text2: string) => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Compare the following two student submissions for plagiarism or excessive collaboration.

    Student A Submission:
    ${text1}

    Student B Submission:
    ${text2}

    Task:
    1. Identify similarities in phrasing, structure, and specific errors.
    2. Determine a "Similarity Score" (0-100%).
    3. Conclude whether this looks like independent work, collaboration, or direct copying.
    
    Output in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Could not compare assignments.";
  } catch (error) {
    console.error("Error comparing assignments:", error);
    throw error;
  }
};