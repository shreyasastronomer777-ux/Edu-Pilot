
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonPlanConfig, Quiz, SlideDeck, BrainBreak, Role, ExamPaper, PPTProject, ExamQuestion, StudyPathData } from "../types";

/**
 * SVGPT AI Engine - Technical Core
 * Powered by Google Gemini Intelligence
 */

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("AI is offline. Please check your connection.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Utility to clean AI output (strip markdown markers)
 */
const cleanContentString = (str: string, type: 'json' | 'svg' = 'json') => {
  if (!str) return "";
  const pattern = type === 'svg' ? /<svg[\s\S]*?<\/svg>/i : /```(?:json)?\s*([\s\S]*?)\s*```/;
  const match = str.match(pattern);
  if (match) return type === 'svg' ? match[0] : match[1].trim();
  return str.trim();
};

const generateWithResilience = async (params: any) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      ...params,
      config: { ...params.config, thinkingConfig: { thinkingBudget: 0 } }
    });
    if (!response.text) throw new Error("AI didn't answer. Try again.");
    return response;
  } catch (error: any) {
    console.error("AI Error:", error);
    throw new Error(error.message || "Something went wrong. Try again.");
  }
};

export const generateStudyRoadmap = async (topic: string, duration: string): Promise<StudyPathData> => {
  const prompt = `Synthesize a high-performance academic roadmap for learning "${topic}" over ${duration}.
  Requirements:
  1. Break the journey into 5-7 logical neural milestones.
  2. Each milestone must have a title, specific learning objective, key concepts, recommended resource types, and a "Mastery Check" question.
  3. Output ONLY valid JSON matching the StudyPathData schema.`;

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          duration: { type: Type.STRING },
          milestones: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                objective: { type: Type.STRING },
                keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                resources: { type: Type.ARRAY, items: { type: Type.STRING } },
                masteryCheck: { type: Type.STRING }
              },
              required: ["id", "title", "objective", "keyConcepts", "resources", "masteryCheck"]
            }
          }
        },
        required: ["topic", "duration", "milestones"]
      }
    }
  });
  return JSON.parse(cleanContentString(response.text!, 'json')) as StudyPathData;
};

export const parseExamData = async (rawText: string): Promise<ExamQuestion[]> => {
  const prompt = `Deconstruct the following raw text into a structured JSON array of academic questions.
  
  Text: "${rawText}"
  
  Requirements:
  1. Identify question text, marks (default to 1 if not found), and type (MCQ, SHORT, or LONG).
  2. Extract any options for MCQs.
  3. Extract or infer the Answer Key/Marking Scheme.
  4. Assign a Bloom's Taxonomy level and estimated time.
  5. Output ONLY valid JSON array of objects.`;

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['MCQ', 'SHORT', 'LONG'] },
            question: { type: Type.STRING },
            marks: { type: Type.NUMBER },
            bloomLevel: { type: Type.STRING },
            estimatedTime: { type: Type.STRING },
            answerKey: { type: Type.STRING },
            markingScheme: { type: Type.ARRAY, items: { type: Type.STRING } },
            options: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    }
  });
  return JSON.parse(cleanContentString(response.text!, 'json'));
};

export const generateExamPaper = async (config: any): Promise<ExamPaper> => {
  const prompt = `Make a school test. 
  Subject: ${config.subject}
  Chapters: ${config.chapters}
  Total Marks: ${config.totalMarks}
  Grade: ${config.grade}
  
  Rules:
  1. Use easy and clear words.
  2. For math or physics, use LaTeX formatting like $x^2$ or $\\frac{1}{2}$.
  3. Include multiple choice and long answer questions.
  4. Output ONLY valid JSON matching the ExamPaper interface.`;

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json')) as ExamPaper;
};

export const synthesizePPTProject = async (topic: string, grade: string, count: number): Promise<PPTProject> => {
  const prompt = `Create a ${count}-slide presentation for a ${grade} lesson on "${topic}". 
  Rules:
  1. Use simple language.
  2. For any formulas, use LaTeX.
  3. Provide a VBA script to build these slides automatically.
  Output JSON.`;

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json')) as PPTProject;
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
      systemInstruction: `You are a helpful AI for a ${userRole || 'student'}. 
      ALWAYS use simple, clear words. No jargon. 
      ALWAYS format math and science symbols in LaTeX like $\\times$ or $E=mc^2$.`,
      temperature: 0.7
    }
  });
  return response.text || "I am thinking...";
};

