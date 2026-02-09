import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonPlanConfig, Quiz, SlideDeck, BrainBreak, Role, ExamPaper, PPTProject } from "../types";

/**
 * SVGPT AI Engine - Technical Core (High Velocity Version)
 * Powered by Google Gemini Intelligence
 */

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined") {
    throw new Error("Neural link offline. The API_KEY is missing from the environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Robust extraction for SVG or JSON from model responses
 */
const cleanContentString = (str: string, type: 'json' | 'svg' = 'json') => {
  if (!str) return "";
  const pattern = type === 'svg' ? /<svg[\s\S]*?<\/svg>/i : /```(?:json)?\s*([\s\S]*?)\s*```/;
  const match = str.match(pattern);
  
  if (match) {
    return type === 'svg' ? match[0] : match[1].trim();
  }
  
  // Fallback: If no markdown blocks, try to find the first '{' or '<svg'
  if (type === 'svg') {
    const startIdx = str.toLowerCase().indexOf('<svg');
    const endIdx = str.toLowerCase().lastIndexOf('</svg>');
    if (startIdx !== -1 && endIdx !== -1) {
      return str.substring(startIdx, endIdx + 6);
    }
  } else {
    const firstBrace = str.indexOf('{');
    const lastBrace = str.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      return str.substring(firstBrace, lastBrace + 1).trim();
    }
  }
  return str.trim();
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

export const generateExamPaper = async (config: any): Promise<ExamPaper> => {
  const prompt = `Synthesize a professional academic exam paper. 
  Subject: ${config.subject}
  Chapters: ${config.chapters}
  Total Marks: ${config.totalMarks}
  Grade: ${config.grade}
  Blueprint: ${JSON.stringify(config.blueprint)}
  
  Requirements:
  1. Distribute questions based on Bloom's Taxonomy cognitive levels.
  2. Include estimated time for each question.
  3. Provide a clear marking scheme for subjective questions.
  4. Ensure full syllabus coverage of the specified chapters.
  5. Output ONLY valid JSON matching the ExamPaper interface.`;

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subject: { type: Type.STRING },
          grade: { type: Type.STRING },
          totalMarks: { type: Type.NUMBER },
          duration: { type: Type.STRING },
          instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                questions: {
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
            }
          }
        }
      }
    }
  });
  return JSON.parse(cleanContentString(response.text!, 'json')) as ExamPaper;
};

export const synthesizePPTProject = async (topic: string, grade: string, count: number): Promise<PPTProject> => {
  const prompt = `Act as an expert teacher. Create a ${count}-slide presentation project for a ${grade} lesson on "${topic}". 
  Requirements:
  1. For the outline: title, bullet points, visual prompt, check for understanding.
  2. For automation: Provide a VBA script.
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
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json')) as Quiz;
};

export const generateQuiz = async (topic: string, role: string, count: number = 5): Promise<Quiz> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Create a practice quiz for a ${role} on the topic: ${topic}. Output JSON.` }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json')) as Quiz;
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
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json')) as {front: string, back: string}[];
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
  return JSON.parse(cleanContentString(response.text!, 'json'));
};

export const generateSlidesFromLesson = async (lessonContent: string): Promise<SlideDeck> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Slide deck for: ${lessonContent}. JSON.` }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json'));
};

export const generateBrainBreak = async (context: string): Promise<BrainBreak> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Brain break for: ${context}. JSON.` }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json'));
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
  return JSON.parse(cleanContentString(response.text!, 'json'));
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
    contents: [{ parts: [{ inlineData: { data: cleanData, mimeType } }, { text: "Synthesize a professional SVG diagram, 5 flashcards, and a 5-question quiz. Output as a single JSON object." }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json'));
};

export const synthesizeSVGWorksheet = async (topic: string, gradeLevel: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: `Synthesize a professional, A4-ratio SVG worksheet for ${topic} at ${gradeLevel}. Include a title, 3 diagrams, 5 problems, and space for name. Return ONLY the SVG code.` }] }]
  });
  return cleanContentString(response.text!, 'svg');
};

export const synthesizeSVGSlides = async (lessonContent: string): Promise<string[]> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: `Synthesize 6 academic SVG slides for: ${lessonContent}. Output as a JSON array of SVG strings.` }] }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json'));
};

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
    model: "gemini-flash-lite-latest",
    contents: [{ role: 'user', parts }],
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanContentString(response.text!, 'json')) as { question: string, answer: string }[];
};

export const streamExamQuestions = async (input: { type: 'file' | 'text', data: string, mimeType?: string }, onChunk: (text: string) => void) => {
  const ai = getAI();
  let parts: any[] = [];
  if (input.type === 'file') {
    const cleanData = input.data.includes(',') ? input.data.split(',')[1] : input.data;
    parts = [
      { inlineData: { data: cleanData, mimeType: input.mimeType } },
      { text: "Synthesize 10 rigorous exam questions. JSON array format." }
    ];
  } else {
    parts = [{ text: `Synthesize 10 rigorous exam questions for: \n\n${input.data}\n\nOutput as JSON array.` }];
  }

  const response = await ai.models.generateContentStream({
    model: "gemini-flash-lite-latest",
    contents: [{ role: 'user', parts }],
    config: { responseMimeType: "application/json", thinkingConfig: { thinkingBudget: 0 } }
  });

  for await (const chunk of response) {
    if (chunk.text) onChunk(chunk.text);
  }
};

/**
 * PATHFINDER SYNTHESIS - IMPROVED
 */
export const synthesizePathfinder = async (topic: string, gradeLevel: string): Promise<string> => {
  const prompt = `Act as an Educational Architect. Synthesize a professional "Guided Inquiry Pathfinder" for students studying "${topic}" at ${gradeLevel} level.
  
  Requirements:
  1. Output ONLY a standalone, valid SVG string.
  2. The SVG should be designed for A4 portrait printing (viewBox="0 0 800 1100").
  3. Visually include:
     - A modern header with the title "${topic}".
     - A "Research Roadmap" with 5 key milestone nodes (labeled).
     - A "Core Inquiry Questions" section with 3 challenging questions.
     - A "Source Checklist" (Academic Journals, Primary Sources, etc.).
  4. Use a clean, indigo-accented academic style.
  5. Ensure all text in the SVG is legible and properly spaced.`;

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }]
  });
  return cleanContentString(response.text!, 'svg');
};

export const generateAudioBriefing = async (content: string): Promise<{ audioBase64: string, script: string }> => {
  const ai = getAI();
  const res = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Synthesize a 1-minute briefing script for: ${content}` }] }]
  });
  const script = res.text || "";
  const audioRes = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: script }] }],
    // Fix: Corrected property name from responseModalalities to responseModalities
    config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } }
  });
  return { audioBase64: audioRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "", script };
};