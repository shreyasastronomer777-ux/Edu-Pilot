
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonPlanConfig, Quiz } from "../types";

// Helper to get client to avoid top-level initialization issues
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const solveDoubt = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const model = "gemini-3-pro-preview";
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          { text: "Analyze this academic material (Math, Science, or Literature). Solve the primary problem or question shown step-by-step with high rigor. Explain the underlying concepts clearly. Format the output with elegant Markdown." }
        ]
      },
      config: { 
        thinkingConfig: { thinkingBudget: 16000 },
        systemInstruction: "You are an elite academic tutor. Your goal is to not just give answers, but to foster deep understanding."
      }
    });

    return response.text || "Neural analysis failed to generate a solution.";
  } catch (error) {
    console.error("Doubt Solver Error:", error);
    throw error;
  }
};

export const generateRevisionInsights = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const model = "gemini-3-pro-preview";
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          { text: "Perform an academic autopsy on this material. Your output MUST follow this structure: \n\n1. ## 📖 Core Definitions\nList every technical term or key concept with a bold definition.\n\n2. ## 🎯 Important Points\nProvide a bulleted list of the most critical concepts, theories, or facts required for an exam.\n\n3. ## 💡 Quick Summary\nA high-level overview of the material's significance. Use elegant Markdown for perfect readability." }
        ]
      },
      config: { 
        thinkingConfig: { thinkingBudget: 16000 },
        systemInstruction: "You are a master academic summarizer. Your mission is to extract the absolute essence of definitions and critical points to facilitate rapid student revision."
      }
    });

    return response.text || "Neural analysis failed to generate revision material.";
  } catch (error) {
    console.error("Revision Error:", error);
    throw error;
  }
};

export const chatWithEduAssistant = async (message: string, history: {role: string, parts: {text: string}[]}[], userRole: 'teacher' | 'student' | null) => {
  const ai = getAI();
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
        thinkingConfig: { thinkingBudget: 16000 }
      }
    });

    return response.text || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("EduAssistant Error:", error);
    throw error;
  }
};

export const convertNotesToFlashcards = async (notes: string): Promise<{front: string, back: string}[]> => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        front: { type: Type.STRING },
        back: { type: Type.STRING }
      },
      required: ["front", "back"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Transform these academic notes into high-impact active recall flashcards:\n\n${notes}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
    return JSON.parse(response.text!) as {front: string, back: string}[];
  } catch (error) {
    console.error("Flashcard Gen Error:", error);
    throw error;
  }
};

export const convertAssetToFlashcards = async (base64Data: string, mimeType: string): Promise<{front: string, back: string}[]> => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        front: { type: Type.STRING },
        back: { type: Type.STRING }
      },
      required: ["front", "back"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType, data: cleanBase64 } },
          { text: "Transform the academic content in this file into high-impact active recall flashcards. Focus on key definitions, equations, and critical concepts." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });
    return JSON.parse(response.text!) as {front: string, back: string}[];
  } catch (error) {
    console.error("Asset Flashcard Gen Error:", error);
    throw error;
  }
};

