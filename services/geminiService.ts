
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonPlanConfig, Quiz, SlideDeck, BrainBreak, Role } from "../types";

/**
 * SVGPT AI Engine - Powered by Google Gemini 3 Pro & Flash
 */

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("AI Key missing. Please check your environment settings.");
  }
  return new GoogleGenAI({ apiKey });
};

const generateWithResilience = async (params: any) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent(params);
    if (!response.text) throw new Error("The AI returned an empty response. Please try again.");
    return response;
  } catch (error: any) {
    console.error("AI Error:", error);
    const msg = error.message?.toLowerCase() || "";
    if (msg.includes("400") || msg.includes("invalid")) {
       throw new Error("Neural synchronization error. Please clear this chat session.");
    }
    throw new Error(error.message || "Something went wrong with the AI link.");
  }
};

const sanitizeHistory = (history: any[]) => {
  let sanitized = history.map(m => ({
    role: m.role === 'bot' || m.role === 'model' ? 'model' : 'user',
    parts: [{ text: (m.parts?.[0]?.text || m.text || "").trim() }]
  })).filter(m => m.parts[0].text !== "");

  while (sanitized.length > 0 && sanitized[0].role !== 'user') {
    sanitized.shift();
  }

  const final: any[] = [];
  for (const turn of sanitized) {
    if (final.length === 0 || final[final.length - 1].role !== turn.role) {
      final.push(turn);
    }
  }
  return final;
};

export const chatWithEduAssistant = async (message: string, history: any[], userRole: Role | null) => {
  const context = sanitizeHistory(history);
  if (context.length > 0 && context[context.length - 1].role === 'user') {
    context.pop();
  }
  context.push({ role: 'user', parts: [{ text: message }] });

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview", 
    contents: context,
    config: {
      systemInstruction: `You are SVGPT, a high-performance AI co-pilot for a ${userRole || 'student'}. Be concise, academic, and supportive. Use Markdown for clarity.`,
      temperature: 0.7
    }
  });
  return response.text || "I am currently recalibrating. Please try again.";
};

export const solveDoubt = async (base64Data: string, mimeType: string): Promise<string> => {
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-pro-preview",
    contents: [{
      parts: [
        { inlineData: { mimeType, data: cleanBase64 } },
        { text: "Perform a deep analysis of this academic material. Deconstruct the concepts, solve any problems presented, and provide a comprehensive, step-by-step pedagogical explanation. Use Markdown for clarity." }
      ]
    }],
    config: { 
      systemInstruction: "You are a specialized academic tutor with expertise in analyzing both visual diagrams and complex PDF documents. Explain concepts with extreme clarity and logical rigor."
    }
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
        { text: "Synthesize high-impact revision notes from this document or image. Focus on core definitions, formulas, and critical takeaways. Organize with clear bullet points." }
      ]
    }],
    config: { 
      systemInstruction: "Extract high-impact academic data for optimized student revision. Be concise and highly structured."
    }
  });
  return response.text || "Summarization failed.";
};

export const streamLessonPlan = async (config: LessonPlanConfig, onChunk: (text: string) => void) => {
  const ai = getAI();
  const prompt = `Synthesize a lesson plan for ${config.gradeLevel}. Subject: ${config.subject}. Topic: ${config.topic}. Focus: ${config.focus}.`;
  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a master teacher. Synthesize structured, standard-aligned lesson plans.",
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
      { text: `Synthesize an assessment with ${count} questions based on this asset.` }
    ];
  } else {
    parts = [{ text: `Synthesize an assessment with ${count} questions on: ${source.data}.` }];
  }

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts }],
    config: { responseMimeType: "application/json", responseSchema: quizSchema }
  });
  return JSON.parse(response.text!) as Quiz;
};

export const generateQuiz = async (topic: string, role: string, count: number = 5): Promise<Quiz> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Create a practice quiz for a ${role} on the topic: ${topic}.` }] }],
    config: { responseMimeType: "application/json", responseSchema: quizSchema }
  });
  return JSON.parse(response.text!) as Quiz;
};

export const checkHomework = async (assignment: string, studentWork: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-pro-preview",
    contents: [{ role: 'user', parts: [{ text: `Evaluate this work. Criteria: ${assignment}\n\nSubmission: ${studentWork}` }] }],
    config: { systemInstruction: "Provide professional academic feedback and grading." }
  });
  return response.text || "Grading failed.";
};

export const summarizeText = async (text: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Summarize this text: ${text}` }] }],
    config: { systemInstruction: "Be clear and concise. Use Markdown." }
  });
  return response.text || "Summarization failed.";
};

export const generateVisualAid = async (prompt: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-2.5-flash-image",
    contents: [{ role: 'user', parts: [{ text: `Academic illustration showing: ${prompt}` }] }],
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  const part = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("Visual generation failed.");
};

