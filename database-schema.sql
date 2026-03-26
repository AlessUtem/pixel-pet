-- ============================================
-- PIXEL PET DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (Users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  total_score INTEGER DEFAULT 0,
  rank INTEGER GENERATED ALWAYS AS STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ============================================
-- 2. PETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT 'generic', -- 'cat', 'dog', 'dragon', etc
  stage TEXT DEFAULT 'egg', -- 'egg', 'baby', 'teen', 'adult'
  
  -- Stats
  hunger INTEGER DEFAULT 50,
  energy INTEGER DEFAULT 100,
  happiness INTEGER DEFAULT 75,
  health INTEGER DEFAULT 100,
  
  -- Metadata
  birth_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  last_action_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  is_alive BOOLEAN DEFAULT TRUE,
  death_date TIMESTAMP WITH TIME ZONE,
  
  -- Experience
  experience INTEGER DEFAULT 0,
  total_actions INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ============================================
-- 3. PET ACTIONS LOG
-- ============================================
CREATE TABLE IF NOT EXISTS pet_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'feed', 'play', 'sleep', 'pet'
  value_change INTEGER, -- how much stat changed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ============================================
-- 4. PET STATS HISTORY (for graphs)
-- ============================================
CREATE TABLE IF NOT EXISTS pet_stats_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  hunger INTEGER NOT NULL,
  energy INTEGER NOT NULL,
  happiness INTEGER NOT NULL,
  health INTEGER NOT NULL,
  stage TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_stats_history ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Pets: Users can only see their own pets
CREATE POLICY "Users can view their own pets"
ON pets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pets"
ON pets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets"
ON pets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets"
ON pets FOR DELETE
USING (auth.uid() = user_id);

-- Pet Actions: Users can only see actions from their own pets
CREATE POLICY "Users can view actions from their own pets"
ON pet_actions FOR SELECT
USING (
  pet_id IN (
    SELECT id FROM pets WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create actions for their own pets"
ON pet_actions FOR INSERT
WITH CHECK (
  pet_id IN (
    SELECT id FROM pets WHERE user_id = auth.uid()
  )
);

-- Pet Stats History: Users can only see stats from their own pets
CREATE POLICY "Users can view stats from their own pets"
ON pet_stats_history FOR SELECT
USING (
  pet_id IN (
    SELECT id FROM pets WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create stats for their own pets"
ON pet_stats_history FOR INSERT
WITH CHECK (
  pet_id IN (
    SELECT id FROM pets WHERE user_id = auth.uid()
  )
);

-- ============================================
-- INDEXES (for performance)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_actions_pet_id ON pet_actions(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_stats_pet_id ON pet_stats_history(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_actions_created ON pet_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_pet_stats_recorded ON pet_stats_history(recorded_at);

-- ============================================
-- VIEWS (optional, for leaderboard)
-- ============================================
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.id,
  p.display_name,
  p.avatar_url,
  p.total_score,
  COUNT(DISTINCT pt.id) as pets_count,
  AVG(pt.health) as avg_pet_health,
  ROW_NUMBER() OVER (ORDER BY p.total_score DESC) as rank
FROM profiles p
LEFT JOIN pets pt ON p.id = pt.user_id AND pt.is_alive = TRUE
GROUP BY p.id, p.display_name, p.avatar_url, p.total_score
ORDER BY p.total_score DESC;
