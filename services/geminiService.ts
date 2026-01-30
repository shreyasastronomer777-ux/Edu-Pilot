import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonPlanConfig, Quiz, SlideDeck, BrainBreak, Role } from "../types";

/**
 * SVGPT AI Engine - Powered by Google Gemini 3 Flash
 * Optimized for high-reliability academic synthesis on mobile and web
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
  // Step 1: Look for markdown code blocks
  const match = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  let candidate = match ? match[1] : str;
  
  // Step 2: If no code blocks or parsing fails, find the first '{' and last '}'
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
        // Ensure faster response for mobile stability
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    if (!response.text) throw new Error("The neural node returned an empty response.");
    return response;
  } catch (error: any) {
    console.error("Neural Sync Error:", error);
    const msg = error.message?.toLowerCase() || "";
    
    if (msg.includes("api_key is missing")) {
       throw new Error("Neural Link Offline: API Key not configured in environment.");
    }
    if (msg.includes("401") || msg.includes("api key") || msg.includes("unauthorized")) {
       throw new Error("Neural Link Unauthorized. Verify academic API credentials.");
    }
    if (msg.includes("429") || msg.includes("quota")) {
       throw new Error("Neural Traffic Limit. Cooldown active for 60 seconds.");
    }
    if (msg.includes("safety") || msg.includes("blocked")) {
       throw new Error("Neural Safety Filter triggered. Refine your query parameters.");
    }
    throw new Error(error.message || "An unexpected error occurred in the neural grid.");
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
  return response.text || "Neural core recalibrating. Try again.";
};

export const solveDoubt = async (base64Data: string, mimeType: string): Promise<string> => {
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{
      parts: [
        { inlineData: { mimeType, data: cleanBase64 } },
        { text: "Perform an advanced academic analysis. 1. If an equation is present, provide a 'Neural Equation Breakdown' identifying every component. 2. Explain the mechanism step-by-step. 3. List 'Key Components' and their academic significance. 4. Conclude with a 'Synthesis Takeaway'. Use bold LaTeX notation for all formulas." }
      ]
    }],
    config: { 
      systemInstruction: "You are SVGPT Scientific Core. You specialize in identifying balanced equations and performing deep pedagogical deconstruction."
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
        { text: "Synthesize high-impact revision notes. Focus on core definitions, formulas, and critical takeaways with clear bullet points." }
      ]
    }]
  });
  return response.text || "Summarization failed.";
};

export const streamLessonPlan = async (config: LessonPlanConfig, onChunk: (text: string) => void) => {
  try {
    const ai = getAI();
    const prompt = `Synthesize a lesson plan for ${config.gradeLevel}. Subject: ${config.subject}. Topic: ${config.topic}. Focus: ${config.focus}.`;
    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a master teacher synthesizing structured, standard-aligned lesson plans.",
        thinkingConfig: { thinkingBudget: 0 }
      },
    });
    for await (const chunk of response) {
      if (chunk.text) onChunk(chunk.text);
    }
  } catch (error: any) {
    console.error("Stream Error:", error);
    throw new Error(error.message || "Neural streaming interrupted.");
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
      { text: `Synthesize a ${count}-question JSON assessment based on this asset.` }
    ];
  } else {
    parts = [{ text: `Synthesize a ${count}-question JSON assessment on: ${source.data}.` }];
  }

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts }],
    config: { responseMimeType: "application/json", responseSchema: quizSchema }
  });
  
  try {
    const cleaned = cleanJsonString(response.text!);
    return JSON.parse(cleaned) as Quiz;
  } catch (e) {
    throw new Error("Neural response parsing failed. The model output was non-standard. Retrying may fix this.");
  }
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
    contents: [{ role: 'user', parts: [{ text: `Synthesize flashcards from these notes: ${notes}. Output JSON.` }] }],
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

export const synthesizeInstantLessonAssets = async (source: { type: 'file' | 'url', data: string, mimeType?: string }): Promise<{ plan: string, slides: SlideDeck, summary: string }> => {
  let parts: any[] = [];
  if (source.type === 'file') {
    const cleanData = source.data.includes(',') ? source.data.split(',')[1] : source.data;
    parts = [
      { inlineData: { data: cleanData, mimeType: source.mimeType } },
      { text: "Synthesize a full lesson plan, a slide deck object, and a one-sentence summary from this document. Output ONLY raw JSON." }
    ];
  } else {
    parts = [{ text: `Synthesize a full lesson plan, a slide deck object, and a one-sentence summary from this data: ${source.data}. Output ONLY raw JSON.` }];
  }

  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts }],
    config: { 
      responseMimeType: "application/json", 
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plan: { type: Type.STRING, description: "Full markdown lesson plan" },
          summary: { type: Type.STRING, description: "Concise summary" },
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

  try {
    const cleaned = cleanJsonString(response.text!);
    return JSON.parse(cleaned) as { plan: string, slides: SlideDeck, summary: string };
  } catch (e) {
    throw new Error("Neural synthesis returned invalid formatting. Please retry.");
  }
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
    contents: [{ role: 'user', parts: [{ text: `Synthesize a slide deck for this content: ${lessonContent}. Output JSON.` }] }],
    config: { responseMimeType: "application/json", responseSchema: schema }
  });
  return JSON.parse(cleanJsonString(response.text!)) as SlideDeck;
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
    contents: [{ role: 'user', parts: [{ text: `Suggest a classroom brain break activity based on: ${context}. Output JSON.` }] }],
    config: { responseMimeType: "application/json", responseSchema: schema }
  });
  return JSON.parse(cleanJsonString(response.text!)) as BrainBreak;
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
    model: "gemini-3-flash-preview",
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
    model: "gemini-3-flash-preview",
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
      { text: "Synthesize flashcards from this document. Output JSON." }
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
  return JSON.parse(cleanJsonString(response.text!)) as {front: string, back: string}[];
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

export const synthesizeSVGDiagramAndCards = async (base64Data: string, mimeType: string): Promise<{ svgCode: string, cards: { front: string, back: string }[], quiz: Quiz }> => {
  const cleanData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{
      parts: [
        { inlineData: { data: cleanData, mimeType } },
        { text: "Perform a deep structural analysis. 1. Synthesize a clean valid SVG representation. 2. Generate 5 active recall flashcards. 3. Generate a 5-question multiple choice quiz to test understanding of the diagram components. Output JSON." }
      ]
    }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          svgCode: { type: Type.STRING, description: "Valid SVG XML string." },
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
          },
          quiz: {
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
          }
        },
        required: ["svgCode", "cards", "quiz"]
      }
    }
  });
  return JSON.parse(cleanJsonString(response.text!)) as { svgCode: string, cards: { front: string, back: string }[], quiz: Quiz };
};

export const synthesizeSVGWorksheet = async (topic: string, gradeLevel: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{
      parts: [{ text: `Synthesize a high-quality, printable academic worksheet SVG for the topic: ${topic}. Grade level: ${gradeLevel}. Include a header, diagram, 5 questions, and a rubric. Output ONLY valid SVG XML code.` }]
    }],
    config: {
      systemInstruction: "You are an elite instructional designer. Synthesize professional SVG worksheets."
    }
  });
  return response.text!;
};

export const synthesizeSVGSlides = async (lessonContent: string): Promise<string[]> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{
      parts: [{ text: `Deconstruct this lesson into 6 beautiful SVG slides: ${lessonContent}. Output a JSON array of SVG XML strings.` }]
    }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING, description: "A valid SVG XML string." }
      }
    }
  });
  return JSON.parse(cleanJsonString(response.text!)) as string[];
};

export const synthesizeExamQuestions = async (base64Data: string, mimeType: string): Promise<{ question: string, answer: string }[]> => {
  const cleanData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{
      parts: [
        { inlineData: { data: cleanData, mimeType } },
        { text: "Analyze this lesson and synthesize 10 rigorous exam questions with detailed answers. Output JSON." }
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
  return JSON.parse(cleanJsonString(response.text!)) as { question: string, answer: string }[];
};

export const synthesizePathfinder = async (topic: string, gradeLevel: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [{
      parts: [{ text: `Synthesize a professional academic 'Pathfinder' SVG (Research Roadmap). Topic: ${topic}. Grade: ${gradeLevel}. Output ONLY valid SVG XML code.` }]
    }],
    config: {
      systemInstruction: "You are a master of instructional scaffolding. Create elegant SVG research guides."
    }
  });
  return response.text!;
};

export const generateAudioBriefing = async (content: string): Promise<{ audioBase64: string, script: string }> => {
  const ai = getAI();
  
  const scriptResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: 'user', parts: [{ text: `Transform into a professional audio briefing script (200 words): ${content}` }] }],
    config: {
      systemInstruction: "You are an expert academic narrator.",
      temperature: 0.7
    }
  });
  
  const script = scriptResponse.text || "Synthesis failed.";

  const audioResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: script }] }],
    config: {
      responseModalalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Zephyr' },
        },
      },
    },
  });

  const audioPart = audioResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (!audioPart?.inlineData?.data) {
    throw new Error("Neural audio synthesis failed.");
  }

  return { 
    audioBase64: audioPart.inlineData.data, 
    script 
  };
};