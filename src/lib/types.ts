// File: src/lib/types.ts

export type Theme = 'light' | 'dark' | 'very-dark';

export type Role = 'user' | 'assistant';

export interface Message {
  role: Role;
  content: string;
  timestamp?: string;
}

export interface Conversation {
  id: string;
  title: string;
  time: string;
  messages: Message[];
}

export interface ThemeClasses {
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  hover: string;
  hoverSecondary: string;
}

export interface AIResponse {
  role: Role;
  content: string;
  document?: {
    fileName: string;
    mimeType: string;
    data: string;
  };
}
