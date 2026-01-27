import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonPlanConfig, Quiz, SlideDeck, BrainBreak, Role } from "../types";

/**
 * Lead Developers: Shreyas Gunjal & Vaibhav Chiniwar
 * Powered by SVGPT Neural Core (Gemini 3 Flash & Pro)
 */

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Neural Link Offline: API_KEY environment variable is not defined.");
  }
  return new GoogleGenAI({ apiKey });
};

// Error resilient wrapper for content generation
const generateWithResilience = async (params: any) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent(params);
    if (!response.text) throw new Error("Null response from Neural Core.");
    return response;
  } catch (error: any) {
    console.error("Neural Core Request Failure:", error);
    if (error.message?.includes("500") || error.message?.includes("recall")) {
      throw new Error("Neural synthesis interrupted. Please try a shorter prompt or reset the session.");
    }
    throw error;
  }
};

export const solveDoubt = async (base64Data: string, mimeType: string): Promise<string> => {
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-pro-preview",
    contents: [
      { inlineData: { mimeType, data: cleanBase64 } },
      { text: "Analyze this material. Provide a step-by-step resolution with high academic rigor. Use Markdown. Ensure all mathematical formulas use clear notation and code blocks are used for technical excerpts. Organize with clear headings and bulleted lists." }
    ],
    config: { 
      systemInstruction: "You are the SVGPT Neural Solver. Focus on absolute clarity and pedagogical precision. Engineered by Shreyas Gunjal and Vaibhav Chiniwar. Render output in beautiful, highly readable Markdown. Use code blocks for any technical or mathematical segments."
    }
  });
  return response.text || "Synthesis failed.";
};

export const generateRevisionInsights = async (base64Data: string, mimeType: string): Promise<string> => {
  const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [
      { inlineData: { mimeType, data: cleanBase64 } },
      { text: "Extract core academic nodes: Definitions, Key Points, and Synthesis Summary. Use highly structured Markdown with bold headers and clean lists." }
    ],
    config: { 
      systemInstruction: "You are the SVGPT Revision Engine. Your objective is density and clarity. Use bullet points extensively for readability."
    }
  });
  return response.text || "Neural analysis failed.";
};

export const chatWithEduAssistant = async (message: string, history: any[], userRole: Role | null) => {
  let roleInstruction = "";
  if (userRole === 'teacher') {
    roleInstruction = "User: EDUCATOR. Your objective: Provide advanced pedagogical consulting. Focus on curriculum design, instructional strategy, and specific lesson planning tips. When asked for help, offer specific teaching methodologies (e.g., active learning, scaffolding) and creative classroom activity ideas.";
  } else if (userRole === 'student') {
    roleInstruction = "User: SCHOLAR. Your objective: Act as an elite academic tutor. Focus on concept deconstruction, active recall, and study optimization. Break down complex topics into simple mental models and provide mnemonic devices or study tips to help the user master the material.";
  } else if (userRole === 'parent') {
    roleInstruction = "User: PARENT. Objective: Progress monitoring and student support strategies.";
  } else if (userRole === 'admin') {
    roleInstruction = "User: ADMIN. Objective: Institutional policy and school analytics.";
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
      systemInstruction: `You are the SVGPT Neural Assistant, an elite academic AI engineered by Shreyas Gunjal & Vaibhav Chiniwar. ${roleInstruction}. Maintain a professional, supportive, and highly intelligent tone. Response must be high-rigor and formatted in clean Markdown. Always tailor your advice specifically to the user's role as a ${userRole || 'Scholar'}.`,
      temperature: 0.7
    }
  });
  return response.text || "Neural link weak.";
};

export const streamLessonPlan = async (config: LessonPlanConfig, onChunk: (text: string) => void) => {
  const ai = getAI();
  const prompt = `Synthesize a high-rigor ${config.gradeLevel} ${config.subject} plan on: ${config.topic}. Use SVGPT Standard Architecture. Focus on ${config.focus}. Alignment: ${config.standard}. Level: ${config.proficiencyLevel}.`;
  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are the SVGPT master curriculum engineer, created by Shreyas Gunjal and Vaibhav Chiniwar. Produce highly structured pedagogical blueprints.",
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
    contents.push({ text: `Generate a sophisticated ${count}-question quiz from: ${source.data}` });
  } else if (source.type === 'file') {
    const cleanData = source.data.includes(',') ? source.data.split(',')[1] : source.data;
    contents.push({ text: `Generate a sophisticated ${count}-question quiz from this academic asset.` });
    contents.push({ inlineData: { data: cleanData, mimeType: source.mimeType } });
  } else {
    contents.push({ text: `Generate a sophisticated ${count}-question quiz from this topic: ${source.data}` });
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
    contents: `Generate a sophisticated ${count}-question quiz for a ${role} on the topic: ${topic}`,
    config: { responseMimeType: "application/json", responseSchema: quizSchema }
  });
  return JSON.parse(response.text!) as Quiz;
};

export const checkHomework = async (assignment: string, studentWork: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-pro-preview",
    contents: `Conduct a rigorous evaluation. Alignment Criteria: ${assignment}\n\nStudent Submission: ${studentWork}`,
    config: { systemInstruction: "Evaluator AI Mode. High-performance feedback loop activated. Provide detailed pedagogical feedback." }
  });
  return response.text || "Analysis failed.";
};

