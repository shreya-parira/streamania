
export interface Quiz {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  isActive: boolean;
  timeLimit: number; // in seconds
  createdAt: Date;
  createdBy: string; // admin user ID
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizAnswer {
  id: string;
  quizId: string;
  userId: string;
  username: string;
  selectedOptionId: string;
  betAmount: number;
  isCorrect?: boolean;
  pointsWon?: number;
  submittedAt: Date;
}
