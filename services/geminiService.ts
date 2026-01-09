
import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlanConfig, Quiz } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * EduAssistant Chat Service
 * Upgraded to Gemini 3 Pro for advanced educational reasoning.
 */
export const chatWithEduAssistant = async (message: string, history: {role: string, parts: {text: string}[]}[], userRole: 'teacher' | 'student' | null) => {
  const model = "gemini-3-pro-preview"; 
  
  const roleInstruction = userRole === 'teacher' 
    ? "The user is a TEACHER. Focus on curriculum standards, pedagogy, and lesson optimization."
    : "The user is a STUDENT. Focus on concept mastery, study techniques, and active recall.";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `You are EduPilot Pro, an elite academic reasoning engine. 
        You provide deep, intellectually rigorous support. 
        ${roleInstruction}
        Format output using elegant Markdown.`,
        thinkingConfig: { thinkingBudget: 16000 } // Maximum reasoning power
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
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    Synthesize an elite instructional plan for a ${config.gradeLevel} ${config.subject} session.
    Topic: ${config.topic}
    Focus: ${config.focus}
    Duration: ${config.duration}

    Deliver a highly structured, standards-aligned response.
  `;

  try {
    const response = await ai.models.generateContentStream({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a master curriculum engineer. Use deep pedagogical reasoning.",
        thinkingConfig: { thinkingBudget: 8000 }
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
      title: { type: Type.STRING },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
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
      contents: `Create a ${count}-question high-rigor quiz for "${topic}".`,
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
      contents: { parts: [{ text: `A high-detail educational diagram/illustration: ${prompt}` }] },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Checks homework submission.
 */
export const checkHomework = async (assignment: string, studentWork: string): Promise<string> => {
  const model = "gemini-3-pro-preview";
  const prompt = `Grade this work rigorously:\n\nAssignment: ${assignment}\n\nStudent: ${studentWork}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { 
        thinkingConfig: { thinkingBudget: 8000 } 
      }
    });
    return response.text || "Feedback unavailable.";
  } catch (error) {
    console.error("Error checking homework:", error);
    throw error;
  }
};

/**
 * Grades an uploaded answer sheet against optional context and answer key.
 */
export const gradeAnswerSheet = async (
  studentWork: { dataUri: string, mimeType: string },
  assignmentContext: string,
  answerKey?: { dataUri: string, mimeType: string }
): Promise<string> => {
  const model = "gemini-3-pro-preview";

  const parts: any[] = [
    { text: `Grade this student's work. Context: ${assignmentContext || 'No specific context provided.'}` },
    {
      inlineData: {
        data: studentWork.dataUri.includes(',') ? studentWork.dataUri.split(',')[1] : studentWork.dataUri,
        mimeType: studentWork.mimeType
      }
    }
  ];

  if (answerKey) {
    parts.push({ text: "Reference this answer key to grade accurately:" });
    parts.push({
      inlineData: {
        data: answerKey.dataUri.includes(',') ? answerKey.dataUri.split(',')[1] : answerKey.dataUri,
        mimeType: answerKey.mimeType
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction: "You are a professional academic evaluator. Provide a rigorous grade and constructive feedback in Markdown format.",
        thinkingConfig: { thinkingBudget: 8000 }
      }
    });
    return response.text || "Analysis complete, but no text was returned.";
  } catch (error) {
    console.error("Error in gradeAnswerSheet:", error);
    throw error;
  }
};

/**
 * Checks text for plagiarism.
 */
export const checkPlagiarism = async (text: string) => {
  const model = "gemini-3-flash-preview";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Scan this text for originality: "${text}"`,
      config: { tools: [{ googleSearch: {} }] },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title || "Web Source"
      }));

    return {
      analysis: response.text || "Scan complete.",
      sources: sources as { uri: string, title: string }[]
    };
  } catch (error) {
    console.error("Error checking plagiarism:", error);
    throw error;
  }
};

/**
 * Compares two student assignments for similarity.
 */
export const compareAssignments = async (textA: string, textB: string): Promise<string> => {
  const model = "gemini-3-pro-preview";
  const prompt = `Compare these two submissions for academic integrity. Identify similarities, potential collusion, and provide a final verdict.\n\nSubmission 1:\n${textA}\n\nSubmission 2:\n${textB}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are an academic integrity officer. Detect collusion or plagiarism between these two texts.",
        thinkingConfig: { thinkingBudget: 8000 }
      }
    });
    return response.text || "Comparison complete, but no text was returned.";
  } catch (error) {
    console.error("Error in compareAssignments:", error);
    throw error;
  }
};

/**
 * Summarizes text for study purposes.
 */
export const summarizeText = async (text: string): Promise<string> => {
  const model = "gemini-3-pro-preview";
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Deeply summarize this material for a scholar:\n\n${text}`,
      config: { thinkingConfig: { thinkingBudget: 8000 } }
    });
    return response.text || "Summary unavailable.";
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw error;
  }
};
