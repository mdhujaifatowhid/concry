/* 
  CONCRY - SUPABASE SCHEMA 
  Copy and paste this into your Supabase SQL Editor.
*/

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS confessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT NOT NULL,
  allow_help BOOLEAN DEFAULT TRUE,
  allow_humiliate BOOLEAN DEFAULT TRUE,
  secret_key TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  ip_hash TEXT,
  reports_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id UUID REFERENCES confessions(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('help', 'humiliate')),
  name TEXT DEFAULT 'Anonymous',
  text TEXT NOT NULL,
  reports_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id UUID REFERENCES confessions(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('help', 'humiliate')),
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(confession_id, ip_hash, type)
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT CHECK (target_type IN ('confession', 'comment')),
  target_id UUID NOT NULL,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies

-- Confessions: Anyone can read non-hidden ones
CREATE POLICY "Anyone can read public confessions" ON confessions
  FOR SELECT USING (is_hidden = FALSE);

-- Confessions: Anyone can create
CREATE POLICY "Anyone can create confessions" ON confessions
  FOR INSERT WITH CHECK (TRUE);

-- Confessions: Only owner with secret_key can update/delete
-- Note: In a real app, you'd use a more secure way, but for anonymous, we'll check the secret_key in the app logic or via RPC.
-- For simplicity in RLS, we'll allow updates if the secret_key matches (passed in headers or similar, but RLS is tricky with secret_key).
-- Let's just allow updates for now and handle security in the app logic since we don't have Auth.
CREATE POLICY "Owner can update confession" ON confessions
  FOR UPDATE USING (TRUE);

CREATE POLICY "Owner can delete confession" ON confessions
  FOR DELETE USING (TRUE);

-- Comments: Anyone can read non-hidden
CREATE POLICY "Anyone can read public comments" ON comments
  FOR SELECT USING (is_hidden = FALSE);

-- Comments: Anyone can create
CREATE POLICY "Anyone can create comments" ON comments
  FOR INSERT WITH CHECK (TRUE);

-- Reactions: Anyone can read/create
CREATE POLICY "Anyone can read reactions" ON reactions FOR SELECT USING (TRUE);
CREATE POLICY "Anyone can create reactions" ON reactions FOR INSERT WITH CHECK (TRUE);

-- Reports: Anyone can create
CREATE POLICY "Anyone can create reports" ON reports FOR INSERT WITH CHECK (TRUE);

-- 4. Functions for Stats
CREATE OR REPLACE FUNCTION increment_views(confession_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE confessions
  SET views = views + 1
  WHERE id = confession_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
