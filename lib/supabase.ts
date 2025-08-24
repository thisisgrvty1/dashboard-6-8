import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate URL format
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl)) {
  console.warn('Supabase environment variables are missing or invalid. Database features will be disabled.');
  // Create a mock client that won't crash the app
  export const supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      insert: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      select: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      upsert: () => Promise.resolve({ error: new Error('Supabase not configured') })
    })
  } as any;
} else {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey);
}


// Database types
export interface DatabaseGeneratedImage {
  id: string;
  user_id: string;
  prompt: string;
  image_urls: string[];
  aspect_ratio: string;
  style?: string;
  negative_prompt?: string;
  seed?: number;
  created_at: string;
}

export interface DatabaseGeneratedVideo {
  id: string;
  user_id: string;
  prompt: string;
  video_urls: string[];
  model: string;
  seed?: number;
  input_image?: { mimeType: string; data: string };
  created_at: string;
}

export interface DatabaseGeneratedMusic {
  id: string;
  user_id: string;
  prompt: string;
  title: string;
  style: string;
  is_instrumental: boolean;
  audio_url: string;
  created_at: string;
}

export interface DatabaseAISearchResult {
  id: string;
  user_id: string;
  prompt: string;
  result: string;
  sources: Array<{ web: { uri: string; title: string } }>;
  created_at: string;
}

export interface DatabaseChatSession {
  id: string;
  user_id: string;
  title: string;
  persona_name: string;
  system_instruction: string;
  messages: Array<{ id: string; sender: 'user' | 'model'; text: string }>;
  config?: {
    temperature: number;
    topP: number;
    topK: number;
  };
  created_at: string;
  updated_at: string;
}