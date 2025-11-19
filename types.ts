export enum View {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  QUIZ = 'QUIZ',
  LIVE_INTERVIEW = 'LIVE_INTERVIEW',
  FIND_ATTORNEY = 'FIND_ATTORNEY',
  RESOURCES = 'RESOURCES',
  PAYMENT = 'PAYMENT',
  PRIVACY = 'PRIVACY',
  TERMS = 'TERMS',
  SUPPORT = 'SUPPORT',
  FAQ = 'FAQ',
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
}

export enum QuizCategory {
  AMERICAN_GOVERNMENT = 'American Government',
  AMERICAN_HISTORY = 'American History',
  INTEGRATED_CIVICS = 'Integrated Civics',
  CIVIC_DUTIES = 'Civic Duties',
  MIXED = 'Mixed Review'
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
}

export interface QuizResult {
  total: number;
  correct: number;
  date: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
}

export interface UserStats {
  quizzesTaken: number;
  totalCorrect: number;
  totalQuestions: number;
  masteryByTopic: Record<string, number>; // 0-100
  isPremium: boolean;
  questionsInWindow: number;
  windowStartTime: number;
}