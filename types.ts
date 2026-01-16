
export enum View {
  DASHBOARD = 'DASHBOARD',
  LESSON_PLANNER = 'LESSON_PLANNER',
  QUIZ_MAKER = 'QUIZ_MAKER',
  VISUAL_STUDIO = 'VISUAL_STUDIO',
  HOMEWORK_CHECKER = 'HOMEWORK_CHECKER',
  ATTENDANCE = 'ATTENDANCE',
  PLAGIARISM_CHECKER = 'PLAGIARISM_CHECKER',
  // Student Views
  FLASHCARDS = 'FLASHCARDS',
  STUDY_NOTES = 'STUDY_NOTES',
  AI_SUMMARIZER = 'AI_SUMMARIZER',
  STUDENT_QUIZ = 'STUDENT_QUIZ',
  FOCUS_ROOM = 'FOCUS_ROOM',
  DOUBT_SOLVER = 'DOUBT_SOLVER',
  AUDIO_BRIEFING = 'AUDIO_BRIEFING'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export interface LessonPlanConfig {
  topic: string;
  gradeLevel: string;
  subject: string;
  duration: string;
  focus: string;
  standard?: string;
  proficiencyLevel?: string;
}

export interface GradeEntry {
  id: string;
  name: string;
  weight: number;
  score: number;
}

// Interface for StudyQuest functionality
export interface Quest {
  id: string;
  title: string;
  xp: number;
  status: 'available' | 'completed';
  deadline: string;
  category: string;
}