export const convertNotesToFlashcards = async (notes: string): Promise<{front: string, back: string}[]> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Synthesize flashcards from these notes: ${notes}` }] }],
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
      { text: "Synthesize a full lesson plan, slides, and summary from this document." }
    ];
  } else {
    parts = [{ text: `Synthesize a full lesson plan, slides, and summary from this link: ${source.data}` }];
  }

  const response = await generateWithResilience({
    model: "gemini-3-pro-preview",
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
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Synthesize a slide deck for this content: ${lessonContent}` }] }],
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
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Suggest a classroom brain break activity based on: ${context}` }] }],
    config: { responseMimeType: "application/json", responseSchema: schema }
  });
  return JSON.parse(response.text!) as BrainBreak;
};

export const gradeAnswerSheet = async (studentAsset: { dataUri: string, mimeType: string }, criteria: string, answerKey?: { dataUri: string, mimeType: string }): Promise<string> => {
  const studentData = studentAsset.dataUri.includes(',') ? studentAsset.dataUri.split(',')[1] : studentAsset.dataUri;
  const parts: any[] = [
    { inlineData: { data: studentData, mimeType: studentAsset.mimeType } },
    { text: `Grade this student submission based on: ${criteria}` }
  ];

  if (answerKey) {
    const keyData = answerKey.dataUri.includes(',') ? answerKey.dataUri.split(',')[1] : answerKey.dataUri;
    parts.push({ inlineData: { data: keyData, mimeType: answerKey.mimeType } });
    parts.push({ text: "Reference this key." });
  }

  const response = await generateWithResilience({
    model: "gemini-3-pro-preview",
    contents: [{ role: 'user', parts }],
    config: { systemInstruction: "Provide detailed academic grading." }
  });
  return response.text!;
};

export const checkPlagiarism = async (text: string): Promise<{ analysis: string, sources: {uri: string, title: string}[] }> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Analyze for plagiarism: ${text}` }] }],
    config: { tools: [{ googleSearch: {} }] }
  });

  const analysis = response.text || "Analysis complete.";
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
    model: "gemini-3-pro-preview",
    contents: [{ role: 'user', parts: [{ text: `Compare Student A and B for collusion:\n\nA: ${textA}\n\nB: ${textB}` }] }],
    config: { systemInstruction: "Analyze similarities between two academic submissions." }
  });
  return response.text!;
};

export const convertAssetToFlashcards = async (base64Data: string, mimeType: string): Promise<{front: string, back: string}[]> => {
  const cleanData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [
      { inlineData: { data: cleanData, mimeType } },
      { text: "Synthesize flashcards from this document." }
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
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [
      { inlineData: { data: cleanData, mimeType } },
      { text: "Synthesize structured notes from this audio recording." }
    ] }],
  });
  return response.text!;
};

export const generateAudioBriefing = async (content: string): Promise<{ audioBase64: string, script: string }> => {
  const scriptResponse = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Synthesize an engaging audio script for this content: ${content}` }] }],
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

export const synthesizeSVGDiagramAndCards = async (base64Data: string, mimeType: string): Promise<{ svgCode: string, cards: { front: string, back: string }[] }> => {
  const cleanData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-pro-preview",
    contents: [{
      parts: [
        { inlineData: { data: cleanData, mimeType } },
        { text: "Perform a deep structural analysis of this drawing/diagram. 1. Synthesize a clean, valid SVG representation (simplified code) of the main components. 2. Generate 5 high-impact active recall flashcards based on the diagram's content. Output in JSON format." }
      ]
    }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          svgCode: { type: Type.STRING, description: "Valid SVG XML string representing the diagram." },
          cards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING }
              },
              required: ["front", "back"]
            }
          }
        },
        required: ["svgCode", "cards"]
      }
    }
  });
  return JSON.parse(response.text!) as { svgCode: string, cards: { front: string, back: string }[] };
};

export const synthesizeSVGWorksheet = async (topic: string, gradeLevel: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-pro-preview",
    contents: [{
      parts: [{ text: `Synthesize a high-quality, printable academic worksheet SVG for the topic: ${topic}. Grade level: ${gradeLevel}. Include: 1. A clear header. 2. A central instructional diagram or visual model (stylized SVG). 3. 5 analytical questions with answer spaces. 4. A concise grading rubric at the footer. Output ONLY valid SVG XML code.` }]
    }],
    config: {
      systemInstruction: "You are an elite instructional designer. Synthesize professional, highly-structured SVG worksheets. Use clean lines and standard academic fonts."
    }
  });
  return response.text!;
};

export const synthesizeSVGSlides = async (lessonContent: string): Promise<string[]> => {
  const response = await generateWithResilience({
    model: "gemini-3-pro-preview",
    contents: [{
      parts: [{ text: `Deconstruct this lesson plan into 6 beautiful SVG presentation slides: ${lessonContent}. Each slide should be a standalone valid SVG (800x450). Use professional colors, clear typography, and simplified architectural diagrams where relevant. Output a JSON array of SVG XML strings.` }]
    }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING, description: "A valid SVG XML string." }
      }
    }
  });
  return JSON.parse(response.text!) as string[];
};

/**
 * NEW: Exam Prep Question Synthesis for Students
 * Extracts questions and answers from a lesson image or PDF.
 */
export const synthesizeExamQuestions = async (base64Data: string, mimeType: string): Promise<{ question: string, answer: string }[]> => {
  const cleanData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-pro-preview",
    contents: [{
      parts: [
        { inlineData: { data: cleanData, mimeType } },
        { text: "Analyze this lesson material and synthesize a set of 10 rigorous exam-style questions. For each question, provide a detailed correct answer. Output in a JSON array format." }
      ]
    }],
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
  return JSON.parse(response.text!) as { question: string, answer: string }[];
};

/**
 * NEW: Pathfinder Maker for Teachers
 * Generates a guided inquiry roadmap in SVG format.
 */
export const synthesizePathfinder = async (topic: string, gradeLevel: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-pro-preview",
    contents: [{
      parts: [{ text: `Synthesize a professional academic 'Pathfinder' (Research Roadmap) as a high-quality SVG (Portrait A4 layout). Topic: ${topic}. Grade: ${gradeLevel}. Include: 1. A roadmap visual metaphor (curving path). 2. 5 Milestone nodes with inquiry questions. 3. Suggested high-quality source types for investigation. 4. A 'Final Reflection' prompt at the end. Output ONLY valid SVG XML code.` }]
    }],
    config: {
      systemInstruction: "You are a master of instructional scaffolding. Create elegant, architectural SVG research guides. Use clear hierarchy and inspiring pedagogical design."
    }
  });
  return response.text!;
};
