
import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlanConfig, Quiz } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * EduAssistant Chat Service
 * Provides a specialized chat interface for the educational assistant.
 */
export const chatWithEduAssistant = async (message: string, history: {role: string, parts: {text: string}[]}[], userRole: 'teacher' | 'student' | null) => {
  const model = "gemini-3-flash-preview";
  
  const roleInstruction = userRole === 'teacher' 
    ? "The user is a TEACHER. Focus on curriculum standards, lesson efficiency, creative classroom activities, and professional pedagogical support."
    : "The user is a STUDENT. Focus on tutoring, explaining complex concepts simply, study techniques, and encouraging academic growth.";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `You are EduAssistant, a brilliant and friendly AI assistant for EduPilot. 
        Your goal is to help users navigate the app and assist with educational tasks. 
        ${roleInstruction}
        Be concise, encouraging, and witty. Always maintain a professional yet approachable educational tone.`,
      }
    });

    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("EduAssistant Error:", error);
    throw error;
  }
};

/**
 * Generates a lesson plan stream based on teacher inputs.
 */
export const streamLessonPlan = async (
  config: LessonPlanConfig,
  onChunk: (text: string) => void
) => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Create a comprehensive lesson plan for a ${config.gradeLevel} ${config.subject} class.
    Topic: ${config.topic}
    Duration: ${config.duration}
    Focus Area: ${config.focus}

    Structure the lesson plan with the following sections using Markdown:
    1. Lesson Objectives
    2. Materials Needed
    3. Warm-up Activity
    4. Main Instruction
    5. Guided Practice
    6. Assessment/Wrap-up
    
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
  const model = "gemini-3-flash-preview";

  const schema = {
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
  const model = "gemini-2.5-flash-image"; 

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || "image/png";
          return `data:${mimeType};base64,${part.inlineData.data}`;
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
  const model = "gemini-3-flash-preview";
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
 * Grades a student's answer sheet from an image scan.
 */
export const gradeAnswerSheet = async (
  studentImage: { dataUri: string, mimeType: string },
  assignmentContext: string,
  answerKey?: { dataUri: string, mimeType: string }
): Promise<string> => {
  const model = "gemini-3-flash-preview";
  
  const promptText = `
    You are an expert teacher's assistant helping to grade a student's physical answer sheet.
    Evaluate the student's answers against the context provided.
    Output in clean Markdown.
  `;

  try {
    const parts: any[] = [];

    if (answerKey) {
      const keyBase64 = answerKey.dataUri.split(',')[1];
      parts.push({ inlineData: { mimeType: answerKey.mimeType, data: keyBase64 } });
      parts.push({ text: "Above is the Answer Key Document." });
    }

    const studentBase64 = studentImage.dataUri.split(',')[1];
    parts.push({ inlineData: { mimeType: studentImage.mimeType, data: studentBase64 } });
    parts.push({ text: "Above is the Student Submission." });
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
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze the following text for plagiarism.
    Text to analyze: "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title || "Web Source"
      }));

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
 * Compares two student assignments.
 */
export const compareAssignments = async (text1: string, text2: string) => {
  const model = "gemini-3-flash-preview";
  const prompt = `Compare the following two student submissions for plagiarism. Output in Markdown.`;

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

/**
 * Summarizes text for study purposes.
 */
export const summarizeText = async (text: string): Promise<string> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Summarize the following text for a student. Bullet points and Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Could not summarize text.";
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw error;
  }
};
