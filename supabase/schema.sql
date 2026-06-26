-- ═══════════════════════════════════════════════
--   Dating Planner — Supabase Schema
--   Run this in: Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. User Profiles ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 2. Date Plans ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  mood        TEXT DEFAULT 'romantic',
  date        DATE,
  time        TEXT,
  location    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own dates" ON public.dates
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_dates_user_id ON public.dates(user_id);
CREATE INDEX idx_dates_date    ON public.dates(date DESC);

-- ── 3. Photos (Scrapbook) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.photos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_id     UUID REFERENCES public.dates(id) ON DELETE SET NULL,
  image_url   TEXT NOT NULL,
  caption     TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own photos" ON public.photos
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_photos_user_id ON public.photos(user_id);

-- ── 4. Budget ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.budget (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_id     UUID REFERENCES public.dates(id) ON DELETE SET NULL,
  amount      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  note        TEXT NOT NULL,
  category    TEXT DEFAULT 'Lainnya',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.budget ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own budget" ON public.budget
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_budget_user_id ON public.budget(user_id);

-- ── 5. Couple Challenges ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.challenges (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  frequency   TEXT DEFAULT 'once'   CHECK (frequency IN ('daily', 'weekly', 'once')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own challenges" ON public.challenges
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_challenges_user_id ON public.challenges(user_id);

-- ── 6. Secret Notes ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  unlock_time TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notes" ON public.notes
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_notes_user_id ON public.notes(user_id);

-- ── 7. Calendar Events ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  date        DATE NOT NULL,
  type        TEXT DEFAULT 'other' CHECK (type IN ('anniversary', 'birthday', 'date', 'other')),
  reminder    BOOLEAN DEFAULT true,
  color       TEXT DEFAULT '#FF6B9D',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own events" ON public.calendar_events
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_calendar_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_date    ON public.calendar_events(date);

-- ── 8. Progress Metrics ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.progress (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric      TEXT NOT NULL,
  icon        TEXT DEFAULT '📊',
  value       INTEGER DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, metric)
);

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON public.progress
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_progress_user_id ON public.progress(user_id);

-- ═══════════════════════════════════════════════
--   Supabase STORAGE — bucket setup
--   Run separately or in Dashboard > Storage
-- ═══════════════════════════════════════════════

-- Create bucket for photos (run in Dashboard > Storage > New Bucket)
-- Bucket name: photos
-- Public: true

-- Storage policies (run in SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Photos are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ═══════════════════════════════════════════════
--   Sample data (optional — remove in production)
-- ═══════════════════════════════════════════════

-- After creating your account, you can seed default progress metrics:
-- The app does this automatically on first load.
