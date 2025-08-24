import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { 
  GeneratedImage, 
  GeneratedVideo, 
  GeneratedMusic, 
  AISearchResult, 
  ChatSession 
} from '../types';
import type {
  DatabaseGeneratedImage,
  DatabaseGeneratedVideo,
  DatabaseGeneratedMusic,
  DatabaseAISearchResult,
  DatabaseChatSession
} from '../lib/supabase';

// Transform functions to convert between database and app types
const transformDbImageToApp = (dbImage: DatabaseGeneratedImage): GeneratedImage => ({
  id: dbImage.id,
  prompt: dbImage.prompt,
  imageUrls: dbImage.image_urls,
  timestamp: dbImage.created_at,
  aspectRatio: dbImage.aspect_ratio,
  style: dbImage.style,
  negativePrompt: dbImage.negative_prompt,
  seed: dbImage.seed,
});

const transformDbVideoToApp = (dbVideo: DatabaseGeneratedVideo): GeneratedVideo => ({
  id: dbVideo.id,
  prompt: dbVideo.prompt,
  videoUrls: dbVideo.video_urls,
  timestamp: dbVideo.created_at,
  model: dbVideo.model,
  seed: dbVideo.seed,
  inputImage: dbVideo.input_image,
});

const transformDbMusicToApp = (dbMusic: DatabaseGeneratedMusic): GeneratedMusic => ({
  id: dbMusic.id,
  prompt: dbMusic.prompt,
  title: dbMusic.title,
  style: dbMusic.style,
  isInstrumental: dbMusic.is_instrumental,
  audioUrl: dbMusic.audio_url,
  timestamp: dbMusic.created_at,
});

const transformDbSearchToApp = (dbSearch: DatabaseAISearchResult): AISearchResult => ({
  id: dbSearch.id,
  prompt: dbSearch.prompt,
  result: dbSearch.result,
  sources: dbSearch.sources,
  timestamp: dbSearch.created_at,
});

const transformDbChatToApp = (dbChat: DatabaseChatSession): ChatSession => ({
  id: dbChat.id,
  title: dbChat.title,
  messages: dbChat.messages,
  lastUpdated: dbChat.updated_at,
  personaName: dbChat.persona_name,
  systemInstruction: dbChat.system_instruction,
  config: dbChat.config,
});

export const useDatabase = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Generated Images
  const saveGeneratedImage = async (image: GeneratedImage) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('generated_images')
      .insert({
        id: image.id,
        user_id: user.id,
        prompt: image.prompt,
        image_urls: image.imageUrls,
        aspect_ratio: image.aspectRatio,
        style: image.style,
        negative_prompt: image.negativePrompt,
        seed: image.seed,
        created_at: image.timestamp,
      });
    
    if (error) console.error('Error saving image:', error);
  };

  const loadGeneratedImages = async (limit = 10): Promise<GeneratedImage[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error loading images:', error);
      return [];
    }
    
    return data.map(transformDbImageToApp);
  };

  const deleteGeneratedImage = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('generated_images')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) console.error('Error deleting image:', error);
  };

  // Generated Videos
  const saveGeneratedVideo = async (video: GeneratedVideo) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('generated_videos')
      .insert({
        id: video.id,
        user_id: user.id,
        prompt: video.prompt,
        video_urls: video.videoUrls,
        model: video.model,
        seed: video.seed,
        input_image: video.inputImage,
        created_at: video.timestamp,
      });
    
    if (error) console.error('Error saving video:', error);
  };

  const loadGeneratedVideos = async (limit = 10): Promise<GeneratedVideo[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('generated_videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error loading videos:', error);
      return [];
    }
    
    return data.map(transformDbVideoToApp);
  };

  const deleteGeneratedVideo = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('generated_videos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) console.error('Error deleting video:', error);
  };

  // Generated Music
  const saveGeneratedMusic = async (music: GeneratedMusic) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('generated_music')
      .insert({
        id: music.id,
        user_id: user.id,
        prompt: music.prompt,
        title: music.title,
        style: music.style,
        is_instrumental: music.isInstrumental,
        audio_url: music.audioUrl,
        created_at: music.timestamp,
      });
    
    if (error) console.error('Error saving music:', error);
  };

  const loadGeneratedMusic = async (limit = 10): Promise<GeneratedMusic[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('generated_music')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error loading music:', error);
      return [];
    }
    
    return data.map(transformDbMusicToApp);
  };

  const deleteGeneratedMusic = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('generated_music')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) console.error('Error deleting music:', error);
  };

  // AI Search Results
  const saveAISearchResult = async (result: AISearchResult) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('ai_search_results')
      .insert({
        id: result.id,
        user_id: user.id,
        prompt: result.prompt,
        result: result.result,
        sources: result.sources,
        created_at: result.timestamp,
      });
    
    if (error) console.error('Error saving search result:', error);
  };

  const loadAISearchResults = async (limit = 10): Promise<AISearchResult[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('ai_search_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error loading search results:', error);
      return [];
    }
    
    return data.map(transformDbSearchToApp);
  };

  const deleteAISearchResult = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('ai_search_results')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) console.error('Error deleting search result:', error);
  };

  // Chat Sessions
  const saveChatSession = async (session: ChatSession) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('chat_sessions')
      .upsert({
        id: session.id,
        user_id: user.id,
        title: session.title,
        persona_name: session.personaName,
        system_instruction: session.systemInstruction,
        messages: session.messages,
        config: session.config,
        created_at: session.lastUpdated,
        updated_at: session.lastUpdated,
      });
    
    if (error) console.error('Error saving chat session:', error);
  };

  const loadChatSessions = async (limit = 10): Promise<ChatSession[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error loading chat sessions:', error);
      return [];
    }
    
    return data.map(transformDbChatToApp);
  };

  const deleteChatSession = async (id: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (error) console.error('Error deleting chat session:', error);
  };

  return {
    user,
    isLoading,
    // Images
    saveGeneratedImage,
    loadGeneratedImages,
    deleteGeneratedImage,
    // Videos
    saveGeneratedVideo,
    loadGeneratedVideos,
    deleteGeneratedVideo,
    // Music
    saveGeneratedMusic,
    loadGeneratedMusic,
    deleteGeneratedMusic,
    // Search
    saveAISearchResult,
    loadAISearchResults,
    deleteAISearchResult,
    // Chat
    saveChatSession,
    loadChatSessions,
    deleteChatSession,
  };
};