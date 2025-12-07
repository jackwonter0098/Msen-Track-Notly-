
export const MOODS = ['😊', '💪', '💡', '😐', '😢'] as const;
export type Mood = typeof MOODS[number];

export interface Note {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  mood: Mood;
  text: string;
  createdAt: number; // timestamp
  updatedAt?: number; // timestamp
}

export interface Challenge {
  id:string;
  title: string;
  startDate: string; // ISO string YYYY-MM-DD
  durationDays: number;
  status: 'active' | 'completed';
  isArchived: boolean;
  notes: Note[];
}
