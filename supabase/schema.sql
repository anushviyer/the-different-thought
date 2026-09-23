CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(60) NOT NULL UNIQUE,
    slug VARCHAR(80) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(300) NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image_url TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    featured BOOLEAN DEFAULT false,
    author_name VARCHAR(120) DEFAULT 'Anush',
    reading_time VARCHAR(30) DEFAULT '4 min read',
    views INTEGER DEFAULT 0,
    seo_title VARCHAR(255),
    seo_description TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.author_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL DEFAULT 'Anush',
    headline VARCHAR(255) DEFAULT 'Writer, observer, and traveler.',
    profile_image_url TEXT,
    short_bio TEXT,
    full_story TEXT,
    philosophy TEXT,
    interests TEXT[] DEFAULT ARRAY['Analog Photography', 'Pour-Over Coffee', 'Architecture'],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_name VARCHAR(150) NOT NULL DEFAULT 'The Different Thought',
    tagline VARCHAR(255) DEFAULT 'Stories, ideas & observations from a different point of view.',
    contact_email VARCHAR(255) DEFAULT 'hello@thedifferentthought.com',
    footer_text TEXT DEFAULT 'A personal digital journal exploring the nuances of everyday life.',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(120),
    status VARCHAR(30) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public articles read" ON public.articles FOR SELECT USING (status = 'published' OR auth.role() = 'authenticated');
CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public tags read" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public author read" ON public.author_profile FOR SELECT USING (true);
CREATE POLICY "Public settings read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public subscribers insert" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin write articles" ON public.articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write tags" ON public.tags FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write author" ON public.author_profile FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');