export const streamLessonPlan = async (
  config: LessonPlanConfig,
  onChunk: (text: string) => void
) => {
  const ai = getAI();
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    Synthesize an elite instructional plan for a ${config.gradeLevel} ${config.subject} session.
    Topic: ${config.topic}
    Focus: ${config.focus}
    Duration: ${config.duration}
    Curriculum Standard: ${config.standard || 'General Excellence'}
    Class Proficiency Level: ${config.proficiencyLevel || 'Standard'}

    Deliver a highly structured, standards-aligned response including objectives, materials, and a step-by-step breakdown.
  `;

  try {
    const response = await ai.models.generateContentStream({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a master curriculum engineer. Use deep pedagogical reasoning and ensure standard alignment.",
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

export const generateQuizFromSource = async (
  source: { type: 'text' | 'file' | 'url', data: string, mimeType?: string },
  count: number = 10
): Promise<Quiz> => {
  const ai = getAI();
  const model = "gemini-3-pro-preview";

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

  const parts: any[] = [];
  const cleanData = source.data.includes(',') ? source.data.split(',')[1] : source.data;

  if (source.type === 'text') {
    parts.push({ text: `Generate a ${count}-question high-rigor MCQ quiz based on this topic/context: ${source.data}` });
  } else if (source.type === 'file') {
    parts.push({ text: `Analyze the attached document and generate a ${count}-question MCQ quiz.` });
    parts.push({
      inlineData: {
        data: cleanData,
        mimeType: source.mimeType
      }
    });
  } else if (source.type === 'url') {
    parts.push({ text: `Generate a ${count}-question high-rigor MCQ quiz based on the content found at this YouTube/URL link: ${source.data}. Use Google Search tools to verify video content.` });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        tools: source.type === 'url' ? [{ googleSearch: {} }] : undefined
      },
    });

    return JSON.parse(response.text!) as Quiz;
  } catch (error) {
    console.error("Quiz Gen Error:", error);
    throw error;
  }
};

// Added missing generateQuiz function to support student practice mode
export const generateQuiz = async (topic: string, level: string = 'Standard', count: number = 5): Promise<Quiz> => {
  return generateQuizFromSource({ type: 'text', data: `${topic} (Target Audience: ${level})` }, count);
};

export const generateVisualAid = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const model = "gemini-2.5-flash-image"; 
  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: `A high-detail educational diagram/illustration: ${prompt}` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const checkHomework = async (assignment: string, studentWork: string): Promise<string> => {
  const ai = getAI();
  const model = "gemini-3-pro-preview";
  const prompt = `Grade this work rigorously. Focus on handwriting analysis if scan provided:\n\nAssignment: ${assignment}\n\nStudent: ${studentWork}`;
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 8000 } }
    });
    return response.text || "Feedback unavailable.";
  } catch (error) {
    console.error("Error checking homework:", error);
    throw error;
  }
};

export const gradeAnswerSheet = async (
  studentWork: { dataUri: string, mimeType: string },
  assignmentContext: string,
  answerKey?: { dataUri: string, mimeType: string }
): Promise<string> => {
  const ai = getAI();
  const model = "gemini-3-pro-preview";
  const parts: any[] = [
    { text: `Grade this student's work. Focus on OCR/Handwriting extraction. Context: ${assignmentContext || 'No specific context provided.'}` },
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
        systemInstruction: "You are a professional academic evaluator specializing in OCR and handwriting analysis. Provide a rigorous grade and constructive feedback in Markdown format.",
        thinkingConfig: { thinkingBudget: 8000 }
      }
    });
    return response.text || "Analysis complete.";
  } catch (error) {
    console.error("Error in gradeAnswerSheet:", error);
    throw error;
  }
};

export const checkPlagiarism = async (text: string) => {
  const ai = getAI();
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
      .map((chunk: any) => ({ uri: chunk.web.uri, title: chunk.web.title || "Web Source" }));
    return {
      analysis: response.text || "Scan complete.",
      sources: sources as { uri: string, title: string }[]
    };
  } catch (error) {
    console.error("Error checking plagiarism:", error);
    throw error;
  }
};

export const compareAssignments = async (textA: string, textB: string): Promise<string> => {
  const ai = getAI();
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
    return response.text || "Comparison complete.";
  } catch (error) {
    console.error("Error in compareAssignments:", error);
    throw error;
  }
};

export const summarizeText = async (text: string): Promise<string> => {
  const ai = getAI();
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

export const summarizeAudioLecture = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const model = "gemini-3-pro-preview";
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          { text: "Analyze this academic lecture recording. Provide a comprehensive summary with key concepts, definitions, and critical takeaways in elegant Markdown." }
        ]
      },
      config: { 
        thinkingConfig: { thinkingBudget: 16000 },
        systemInstruction: "You are an elite academic scribe. Your mission is to synthesize lectures into high-rigor notes."
      }
    });

    return response.text || "Neural analysis failed to generate a summary.";
  } catch (error) {
    console.error("Audio Summary Error:", error);
    throw error;
  }
};

export const generateAudioBriefing = async (content: string): Promise<{ audioBase64: string, script: string }> => {
  const ai = getAI();
  
  // First generate a script
  const scriptResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a professional, engaging podcast-style audio briefing script (approx 1 minute) based on the following academic notes. Start with a warm greeting from the SVGPT Neural Core. Focus on clarity and high-level insights. Notes:\n\n${content}`,
    config: { systemInstruction: "You are an elite academic news anchor. Speak clearly and intelligently." }
  });
  const script = scriptResponse.text || "Welcome to your SVGPT briefing.";

  // Then convert script to speech
  const ttsResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: script }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const audioBase64 = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioBase64) throw new Error("TTS failed");

  return { audioBase64, script };
};