export const solveDoubt = async (base64Data: string, mimeType: string): Promise<string> => {
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{
      parts: [
        { inlineData: { mimeType, data: cleanBase64 } },
        { text: "Help me with this school question. Use easy words. Use LaTeX for math." }
      ]
    }]
  });
  return response.text || "I couldn't read that.";
};

export const generateRevisionInsights = async (base64Data: string, mimeType: string): Promise<string> => {
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{
      parts: [
        { inlineData: { mimeType, data: cleanBase64 } },
        { text: "Summarize this for me using simple notes. Use LaTeX for formulas." }
      ]
    }]
  });
  return response.text || "Summary failed.";
};

export const streamLessonPlan = async (config: LessonPlanConfig, onChunk: (text: string) => void) => {
  const ai = getAI();
  const prompt = `Lesson plan for ${config.gradeLevel}. Subject: ${config.subject}. Topic: ${config.topic}. Use simple words and LaTeX for math.`;
  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { systemInstruction: "You are a teacher making easy-to-follow lesson plans." },
  });
  for await (const chunk of response) {
    if (chunk.text) onChunk(chunk.text);
  }
};

export const generateQuizFromSource = async (source: any, count: number = 5): Promise<Quiz> => {
  let parts: any[] = [];
  if (source.type === 'file') {
    const cleanData = source.data.includes(',') ? source.data.split(',')[1] : source.data;
    parts = [
      { inlineData: { data: cleanData, mimeType: source.mimeType } },
      { text: `Make a ${count}-question quiz using easy words. Use LaTeX for math. JSON.` }
    ];
  } else {
    parts = [{ text: `Make a ${count}-question quiz on: ${source.data}. Use simple words and LaTeX. JSON.` }];
  }

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json')) as Quiz;
};

export const synthesizeSVGDiagramAndCards = async (base64Data: string, mimeType: string): Promise<{ svgCode: string, cards: { front: string, back: string }[], quiz: Quiz }> => {
  const cleanData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ inlineData: { data: cleanData, mimeType } }, { text: "Make a simple diagram, flashcards, and quiz. JSON." }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json'));
};

export const synthesizeSVGWorksheet = async (topic: string, gradeLevel: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: `Make a worksheet for ${topic} at ${gradeLevel}. Use simple text and math symbols. Return SVG.` }] }]
  });
  return cleanContentString(response.text!, 'svg');
};

export const synthesizePathfinder = async (topic: string, gradeLevel: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: `Make a simple study path for ${topic}. Use easy words. Return SVG.` }] }]
  });
  return cleanContentString(response.text!, 'svg');
};

export const summarizeText = async (text: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Explain this in simple words: ${text}` }] }]
  });
  return response.text || "Failed.";
};

export const generateVisualAid = async (prompt: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-2.5-flash-image",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  const part = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("Image failed.");
};

export const summarizeAudioLecture = async (base64Audio: string, mimeType: string): Promise<string> => {
  const cleanData = base64Audio.includes(',') ? base64Audio.split(',')[1] : base64Audio;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ inlineData: { data: cleanData, mimeType } }, { text: "Explain this recording in simple words." }] }],
  });
  return response.text!;
};

export const generateSlidesFromLesson = async (lessonContent: string): Promise<SlideDeck> => {
  const prompt = `Based on this lesson content, create a slide deck with a title and slides containing bullet points and a visual prompt for each.
  Content: ${lessonContent}
  Output ONLY valid JSON.`;

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json')) as SlideDeck;
};

export const generateBrainBreak = async (lessonContent: string): Promise<BrainBreak> => {
  const prompt = `Suggest a relevant "Brain Break" activity for students based on this lesson content.
  Content: ${lessonContent}
  Output ONLY valid JSON matching the BrainBreak interface.`;

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json')) as BrainBreak;
};

export const synthesizeSVGSlides = async (lessonContent: string): Promise<string[]> => {
  const prompt = `Create a series of 5 simple SVG slides (as a JSON array of strings) based on this content. Each string should be a full <svg> tag.
  Content: ${lessonContent}
  Output ONLY JSON.`;

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json')) as string[];
};

export const checkHomework = async (assignment: string, studentWork: string): Promise<string> => {
  const prompt = `Grade this student work based on the provided assignment criteria. Use simple language.
  Criteria: ${assignment}
  Student Work: ${studentWork}`;

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });
  return response.text!;
};

export const gradeAnswerSheet = async (studentImage: { dataUri: string, mimeType: string }, assignment: string, answerKey?: { dataUri: string, mimeType: string }): Promise<string> => {
  const parts: any[] = [
    { inlineData: { data: studentImage.dataUri.split(',')[1], mimeType: studentImage.mimeType } },
    { text: `Grade this handwritten student answer sheet. Criteria: ${assignment}` }
  ];
  if (answerKey) {
    parts.push({ inlineData: { data: answerKey.dataUri.split(',')[1], mimeType: answerKey.mimeType } });
    parts.push({ text: "Use this provided answer key for grading." });
  }

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts }]
  });
  return response.text!;
};

export const checkPlagiarism = async (text: string): Promise<{ analysis: string, sources: {uri: string, title: string}[] }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Check this text for plagiarism or source matching online: ${text}`,
    config: {
      tools: [{ googleSearch: {} }],
      thinkingConfig: { thinkingBudget: 0 }
    },
  });

  const sources: {uri: string, title: string}[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({ uri: chunk.web.uri, title: chunk.web.title });
      }
    });
  }

  return {
    analysis: response.text || "Scanning complete.",
    sources
  };
};

