import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonPlanConfig, Quiz, SlideDeck, BrainBreak } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Neural Link Offline: Gemini API Key not found.");
  }
  return new GoogleGenAI({ apiKey });
};

export const solveDoubt = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { mimeType, data: cleanBase64 } },
          { text: "Analyze this academic material. Solve the problem shown step-by-step with high rigor. Explain concepts clearly using Markdown." }
        ]
      },
      config: { 
        thinkingConfig: { thinkingBudget: 16000 },
        maxOutputTokens: 20000,
        systemInstruction: "You are an elite academic tutor."
      }
    });
    return response.text || "Synthesis failed.";
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const generateRevisionInsights = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { mimeType, data: cleanBase64 } },
          { text: "Perform an academic autopsy. Extract: 1. Core Definitions, 2. Important Points, 3. Quick Summary. Format elegantly with Markdown." }
        ]
      },
      config: { 
        thinkingConfig: { thinkingBudget: 16000 },
        maxOutputTokens: 20000,
        systemInstruction: "You are a master academic summarizer."
      }
    });
    return response.text || "Neural analysis failed.";
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const chatWithEduAssistant = async (message: string, history: any[], userRole: 'teacher' | 'student' | null) => {
  const ai = getAI();
  const roleInstruction = userRole === 'teacher' 
    ? "The user is an EDUCATOR. Focus on pedagogical excellence, lesson architecting, and curriculum standards."
    : "The user is a SCHOLAR. Focus on cognitive mastery, active recall strategies, and deconstructing complex theories.";
  
  // Strict history cleaning for Gemini API requirements:
  // 1. Must alternate User/Model.
  // 2. Must start with 'user'.
  const validHistory = history
    .filter(m => m.parts && m.parts[0]?.text)
    .map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: m.parts
    }));

  // If first turn is 'model' (like the greeting), remove it so history starts with 'user'
  const finalHistory = validHistory.length > 0 && validHistory[0].role === 'model' ? validHistory.slice(1) : validHistory;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: [...finalHistory, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: `You are EduPilot Pro, an elite academic intelligence. You provide concise, high-rigor assistance. ${roleInstruction}`,
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 2500,
        temperature: 0.7
      }
    });
    return response.text || "Neural link weak. Retrying transmission...";
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};

