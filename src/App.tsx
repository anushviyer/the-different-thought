import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, NavLink, Outlet, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  Search, Menu, X, ArrowUpRight, ArrowRight, ArrowLeft, Clock, Calendar, 
  Share2, Check, Sparkles, Compass, Mail, Feather, LayoutDashboard, 
  FileText, Image as ImageIcon, Layers, Tag as TagIcon, Users, UserCheck, 
  Settings, LogOut, Plus, Edit3, Trash2, Eye, Save, Lock, Download, 
  CheckCircle2, Heading1, Heading2, Bold, Italic, Quote
} from 'lucide-react';

/* ==========================================================================
   1. TYPES
   ========================================================================== */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  article_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category_id: string;
  category?: Category;
  status: 'draft' | 'published' | 'scheduled';
  featured?: boolean;
  author_name: string;
  reading_time: string;
  views: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthorProfile {
  name: string;
  headline: string;
  profile_image_url: string;
  short_bio: string;
  full_story: string;
  philosophy: string;
  interests: string[];
  instagram_url?: string;
  linkedin_url?: string;
  x_url?: string;
}

export interface SiteSettings {
  site_name: string;
  tagline: string;
  contact_email: string;
  footer_text: string;
}

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed';
  created_at: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  created_at: string;
}

/* ==========================================================================
   2. SUPABASE & DATABASE ENGINE
   ========================================================================== */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-id'));
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

const SEED_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Thoughts & Perspectives', slug: 'thoughts', description: 'Reflections on modern living, deep attention, and deliberate slowing down.' },
  { id: 'cat-2', name: 'Travel & Wandering', slug: 'travel', description: 'Journeys through quiet alleys, train windows, and unfamiliar cultures.' },
  { id: 'cat-3', name: 'Craft & Lifestyle', slug: 'lifestyle', description: 'Objects of character, ritual, tactile materials, and the beauty of analog simplicity.' },
  { id: 'cat-4', name: 'Tech & Future', slug: 'technology', description: 'Examining our relationship with algorithms, screens, and intentional technology.' },
  { id: 'cat-5', name: 'Design & Spaces', slug: 'design', description: 'Form, deliberate architecture, functional aesthetics, and mindful spaces.' },
  { id: 'cat-6', name: 'Business & Ventures', slug: 'business', description: 'Entrepreneurship, practical strategy, and turning creative ideas into reality.' }
];

const SEED_TAGS: Tag[] = [
  { id: 'tag-1', name: 'Slow Living', slug: 'slow-living' },
  { id: 'tag-2', name: 'Travel Notes', slug: 'travel-notes' },
  { id: 'tag-3', name: 'Creativity', slug: 'creativity' }
];

const SEED_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'The Art of the Unplanned Train Journey: Finding Calm in Unscheduled Hours',
    slug: 'art-of-unplanned-train-journey',
    excerpt: 'Why moving without an itinerary turns ordinary landscapes into profound personal meditations.',
    content: `<h2>The Velocity of Looking</h2><p>Modern travel has become an exercise in optimization. We benchmark flights, cross-check TripAdvisor ratings, pin seventy-four places on digital maps, and ensure every ninety-minute window contains an edible or architectural highlight.</p><p>Last spring, I took an early morning train departing from a damp platform without reserving a hotel at the destination. The rhythmic clack of the wheels against steel tracks created an unexpected rhythm in my head — one that banished the urge to refresh email feeds.</p><blockquote>"The journey begins only when our anticipation of the end dissolves."</blockquote><h2>What We Notice When We Are Not in a Hurry</h2><p>As the locomotive curved around misty valleys, strangers began chatting without the calculated urgency of networking. An older woman was peeling oranges and offering wedges to a student studying architecture. Light fell in soft, geometric slivers across worn velour seats.</p><p>We do not travel to check boxes; we travel to let the strange and the quiet reshape our internal weather.</p>`,
    cover_image_url: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=1600&auto=format&fit=crop',
    category_id: 'cat-2',
    status: 'published',
    featured: true,
    author_name: 'Anush',
    reading_time: '5 min read',
    views: 1420,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    published_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'art-2',
    title: 'The Quiet Radicalism of Finishing One Book Before Buying Another',
    slug: 'quiet-radicalism-of-finishing-one-book',
    excerpt: 'How resisting the collector impulse restored my capacity for sustained contemplation.',
    content: `<h2>The Tsundoku Dilemma</h2><p>There is a lovely Japanese word, <em>tsundoku</em>, which refers to the habit of acquiring books and piling them up unread. For years, I treated my bookshelf as a showroom of aspirational identities.</p><p>Then came the realization: collecting books is a consumer act; reading them is an intellectual and spiritual one.</p><h2>The Single-Volume Experiment</h2><p>For six months, I instituted a strict rule: not a single book could be purchased, downloaded, or borrowed until the current volume was read front to back, annotated with a pencil, and digested.</p><p>What followed was an unexpected deepening of attention. When you know there is no backup entertainment sitting on the coffee table, you engage deeply with difficult chapters.</p>`,
    cover_image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1600&auto=format&fit=crop',
    category_id: 'cat-1',
    status: 'published',
    featured: false,
    author_name: 'Anush',
    reading_time: '4 min read',
    views: 890,
    created_at: new Date(Date.now() - 345600000).toISOString(),
    updated_at: new Date(Date.now() - 345600000).toISOString(),
    published_at: new Date(Date.now() - 345600000).toISOString()
  }
];

