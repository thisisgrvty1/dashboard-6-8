export type TopLevelView = 
  | 'home'
  | 'webhook_chat' 
  | 'ai_agent' 
  | 'video_generation' 
  | 'image_generation'
  | 'ai_search'
  | 'music_generation'
  | 'settings'
  | 'imprint'
  | 'privacy_policy'
  | 'gemini_live';
  
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'de';

export interface ApiKeys {
  make: string;
  openai: string;
  gemini: string;
  suno: string;
}

// For Webhook Chat
export interface Message {
  id: string;
  sender: 'user' | 'webhook';
  text: string;
  timestamp: string;
}

export interface Module {
  id:string;
  name: string;
  webhookUrl: string;
  chatHistory: Message[];
}

// For AI Agent
export interface AIAgentMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: AIAgentMessage[];
  lastUpdated: string;
  personaName: string;
  systemInstruction: string;
  config?: {
    temperature: number;
    topP: number;
    topK: number;
  }
}

// Types for long-term persisted history
export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrls: string[]; 
  timestamp: string;
  aspectRatio: string;
  negativePrompt?: string;
  style?: string;
  seed?: number;
}

export interface GeneratedVideo {
  id: string;
  prompt: string;
  videoUrls: string[]; 
  timestamp: string;
  model: string;
  inputImage?: { mimeType: string; data: string; };
  seed?: number;
}

export interface GeneratedMusic {
  id: string;
  prompt: string;
  title: string;
  style: string;
  isInstrumental: boolean;
  audioUrl: string; 
  timestamp: string;
}

export interface GroundingChunk {
    web: {
        uri: string;
        title: string;
    }
}

export interface AISearchResult {
  id: string;
  prompt: string;
  result: string;
  sources: GroundingChunk[];
  timestamp: string;
}


// Types for active generation jobs in the queue
export interface ImageJob {
  id: string;
  prompt: string;
  aspectRatio: string;
  numberOfImages: number;
  seed?: number;
  negativePrompt?: string;
  style?: string;
  status: 'generating' | 'completed' | 'failed';
  imageUrls?: string[];
  error?: string;
  timestamp: string;
}

export interface VideoJob {
  id: string;
  prompt: string;
  numberOfVideos: number;
  seed?: number;
  model: string;
  inputImage?: { mimeType: string; data: string; };
  status: 'generating' | 'polling' | 'completed' | 'failed';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operation?: any; 
  videoUrls?: string[];
  error?: string;
  timestamp: string;
  statusMessage: string;
}

export interface MusicJob {
  id: string;
  prompt: string;
  title: string;
  style: string;
  isInstrumental: boolean;
  status: 'generating' | 'polling' | 'completed' | 'failed';
  audioUrl?: string;
  error?: string;
  timestamp: string;
  statusMessage: string;
}

export type CombinedJob = (ImageJob & { type: 'image' }) | (VideoJob & { type: 'video' }) | (MusicJob & { type: 'music' });

export type ActivityStreamItem = 
  | (ImageJob & { type: 'image' })
  | (VideoJob & { type: 'video' })
  | (MusicJob & { type: 'music' })
  | (ChatSession & { type: 'agent' })
  | (AISearchResult & { type: 'search' });