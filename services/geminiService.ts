
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonPlanConfig, Quiz, SlideDeck, BrainBreak, Role } from "../types";

/**
 * SVGPT AI Engine - Powered by Google Gemini Flash
 */

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("AI Key missing. Please check your settings.");
  }
  return new GoogleGenAI({ apiKey });
};

// Robust wrapper to handle AI requests safely
const generateWithResilience = async (params: any) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent(params);
    if (!response.text) throw new Error("The AI didn't give an answer. Try again.");
    return response;
  } catch (error: any) {
    console.error("AI Error:", error);
    throw new Error("Something went wrong with the AI. Please try a shorter message.");
  }
};

export const solveDoubt = async (base64Data: string, mimeType: string): Promise<string> => {
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-flash-latest",
    contents: [{
      parts: [
        { inlineData: { mimeType, data: cleanBase64 } },
        { text: "Look at this file and explain the answer in simple words. Use step-by-step points." }
      ]
    }],
    config: { 
      systemInstruction: "You are a kind teacher. Explain things simply so a child can understand. Use bold text for important words."
    }
  });
  return response.text || "I couldn't find an answer.";
};

export const generateRevisionInsights = async (base64Data: string, mimeType: string): Promise<string> => {
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-flash-latest",
    contents: [{
      parts: [
        { inlineData: { mimeType, data: cleanBase64 } },
        { text: "Read this and give me the main points. Use a simple list and simple words." }
      ]
    }],
    config: { 
      systemInstruction: "You make long notes short and easy to read. Use simple English."
    }
  });
  return response.text || "I couldn't read the file.";
};

export const chatWithEduAssistant = async (message: string, history: any[], userRole: Role | null) => {
  const normalizedHistory = history.map(m => ({
    role: m.role === 'bot' || m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.parts?.[0]?.text || m.text || "" }]
  })).filter(m => m.parts[0].text);

  const response = await generateWithResilience({
    model: "gemini-flash-latest", 
    contents: [...normalizedHistory, { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: "You are a helpful AI friend. Use very simple words. If the user is a teacher, help them with school work. If they are a student, help them study. Always be nice and clear.",
      temperature: 0.7
    }
  });
  return response.text || "I am having trouble talking right now.";
};

export const streamLessonPlan = async (config: LessonPlanConfig, onChunk: (text: string) => void) => {
  const ai = getAI();
  const prompt = `Create a simple lesson plan for ${config.gradeLevel} students. Subject: ${config.subject}. Topic: ${config.topic}. Use simple words and a clear plan.`;
  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-flash-latest",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a great teacher. Create clear, simple lesson plans with easy steps.",
      },
    });
    for await (const chunk of response) {
      if (chunk.text) onChunk(chunk.text);
    }
  } catch (error) {
    console.error("Stream Error:", error);
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

export const generateQuizFromSource = async (source: any, count: number = 5): Promise<Quiz> => {
  let parts: any[] = [];
  if (source.type === 'file') {
    const cleanData = source.data.includes(',') ? source.data.split(',')[1] : source.data;
    parts = [
      { inlineData: { data: cleanData, mimeType: source.mimeType } },
      { text: `Make a simple quiz with ${count} questions based on this file. Use very simple words.` }
    ];
  } else {
    parts = [{ text: `Make a simple quiz with ${count} questions about: ${source.data}. Use very simple English.` }];
  }

  const response = await generateWithResilience({
    model: "gemini-flash-latest",
    contents: [{ role: 'user', parts }],
    config: { responseMimeType: "application/json", responseSchema: quizSchema }
  });
  return JSON.parse(response.text!) as Quiz;
};

export const generateQuiz = async (topic: string, role: string, count: number = 5): Promise<Quiz> => {
  const response = await generateWithResilience({
    model: "gemini-flash-latest",
    contents: [{ role: 'user', parts: [{ text: `Make a simple ${count}-question quiz for a ${role} on the topic: ${topic}. Use easy words.` }] }],
    config: { responseMimeType: "application/json", responseSchema: quizSchema }
  });
  return JSON.parse(response.text!) as Quiz;
};

export const checkHomework = async (assignment: string, studentWork: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-flash-latest",
    contents: [{ role: 'user', parts: [{ text: `Check this work. Plan: ${assignment}\n\nWork: ${studentWork}. Tell them what they did well and how to fix mistakes using simple words.` }] }],
    config: { systemInstruction: "You are a kind teacher. Be helpful and use very easy sentences." }
  });
  return response.text || "I couldn't check it.";
};

export const summarizeText = async (text: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-flash-latest",
    contents: [{ role: 'user', parts: [{ text: `Make this text short and easy to read: ${text}` }] }],
    config: { systemInstruction: "Use simple words. Make it clear." }
  });
  return response.text || "I couldn't summarize it.";
};

export const generateVisualAid = async (prompt: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-2.5-flash-image",
    contents: [{ role: 'user', parts: [{ text: `A clear, simple drawing for kids showing: ${prompt}` }] }],
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  const part = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("Couldn't make the image.");
};

