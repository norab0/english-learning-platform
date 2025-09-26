export interface Exam {
  id: string;
  title: string;
  description: string;
  courseId?: string; // Made optional for standalone exams
  level: 'beginner' | 'intermediate' | 'advanced';
  questions: Question[];
  duration: number; // in minutes
  passingScore: number; // percentage
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'fill-in-blank';
  options?: string[];
  correctAnswer: string | string[] | number;
  points: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  answers: Answer[];
  score?: number;
  completedAt?: Date;
  startedAt: Date;
}

export interface Answer {
  questionId: string;
  answer: string | string[] | number;
  isCorrect?: boolean;
}