export const gradeAnswerSheet = async (
  studentAsset: { dataUri: string, mimeType: string },
  assignment: string,
  answerKeyAsset?: { dataUri: string, mimeType: string }
): Promise<string> => {
  const cleanStudent = studentAsset.dataUri.includes(',') ? studentAsset.dataUri.split(',')[1] : studentAsset.dataUri;
  const parts: any[] = [
    { inlineData: { data: cleanStudent, mimeType: studentAsset.mimeType } },
    { text: `Evaluate this student answer sheet. Criteria: ${assignment}` }
  ];
  
  if (answerKeyAsset) {
    const cleanKey = answerKeyAsset.dataUri.includes(',') ? answerKeyAsset.dataUri.split(',')[1] : answerKeyAsset.dataUri;
    parts.push({ inlineData: { data: cleanKey, mimeType: answerKeyAsset.mimeType } });
    parts.push({ text: "Use the provided reference key for comparison." });
  }

  const response = await generateWithResilience({
    model: "gemini-3-pro-preview",
    contents: parts,
    config: { systemInstruction: "Evaluator AI Mode. Perform OCR and rigorous grading alignment." }
  });
  return response.text || "Grading analysis failed.";
};

export const summarizeText = async (text: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: `Synthesize a high-density academic summary: ${text}`,
    config: { systemInstruction: "Master Summarizer Mode. Extract core nodes of knowledge." }
  });
  return response.text || "Summarization failed.";
};

export const summarizeAudioLecture = async (base64Audio: string, mimeType: string): Promise<string> => {
  const cleanAudio = base64Audio.includes(',') ? base64Audio.split(',')[1] : base64Audio;
  const response = await generateWithResilience({
    model: "gemini-3-flash-preview",
    contents: [
      { inlineData: { data: cleanAudio, mimeType } },
      { text: "Transcribe and synthesize high-density academic notes from this lecture recording. Use structured Markdown." }
    ],
    config: { systemInstruction: "Neural Scribe Mode. Transcribe and summarize audio assets with academic rigor." }
  });
  return response.text || "Audio synthesis failed.";
};

export const generateVisualAid = async (prompt: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-2.5-flash-image",
    contents: [{ text: `Professional educational diagram, clear labels, academic style, ultra-high resolution: ${prompt}` }],
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  const part = response.candidates?.[0]?.content?.parts.find((p: any) => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("Neural Rendering Buffer Empty.");
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
    contents: `Transform these academic notes into high-impact flashcards for active recall:\n\n${notes}`,
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
      { text: "Synthesize active recall flashcards from this academic asset." }
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
    contents: `Convert this lesson plan into a structured slide deck presentation: ${lessonContent}`,
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
    contents: `Generate a contextually relevant brain break activity for this lesson: ${lessonContent}`,
    config: { responseMimeType: "application/json", responseSchema: schema }
  });
  return JSON.parse(response.text!) as BrainBreak;
};

export const checkPlagiarism = async (text: string): Promise<{ analysis: string, sources: {uri: string, title: string}[] }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Critically analyze this text for potential plagiarism or lack of original thought. Check against online sources and provide a detailed report: ${text}`,
    config: {
      tools: [{googleSearch: {}}],
    }
  });
  
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    uri: chunk.web?.uri || "",
    title: chunk.web?.title || "Online Source"
  })).filter((s: any) => s.uri) || [];

  return {
    analysis: response.text || "Neural integrity check completed. No external markers identified.",
    sources
  };
};

export const compareAssignments = async (textA: string, textB: string): Promise<string> => {
  const response = await generateWithResilience({
    model: "gemini-3-pro-preview",
    contents: `Compare these two student submissions for similarity, potential collusion, or shared structural templates. Provide a detailed comparative report.\n\nStudent A: ${textA}\n\nStudent B: ${textB}`,
    config: { systemInstruction: "Guard Rail AI Mode. Peer comparison and collusion detection." }
  });
  return response.text || "Comparison failed.";
};

export const generateAudioBriefing = async (content: string): Promise<{ audioBase64: string, script: string }> => {
  const ai = getAI();
  const scriptResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Transform this academic content into an engaging, conversational 2-minute audio briefing script: ${content}`,
    config: { systemInstruction: "You are a professional academic broadcaster. Create clear, concise briefing scripts." }
  });
  const script = scriptResponse.text || "Briefing synthesis failed.";

  const audioResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this academic briefing clearly and professionally: ${script}` }] }],
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

/**
 * NEW: Instant Lesson Generator Synthesis
 * Synthesizes a full lesson plan, slide deck structure, and summary from a single source.
 */
export const synthesizeInstantLessonAssets = async (source: { type: 'file' | 'url', data: string, mimeType?: string }): Promise<{ plan: string, slides: SlideDeck, summary: string }> => {
  const ai = getAI();
  const contents: any[] = [];
  
  if (source.type === 'file') {
    const cleanData = source.data.includes(',') ? source.data.split(',')[1] : source.data;
    contents.push({ inlineData: { data: cleanData, mimeType: source.mimeType } });
    contents.push({ text: "Perform a deep academic synthesis of this document. Generate: 1. A detailed 40-minute lesson plan. 2. A 6-slide deck structure. 3. A 200-word concise summary." });
  } else {
    contents.push({ text: `Perform a deep academic synthesis of the content at this link: ${source.data}. Generate: 1. A detailed 40-minute lesson plan. 2. A 6-slide deck structure. 3. A 200-word concise summary.` });
  }

  const combinedSchema = {
    type: Type.OBJECT,
    properties: {
      plan: { type: Type.STRING, description: "Detailed Markdown lesson plan." },
      summary: { type: Type.STRING, description: "200-word concise summary." },
      slides: slideSchema
    },
    required: ["plan", "slides", "summary"]
  };

  const response = await generateWithResilience({
    model: "gemini-3-pro-preview",
    contents,
    config: { 
      responseMimeType: "application/json", 
      responseSchema: combinedSchema,
      tools: source.type === 'url' ? [{ googleSearch: {} }] : undefined
    }
  });

  return JSON.parse(response.text!) as { plan: string, slides: SlideDeck, summary: string };
};