export const convertNotesToFlashcards = async (notes: string): Promise<{front: string, back: string}[]> => {
  const response = await generateWithResilience({
    model: "gemini-flash-latest",
    contents: [{ role: 'user', parts: [{ text: `Turn these notes into simple flashcards with a question and an answer: ${notes}` }] }],
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
  return JSON.parse(response.text!) as {front: string, back: string}[];
};

export const synthesizeInstantLessonAssets = async (source: { type: 'file' | 'url', data: string, mimeType?: string }): Promise<{ plan: string, slides: SlideDeck, summary: string }> => {
  let parts: any[] = [];
  if (source.type === 'file') {
    const cleanData = source.data.includes(',') ? source.data.split(',')[1] : source.data;
    parts = [
      { inlineData: { data: cleanData, mimeType: source.mimeType } },
      { text: "Create a simple lesson plan, slide topics, and a short summary from this file. Use easy words." }
    ];
  } else {
    parts = [{ text: `Create a simple lesson plan, slide topics, and a short summary from this link: ${source.data}. Use easy words.` }];
  }

  const response = await generateWithResilience({
    model: "gemini-flash-latest",
    contents: [{ role: 'user', parts }],
    config: { 
      responseMimeType: "application/json", 
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plan: { type: Type.STRING },
          summary: { type: Type.STRING },
          slides: {
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
          }
        },
        required: ["plan", "slides", "summary"]
      }
    }
  });

  return JSON.parse(response.text!) as { plan: string, slides: SlideDeck, summary: string };
};

export const generateSlidesFromLesson = async (lessonContent: string): Promise<SlideDeck> => {
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

  const response = await generateWithResilience({
    model: "gemini-flash-latest",
    contents: [{ role: 'user', parts: [{ text: `Based on this lesson content, create a structured slide deck. For each slide, provide a visual prompt for an image generator: ${lessonContent}` }] }],
    config: { responseMimeType: "application/json", responseSchema: schema }
  });
  return JSON.parse(response.text!) as SlideDeck;
};

export const generateBrainBreak = async (context: string): Promise<BrainBreak> => {
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
    model: "gemini-flash-latest",
    contents: [{ role: 'user', parts: [{ text: `Suggest a quick "brain break" activity related to this topic for a classroom: ${context}` }] }],
    config: { responseMimeType: "application/json", responseSchema: schema }
  });
  return JSON.parse(response.text!) as BrainBreak;
};

export const gradeAnswerSheet = async (studentAsset: { dataUri: string, mimeType: string }, criteria: string, answerKey?: { dataUri: string, mimeType: string }): Promise<string> => {
  const studentData = studentAsset.dataUri.includes(',') ? studentAsset.dataUri.split(',')[1] : studentAsset.dataUri;
  const parts: any[] = [
    { inlineData: { data: studentData, mimeType: studentAsset.mimeType } },
    { text: `Grade this student answer sheet based on these criteria: ${criteria}. Provide feedback and a score.` }
  ];

  if (answerKey) {
    const keyData = answerKey.dataUri.includes(',') ? answerKey.dataUri.split(',')[1] : answerKey.dataUri;
    parts.push({ inlineData: { data: keyData, mimeType: answerKey.mimeType } });
    parts.push({ text: "Use this provided answer key for reference." });
  }

  const response = await generateWithResilience({
    model: "gemini-flash-latest",
    contents: [{ role: 'user', parts }],
    config: { systemInstruction: "You are an expert examiner. Provide precise and encouraging feedback." }
  });
  return response.text!;
};

export const checkPlagiarism = async (text: string): Promise<{ analysis: string, sources: {uri: string, title: string}[] }> => {
  const response = await generateWithResilience({
    model: "gemini-flash-latest",
    contents: [{ role: 'user', parts: [{ text: `Check this text for potential plagiarism and provide an analysis: ${text}` }] }],
    config: { 
      tools: [{ googleSearch: {} }]
    }
  });

  const analysis = response.text || "No analysis available.";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      uri: chunk.web.uri,
      title: chunk.web.title
    }));

  return { analysis, sources };
};

export const compareAssignments = async (textA: string, textB: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-flash-latest",
    contents: [{ role: 'user', parts: [{ text: `Compare these two student submissions for similarity and potential collusion:\n\nStudent A: ${textA}\n\nStudent B: ${textB}` }] }],
    config: { systemInstruction: "Analyze the writing style, structure, and content overlap between two students." }
  });
  return response.text!;
};

export const convertAssetToFlashcards = async (base64Data: string, mimeType: string): Promise<{front: string, back: string}[]> => {
  const cleanData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-flash-latest",
    contents: [{ role: 'user', parts: [
      { inlineData: { data: cleanData, mimeType } },
      { text: "Turn the content of this file into simple flashcards with a question and an answer." }
    ] }],
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
  return JSON.parse(response.text!) as {front: string, back: string}[];
};

export const summarizeAudioLecture = async (base64Audio: string, mimeType: string): Promise<string> => {
  const cleanData = base64Audio.includes(',') ? base64Audio.split(',')[1] : base64Audio;
  const response = await generateWithResilience({
    model: "gemini-flash-latest",
    contents: [{ role: 'user', parts: [
      { inlineData: { data: cleanData, mimeType } },
      { text: "Listen to this audio lecture and provide detailed, structured notes and a summary using simple language." }
    ] }],
  });
  return response.text!;
};

export const generateAudioBriefing = async (content: string): Promise<{ audioBase64: string, script: string }> => {
  const scriptResponse = await generateWithResilience({
    model: "gemini-flash-latest",
    contents: [{ role: 'user', parts: [{ text: `Convert these notes into a natural, engaging briefing script suitable for audio playback: ${content}` }] }],
  });
  const script = scriptResponse.text!;

  const ai = getAI();
  const audioResponse = await ai.models.generateContent({
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

  const audioBase64 = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  return { audioBase64, script };
};
