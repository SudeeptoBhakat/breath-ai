-- ===================================================================
-- BreatheBetter (PranaAir) - Supabase PostgreSQL Schema
-- Lets Code Diwali Challenge 2026
-- ===================================================================

-- 1. User Bookmarked Locations
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'guest-user',
    city_name TEXT NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. User Notification & Smart Alert Thresholds
CREATE TABLE IF NOT EXISTS public.user_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'guest-user',
    city_name TEXT NOT NULL,
    threshold_aqi INTEGER DEFAULT 150,
    notify_pm25 BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Community Air Quality Reports (Crowdsourced Ground Observations)
CREATE TABLE IF NOT EXISTS public.community_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_name TEXT NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    smell_severity TEXT CHECK (smell_severity IN ('None', 'Mild Smog', 'Strong Smoke', 'Acrid/Burning')),
    visibility_meters INTEGER DEFAULT 1000,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Row Level Security (RLS) policies for open demo
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to favorites" ON public.user_favorites FOR SELECT USING (true);
CREATE POLICY "Allow public insert to favorites" ON public.user_favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete from favorites" ON public.user_favorites FOR DELETE USING (true);

CREATE POLICY "Allow public read access to alerts" ON public.user_alerts FOR SELECT USING (true);
CREATE POLICY "Allow public upsert to alerts" ON public.user_alerts FOR ALL USING (true);

CREATE POLICY "Allow public read community reports" ON public.community_reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert community reports" ON public.community_reports FOR INSERT WITH CHECK (true);