const SEED_AUTHOR: AuthorProfile = {
  name: 'Anush',
  headline: 'Writer, observer, and traveler.',
  profile_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
  short_bio: 'I write about ordinary observations turned upside down, slow travel, tactile design, and navigating life with curious eyes.',
  full_story: 'I spent the earlier chapters of my life moving at breakneck speed through corporate milestones, always scanning the horizon for what was next rather than what was here.\n\nThe Different Thought was founded out of a simple conviction: what we look at changes based on how much patience we grant it.',
  philosophy: 'The antidote to noise is not total silence; it is deep, deliberate attention. When we slow down, everyday moments uncover their genuine meaning.',
  interests: ['Analog Photography', 'Pour-Over Coffee', 'Architecture', 'Nordic Literature', 'Minimalist Design'],
  instagram_url: 'https://instagram.com',
  linkedin_url: 'https://linkedin.com',
  x_url: 'https://x.com'
};

const SEED_SETTINGS: SiteSettings = {
  site_name: 'The Different Thought',
  tagline: 'Stories, ideas & observations from a different point of view.',
  contact_email: 'hello@thedifferentthought.com',
  footer_text: 'A personal digital journal exploring the nuances of everyday life, mindful design, and deliberate thought.'
};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`tdt_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`tdt_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(e);
  }
}

export const dbEngine = {
  async getArticles(): Promise<Article[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('articles').select('*, category:categories(*)').order('created_at', { ascending: false });
      if (!error && data) return data as Article[];
    }
    const articles = getStorage<Article[]>('articles', SEED_ARTICLES);
    const categories = await this.getCategories();
    return articles.map(art => ({ ...art, category: categories.find(c => c.id === art.category_id) }));
  },

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const articles = await this.getArticles();
    return articles.find(a => a.slug === slug) || null;
  },

  async saveArticle(article: Partial<Article>): Promise<Article> {
    const articles = await this.getArticles();
    let saved: Article;
    if (article.id) {
      const index = articles.findIndex(a => a.id === article.id);
      if (index >= 0) {
        saved = { ...articles[index], ...article, updated_at: new Date().toISOString() } as Article;
        articles[index] = saved;
      } else {
        throw new Error('Article not found');
      }
    } else {
      saved = {
        id: 'art-' + Date.now(),
        title: article.title || 'Untitled',
        slug: article.slug || ('story-' + Date.now()),
        excerpt: article.excerpt || '',
        content: article.content || '',
        cover_image_url: article.cover_image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop',
        category_id: article.category_id || '',
        status: article.status || 'draft',
        featured: article.featured || false,
        author_name: article.author_name || 'Anush',
        reading_time: article.reading_time || '4 min read',
        views: 0,
        published_at: article.status === 'published' ? new Date().toISOString() : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      articles.unshift(saved);
    }
    setStorage('articles', articles);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('articles').upsert([saved]);
    }
    return saved;
  },

  async deleteArticle(id: string): Promise<void> {
    const articles = (await this.getArticles()).filter(a => a.id !== id);
    setStorage('articles', articles);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('articles').delete().eq('id', id);
    }
  },

  async incrementViews(slug: string): Promise<void> {
    const articles = await this.getArticles();
    const target = articles.find(a => a.slug === slug);
    if (target) {
      target.views = (target.views || 0) + 1;
      setStorage('articles', articles);
    }
  },

  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && data) return data as Category[];
    }
    const categories = getStorage<Category[]>('categories', SEED_CATEGORIES);
    const articles = getStorage<Article[]>('articles', SEED_ARTICLES);
    return categories.map(cat => ({
      ...cat,
      article_count: articles.filter(a => a.category_id === cat.id && a.status === 'published').length
    }));
  },

  async saveCategory(cat: Partial<Category>): Promise<Category> {
    const categories = await this.getCategories();
    let saved: Category;
    if (cat.id) {
      const index = categories.findIndex(c => c.id === cat.id);
      saved = { ...categories[index], ...cat } as Category;
      categories[index] = saved;
    } else {
      saved = {
        id: 'cat-' + Date.now(),
        name: cat.name || 'New Category',
        slug: cat.slug || ('cat-' + Date.now()),
        description: cat.description || '',
        image_url: cat.image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop'
      };
      categories.push(saved);
    }
    setStorage('categories', categories);
    return saved;
  },

  async deleteCategory(id: string): Promise<void> {
    const categories = (await this.getCategories()).filter(c => c.id !== id);
    setStorage('categories', categories);
  },

  async getTags(): Promise<Tag[]> {
    return getStorage<Tag[]>('tags', SEED_TAGS);
  },

  async saveTag(tag: Partial<Tag>): Promise<Tag> {
    const tags = await this.getTags();
    const saved = { id: tag.id || 'tag-' + Date.now(), name: tag.name || 'New Tag', slug: tag.slug || ('tag-' + Date.now()) };
    const idx = tags.findIndex(t => t.id === saved.id);
    if (idx >= 0) tags[idx] = saved; else tags.push(saved);
    setStorage('tags', tags);
    return saved;
  },

  async deleteTag(id: string): Promise<void> {
    setStorage('tags', (await this.getTags()).filter(t => t.id !== id));
  },

  async getAuthorProfile(): Promise<AuthorProfile> {
    return getStorage<AuthorProfile>('author_profile', SEED_AUTHOR);
  },

  async saveAuthorProfile(profile: AuthorProfile): Promise<void> {
    setStorage('author_profile', profile);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('author_profile').upsert([profile]);
    }
  },

  async getSiteSettings(): Promise<SiteSettings> {
    return getStorage<SiteSettings>('site_settings', SEED_SETTINGS);
  },

  async saveSiteSettings(settings: SiteSettings): Promise<void> {
    setStorage('site_settings', settings);
    if (isSupabaseConfigured && supabase) {
      await supabase.from('site_settings').upsert([settings]);
    }
  },

  async getSubscribers(): Promise<Subscriber[]> {
    return getStorage<Subscriber[]>('subscribers', [
      { id: 'sub-1', email: 'reader@thoughtful.io', name: 'Elena Rostova', status: 'active', created_at: new Date().toISOString() }
    ]);
  },

  async addSubscriber(email: string, name?: string): Promise<{ success: boolean; message: string }> {
    const subscribers = await this.getSubscribers();
    if (subscribers.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'This email is already part of our reader circle.' };
    }
    const newSub: Subscriber = { id: 'sub-' + Date.now(), email, name, status: 'active', created_at: new Date().toISOString() };
    subscribers.unshift(newSub);
    setStorage('subscribers', subscribers);
    return { success: true, message: 'Welcome to The Different Thought dispatch.' };
  },

  async getMedia(): Promise<MediaAsset[]> {
    return getStorage<MediaAsset[]>('media', [
      { id: 'm-1', filename: 'foggy-mountain-train.jpg', url: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=1600&auto=format&fit=crop', created_at: new Date().toISOString() },
      { id: 'm-2', filename: 'solitary-reading-nook.jpg', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1600&auto=format&fit=crop', created_at: new Date().toISOString() }
    ]);
  },

  async addMedia(file: { filename: string; url: string }): Promise<MediaAsset> {
    const list = await this.getMedia();
    const asset: MediaAsset = { id: 'm-' + Date.now(), filename: file.filename, url: file.url, created_at: new Date().toISOString() };
    list.unshift(asset);
    setStorage('media', list);
    return asset;
  },

  async deleteMedia(id: string): Promise<void> {
    setStorage('media', (await this.getMedia()).filter(m => m.id !== id));
  }
};

/* ==========================================================================
   3. AUTHENTICATION CONTEXT
   ========================================================================== */
interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userEmail: null,
  login: async () => false,
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('tdt_admin_auth') === 'true');
  const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem('tdt_admin_email') || null);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || null);
        }
      });
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (!error && data.user) {
        setIsAuthenticated(true);
        setUserEmail(data.user.email || email);
        localStorage.setItem('tdt_admin_auth', 'true');
        localStorage.setItem('tdt_admin_email', email);
        return true;
      }
    }
    if (email === 'admin@thedifferentthought.com' && pass === 'Thought2026!') {
      setIsAuthenticated(true);
      setUserEmail(email);
      localStorage.setItem('tdt_admin_auth', 'true');
      localStorage.setItem('tdt_admin_email', email);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserEmail(null);
    localStorage.removeItem('tdt_admin_auth');
    localStorage.removeItem('tdt_admin_email');
  };

  return <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

