
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export enum Category {
  DUA = 'Dua',
  QURAN = 'Qur\'an',
  HADITH = 'Hadith',
  FIQH = 'Fiqh',
  HISTORY = 'History',
  GENERAL = 'General'
}
