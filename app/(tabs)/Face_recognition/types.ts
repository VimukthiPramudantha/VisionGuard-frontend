// app/(tabs)/Face_recognition/types.ts

export type TabType = 'identify' | 'register' | 'database' | 'compare';

export interface RegisteredFace {
  id: string;
  name: string;
  image_url: string;
  file_path: string;
}

export interface CompareResult {
  similarity: number;
  match: boolean;
  message: string;
}

export interface IdentifyResult {
  match: boolean;
  name?: string;
  similarity_percentage?: number;
  message: string;
}