/* ==========================================================================
   4. PUBLIC LAYOUT & NAVIGATION
   ========================================================================== */
export const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');

    try {
      // Save subscriber to storage or dbEngine if implemented
      const existing = JSON.parse(localStorage.getItem('dt_subscribers') || '[]');
      existing.push({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        subscribedAt: new Date().toISOString()
      });
      localStorage.setItem('dt_subscribers', JSON.stringify(existing));

      setStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
        setStatus('idle');
        setFirstName('');
        setLastName('');
        setEmail('');
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E3DC]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="The Different Thought" className="h-16 w-auto object-contain" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs uppercase tracking-widest font-medium text-[#18181B]">
            <Link to="/" className="hover:text-[#FFB300] transition">Home</Link>
            <Link to="/about" className="hover:text-[#FFB300] transition">Origin</Link>
            <Link to="/categories" className="hover:text-[#FFB300] transition">Pillars</Link>
            <Link to="/blog" className="hover:text-[#FFB300] transition">Thoughts</Link>
            <Link to="/contact" className="hover:text-[#FFB300] transition">Reach Out</Link>
          </nav>

          {/* Right Action: Subscribe Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#18181B] text-white hover:bg-black px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider transition uppercase flex items-center gap-1.5 shadow-sm"
            >
              Subscribe
            </button>
          </div>
        </div>
      </header>

      {/* Subscribe Modal Backdrop & Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#FAF8F5] border border-[#E8E3DC] rounded-2xl p-8 shadow-2xl space-y-6">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-[#71717A] hover:text-[#18181B] text-xl font-semibold leading-none"
              aria-label="Close"
            >
              &times;
            </button>

            {/* Header Text */}
            <div className="space-y-2 text-center">
              <h2 className="font-serif text-3xl font-bold text-[#18181B]">Join the Dispatch</h2>
              <p className="text-sm text-[#52525B] leading-relaxed">
                Essays on deliberate craft, quiet observations, and slow journeys — delivered straight to your inbox.
              </p>
            </div>

            {status === 'success' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center text-sm font-medium">
                Thank you for subscribing! Welcome aboard.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#71717A] mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8E3DC] rounded-xl text-sm focus:outline-none focus:border-[#18181B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#71717A] mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E8E3DC] rounded-xl text-sm focus:outline-none focus:border-[#18181B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold text-[#71717A] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E8E3DC] rounded-xl text-sm focus:outline-none focus:border-[#18181B]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 bg-[#18181B] hover:bg-black text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-50 mt-2"
                >
                  {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export const Footer: React.FC = () => (
  <footer className="bg-[#FAF8F5] border-t border-[#E8E3DC] pt-16 pb-12 mt-20">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#E8E3DC]">
        <div className="md:col-span-6 space-y-4">
          <Link to="/" className="inline-block">
            <img
              src="/logo.png"
              alt="The Different Thought"
              className="h-18 w-auto object-contain"
            />
          </Link>
          <p className="text-[#52525B] text-sm leading-relaxed max-w-md">
            An independent digital journal committed to examining everyday realities, slow journeys, deliberate craft, and unconventional viewpoints.
          </p>
        </div>

        <div className="md:col-span-3 space-y-3">
          <div className="text-xs uppercase tracking-widest text-[#71717A] font-semibold">Explore</div>
          <ul className="space-y-2 text-sm text-[#3F3F46]">
            <li><Link to="/blog" className="hover:text-[#FFB300]">All Stories</Link></li>
            <li><Link to="/about" className="hover:text-[#FFB300]">About Author</Link></li>
            <li><Link to="/categories" className="hover:text-[#FFB300]">Categories</Link></li>
            <li><Link to="/contact" className="hover:text-[#FFB300]">Contact</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3 space-y-3">
          <div className="text-xs uppercase tracking-widest text-[#71717A] font-semibold">Gateway</div>
          <ul className="space-y-2 text-sm text-[#3F3F46]">
            <li><Link to="/admin/login" className="text-[#71717A] hover:text-[#18181B]">Editorial Portal</Link></li>
            <li><Link to="/privacy" className="hover:text-[#18181B]">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-[#18181B]">Terms</Link></li>
          </ul>
        </div>
      </div>

      <div className="pt-8 text-center text-xs text-[#71717A]">
        &copy; {new Date().getFullYear()} The Different Thought. Written with deliberate focus.
      </div>
    </div>
  </footer>
);

export const PublicLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#18181B]">
    <Header />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);
/* ==========================================================================
   5. PUBLIC PAGES
   ========================================================================== */
export const HomePage: React.FC = () => {
  const [featured, setFeatured] = useState<Article | null>(null);
  const [latest, setLatest] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const articles = await dbEngine.getArticles();
      const pub = articles.filter(a => a.status === 'published');
      setFeatured(pub.find(a => a.featured) || pub[0] || null);
      setLatest(pub.slice(1, 5));
      setCategories(await dbEngine.getCategories());
      setAuthor(await dbEngine.getAuthorProfile());
    }
    load();
  }, []);

  const handleSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subEmail) {
      const res = await dbEngine.addSubscriber(subEmail);
      setSubStatus(res.message);
      setSubEmail('');
    }
  };

  return (
    <div className="space-y-24 pb-20">
      <section className="pt-12 md:pt-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181B] text-xs font-medium tracking-wider uppercase text-[#FFFFFF]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Independent Editorial Publication</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#18181B] leading-[1.12]">
              Just Thoughts,<br />Stories &amp; Everything In Between
            </h1>
            <p className="text-lg text-[#52525B] leading-relaxed max-w-xl">
              I’ve always believed that there’s more than one way to look at something. This blog is a collection of my experiences, travels, observations, interests and the thoughts that stay with me long after a moment has passed.
            </p>
            <div className="flex gap-4 pt-2">
              <Link to="/blog" className="px-6 py-3.5 bg-[#18181B] text-[#FAF8F5] font-medium text-sm rounded-full hover:bg-[#FFB300] transition-colors inline-flex items-center gap-2">
                <span>Explore The Journal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 aspect-[4/5] rounded-2xl overflow-hidden shadow-lg border border-[#E8E3DC]">
            <img src="/anush-iyer.png" alt="Contemplative" className="w-full h-full object-cover grayscale-[20%]" />
          </div>
        </div>
      </section>

      {featured && (
        <section className="px-6 max-w-6xl mx-auto">
          <div className="border-t border-[#E8E3DC] pt-12 mb-8">
            <span className="text-xs uppercase tracking-widest text-[#71717A] font-semibold">Featured Monograph</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-2xl border border-[#E8E3DC] p-6 sm:p-8">
            <div className="lg:col-span-7 aspect-[16/10] overflow-hidden rounded-xl">
              <img src={featured.cover_image_url} alt={featured.title} className="w-full h-full object-cover" />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs text-[#71717A] flex items-center gap-2">
                <span>{featured.reading_time}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#18181B]">
                <Link to={`/blog/${featured.slug}`} className="hover:text-[#FFB300] transition-colors">{featured.title}</Link>
              </h2>
              <p className="text-[#52525B] text-sm leading-relaxed">{featured.excerpt}</p>
              <Link to={`/blog/${featured.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#18181B] hover:text-[#FFB300]">
                <span>Read Full Essay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="px-6 max-w-6xl mx-auto">
        <div className="border-t border-[#E8E3DC] pt-12 mb-8 flex justify-between items-center">
          <h2 className="font-serif text-2xl font-bold text-[#18181B]">Recent Dispatches</h2>
          <Link to="/blog" className="text-xs uppercase tracking-wider font-semibold text-[#18181B] hover:text-[#FFB300]">All Stories &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {latest.map(article => (
            <article key={article.id} className="bg-white rounded-xl border border-[#E8E3DC] overflow-hidden flex flex-col">
              <Link to={`/blog/${article.slug}`} className="aspect-[16/9] overflow-hidden">
                <img src={article.cover_image_url} alt={article.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </Link>
              <div className="p-6 space-y-3">
                <span className="text-xs text-[#FFB300] uppercase font-semibold">{article.reading_time}</span>
                <h3 className="font-serif text-xl font-bold text-[#18181B]">
                  <Link to={`/blog/${article.slug}`} className="hover:text-[#FFB300]">{article.title}</Link>
                </h3>
                <p className="text-sm text-[#52525B] line-clamp-2">{article.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {author && (
        <section className="px-6 max-w-6xl mx-auto">
          <div className="bg-[#F3EFEA] border border-[#E8E3DC] rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row gap-8 items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden shrink-0 border-2 border-white">
              <img src="/anush-author.png" alt={author.name} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest text-[#71717A] font-semibold">About The Author</span>
              <h3 className="font-serif text-2xl font-bold text-[#18181B]">Hi, I'm Anush.</h3>
              <p className="text-[#52525B] text-sm leading-relaxed">I’m a second-generation entrepreneur in the world of design, someone who enjoys good conversations, new places, great coffee and the little things that make an ordinary day memorable. This is my space to share the things I experience, think about, question and discover along the way.</p>
              <Link to="/about" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#FFB300]">
                <span>Read Full Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="px-6 max-w-md mx-auto text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#18181B]">Receive The Unhurried Dispatch</h2>
        <p className="text-sm text-[#52525B]">Delivered bi-weekly. Direct thoughts on living, wandering, and making.</p>
        <form onSubmit={handleSub} className="flex gap-2">
          <input
            type="email"
            required
            placeholder="Your email address"
            value={subEmail}
            onChange={(e) => setSubEmail(e.target.value)}
            className="flex-1 px-4 py-2 bg-white border border-[#E8E3DC] rounded-full text-sm focus:outline-none"
          />
          <button type="submit" className="px-5 py-2 bg-[#18181B] text-white text-xs uppercase font-semibold rounded-full hover:bg-[#FFB300]">
            Join
          </button>
        </form>
        {subStatus && <p className="text-xs text-[#FFB300]">{subStatus}</p>}
      </section>
    </div>
  );
};

export const BlogPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setArticles((await dbEngine.getArticles()).filter(a => a.status === 'published'));
      setCategories(await dbEngine.getCategories());
    }
    load();
  }, []);

  const filtered = articles.filter(a => {
    const matchCat = selectedCat === 'all' || a.category_id === selectedCat;
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
      <div className="border-b border-[#E8E3DC] pb-6 space-y-2">
        <h1 className="font-serif text-4xl font-bold text-[#18181B]">All Essays &amp; Dispatches</h1>
        <p className="text-sm text-[#52525B]">The complete ongoing archive of personal writings and observations.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Filter by keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 bg-white border border-[#E8E3DC] rounded-lg text-sm"
        />
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="px-3 py-2 bg-white border border-[#E8E3DC] rounded-lg text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(art => (
          <article key={art.id} className="bg-white rounded-xl border border-[#E8E3DC] overflow-hidden flex flex-col">
            <Link to={`/blog/${art.slug}`} className="aspect-[16/10] overflow-hidden">
              <img src={art.cover_image_url} alt={art.title} className="w-full h-full object-cover" />
            </Link>
            <div className="p-6 space-y-3">
              <span className="text-xs text-[#FFB300] font-semibold uppercase">{art.reading_time}</span>
              <h2 className="font-serif text-xl font-bold text-[#18181B]">
                <Link to={`/blog/${art.slug}`} className="hover:text-[#FFB300]">{art.title}</Link>
              </h2>
              <p className="text-sm text-[#52525B] line-clamp-3">{art.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    async function load() {
      const art = await dbEngine.getArticleBySlug(slug!);
      setArticle(art);
      if (art) dbEngine.incrementViews(slug!);
    }
    load();
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) return <div className="py-20 text-center text-sm">Loading essay...</div>;

  return (
    <article className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <Link to="/blog" className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-[#71717A] hover:text-[#18181B]">
        <ArrowLeft className="w-3.5 h-3.5" /> Return to Archive
      </Link>
      <header className="space-y-4">
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#18181B] leading-tight">{article.title}</h1>
        <p className="font-serif italic text-lg text-[#52525B] border-l-2 border-[#FFB300] pl-4">{article.excerpt}</p>
        <div className="flex items-center justify-between pt-4 border-t border-[#E8E3DC] text-xs text-[#71717A]">
          <span>By {article.author_name} &bull; {article.reading_time}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="flex items-center gap-1 border border-[#E8E3DC] px-3 py-1 rounded-full hover:bg-white"
          >
            {copied ? <Check className="w-3 h-3 text-green-600" /> : <Share2 className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </header>
      <div className="aspect-[16/10] rounded-xl overflow-hidden border border-[#E8E3DC]">
        <img src={article.cover_image_url} alt={article.title} className="w-full h-full object-cover" />
      </div>
      <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: article.content }} />
    </article>
  );
};

export const AboutPage: React.FC = () => {
  const [author, setAuthor] = useState<AuthorProfile | null>(null);

  useEffect(() => {
    async function load() { setAuthor(await dbEngine.getAuthorProfile()); }
    load();
  }, []);

  if (!author) return null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
      <div className="flex flex-col sm:flex-row gap-8 items-center">
        <div className="w-40 h-40 rounded-2xl overflow-hidden shrink-0 border border-[#E8E3DC]">
          <img src="/anush-author.png" alt="Anush Iyer" className="w-full h-full object-cover" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-4xl font-bold text-[#18181B]">Hi, I'm Anush Iyer.</h1>
          <p className="font-serif italic text-[#FFB300]">“Entrepreneur, observer, traveller, and always curious.”</p>
          <p className="text-sm text-[#52525B] leading-relaxed">
           I'm a second-generation entrepreneur in the world of design, brought up around creativity, ideas and the process of turning them into something real. Outside of work, I enjoy travelling, good conversations, great coffee, discovering new places and noticing the little things that often go unseen.
          </p>
        </div>
      </div>
      <div className="space-y-4 border-t border-[#E8E3DC] pt-8">
        <h2 className="font-serif text-2xl font-bold text-[#18181B]">My Story</h2>
        <p className="text-sm text-[#52525B] leading-relaxed">
        I grew up around design, creativity and the business of turning ideas into something real. As a second-generation entrepreneur, I&apos;ve had the opportunity to travel, meet interesting people, experience different cultures and see the world from many perspectives.
      </p>
      <p className="text-sm text-[#52525B] leading-relaxed">
        <strong className="font-bold text-[#18181B]">The Different Thought</strong> is my space to share those experiences, ideas, observations and the little things that make life interesting &mdash; from travel and design to business, technology and everything in between.
      </p>
    </div>
  </div>
);
};

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => { async function load() { setCategories(await dbEngine.getCategories()); } load(); }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <h1 className="font-serif text-4xl font-bold text-[#18181B]">Topic Collections</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(c => (
          <Link key={c.id} to={`/category/${c.slug}`} className="p-6 bg-white border border-[#E8E3DC] rounded-xl hover:border-[#18181B] flex flex-col justify-between h-40">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#18181B]">{c.name}</h2>
              <p className="text-sm text-[#52525B] mt-1">{c.description}</p>
            </div>
            <span className="text-xs uppercase font-semibold text-[#FFB300]">{c.article_count || 0} Stories</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [catName, setCatName] = useState('');

  useEffect(() => {
    async function load() {
      const cats = await dbEngine.getCategories();
      const current = cats.find(c => c.slug === slug);
      if (current) {
        setCatName(current.name);
        const all = await dbEngine.getArticles();
        setArticles(all.filter(a => a.category_id === current.id && a.status === 'published'));
      }
    }
    load();
  }, [slug]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <h1 className="font-serif text-4xl font-bold text-[#18181B]">{catName || 'Category'}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map(art => (
          <article key={art.id} className="bg-white rounded-xl border border-[#E8E3DC] p-6 space-y-2">
            <h2 className="font-serif text-2xl font-bold text-[#18181B]"><Link to={`/blog/${art.slug}`}>{art.title}</Link></h2>
            <p className="text-sm text-[#52525B]">{art.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<Article[]>([]);

  useEffect(() => {
    async function search() {
      if (q.trim()) {
        const all = await dbEngine.getArticles();
        setResults(all.filter(a => a.status === 'published' && a.title.toLowerCase().includes(q.toLowerCase())));
      }
    }
    search();
  }, [q]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
      <h1 className="font-serif text-3xl font-bold text-[#18181B]">Search results for "{q}"</h1>
      <div className="space-y-4">
        {results.map(r => (
          <div key={r.id} className="p-6 bg-white border border-[#E8E3DC] rounded-xl space-y-1">
            <h2 className="font-serif text-xl font-bold"><Link to={`/blog/${r.slug}`}>{r.title}</Link></h2>
            <p className="text-sm text-[#52525B]">{r.excerpt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
      {/* Intro Header + Profile Circle & Social Icons */}
      <section className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
        <div className="space-y-4 max-w-xl text-center md:text-left">
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#18181B]">
            Let's Connect.
          </h1>
          <p className="text-lg md:text-xl text-[#3F3F46] font-medium leading-relaxed">
            Good conversations usually start with a simple hello.
          </p>
          <p className="text-[#52525B] leading-relaxed">
            Whether you want to share a thought, talk about something I've written, suggest an idea, or simply say hello — I'd love to hear from you.
          </p>
        </div>

        {/* Right Column: Author Photo Circle + Social Media Circles */}
        <div className="flex flex-col items-center gap-4 shrink-0">
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-2 border-[#E8E3DC] shadow-sm bg-white">
            <img
              src="anush-author.png"
              alt="Author"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Graceful fallback if author.jpg hasn't been uploaded yet
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Social Media Circular Icon Buttons */}
          <div className="flex items-center gap-3">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/anushiyer27/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full border border-[#E8E3DC] bg-white flex items-center justify-center text-[#18181B] hover:text-[#FFB300] hover:border-[#18181B] transition shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/anush-iyer-93a6bb95/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-10 h-10 rounded-full border border-[#E8E3DC] bg-white flex items-center justify-center text-[#18181B] hover:text-[#FFB300] hover:border-[#18181B] transition shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/anush.v.iyer/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-10 h-10 rounded-full border border-[#E8E3DC] bg-white flex items-center justify-center text-[#18181B] hover:text-[#FFB300] hover:border-[#18181B] transition shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Direct Contact Banner */}
      <section className="p-8 bg-white border border-[#E8E3DC] rounded-2xl shadow-sm space-y-3">
        <span className="text-xs uppercase tracking-widest font-semibold text-[#71717A] block">
          Write To Me
        </span>
        <a 
          href="mailto:hello@thedifferentthought.com"
          className="inline-flex items-center text-xl md:text-2xl font-serif font-bold text-[#18181B] hover:text-[#FFB300] transition"
        >
          hello@thedifferentthought.com &rarr;
        </a>
      </section>

      {/* Grid: What can you reach out about? */}
      <section className="space-y-6">
        <h2 className="font-serif text-2xl font-bold text-[#18181B]">
          What can you reach out about?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 bg-white border border-[#E8E3DC] rounded-xl space-y-2">
            <h3 className="font-serif text-lg font-bold text-[#18181B]">A Thought</h3>
            <p className="text-sm text-[#52525B] leading-relaxed">
              Have something to discuss, challenge or add to something I've written?
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E8E3DC] rounded-xl space-y-2">
            <h3 className="font-serif text-lg font-bold text-[#18181B]">A Story</h3>
            <p className="text-sm text-[#52525B] leading-relaxed">
              Know a place, person or experience worth exploring?
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E8E3DC] rounded-xl space-y-2">
            <h3 className="font-serif text-lg font-bold text-[#18181B]">A Collaboration</h3>
            <p className="text-sm text-[#52525B] leading-relaxed">
              Have an interesting idea or project in mind? Let's talk.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E8E3DC] rounded-xl space-y-2">
            <h3 className="font-serif text-lg font-bold text-[#18181B]">Just Say Hello</h3>
            <p className="text-sm text-[#52525B] leading-relaxed">
              No particular reason needed.
            </p>
          </div>
        </div>
      </section>

      {/* Sign-off Quote & Secondary Email */}
      <section className="p-8 bg-[#FAF8F5] border border-[#E8E3DC] rounded-2xl text-center space-y-3">
        <p className="font-serif italic text-lg md:text-xl text-[#18181B]">
          "Different thoughts are better when they're shared."
        </p>
        <div>
          <a 
            href="mailto:hello@thedifferentthought.com"
            className="inline-block text-sm font-semibold text-[#18181B] hover:text-[#FFB300] transition"
          >
            hello@thedifferentthought.com &rarr;
          </a>
        </div>
      </section>
    </div>
  );
};

export const PrivacyPage = () => <div className="max-w-2xl mx-auto px-6 py-16 prose"><h1 className="font-serif">Privacy Statement</h1><p>We respect your privacy and never sell reader data.</p></div>;
export const TermsPage = () => <div className="max-w-2xl mx-auto px-6 py-16 prose"><h1 className="font-serif">Terms of Publication</h1><p>All essays are copyrighted by Anush.</p></div>;

/* ==========================================================================
   6. CMS / ADMIN PORTAL
   ========================================================================== */
export const AdminLayout: React.FC = () => {
  const { logout, userEmail } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-[#FAF8F5]">
      <aside className="w-60 border-r border-[#E8E3DC] bg-white p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="font-serif font-bold text-lg">TDT &bull; CMS</div>
          <Link to="/admin/articles/new" className="block text-center py-2 bg-[#FFB300] text-white text-xs uppercase font-semibold rounded-lg">
            + New Essay
          </Link>
          <nav className="space-y-1 text-xs uppercase tracking-wider font-semibold text-[#52525B]">
            <NavLink to="/admin/dashboard" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-[#18181B] text-white' : 'hover:bg-[#FAF8F5]'}`}>Dashboard</NavLink>
            <NavLink to="/admin/articles" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-[#18181B] text-white' : 'hover:bg-[#FAF8F5]'}`}>Articles</NavLink>
            <NavLink to="/admin/media" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-[#18181B] text-white' : 'hover:bg-[#FAF8F5]'}`}>Media</NavLink>
            <NavLink to="/admin/categories" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-[#18181B] text-white' : 'hover:bg-[#FAF8F5]'}`}>Categories</NavLink>
            <NavLink to="/admin/tags" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-[#18181B] text-white' : 'hover:bg-[#FAF8F5]'}`}>Tags</NavLink>
            <NavLink to="/admin/subscribers" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-[#18181B] text-white' : 'hover:bg-[#FAF8F5]'}`}>Subscribers</NavLink>
            <NavLink to="/admin/about" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-[#18181B] text-white' : 'hover:bg-[#FAF8F5]'}`}>About Author</NavLink>
            <NavLink to="/admin/settings" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-[#18181B] text-white' : 'hover:bg-[#FAF8F5]'}`}>Settings</NavLink>
          </nav>
        </div>
        <button onClick={() => { logout(); navigate('/admin/login'); }} className="text-xs uppercase text-red-600 font-semibold p-2 text-left">
          Sign Out
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto max-w-5xl"><Outlet /></main>
    </div>
  );
};

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@thedifferentthought.com');
  const [pass, setPass] = useState('Thought2026!');
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await login(email, pass)) navigate('/admin/dashboard');
    else setErr('Invalid credentials.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] p-6">
      <form onSubmit={handleLogin} className="max-w-sm w-full bg-white p-8 rounded-xl border border-[#E8E3DC] space-y-4">
        <h1 className="font-serif text-2xl font-bold text-center">Editorial Login</h1>
        {err && <p className="text-xs text-red-600">{err}</p>}
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} className="w-full p-2.5 border rounded-lg text-sm" />
        <button type="submit" className="w-full py-2.5 bg-[#18181B] text-white text-xs uppercase font-semibold rounded-lg">Sign In</button>
      </form>
    </div>
  );
};

export const AdminDashboardPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  useEffect(() => { async function load() { setArticles(await dbEngine.getArticles()); } load(); }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 border rounded-xl"><div className="text-xs uppercase text-[#71717A]">Articles</div><div className="text-3xl font-bold font-serif">{articles.length}</div></div>
        <div className="bg-white p-6 border rounded-xl"><div className="text-xs uppercase text-[#71717A]">Published</div><div className="text-3xl font-bold font-serif">{articles.filter(a=>a.status==='published').length}</div></div>
        <div className="bg-white p-6 border rounded-xl"><div className="text-xs uppercase text-[#71717A]">Total Views</div><div className="text-3xl font-bold font-serif">{articles.reduce((a,c)=>a+(c.views||0),0)}</div></div>
      </div>
    </div>
  );
};

export const AdminArticlesList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const load = async () => setArticles(await dbEngine.getArticles());
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="font-serif text-3xl font-bold">Articles</h1><Link to="/admin/articles/new" className="px-4 py-2 bg-[#FFB300] text-white text-xs uppercase font-semibold rounded-lg">+ New Article</Link></div>
      <div className="bg-white border rounded-xl divide-y">
        {articles.map(a => (
          <div key={a.id} className="p-4 flex justify-between items-center">
            <div>
              <div className="font-bold text-base">{a.title}</div>
              <div className="text-xs text-[#71717A]">{a.status} &bull; {a.slug}</div>
            </div>
            <div className="flex gap-2">
              <Link to={`/admin/articles/${a.id}`} className="px-3 py-1 bg-[#18181B] text-white text-xs rounded">Edit</Link>
              <button onClick={async () => { if (confirm('Delete?')) { await dbEngine.deleteArticle(a.id); load(); } }} className="px-3 py-1 text-red-600 border border-red-200 text-xs rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminArticleEditor: React.FC = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  useEffect(() => {
    if (!isNew && id) {
      dbEngine.getArticles().then(arts => {
        const found = arts.find(a => a.id === id);
        if (found) { setTitle(found.title); setSlug(found.slug); setExcerpt(found.excerpt); setContent(found.content); setCoverUrl(found.cover_image_url); }
      });
    }
  }, [id, isNew]);

  const handleSave = async (status: 'draft' | 'published') => {
    await dbEngine.saveArticle({
      id: isNew ? undefined : id,
      title,
      slug: slug || ('story-' + Date.now()),
      excerpt,
      content,
      cover_image_url: coverUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop',
      status,
      category_id: 'cat-1'
    });
    navigate('/admin/articles');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-serif text-2xl font-bold">{isNew ? 'New Essay' : 'Edit Essay'}</h1>
        <div className="flex gap-2">
          <button onClick={() => handleSave('draft')} className="px-4 py-2 border rounded-lg text-xs uppercase font-semibold">Save Draft</button>
          <button onClick={() => handleSave('published')} className="px-4 py-2 bg-[#18181B] text-white rounded-lg text-xs uppercase font-semibold">Publish</button>
        </div>
      </div>
      <div className="space-y-4 bg-white p-6 border rounded-xl">
        <input type="text" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} className="w-full font-serif text-2xl p-2 border-b focus:outline-none" />
        <input type="text" placeholder="Slug" value={slug} onChange={e=>setSlug(e.target.value)} className="w-full text-xs font-mono p-2 border rounded" />
        <textarea rows={2} placeholder="Excerpt" value={excerpt} onChange={e=>setExcerpt(e.target.value)} className="w-full text-sm p-2 border rounded" />
        <input type="text" placeholder="Cover Image URL" value={coverUrl} onChange={e=>setCoverUrl(e.target.value)} className="w-full text-xs p-2 border rounded" />
        <textarea rows={14} placeholder="Content in HTML" value={content} onChange={e=>setContent(e.target.value)} className="w-full font-mono text-sm p-3 border rounded" />
      </div>
    </div>
  );
};

export const AdminMediaPage = () => <div className="space-y-4"><h1 className="font-serif text-3xl font-bold">Media</h1><p className="text-sm">Manage image links and storage.</p></div>;
export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadCategories = async () => {
    const data = await dbEngine.getCategories();
    setCategories(data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await dbEngine.saveCategory({
      id: editingId || undefined,
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim()
    });

    setName('');
    setSlug('');
    setDescription('');
    setEditingId(null);
    await loadCategories();
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
  };

  const handleDelete = async (id: string, catName: string) => {
    if (confirm(`Are you sure you want to delete "${catName}"?`)) {
      await dbEngine.deleteCategory(id);
      await loadCategories();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#18181B]">Categories</h1>
        <p className="text-sm text-[#71717A] mt-1">Organize publication pillars.</p>
      </div>

      {/* Add / Edit Category Form */}
      <form onSubmit={handleSave} className="bg-white border border-[#E8E3DC] rounded-xl p-6 space-y-4">
        <h2 className="font-serif text-lg font-bold text-[#18181B]">
          {editingId ? 'Edit Category' : 'Add New Category'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase font-semibold text-[#71717A] mb-1">Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Design & Spaces"
              className="w-full px-3 py-2 border border-[#E8E3DC] rounded-lg text-sm focus:outline-none focus:border-[#18181B]"
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-semibold text-[#71717A] mb-1">Slug</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. design"
              className="w-full px-3 py-2 border border-[#E8E3DC] rounded-lg text-sm focus:outline-none focus:border-[#18181B]"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs uppercase font-semibold text-[#71717A] mb-1">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of what belongs in this pillar..."
            className="w-full px-3 py-2 border border-[#E8E3DC] rounded-lg text-sm focus:outline-none focus:border-[#18181B]"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#FFB300] hover:bg-[#E6A100] text-black font-semibold text-xs uppercase tracking-wider rounded-lg transition"
          >
            {editingId ? 'Save Changes' : '+ Add Category'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-xs uppercase font-semibold text-[#71717A] hover:text-[#18181B]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Category List */}
      <div className="bg-white border border-[#E8E3DC] rounded-xl overflow-hidden divide-y divide-[#E8E3DC]">
        {categories.length === 0 ? (
          <div className="p-6 text-sm text-[#71717A] text-center">No categories found.</div>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-[#18181B] text-base">{c.name}</div>
                <div className="text-xs text-[#71717A] mt-0.5">/{c.slug} &bull; {c.description}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleEdit(c)}
                  className="text-xs font-semibold text-[#18181B] hover:text-[#FFB300] transition"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.name)}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export const AdminTagsPage = () => <div className="space-y-4"><h1 className="font-serif text-3xl font-bold">Tags</h1><p className="text-sm">Manage taxonomy keywords.</p></div>;
export const AdminSubscribersPage = () => <div className="space-y-4"><h1 className="font-serif text-3xl font-bold">Subscribers</h1><p className="text-sm">View audience subscriptions.</p></div>;
export const AdminAboutPage = () => <div className="space-y-4"><h1 className="font-serif text-3xl font-bold">About Page CMS</h1><p className="text-sm">Edit your narrative biography and philosophy directly.</p></div>;
export const AdminSettingsPage = () => <div className="space-y-4"><h1 className="font-serif text-3xl font-bold">Site Settings</h1><p className="text-sm">Update publication title, tagline, and contact info.</p></div>;

/* ==========================================================================
   7. MAIN APP ROUTER
   ========================================================================== */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<ArticlePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="category/:slug" element={<CategoryDetailPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
          </Route>

          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="articles" element={<AdminArticlesList />} />
            <Route path="articles/new" element={<AdminArticleEditor />} />
            <Route path="articles/:id" element={<AdminArticleEditor />} />
            <Route path="media" element={<AdminMediaPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="tags" element={<AdminTagsPage />} />
            <Route path="subscribers" element={<AdminSubscribersPage />} />
            <Route path="about" element={<AdminAboutPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
