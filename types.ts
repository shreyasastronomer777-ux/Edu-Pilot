export enum View {
  DASHBOARD = 'DASHBOARD',
  LESSON_PLANNER = 'LESSON_PLANNER',
  QUIZ_MAKER = 'QUIZ_MAKER',
  VISUAL_STUDIO = 'VISUAL_STUDIO',
  HOMEWORK_CHECKER = 'HOMEWORK_CHECKER',
  ATTENDANCE = 'ATTENDANCE',
  PLAGIARISM_CHECKER = 'PLAGIARISM_CHECKER'
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
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}