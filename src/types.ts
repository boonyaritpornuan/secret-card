export interface Card {
  q: string;
  a: string;
}

export interface SetProgress {
  setId: string; // e.g., "p1-s1", "p2-s5"
  partId: number; // 1, 2, or 3
  label: string; // e.g., "ชุดที่ 1"
  completed: boolean;
  rememberedCount: number;
  missedCount: number;
  totalCount: number;
  unlocked: boolean;
  lastUpdated: string;
  lastIndex?: number;
  cardResults?: ('got' | 'miss' | null)[];
}

export interface Part {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  sets: {
    id: string;
    label: string;
    cards: Card[];
  }[];
}

export interface ExamQuestion {
  id: number;
  q: string;
  passage?: string | null;
  choices: {
    [key: string]: string;
  };
  answer: string | null;
  explanation?: string | null;
}

export interface ExamProgress {
  examId: string;
  title: string;
  score: number;
  totalQuestions: number;
  completed: boolean;
  lastUpdated: string;
}

export type PositionId = 'paph' | 'sphu';

export interface Position {
  id: PositionId;
  name: string;
  subtitle: string;
  tagline: string;
  badge: string;
  parts: Part[];
  exams: { id: string; title: string; count: number }[];
  examLoaders: Record<string, () => Promise<any>>;
  progressKey: string;
  examProgressKey: string;
}
