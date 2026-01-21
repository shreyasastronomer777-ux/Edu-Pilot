
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonPlanConfig, Quiz, SlideDeck, BrainBreak, Role } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Neural Link Offline: API_KEY environment variable is not defined.");
  }
  return new GoogleGenAI({ apiKey });
};

export const solveDoubt = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        { inlineData: { mimeType, data: cleanBase64 } },
        { text: "Analyze this academic material. Solve the problem shown step-by-step with high rigor. Explain concepts clearly using Markdown." }
      ],
      config: { 
        thinkingConfig: { thinkingBudget: 16000 },
        systemInstruction: "You are an elite academic tutor powered by the SVGPT Neural Core. Your responses should be formatted in clean Markdown."
      }
    });
    return response.text || "Synthesis failed to produce content.";
  } catch (error) {
    console.error("Solver Failure:", error);
    throw error;
  }
};

export const generateRevisionInsights = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        { inlineData: { mimeType, data: cleanBase64 } },
        { text: "Perform an academic autopsy. Extract: 1. Core Definitions, 2. Important Points, 3. Quick Summary. Format elegantly with Markdown." }
      ],
      config: { 
        thinkingConfig: { thinkingBudget: 16000 },
        systemInstruction: "You are a master academic summarizer within the SVGPT ecosystem. Focus on density and clarity."
      }
    });
    return response.text || "Neural analysis failed.";
  } catch (error) {
    console.error("Revision Insight Failure:", error);
    throw error;
  }
};

/**
 * Enhanced chat assistant with strict history normalization to prevent RPC 500 errors.
 * Ensures roles alternate strictly: user -> model -> user.
 */
export const chatWithEduAssistant = async (message: string, history: any[], userRole: Role | null) => {
  const ai = getAI();
  let roleInstruction = "";
  
  if (userRole === 'teacher') {
    roleInstruction = "The user is an EDUCATOR. Focus on pedagogical excellence, lesson architecting, and curriculum standards.";
  } else if (userRole === 'student') {
    roleInstruction = "The user is a SCHOLAR. Focus on cognitive mastery, active recall strategies, and deconstructing complex theories.";
  } else if (userRole === 'parent') {
    roleInstruction = "The user is a PARENT/GUARDIAN. Focus on monitoring student progress, analyzing behavioral metrics, and home-school coordination.";
  } else if (userRole === 'admin') {
    roleInstruction = "The user is a SCHOOL ADMINISTRATOR. Focus on institutional oversight, academic policy, and high-level school analytics.";
  } else {
    roleInstruction = "Focus on general academic support and helpful information.";
  }
  
  // Normalize history to satisfy strict alternating role requirement
  const normalizedHistory: { role: string; parts: { text: string }[] }[] = [];
  const validHistory = history.filter(m => m.parts && m.parts[0]?.text?.trim());

  for (const msg of validHistory) {
    const role = msg.role === 'bot' || msg.role === 'model' ? 'model' : 'user';
    
    // If the role is same as the previous, merge the parts to maintain alternation
    if (normalizedHistory.length > 0 && normalizedHistory[normalizedHistory.length - 1].role === role) {
      normalizedHistory[normalizedHistory.length - 1].parts[0].text += `\n\n${msg.parts[0].text}`;
    } else {
      normalizedHistory.push({
        role,
        parts: [{ text: msg.parts[0].text }]
      });
    }
  }

  // Gemini models require the conversation to start with a 'user' message
  if (normalizedHistory.length > 0 && normalizedHistory[0].role === 'model') {
    normalizedHistory.shift();
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: [...normalizedHistory, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: `You are the SVGPT Neural Assistant, an elite academic intelligence engineered by Shreyas Gunjal & Vaibhav Chiniwar. Provide high-rigor, concise assistance. ${roleInstruction}. Do not mention external entities like Google or Gemini. You are SVGPT.`,
        temperature: 0.7
      }
    });
    return response.text || "Neural link weak. Please attempt re-transmission.";
  } catch (error) {
    console.error("Assistant Synthesis Failure (Likely malformed payload/RPC):", error);
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
      contents: `Transform these academic notes into high-impact flashcards for active recall:\n\n${notes}`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text!) as {front: string, back: string}[];
  } catch (error) {
    console.error("Flashcard Synthesis Failure:", error);
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
      contents: [
        { inlineData: { mimeType, data: cleanBase64 } },
        { text: "Synthesize active recall flashcards from this academic asset." }
      ],
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text!) as {front: string, back: string}[];
  } catch (error) {
    console.error("Asset Flashcard Failure:", error);
    throw error;
  }
};

