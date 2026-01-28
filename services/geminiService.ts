
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonPlanConfig, Quiz, SlideDeck, BrainBreak, Role } from "../types";

/**
 * Powered by SVGPT AI
 */

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("AI is offline: Please check your API key.");
  }
  return new GoogleGenAI({ apiKey });
};

// Error resilient wrapper for content generation
const generateWithResilience = async (params: any) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent(params);
    if (!response.text) throw new Error("No response from AI.");
    return response;
  } catch (error: any) {
    console.error("AI Error:", error);
    if (error.message?.includes("500") || error.message?.includes("recall")) {
      throw new Error("AI was interrupted. Please try again with less text.");
    }
    throw error;
  }
};

export const solveDoubt = async (base64Data: string, mimeType: string): Promise<string> => {
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [
      { inlineData: { mimeType, data: cleanBase64 } },
      { text: "Look at this image or file. Give a simple, step-by-step answer. Use clear words. If there is math, explain it simply. Use headings and lists so it is easy to read." }
    ],
    config: { 
      systemInstruction: "You are a helpful AI teacher. Give clear and simple answers. Use simple English so everyone can understand. Use Markdown for formatting."
    }
  });
  return response.text || "I could not find an answer.";
};

export const generateRevisionInsights = async (base64Data: string, mimeType: string): Promise<string> => {
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [
      { inlineData: { mimeType, data: cleanBase64 } },
      { text: "Find the most important parts: Words to know, Main ideas, and a Summary. Use simple bullet points and bold titles." }
    ],
    config: { 
      systemInstruction: "You are an AI that makes notes easy to read. Use simple words and lists."
    }
  });
  return response.text || "I could not read the file.";
};

export const chatWithEduAssistant = async (message: string, history: any[], userRole: Role | null) => {
  let roleInstruction = "";
  if (userRole === 'teacher') {
    roleInstruction = "You are talking to a teacher. Help them make lesson plans and give them ideas for the classroom. Use simple words.";
  } else if (userRole === 'student') {
    roleInstruction = "You are talking to a student. Help them study and explain things simply. Give them tips to learn better.";
  } else {
    roleInstruction = "Be a helpful assistant. Use simple English.";
  }

  const normalizedHistory: { role: string; parts: { text: string }[] }[] = [];
  const validHistory = history.filter(m => m.parts && m.parts[0]?.text?.trim());

  for (const msg of validHistory) {
    const role = msg.role === 'bot' || msg.role === 'model' ? 'model' : 'user';
    if (normalizedHistory.length > 0 && normalizedHistory[normalizedHistory.length - 1].role === role) {
      normalizedHistory[normalizedHistory.length - 1].parts[0].text += `\n\n${msg.parts[0].text}`;
    } else {
      normalizedHistory.push({ role, parts: [{ text: msg.parts[0].text }] });
    }
  }

  if (normalizedHistory.length > 0 && normalizedHistory[0].role === 'model') {
    normalizedHistory.shift();
  }

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview", 
    contents: [...normalizedHistory, { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: `You are the SVGPT AI Assistant. ${roleInstruction} Be friendly, smart, and use very simple words. Format your answer nicely with Markdown.`,
      temperature: 0.7
    }
  });
  return response.text || "I am having trouble connecting.";
};

export const streamLessonPlan = async (config: LessonPlanConfig, onChunk: (text: string) => void) => {
  const ai = getAI();
  const prompt = `Make a simple lesson plan for ${config.gradeLevel} ${config.subject} about: ${config.topic}. Focus on ${config.focus}. Use simple words that are easy to follow.`;
  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a master teacher. Create a clear and simple lesson plan for a class. Use headings and bullet points.",
      },
    });
    for await (const chunk of response) {
      if (chunk.text) onChunk(chunk.text);
    }
  } catch (error) {
    console.error("Lesson Error:", error);
    throw error;
  }
};

const quizSchema = {
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

export const generateQuizFromSource = async (source: any, count: number = 10): Promise<Quiz> => {
  const contents: any[] = [];
  if (source.type === 'text') {
    contents.push({ text: `Make a simple ${count}-question quiz based on this text: ${source.data}` });
  } else if (source.type === 'file') {
    const cleanData = source.data.includes(',') ? source.data.split(',')[1] : source.data;
    contents.push({ text: `Make a simple ${count}-question quiz from this file.` });
    contents.push({ inlineData: { data: cleanData, mimeType: source.mimeType } });
  } else {
    contents.push({ text: `Make a simple ${count}-question quiz about: ${source.data}` });
  }

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents,
    config: { responseMimeType: "application/json", responseSchema: quizSchema }
  });
  return JSON.parse(response.text!) as Quiz;
};

export const generateQuiz = async (topic: string, role: string, count: number = 5): Promise<Quiz> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: `Make a simple ${count}-question quiz for a ${role} on the topic: ${topic}`,
    config: { responseMimeType: "application/json", responseSchema: quizSchema }
  });
  return JSON.parse(response.text!) as Quiz;
};

export const checkHomework = async (assignment: string, studentWork: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: `Check this student work. Assignment: ${assignment}\n\nStudent Work: ${studentWork}. Explain what they did well and how they can improve using very simple words.`,
    config: { systemInstruction: "You are a kind teacher checking homework. Be encouraging and use simple language." }
  });
  return response.text || "I could not check the work.";
};

