/*
  # Create history tables for AI Dashboard

  1. New Tables
    - `generated_images`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `prompt` (text)
      - `image_urls` (jsonb array)
      - `aspect_ratio` (text)
      - `style` (text, optional)
      - `negative_prompt` (text, optional)
      - `seed` (integer, optional)
      - `created_at` (timestamp)
    - `generated_videos`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `prompt` (text)
      - `video_urls` (jsonb array)
      - `model` (text)
      - `seed` (integer, optional)
      - `input_image` (jsonb, optional)
      - `created_at` (timestamp)
    - `generated_music`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `prompt` (text)
      - `title` (text)
      - `style` (text)
      - `is_instrumental` (boolean)
      - `audio_url` (text)
      - `created_at` (timestamp)
    - `ai_search_results`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `prompt` (text)
      - `result` (text)
      - `sources` (jsonb array)
      - `created_at` (timestamp)
    - `chat_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `persona_name` (text)
      - `system_instruction` (text)
      - `messages` (jsonb array)
      - `config` (jsonb, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Generated Images Table
CREATE TABLE IF NOT EXISTS generated_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt text NOT NULL,
  image_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  aspect_ratio text NOT NULL DEFAULT '1:1',
  style text,
  negative_prompt text,
  seed integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own generated images"
  ON generated_images
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Generated Videos Table
CREATE TABLE IF NOT EXISTS generated_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt text NOT NULL,
  video_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  model text NOT NULL DEFAULT 'veo-2.0-generate-001',
  seed integer,
  input_image jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own generated videos"
  ON generated_videos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Generated Music Table
CREATE TABLE IF NOT EXISTS generated_music (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt text NOT NULL,
  title text NOT NULL,
  style text NOT NULL DEFAULT '',
  is_instrumental boolean NOT NULL DEFAULT false,
  audio_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE generated_music ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own generated music"
  ON generated_music
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- AI Search Results Table
CREATE TABLE IF NOT EXISTS ai_search_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt text NOT NULL,
  result text NOT NULL,
  sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_search_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own search results"
  ON ai_search_results
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  persona_name text NOT NULL,
  system_instruction text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  config jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own chat sessions"
  ON chat_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_images_user_created 
  ON generated_images(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_videos_user_created 
  ON generated_videos(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_music_user_created 
  ON generated_music(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_search_results_user_created 
  ON ai_search_results(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_updated 
  ON chat_sessions(user_id, updated_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for chat_sessions updated_at
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();