export const streamLessonPlan = async (config: LessonPlanConfig, onChunk: (text: string) => void) => {
  const ai = getAI();
  const prompt = `Synthesize a high-rigor ${config.gradeLevel} ${config.subject} plan on: ${config.topic}. Structure with Learning Objectives, Core Activities, and Assessment.`;
  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are the SVGPT master curriculum engineer, created by Shreyas Gunjal and Vaibhav Chiniwar.",
        thinkingConfig: { thinkingBudget: 8000 }
      },
    });
    for await (const chunk of response) {
      if (chunk.text) onChunk(chunk.text);
    }
  } catch (error) {
    console.error("Lesson Streaming Failure:", error);
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
  const contents: any[] = [];
  if (source.type === 'text') {
    contents.push({ text: `Generate a sophisticated ${count}-question quiz with explanations: ${source.data}` });
  } else if (source.type === 'file') {
    const cleanData = source.data.includes(',') ? source.data.split(',')[1] : source.data;
    contents.push({ text: `Generate a sophisticated ${count}-question quiz from this asset.` });
    contents.push({ inlineData: { data: cleanData, mimeType: source.mimeType } });
  } else {
    contents.push({ text: `Generate a sophisticated ${count}-question quiz from this topic/link: ${source.data}` });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text!) as Quiz;
  } catch (error) {
    console.error("Quiz Synthesis Failure:", error);
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
      contents: `Transform this lesson text into an aesthetic 6-slide deck with visual generation prompts: ${lessonText}`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text!) as SlideDeck;
  } catch (error) {
    console.error("Slide Deck Synthesis Failure:", error);
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
      contents: `Create a brief pedagogical brain break script from this content: ${lessonText}`,
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(response.text!) as BrainBreak;
  } catch (error) {
    console.error("Brain Break Failure:", error);
    throw error;
  }
};

export const generateQuiz = async (topic: string, level: string = 'Standard', count: number = 5): Promise<Quiz> => {
  return generateQuizFromSource({ type: 'text', data: `${topic} (Mastery Level: ${level})` }, count);
};

export const generateVisualAid = async (prompt: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ text: `Professional educational diagram, clear labels, academic style, ultra-high resolution: ${prompt}` }],
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    throw new Error("Neural Rendering Buffer Empty.");
  } catch (error) {
    console.error("Visual Aid Synthesis Failure:", error);
    throw error;
  }
};

export const checkHomework = async (assignment: string, studentWork: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Conduct a rigorous evaluation. Assignment: ${assignment}\n\nStudent Work: ${studentWork}`,
      config: { thinkingConfig: { thinkingBudget: 8000 } }
    });
    return response.text || "Evaluative feedback synthesis failed.";
  } catch (error) {
    console.error("Homework Check Failure:", error);
    throw error;
  }
};

export const gradeAnswerSheet = async (studentWork: any, assignmentContext: string, answerKey?: any): Promise<string> => {
  const ai = getAI();
  const contents: any[] = [
    { text: `Grade this scanned student answer sheet. Context: ${assignmentContext}` },
    { inlineData: { data: studentWork.dataUri.split(',')[1], mimeType: studentWork.mimeType } }
  ];
  if (answerKey) {
    contents.push({ inlineData: { data: answerKey.dataUri.split(',')[1], mimeType: answerKey.mimeType } });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents,
      config: { thinkingConfig: { thinkingBudget: 8000 } }
    });
    return response.text || "Scan analysis failed to produce results.";
  } catch (error) {
    console.error("OCR Grade Failure:", error);
    throw error;
  }
};

export const checkPlagiarism = async (text: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Verify academic originality and identify potential online source overlaps for: "${text}"`,
      config: { tools: [{ googleSearch: {} }] },
    });
    const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
      .filter((c: any) => c.web?.uri)
      .map((c: any) => ({ uri: c.web.uri, title: c.web.title || "Academic Source" }));
    return { analysis: response.text || "No detectable overlaps identified.", sources };
  } catch (error) {
    console.error("Plagiarism Scan Failure:", error);
    throw error;
  }
};

export const compareAssignments = async (textA: string, textB: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Conduct a rigorous peer comparison for academic integrity. Identify any similarities or potential collusion between these two submissions.\n\nSubmission A:\n${textA}\n\nSubmission B:\n${textB}`,
      config: { 
        thinkingConfig: { thinkingBudget: 8000 },
        systemInstruction: "You are a senior academic integrity officer. Your reports are thorough and highlight specific areas of concern."
      }
    });
    return response.text || "Comparison failed.";
  } catch (error) {
    console.error("Peer Comparison Failure:", error);
    throw error;
  }
};

export const summarizeText = async (text: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Synthesize a high-density academic summary: ${text}`,
      config: { thinkingConfig: { thinkingBudget: 8000 } }
    });
    return response.text || "Summarization failed.";
  } catch (error) {
    console.error("Summarization Failure:", error);
    throw error;
  }
};

export const summarizeAudioLecture = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getAI();
  const cleanBase64 = base64Data.split(',')[1];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        { inlineData: { mimeType, data: cleanBase64 } },
        { text: "Analyze this audio lecture and synthesize professional, formatted notes including core theories." }
      ],
      config: { thinkingConfig: { thinkingBudget: 16000 } }
    });
    return response.text || "Audio analysis failed.";
  } catch (error) {
    console.error("Audio Synthesis Failure:", error);
    throw error;
  }
};

export const generateAudioBriefing = async (content: string): Promise<{ audioBase64: string, script: string }> => {
  const ai = getAI();
  const scriptRes = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Architect a professional 1-minute audio script summarizing: ${content}`,
    config: { systemInstruction: "You are a professional academic narrator within the SVGPT platform created by Shreyas and Vaibhav." }
  });
  const script = scriptRes.text || "Welcome to your neural briefing.";
  const ttsRes = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: script }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });
  const audioBase64 = ttsRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioBase64) throw new Error("Audio synthesis timed out.");
  return { audioBase64, script };
};
