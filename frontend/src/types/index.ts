// API レスポンスの型定義
export interface Choice {
  id: number;
  text: string;
  pointValue: number;
}

export interface Odai {
  id: number;
  text: string;
  choices: Choice[];
}

export interface DailyChallengeResponse {
  odais: Odai[];
}

export interface Session {
  sessionId: number;
}

export interface AnswerResponse {
  earnedPoint: number;
  totalScore: number;
}

export interface ResultResponse {
  totalScore: number;
  zScore: number;
  mean: number;
  stdDev: number;
}

// コンポーネント用の状態管理型
export interface GameState {
  sessionId: number | null;
  currentQuestionIndex: number;
  answers: UserAnswer[];
  totalScore: number;
  isCompleted: boolean;
}

export interface UserAnswer {
  odaiId: number;
  choiceId: number;
  earnedPoint: number;
}

// UIコンポーネント用の型
export interface QuestionCardProps {
  odai: Odai;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (choiceId: number) => void;
  isLoading?: boolean;
}

export interface ResultCardProps {
  result: ResultResponse;
  onRestart: () => void;
}

export interface ScoreDisplayProps {
  score: number;
  isAnimated?: boolean;
}

// API エラーレスポンス
export interface ApiError {
  error: string;
} 