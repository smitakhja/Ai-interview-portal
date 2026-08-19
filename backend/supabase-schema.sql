-- ============================================
-- AI Interview Portal — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  target_role TEXT DEFAULT 'Software Engineer',
  experience TEXT DEFAULT '1-3 years',
  skills JSONB DEFAULT '["JavaScript","React","Node.js","SQL"]'::jsonb,
  avatar_color TEXT DEFAULT '#3457D5',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Interview sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'general',
  results JSONB DEFAULT '[]'::jsonb,
  average_score INTEGER DEFAULT 0,
  verdict TEXT,
  questions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_interview_user ON interview_sessions(user_id, created_at DESC);

-- 4. Quiz results
CREATE TABLE IF NOT EXISTS quiz_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic TEXT DEFAULT 'javascript',
  score INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  breakdown JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quiz_user ON quiz_results(user_id, created_at DESC);

-- 5. Aptitude results
CREATE TABLE IF NOT EXISTS aptitude_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  by_category JSONB DEFAULT '{}'::jsonb,
  breakdown JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_aptitude_user ON aptitude_results(user_id, created_at DESC);

-- 6. Resume analyses
CREATE TABLE IF NOT EXISTS resume_analyses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_name TEXT DEFAULT 'resume',
  file_type TEXT DEFAULT 'text',
  score INTEGER DEFAULT 0,
  skills JSONB DEFAULT '[]'::jsonb,
  strengths JSONB DEFAULT '[]'::jsonb,
  improvements JSONB DEFAULT '[]'::jsonb,
  extracted_snippet TEXT,
  improved_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_resume_user ON resume_analyses(user_id, created_at DESC);

-- 7. Progress tracking
CREATE TABLE IF NOT EXISTS progress (
  user_id TEXT PRIMARY KEY,
  resume_analyzer JSONB DEFAULT '{"attempts":0,"bestScore":0}'::jsonb,
  mock_interview JSONB DEFAULT '{"attempts":0,"bestScore":0}'::jsonb,
  technical_quiz JSONB DEFAULT '{"attempts":0,"bestScore":0}'::jsonb,
  aptitude_test JSONB DEFAULT '{"attempts":0,"bestScore":0}'::jsonb,
  hr_interview JSONB DEFAULT '{"attempts":0,"bestScore":0}'::jsonb,
  history JSONB DEFAULT '[]'::jsonb,
  readiness INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Enable Row Level Security (optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE aptitude_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (your backend uses service key)
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON interview_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON quiz_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON aptitude_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON resume_analyses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON progress FOR ALL USING (true) WITH CHECK (true);
