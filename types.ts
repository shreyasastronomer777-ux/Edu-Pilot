
export enum View {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  LESSON_PLANNER = 'LESSON_PLANNER',
  QUIZ_MAKER = 'QUIZ_MAKER',
  VISUAL_STUDIO = 'VISUAL_STUDIO',
  HOMEWORK_CHECKER = 'HOMEWORK_CHECKER',
  ATTENDANCE = 'ATTENDANCE',
  PLAGIARISM_CHECKER = 'PLAGIARISM_CHECKER',
  SV_CHATBOT = 'SV_CHATBOT',
  INSTANT_LESSON = 'INSTANT_LESSON',
  WORKSHEET_GENERATOR = 'WORKSHEET_GENERATOR',
  PATHFINDER_MAKER = 'PATHFINDER_MAKER',
  EXAM_GENERATOR = 'EXAM_GENERATOR',
  PPT_GENERATOR = 'PPT_GENERATOR',
  GUEST_ASSESSMENT = 'GUEST_ASSESSMENT',
  // Student Views
  FLASHCARDS = 'FLASHCARDS',
  STUDY_NOTES = 'STUDY_NOTES',
  AI_SUMMARIZER = 'AI_SUMMARIZER',
  STUDENT_QUIZ = 'STUDENT_QUIZ',
  FOCUS_ROOM = 'FOCUS_ROOM',
  DOUBT_SOLVER = 'DOUBT_SOLVER',
  QUICK_REVISION = 'QUICK_REVISION',
  SVG_STUDY_CARD = 'SVG_STUDY_CARD',
  EXAM_PREP = 'EXAM_PREP',
  // Guardian and Admin Views
  PARENT_PORTAL = 'PARENT_PORTAL',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN'
}

export type Role = 'teacher' | 'student' | 'parent' | 'admin';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ExamQuestion {
  type: 'MCQ' | 'SHORT' | 'LONG';
  question: string;
  marks: number;
  bloomLevel: string;
  estimatedTime: string;
  answerKey?: string;
  markingScheme?: string[];
  options?: string[];
}

export interface ExamPaper {
  title: string;
  subject: string;
  grade: string;
  totalMarks: number;
  duration: string;
  instructions: string[];
  sections: {
    name: string;
    description: string;
    questions: ExamQuestion[];
  }[];
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export interface SlideDeck {
  title: string;
  slides: { title: string; content: string[]; visualPrompt: string; check?: string }[];
}

export interface PPTProject {
  outline: SlideDeck;
  vbaScript: string;
}

export interface BrainBreak {
  activityName: string;
  duration: string;
  instructions: string[];
  pedagogicalBenefit: string;
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

export interface Quest {
  id: string;
  title: string;
  xp: number;
  status: 'available' | 'completed';
  deadline: string;
  category: string;
}

export interface DailyChallenge {
  id: string;
  task: string;
  xp: number;
  completed: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  text: string;
  timestamp: string;
}

export interface AccessCode {
  code: string;
  studentId: string;
  studentName: string;
  expires: string;
}