export const convertNotesToFlashcards = async (notes: string): Promise<{front: string, back: string}[]> => {
  const ai = getAI();
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: { front: { type: Type.STRING }, back: { type: Type.STRING } },
      required: ["front", "back"]
    }
  };
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Transform these academic notes into high-impact flashcards:\n\n${notes}`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text!) as {front: string, back: string}[];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const convertAssetToFlashcards = async (base64Data: string, mimeType: string): Promise<{front: string, back: string}[]> => {
  const ai = getAI();
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: { front: { type: Type.STRING }, back: { type: Type.STRING } },
      required: ["front", "back"]
    }
  };
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType, data: cleanBase64 } },
          { text: "Synthesize active recall flashcards from this academic asset." }
        ]
      },
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text!) as {front: string, back: string}[];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const streamLessonPlan = async (config: LessonPlanConfig, onChunk: (text: string) => void) => {
  const ai = getAI();
  const prompt = `Synthesize a high-rigor ${config.gradeLevel} ${config.subject} plan on: ${config.topic}. Standard: ${config.standard}. Focus: ${config.focus}.`;
  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a master curriculum engineer.",
        thinkingConfig: { thinkingBudget: 8000 },
        maxOutputTokens: 12000
      },
    });
    for await (const chunk of response) {
      if (chunk.text) onChunk(chunk.text);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const generateQuizFromSource = async (source: any, count: number = 10): Promise<Quiz> => {
  const ai = getAI();
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
  if (source.type === 'text') parts.push({ text: `Generate a ${count}-question quiz: ${source.data}` });
  else if (source.type === 'file') {
    const cleanData = source.data.includes(',') ? source.data.split(',')[1] : source.data;
    parts.push({ text: `Generate a ${count}-question quiz from this doc.` });
    parts.push({ inlineData: { data: cleanData, mimeType: source.mimeType } });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts },
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text!) as Quiz;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const generateSlidesFromLesson = async (lessonText: string): Promise<SlideDeck> => {
  const ai = getAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      slides: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.ARRAY, items: { type: Type.STRING } },
            visualPrompt: { type: Type.STRING }
          },
          required: ["title", "content", "visualPrompt"]
        }
      }
    },
    required: ["title", "slides"]
  };
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Transform this lesson into a 6-slide deck with visual prompts: ${lessonText}`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text!) as SlideDeck;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const generateBrainBreak = async (lessonText: string): Promise<BrainBreak> => {
  const ai = getAI();
  const schema = {
    type: Type.OBJECT,
    properties: {
      activityName: { type: Type.STRING },
      duration: { type: Type.STRING },
      instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
      pedagogicalBenefit: { type: Type.STRING }
    },
    required: ["activityName", "duration", "instructions", "pedagogicalBenefit"]
  };
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a 2-min activity script for: ${lessonText}`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text!) as BrainBreak;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const generateQuiz = async (topic: string, level: string = 'Standard', count: number = 5): Promise<Quiz> => {
  return generateQuizFromSource({ type: 'text', data: `${topic} (${level})` }, count);
};

export const generateVisualAid = async (prompt: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: [{ text: `High-fidelity educational illustration: ${prompt}` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    throw new Error("Image failed.");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const checkHomework = async (assignment: string, studentWork: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Grade this submission against assignment:\n\nAssign: ${assignment}\n\nWork: ${studentWork}`,
      config: { thinkingConfig: { thinkingBudget: 8000 }, maxOutputTokens: 12000 }
    });
    return response.text || "No feedback.";
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const gradeAnswerSheet = async (studentWork: any, assignmentContext: string, answerKey?: any): Promise<string> => {
  const ai = getAI();
  const parts: any[] = [
    { text: `Grade OCR submission. Context: ${assignmentContext}` },
    { inlineData: { data: studentWork.dataUri.split(',')[1], mimeType: studentWork.mimeType } }
  ];
  if (answerKey) parts.push({ inlineData: { data: answerKey.dataUri.split(',')[1], mimeType: answerKey.mimeType } });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts },
      config: { thinkingConfig: { thinkingBudget: 8000 }, maxOutputTokens: 12000 }
    });
    return response.text || "Scan failed.";
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const checkPlagiarism = async (text: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Verify originality: "${text}"`,
      config: { tools: [{ googleSearch: {} }] },
    });
    const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
      .filter((c: any) => c.web?.uri)
      .map((c: any) => ({ uri: c.web.uri, title: c.web.title || "Source" }));
    return { analysis: response.text || "No matches.", sources };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Fix: studentTextB was used instead of textB
export const compareAssignments = async (textA: string, textB: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [{ text: `Detect collusion:\n\nStudent A: ${textA}\n\nStudent B: ${textB}` }]
      },
      config: { thinkingConfig: { thinkingBudget: 8000 }, maxOutputTokens: 12000 }
    });
    return response.text || "Comparison complete.";
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const summarizeText = async (text: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Summarize: ${text}`,
      config: { thinkingConfig: { thinkingBudget: 8000 }, maxOutputTokens: 12000 }
    });
    return response.text || "Synthesis failed.";
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const summarizeAudioLecture = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const cleanBase64 = base64Data.split(',')[1];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { mimeType, data: cleanBase64 } },
          { text: "Synthesize a comprehensive summary from this audio lecture." }
        ]
      },
      config: { thinkingConfig: { thinkingBudget: 16000 }, maxOutputTokens: 20000 }
    });
    return response.text || "Audio analysis failed.";
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const generateAudioBriefing = async (content: string): Promise<{ audioBase64: string, script: string }> => {
  const ai = getAI();
  const scriptRes = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a professional 1-minute podcast script from: ${content}`,
    config: { systemInstruction: "You are an elite academic news anchor." }
  });
  const script = scriptRes.text || "Welcome back.";
  const ttsRes = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: script }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });
  const audioBase64 = ttsRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioBase64) throw new Error("TTS failed.");
  return { audioBase64, script };
};