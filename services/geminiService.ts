
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonPlanConfig, Quiz, SlideDeck, BrainBreak, Role } from "../types";

/**
 * SVGPT AI Engine - High Velocity Optimized
 */

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("Neural link offline. The API_KEY is missing from the environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Aggressive JSON extractor to handle dirty streams and markdown wrappers
 */
const cleanJsonString = (str: string) => {
  if (!str) return "";
  const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  let candidate = match ? match[1] : str;
  if (!candidate.trim().startsWith('{') && !candidate.trim().startsWith('[')) {
    const firstBrace = str.indexOf('{');
    const lastBrace = str.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      candidate = str.substring(firstBrace, lastBrace + 1);
    }
  }
  return candidate.trim();
};

const generateWithResilience = async (params: any) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      ...params,
      config: {
        ...params.config,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    if (!response.text) throw new Error("Empty neural response.");
    return response;
  } catch (error: any) {
    console.error("Neural Sync Error:", error);
    throw new Error(error.message || "Unexpected error in neural grid.");
  }
};

export const chatWithEduAssistant = async (message: string, history: any[], userRole: Role | null) => {
  const context = history.map(m => ({
    role: m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.text || m.parts?.[0]?.text || "" }]
  }));
  context.push({ role: 'user', parts: [{ text: message }] });

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview", 
    contents: context,
    config: {
      systemInstruction: `You are SVGPT, a high-performance AI co-pilot for a ${userRole || 'student'}. Be concise and academic.`,
      temperature: 0.7
    }
  });
  return response.text || "Recalibrating...";
};

export const solveDoubt = async (base64Data: string, mimeType: string): Promise<string> => {
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{
      parts: [
        { inlineData: { mimeType, data: cleanBase64 } },
        { text: "Solve this academic doubt with step-by-step logic. Use LaTeX for formulas." }
      ]
    }]
  });
  return response.text || "Analysis failed.";
};

export const generateRevisionInsights = async (base64Data: string, mimeType: string): Promise<string> => {
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{
      parts: [
        { inlineData: { mimeType, data: cleanBase64 } },
        { text: "Synthesize revision notes focusing on definitions and key points." }
      ]
    }]
  });
  return response.text || "Summarization failed.";
};

export const streamLessonPlan = async (config: LessonPlanConfig, onChunk: (text: string) => void) => {
  const ai = getAI();
  const prompt = `Lesson plan for ${config.gradeLevel}. Subject: ${config.subject}. Topic: ${config.topic}. Focus: ${config.focus}.`;
  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { systemInstruction: "You are a master teacher synthesizing structured lesson plans." },
  });
  for await (const chunk of response) {
    if (chunk.text) onChunk(chunk.text);
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

export const generateQuizFromSource = async (source: any, count: number = 5): Promise<Quiz> => {
  let parts: any[] = [];
  if (source.type === 'file') {
    const cleanData = source.data.includes(',') ? source.data.split(',')[1] : source.data;
    parts = [
      { inlineData: { data: cleanData, mimeType: source.mimeType } },
      { text: `Synthesize a ${count}-question JSON assessment.` }
    ];
  } else {
    parts = [{ text: `Synthesize a ${count}-question JSON assessment on: ${source.data}.` }];
  }

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts }],
    config: { responseMimeType: "application/json", responseSchema: quizSchema }
  });
  return JSON.parse(cleanJsonString(response.text!)) as Quiz;
};

export const generateQuiz = async (topic: string, role: string, count: number = 5): Promise<Quiz> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Create a practice quiz for a ${role} on the topic: ${topic}. Output JSON.` }] }],
    config: { responseMimeType: "application/json", responseSchema: quizSchema }
  });
  return JSON.parse(cleanJsonString(response.text!)) as Quiz;
};

export const checkHomework = async (assignment: string, studentWork: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Evaluate this work: ${assignment}\n\nSubmission: ${studentWork}` }] }]
  });
  return response.text || "Grading failed.";
};

export const summarizeText = async (text: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Summarize: ${text}` }] }]
  });
  return response.text || "Summarization failed.";
};

export const generateVisualAid = async (prompt: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-2.5-flash-image",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  const part = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("Visual generation failed.");
};

export const convertNotesToFlashcards = async (notes: string): Promise<{front: string, back: string}[]> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Synthesize flashcards: ${notes}. JSON.` }] }],
    config: { 
      responseMimeType: "application/json", 
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { front: { type: Type.STRING }, back: { type: Type.STRING } },
          required: ["front", "back"]
        }
      } 
    }
  });
  return JSON.parse(cleanJsonString(response.text!)) as {front: string, back: string}[];
};