export const compareAssignments = async (textA: string, textB: string): Promise<string> => {
  const prompt = `Compare these two student submissions for structural similarities or collusion.
  Student A: ${textA}
  Student B: ${textB}`;

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });
  return response.text!;
};

export const convertNotesToFlashcards = async (notes: string): Promise<{front: string, back: string}[]> => {
  const prompt = `Convert these notes into a JSON array of flashcards with 'front' and 'back' properties.
  Notes: ${notes}
  Output ONLY JSON.`;

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json'));
};

export const convertAssetToFlashcards = async (base64Data: string, mimeType: string): Promise<{front: string, back: string}[]> => {
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const prompt = `Extract key concepts from this asset and convert them into a JSON array of flashcards with 'front' and 'back' properties. Output ONLY JSON.`;

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ 
      role: 'user', 
      parts: [
        { inlineData: { data: cleanBase64, mimeType } },
        { text: prompt }
      ] 
    }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json'));
};

export const generateQuiz = async (topic: string, role: string, count: number): Promise<Quiz> => {
  const prompt = `Generate a ${count}-question quiz for a ${role} on the topic: ${topic}.
  Output ONLY JSON.`;

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json')) as Quiz;
};

export const generateAudioBriefing = async (content: string): Promise<{ audioBase64: string, script: string }> => {
  const ai = getAI();
  
  const scriptResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a spoken academic briefing script based on this content: ${content}`,
  });
  const script = scriptResponse.text || "Briefing started.";

  const audioResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: script }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Zephyr' },
        },
      },
    },
  });

  const audioData = audioResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData.data;
  if (!audioData) throw new Error("Audio generation failed.");

  return { audioBase64: audioData, script };
};

export const synthesizeInstantLessonAssets = async (source: { type: 'file' | 'url', data: string, mimeType?: string }): Promise<{ plan: string, slides: SlideDeck, summary: string }> => {
  let parts: any[] = [];
  if (source.type === 'file') {
    const cleanData = source.data.includes(',') ? source.data.split(',')[1] : source.data;
    parts = [
      { inlineData: { data: cleanData, mimeType: source.mimeType } },
      { text: "Synthesize a full lesson plan, a slide deck outline, and a summary from this document. Output ONLY valid JSON." }
    ];
  } else {
    parts = [{ text: `Synthesize a lesson plan, slide deck, and summary from this link/content: ${source.data}. Output ONLY valid JSON.` }];
  }

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts }],
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plan: { type: Type.STRING },
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
                  }
                }
              }
            }
          },
          summary: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(cleanContentString(response.text!, 'json'));
};

export const streamExamQuestions = async (source: { type: 'file' | 'text', data: string, mimeType?: string }, onChunk: (text: string) => void): Promise<void> => {
  const ai = getAI();
  let parts: any[] = [];
  
  if (source.type === 'file') {
    const cleanData = source.data.includes(',') ? source.data.split(',')[1] : source.data;
    parts = [
      { inlineData: { data: cleanData, mimeType: source.mimeType } },
      { text: "Generate 10 exam questions and answers from this document. Output ONLY a JSON array." }
    ];
  } else {
    parts = [{ text: `Generate 10 exam questions and answers from this text: ${source.data}. Output ONLY a JSON array.` }];
  }

  const response = await ai.models.generateContentStream({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts }],
    config: { responseMimeType: "application/json" },
  });

  for await (const chunk of response) {
    if (chunk.text) onChunk(chunk.text);
  }
};