export const gradeAnswerSheet = async (
  studentAsset: { dataUri: string, mimeType: string },
  assignment: string,
  answerKeyAsset?: { dataUri: string, mimeType: string }
): Promise<string> => {
  const cleanStudent = studentAsset.dataUri.includes(',') ? studentAsset.dataUri.split(',')[1] : studentAsset.dataUri;
  const parts: any[] = [
    { inlineData: { data: cleanStudent, mimeType: studentAsset.mimeType } },
    { text: `Grade this student answer sheet. Assignment details: ${assignment}` }
  ];
  
  if (answerKeyAsset) {
    const cleanKey = answerKeyAsset.dataUri.includes(',') ? answerKeyAsset.dataUri.split(',')[1] : answerKeyAsset.dataUri;
    parts.push({ inlineData: { data: cleanKey, mimeType: answerKeyAsset.mimeType } });
    parts.push({ text: "Use this answer key to grade it correctly." });
  }

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: parts,
    config: { systemInstruction: "You are a teacher grading a test. Give a score and simple feedback." }
  });
  return response.text || "I could not grade the sheet.";
};

export const summarizeText = async (text: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: `Summarize this text in simple words: ${text}`,
    config: { systemInstruction: "Make this text easy to understand. Pick the main points." }
  });
  return response.text || "I could not summarize it.";
};

export const summarizeAudioLecture = async (base64Audio: string, mimeType: string): Promise<string> => {
  const cleanAudio = base64Audio.includes(',') ? base64Audio.split(',')[1] : base64Audio;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [
      { inlineData: { data: cleanAudio, mimeType } },
      { text: "Write down the main ideas from this audio. Use simple words and bullet points." }
    ],
    config: { systemInstruction: "You help students by taking simple notes from audio recordings." }
  });
  return response.text || "I could not hear the audio clearly.";
};

export const generateVisualAid = async (prompt: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-2.5-flash-image",
    contents: [{ text: `A simple, clear educational drawing of: ${prompt}` }],
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  const part = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("I could not create the image.");
};

const flashcardSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: { front: { type: Type.STRING }, back: { type: Type.STRING } },
    required: ["front", "back"]
  }
};

export const convertNotesToFlashcards = async (notes: string): Promise<{front: string, back: string}[]> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: `Turn these notes into simple flashcards with a question on the front and answer on the back:\n\n${notes}`,
    config: { responseMimeType: "application/json", responseSchema: flashcardSchema }
  });
  return JSON.parse(response.text!) as {front: string, back: string}[];
};

export const convertAssetToFlashcards = async (base64Data: string, mimeType: string): Promise<{front: string, back: string}[]> => {
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [
      { inlineData: { mimeType, data: cleanBase64 } },
      { text: "Turn this file into simple study flashcards." }
    ],
    config: { responseMimeType: "application/json", responseSchema: flashcardSchema }
  });
  return JSON.parse(response.text!) as {front: string, back: string}[];
};

const slideSchema = {
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

export const generateSlidesFromLesson = async (lessonContent: string): Promise<SlideDeck> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: `Turn this lesson into a simple presentation with 6 slides: ${lessonContent}`,
    config: { responseMimeType: "application/json", responseSchema: slideSchema }
  });
  return JSON.parse(response.text!) as SlideDeck;
};

export const generateBrainBreak = async (lessonContent: string): Promise<BrainBreak> => {
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
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: `Give a simple 2-minute activity for students to take a break during this lesson: ${lessonContent}`,
    config: { responseMimeType: "application/json", responseSchema: schema }
  });
  return JSON.parse(response.text!) as BrainBreak;
};

export const checkPlagiarism = async (text: string): Promise<{ analysis: string, sources: {uri: string, title: string}[] }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Check if this text was copied from the internet. Explain simply: ${text}`,
    config: {
      tools: [{googleSearch: {}}],
    }
  });
  
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    uri: chunk.web?.uri || "",
    title: chunk.web?.title || "Online Source"
  })).filter((s: any) => s.uri) || [];

  return {
    analysis: response.text || "Everything looks original.",
    sources
  };
};

export const compareAssignments = async (textA: string, textB: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: `Check if these two students copied from each other. Give a simple report.\n\nStudent A: ${textA}\n\nStudent B: ${textB}`,
    config: { systemInstruction: "You check for copying between students. Explain the similarities simply." }
  });
  return response.text || "I could not compare them.";
};

export const generateAudioBriefing = async (content: string): Promise<{ audioBase64: string, script: string }> => {
  const ai = getAI();
  const scriptResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a simple 1-minute script to explain this content like a friendly news reporter: ${content}`,
    config: { systemInstruction: "You write simple, friendly scripts for audio." }
  });
  const script = scriptResponse.text || "I could not write the script.";

  const audioResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this script clearly: ${script}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const audioBase64 = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  return { audioBase64, script };
};

export const synthesizeInstantLessonAssets = async (source: { type: 'file' | 'url', data: string, mimeType?: string }): Promise<{ plan: string, slides: SlideDeck, summary: string }> => {
  const ai = getAI();
  const contents: any[] = [];
  
  if (source.type === 'file') {
    const cleanData = source.data.includes(',') ? source.data.split(',')[1] : source.data;
    contents.push({ inlineData: { data: cleanData, mimeType: source.mimeType } });
    contents.push({ text: "Create a simple 40-minute lesson plan, a 6-slide structure, and a short summary from this file. Use simple words." });
  } else {
    contents.push({ text: `Create a simple 40-minute lesson plan, a 6-slide structure, and a short summary from this link: ${source.data}. Use simple words.` });
  }

  const combinedSchema = {
    type: Type.OBJECT,
    properties: {
      plan: { type: Type.STRING, description: "Simple Markdown lesson plan." },
      summary: { type: Type.STRING, description: "Short summary." },
      slides: slideSchema
    },
    required: ["plan", "slides", "summary"]
  };

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents,
    config: { 
      responseMimeType: "application/json", 
      responseSchema: combinedSchema,
      tools: source.type === 'url' ? [{ googleSearch: {} }] : undefined
    }
  });

  return JSON.parse(response.text!) as { plan: string, slides: SlideDeck, summary: string };
};