export const synthesizeInstantLessonAssets = async (source: any): Promise<{ plan: string, slides: SlideDeck, summary: string }> => {
  let parts: any[] = [];
  if (source.type === 'file') {
    const cleanData = source.data.includes(',') ? source.data.split(',')[1] : source.data;
    parts = [
      { inlineData: { data: cleanData, mimeType: source.mimeType } },
      { text: "Synthesize full lesson plan and slides. JSON." }
    ];
  } else {
    parts = [{ text: `Synthesize lesson assets from: ${source.data}. JSON.` }];
  }

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonString(response.text!));
};

export const generateSlidesFromLesson = async (lessonContent: string): Promise<SlideDeck> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Slide deck for: ${lessonContent}. JSON.` }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonString(response.text!));
};

export const generateBrainBreak = async (context: string): Promise<BrainBreak> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Brain break for: ${context}. JSON.` }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonString(response.text!));
};

export const gradeAnswerSheet = async (studentAsset: any, criteria: string, answerKey?: any): Promise<string> => {
  const studentData = studentAsset.dataUri.includes(',') ? studentAsset.dataUri.split(',')[1] : studentAsset.dataUri;
  const parts: any[] = [{ inlineData: { data: studentData, mimeType: studentAsset.mimeType } }, { text: criteria }];
  if (answerKey) {
    const keyData = answerKey.dataUri.includes(',') ? answerKey.dataUri.split(',')[1] : answerKey.dataUri;
    parts.push({ inlineData: { data: keyData, mimeType: answerKey.mimeType } });
  }
  const response = await generateWithResilience({ model: "gemini-3-flash-preview", contents: [{ role: 'user', parts }] });
  return response.text!;
};

export const checkPlagiarism = async (text: string): Promise<{ analysis: string, sources: {uri: string, title: string}[] }> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Plagiarism check: ${text}` }] }],
    config: { tools: [{ googleSearch: {} }] }
  });
  const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
    .filter((c: any) => c.web).map((c: any) => ({ uri: c.web.uri, title: c.web.title }));
  return { analysis: response.text || "", sources };
};

export const compareAssignments = async (textA: string, textB: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Compare A and B: \nA: ${textA}\nB: ${textB}` }] }]
  });
  return response.text!;
};

export const convertAssetToFlashcards = async (base64Data: string, mimeType: string): Promise<{front: string, back: string}[]> => {
  const cleanData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ inlineData: { data: cleanData, mimeType } }, { text: "Synthesize cards. JSON." }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonString(response.text!));
};

export const summarizeAudioLecture = async (base64Audio: string, mimeType: string): Promise<string> => {
  const cleanData = base64Audio.includes(',') ? base64Audio.split(',')[1] : base64Audio;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ inlineData: { data: cleanData, mimeType } }, { text: "Summarize audio." }] }],
  });
  return response.text!;
};

export const synthesizeSVGDiagramAndCards = async (base64Data: string, mimeType: string): Promise<{ svgCode: string, cards: { front: string, back: string }[], quiz: Quiz }> => {
  const cleanData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ inlineData: { data: cleanData, mimeType } }, { text: "SVG, cards, quiz from diagram. JSON." }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonString(response.text!));
};

export const synthesizeSVGWorksheet = async (topic: string, gradeLevel: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: `SVG Worksheet for ${topic} at ${gradeLevel}.` }] }]
  });
  return response.text!;
};

export const synthesizeSVGSlides = async (lessonContent: string): Promise<string[]> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: `6 SVG slides for: ${lessonContent}. JSON array.` }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJsonString(response.text!));
};

/**
 * HIGH VELOCITY EXAM SYNTHESIS
 * Optimized using Gemini Flash Lite for near-instant results
 */
export const synthesizeExamQuestions = async (input: { type: 'file' | 'text', data: string, mimeType?: string }): Promise<{ question: string, answer: string }[]> => {
  let parts: any[] = [];
  if (input.type === 'file') {
    const cleanData = input.data.includes(',') ? input.data.split(',')[1] : input.data;
    parts = [
      { inlineData: { data: cleanData, mimeType: input.mimeType } },
      { text: "Synthesize 10 rigorous exam questions. JSON." }
    ];
  } else {
    parts = [{ text: `Synthesize 10 rigorous exam questions for this content: \n\n${input.data}\n\nOutput ONLY JSON.` }];
  }

  const response = await generateWithResilience({
    model: "gemini-flash-lite-latest", // TURBO SPEED MODEL
    contents: [{ role: 'user', parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING }
          },
          required: ["question", "answer"]
        }
      }
    }
  });
  return JSON.parse(cleanJsonString(response.text!)) as { question: string, answer: string }[];
};

export const synthesizePathfinder = async (topic: string, gradeLevel: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: `SVG Pathfinder for ${topic}.` }] }]
  });
  return response.text!;
};

export const generateAudioBriefing = async (content: string): Promise<{ audioBase64: string, script: string }> => {
  const ai = getAI();
  const res = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Briefing script for: ${content}` }] }]
  });
  const script = res.text || "";
  const audioRes = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: script }] }],
    // Fixed typo: responseModalities
    config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } }
  });
  return { audioBase64: audioRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "", script };
};
