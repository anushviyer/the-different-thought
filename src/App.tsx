import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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

const SEED_ARTICLES: Article[] = [];

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
    try {
      const res = await fetch(`/articles.php?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const categories = await this.getCategories();
          return data.map((art: any) => ({
            ...art,
            category: categories.find(c => c.id === (art.category_id || art.category?.id)) || art.category
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load articles from server:', err);
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
    const payload = {
      id: article.id || undefined,
      title: article.title || 'Untitled',
      slug: article.slug || ('story-' + Date.now()),
      excerpt: article.excerpt || '',
      // Safe base64 encoding that handles UTF-8 / special characters
      content: btoa(encodeURIComponent(article.content || '').replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )),
      content_is_base64: true,
      cover_image_url: article.cover_image_url || '',
      category_id: article.category?.id || article.category_id || '',
      category: article.category,
      status: article.status || 'draft',
      featured: article.featured || false,
      author_name: article.author_name || 'Anush',
      reading_time: article.reading_time || '4 min read',
    };

    // Use full current origin to prevent any HTTP -> HTTPS redirect stripping the body
    const targetUrl = `${window.location.origin}/articles.php`;

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Server returned ${res.status}`);
    }

    const result = await res.json();
    return result.article || payload;
  },
  
  async deleteArticle(id: string): Promise<void> {
    try {
      const res = await fetch(`/articles.php?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete from server');
    } catch (err) {
      console.error('Server delete failed, deleting locally:', err);
    }
    const articles = (await this.getArticles()).filter(a => a.id !== id);
    setStorage('articles', articles);
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
    if (email === 'admin@differentthought.com' && pass === 'Geetha9969$') {
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');

    try {
      const res = await fetch('/subscribers.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
        }),
      });

      if (!res.ok) throw new Error('Subscription failed');

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
      alert('Could not complete subscription. Please try again.');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F5] border-b border-[#E8E3DC] w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/logo.png" alt="The Different Thought" className="h-12 sm:h-16 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-xs uppercase tracking-widest font-medium text-[#18181B]">
            <Link to="/" className="hover:text-[#FFB300] transition">Home</Link>
            <Link to="/about" className="hover:text-[#FFB300] transition">Origin</Link>
            <Link to="/categories" className="hover:text-[#FFB300] transition">Pillars</Link>
            <Link to="/blog" className="hover:text-[#FFB300] transition">Thoughts</Link>
            <Link to="/contact" className="hover:text-[#FFB300] transition">Reach Out</Link>
          </nav>

          {/* Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-[#18181B] text-white hover:bg-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs font-semibold tracking-wider transition uppercase shadow-sm"
            >
              Subscribe
            </button>

            {/* Mobile Hamburger / Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#18181B] hover:bg-[#E8E3DC]/40 focus:outline-none transition cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#E8E3DC] bg-[#FAF8F5] px-6 py-4 shadow-xl space-y-3 text-xs uppercase tracking-widest font-semibold text-[#18181B]">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2.5 hover:text-[#FFB300] border-b border-[#E8E3DC]/60 transition"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2.5 hover:text-[#FFB300] border-b border-[#E8E3DC]/60 transition"
            >
              Origin
            </Link>
            <Link
              to="/categories"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2.5 hover:text-[#FFB300] border-b border-[#E8E3DC]/60 transition"
            >
              Pillars
            </Link>
            <Link
              to="/blog"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2.5 hover:text-[#FFB300] border-b border-[#E8E3DC]/60 transition"
            >
              Thoughts
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2.5 hover:text-[#FFB300] transition"
            >
              Reach Out
            </Link>
          </div>
        )}
      </header>

      {/* Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#FAF8F5] border border-[#E8E3DC] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-[#71717A] hover:text-[#18181B] text-2xl font-bold leading-none cursor-pointer"
            >
              &times;
            </button>

            <div className="space-y-2 text-center pt-2">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#18181B] tracking-tight">
                Join the Dispatch
              </h2>
              <p className="text-sm text-[#52525B] leading-relaxed max-w-sm mx-auto">
                Essays on deliberate craft, quiet observations, and slow journeys — delivered straight to your inbox.
              </p>
            </div>

            {status === 'success' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center text-sm font-medium">
                Thank you for subscribing! Welcome aboard.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] uppercase font-bold tracking-wider text-[#71717A]">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#E8E3DC] rounded-2xl text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#18181B] transition shadow-xs"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] uppercase font-bold tracking-wider text-[#71717A]">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#E8E3DC] rounded-2xl text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#18181B] transition shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-[#71717A]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#E8E3DC] rounded-2xl text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#18181B] transition shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3.5 bg-[#18181B] hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition disabled:opacity-50 shadow-md cursor-pointer mt-2"
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

export const PrivacyPolicy: React.FC = () => (
  <main className="max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-10">
    {/* Page Header */}
    <div className="border-b border-[#E8E3DC] pb-8 space-y-3">
      <span className="text-xs uppercase tracking-widest text-[#71717A] font-semibold">
        Legal & Transparency
      </span>
      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#18181B]">
        Privacy Policy
      </h1>
      <div className="text-xs text-[#71717A] space-y-1 pt-1">
        <p><strong className="text-[#18181B]">Website:</strong> The Different Thought</p>
        <p><strong className="text-[#18181B]">URL:</strong> <a href="https://differentthought.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#FFB300] underline underline-offset-2">https://differentthought.com/</a></p>
        <p><strong className="text-[#18181B]">Effective Date:</strong> 28 September 2026</p>
        <p><strong className="text-[#18181B]">Last Updated:</strong> 28 September 2026</p>
      </div>
    </div>

    {/* Document Body */}
    <div className="space-y-8 text-[#52525B] leading-relaxed text-sm sm:text-base">
      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          1. Introduction
        </h2>
        <p>
          Welcome to The Different Thought (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), a personal blogging website created and managed by Anush Iyer.
        </p>
        <p>
          The Different Thought is a platform for sharing personal thoughts, experiences, travel stories, observations, and perspectives on various subjects.
        </p>
        <p>
          We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains what information we collect, how we use it, how it is protected, and your rights regarding your information when you visit or interact with our website.
        </p>
        <p>
          By using this website, you acknowledge that you have read this Privacy Policy.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          2. Information We Collect
        </h2>
        <p>
          We may collect the following types of information when you visit or interact with our website.
        </p>

        <div className="space-y-2 pl-4 border-l-2 border-[#E8E3DC]">
          <h3 className="font-semibold text-[#18181B]">2.1 Information You Provide</h3>
          <p>We may collect personal information that you voluntarily provide, including:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your name and email address when you contact us.</li>
            <li>Your name and email address when you subscribe to blog updates.</li>
            <li>Any information you include in messages, feedback, or other communications you send to us.</li>
          </ul>
          <p className="pt-1 italic text-xs text-[#71717A]">
            You are not required to provide personal information simply to browse and read our blog.
          </p>
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-[#E8E3DC]">
          <h3 className="font-semibold text-[#18181B]">2.2 Information Collected Automatically</h3>
          <p>
            When you visit our website, certain technical information may be collected automatically, depending on the website features and services in use. This may include:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>IP address.</li>
            <li>Browser type and version.</li>
            <li>Device and operating system information.</li>
            <li>Pages visited and time spent on the website.</li>
            <li>Referring website or source.</li>
            <li>General website usage and interaction data.</li>
          </ul>
          <p className="pt-1 text-xs text-[#71717A]">
            This information may be collected through server logs, cookies, and analytics tools, where enabled.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          3. How We Use Your Information
        </h2>
        <p>We may use the information collected for the following purposes:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>To respond to your questions, enquiries, and feedback.</li>
          <li>To send blog updates and newsletters if you have subscribed.</li>
          <li>To improve our website, content, and overall user experience.</li>
          <li>To understand which articles and topics are of interest to readers.</li>
          <li>To maintain website security and prevent misuse.</li>
          <li>To comply with applicable legal obligations.</li>
        </ul>
        <p>
          We will use personal information only for legitimate purposes and in accordance with applicable law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          4. Email Subscriptions
        </h2>
        <p>
          If you subscribe to The Different Thought, we may collect your email address to send you new articles, blog updates, and other relevant communications.
        </p>
        <p>
          You can unsubscribe at any time using the unsubscribe link provided in our emails, where available, or by contacting us directly.
        </p>
        <p>
          We do not sell or rent subscriber email addresses to third parties.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          5. Cookies and Analytics
        </h2>
        <p>
          Our website may use cookies and similar technologies to support essential website functions, remember preferences, understand website traffic, and improve the browsing experience.
        </p>
        <p>
          Where enabled, third-party analytics services may collect information such as pages visited, browsing duration, device type, and approximate location.
        </p>
        <p>
          You can manage or disable cookies through your browser settings. Please note that disabling certain cookies may affect some website functionality.
        </p>
        <p>
          Where required by applicable law, we will obtain consent before using non-essential cookies or similar technologies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          6. Sharing of Information
        </h2>
        <p>We do not sell, rent, or trade your personal information.</p>
        <p>
          We may share limited information with trusted third-party service providers who help us operate and maintain the website. These may include:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Website hosting providers.</li>
          <li>Email and newsletter service providers.</li>
          <li>Website analytics providers.</li>
          <li>Website security and maintenance providers.</li>
        </ul>
        <p>
          Such providers may process information only as necessary to provide their services and subject to applicable legal requirements.
        </p>
        <p>
          We may also disclose personal information if required by law, legal process, or a lawful request from an authorised government authority.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          7. Third-Party Websites
        </h2>
        <p>
          Our articles and pages may contain links to external websites, publications, social media platforms, or other online resources.
        </p>
        <p>
          These websites operate independently and have their own privacy policies and practices. We are not responsible for their content, privacy practices, or security.
        </p>
        <p>
          We encourage you to review the privacy policies of any third-party websites you visit.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          8. Data Retention
        </h2>
        <p>
          We retain personal information only for as long as reasonably necessary to fulfil the purposes described in this Privacy Policy, comply with applicable legal obligations, resolve disputes, and maintain website security.
        </p>
        <p>
          When information is no longer required, we will take reasonable steps to delete or anonymise it, subject to applicable legal requirements.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          9. Data Security
        </h2>
        <p>
          We take reasonable technical and organisational measures to protect personal information against unauthorised access, disclosure, alteration, loss, or misuse.
        </p>
        <p>
          However, no method of transmitting or storing information online is completely secure. While we make reasonable efforts to protect your information, we cannot guarantee absolute security.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          10. Your Privacy Rights
        </h2>
        <p>Subject to applicable law, you may have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Request access to personal information we hold about you.</li>
          <li>Request correction or updating of inaccurate information.</li>
          <li>Request deletion of your personal information where applicable.</li>
          <li>Withdraw consent for processing where consent is the legal basis.</li>
          <li>Unsubscribe from email communications.</li>
          <li>Raise a concern or complaint about how your information is handled.</li>
        </ul>
        <p>
          To exercise any applicable rights, please contact us using the details provided below. We may need to verify your identity before responding.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          11. Children&apos;s Privacy
        </h2>
        <p>
          The Different Thought is intended for a general audience and is not specifically directed at children.
        </p>
        <p>
          We do not knowingly collect personal information from children in a manner prohibited by applicable law.
        </p>
        <p>
          If you believe that a child has provided personal information to us, please contact us so that we can review the matter and take appropriate action.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          12. Changes to This Privacy Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our website, services, or applicable legal requirements.
        </p>
        <p>
          Any changes will be published on this page along with an updated &ldquo;Last Updated&rdquo; date. We encourage you to review this page periodically.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#E8E3DC]">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          13. Contact Us
        </h2>
        <p>
          If you have any questions, concerns, or requests regarding this Privacy Policy or the handling of your personal information, please contact:
        </p>
        <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E3DC] text-sm space-y-1 inline-block min-w-[280px]">
          <p className="font-bold text-[#18181B]">Anush Iyer</p>
          <p className="text-[#71717A]">The Different Thought</p>
          <p>
            Email:{' '}
            <a
              href="mailto:hello@differentthought.com"
              className="text-[#18181B] font-medium hover:text-[#FFB300] underline underline-offset-2"
            >
              hello@differentthought.com
            </a>
          </p>
          <p>
            Website:{' '}
            <a
              href="https://differentthought.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#18181B] font-medium hover:text-[#FFB300] underline underline-offset-2"
            >
              https://differentthought.com/
            </a>
          </p>
        </div>
      </section>
    </div>
  </main>
);

export const TermsOfService: React.FC = () => (
  <main className="max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-10">
    {/* Page Header */}
    <div className="border-b border-[#E8E3DC] pb-8 space-y-3">
      <span className="text-xs uppercase tracking-widest text-[#71717A] font-semibold">
        Guidelines & Agreements
      </span>
      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#18181B]">
        Terms &amp; Conditions
      </h1>
      <div className="text-xs text-[#71717A] space-y-1 pt-1">
        <p><strong className="text-[#18181B]">Website:</strong> The Different Thought</p>
        <p>
          <strong className="text-[#18181B]">URL:</strong>{' '}
          <a
            href="https://differentthought.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FFB300] underline underline-offset-2"
          >
            https://differentthought.com/
          </a>
        </p>
        <p><strong className="text-[#18181B]">Effective Date:</strong> 28 September 2026</p>
        <p><strong className="text-[#18181B]">Last Updated:</strong> 28 September 2026</p>
      </div>
    </div>

    {/* Document Body */}
    <div className="space-y-8 text-[#52525B] leading-relaxed text-sm sm:text-base">
      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          1. Introduction
        </h2>
        <p>
          Welcome to The Different Thought, a personal blogging website created and managed by Anush Iyer.
        </p>
        <p>
          These Terms &amp; Conditions govern your access to and use of{' '}
          <a
            href="https://differentthought.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#18181B] underline hover:text-[#FFB300]"
          >
            https://differentthought.com/
          </a>
          , including its articles, written content, images, and other features.
        </p>
        <p>
          By accessing or using this website, you agree to these Terms &amp; Conditions. If you do not agree with them, please discontinue use of the website.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          2. About The Different Thought
        </h2>
        <p>
          The Different Thought is an independent personal blog featuring articles, opinions, observations, and experiences relating to travel, business, design, technology, lifestyle, and other subjects.
        </p>
        <p>
          The content reflects the personal views and experiences of the author unless otherwise stated. It is intended for general informational, educational, and entertainment purposes.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          3. Intellectual Property and Copyright
        </h2>
        <p>
          Unless otherwise stated, all original articles, written content, graphics, branding, and other original materials published on this website are the intellectual property of The Different Thought or their respective owners.
        </p>

        <div className="space-y-2 pl-4 border-l-2 border-[#E8E3DC]">
          <h3 className="font-semibold text-[#18181B]">You may:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Read and share links to articles published on this website.</li>
            <li>Quote brief excerpts from articles for personal, educational, or non-commercial purposes, provided appropriate credit and a link to the original article are included.</li>
          </ul>
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-[#E8E3DC]">
          <h3 className="font-semibold text-[#18181B]">You may not:</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Reproduce, republish, or distribute complete articles without prior written permission.</li>
            <li>Copy, modify, or commercially exploit original content without permission.</li>
            <li>Use the website&apos;s branding, logo, or original creative materials without authorisation.</li>
          </ul>
        </div>

        <p className="text-xs text-[#71717A] pt-1">
          Third-party images, trademarks, quotations, and other materials remain the property of their respective owners and may be subject to separate copyright restrictions.
        </p>
        <p className="text-xs text-[#71717A]">
          For permission to reproduce or use original content, please contact us.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          4. Accuracy and Disclaimer
        </h2>
        <p>
          The content published on The Different Thought represents personal opinions, experiences, and observations.
        </p>
        <p>
          Although reasonable care is taken when preparing articles, we do not guarantee that all information is complete, accurate, or up to date.
        </p>
        <p>
          Articles discussing business, technology, travel, design, or other subjects are provided for general informational purposes only. They should not be treated as professional, financial, legal, medical, or other specialised advice.
        </p>
        <p>
          Readers should independently verify information and seek professional advice where appropriate.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          5. Personal Opinions
        </h2>
        <p>
          The views expressed in articles are those of the author and are intended to encourage thought, discussion, and the exchange of perspectives.
        </p>
        <p>
          Readers may agree or disagree with the opinions expressed. Nothing published on this website is intended to represent the views of any employer, client, business partner, or other organisation unless explicitly stated.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          6. Acceptable Use
        </h2>
        <p>You agree to use this website lawfully and responsibly.</p>
        <p className="font-semibold text-[#18181B]">You must not:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use the website for any unlawful or fraudulent purpose.</li>
          <li>Attempt to gain unauthorised access to the website, its server, or its editorial portal.</li>
          <li>Interfere with the website&apos;s security, functionality, or availability.</li>
          <li>Distribute malicious software or attempt to compromise the website.</li>
          <li>Copy or scrape website content in a manner that infringes intellectual property rights or violates applicable law.</li>
        </ul>
        <p className="pt-1">
          We reserve the right to restrict access or take appropriate action in response to misuse of the website.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          7. External Links
        </h2>
        <p>
          This website may contain links to third-party websites, articles, services, or social media platforms for additional information or convenience.
        </p>
        <p>
          These links do not necessarily imply endorsement. We do not control or take responsibility for the content, availability, accuracy, or policies of external websites.
        </p>
        <p>
          Accessing third-party websites is at your own discretion and subject to their respective terms and conditions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          8. Email Communication and Subscriptions
        </h2>
        <p>
          You may contact us or subscribe to updates through the features made available on the website.
        </p>
        <p>
          By subscribing, you agree to receive blog-related updates and communications. You may unsubscribe at any time using the available unsubscribe facility or by contacting us.
        </p>
        <p>
          We reserve the right to discontinue or modify subscription services, website features, or communications at any time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          9. Website Availability
        </h2>
        <p>
          We aim to keep The Different Thought accessible and functioning smoothly. However, we do not guarantee uninterrupted availability or that the website will always be free from errors, technical issues, or security vulnerabilities.
        </p>
        <p>
          We reserve the right to modify, suspend, or discontinue any part of the website without prior notice.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          10. Limitation of Liability
        </h2>
        <p>
          To the extent permitted by applicable law, The Different Thought and its author shall not be liable for any direct, indirect, incidental, or consequential loss arising from your use of, or inability to use, this website or reliance on its content.
        </p>
        <p>
          This includes, without limitation, loss resulting from errors, omissions, outdated information, website interruptions, or third-party content.
        </p>
        <p className="text-xs text-[#71717A]">
          Nothing in these Terms excludes or limits liability where such exclusion or limitation is prohibited by applicable law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          11. Privacy
        </h2>
        <p>
          Your use of this website is also governed by our{' '}
          <Link to="/privacy" className="text-[#18181B] font-semibold underline hover:text-[#FFB300]">
            Privacy Policy
          </Link>
          , which explains how we collect, use, and protect personal information.
        </p>
        <p>
          You can review the Privacy Policy through the link provided on the website.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          12. Changes to These Terms
        </h2>
        <p>
          We may revise these Terms &amp; Conditions from time to time to reflect changes in the website, its features, or applicable laws.
        </p>
        <p>
          Updated terms will be published on this page with a revised &ldquo;Last Updated&rdquo; date. Your continued use of the website after changes are published constitutes acceptance of the updated terms, to the extent permitted by law.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          13. Governing Law and Jurisdiction
        </h2>
        <p>
          These Terms &amp; Conditions shall be governed by and interpreted in accordance with the laws of India.
        </p>
        <p>
          Subject to applicable law, courts of competent jurisdiction in Ahmedabad, Gujarat, India, shall have jurisdiction over disputes arising from the use of this website.
        </p>
      </section>

      <section className="space-y-3 pt-4 border-t border-[#E8E3DC]">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#18181B]">
          14. Contact
        </h2>
        <p>
          For questions, permissions, or concerns relating to these Terms &amp; Conditions, please contact:
        </p>
        <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E3DC] text-sm space-y-1 inline-block min-w-[280px]">
          <p className="font-bold text-[#18181B]">Anush Iyer</p>
          <p className="text-[#71717A]">The Different Thought</p>
          <p>
            Email:{' '}
            <a
              href="mailto:hello@differentthought.com"
              className="text-[#18181B] font-medium hover:text-[#FFB300] underline underline-offset-2"
            >
              hello@differentthought.com
            </a>
          </p>
          <p>
            Website:{' '}
            <a
              href="https://differentthought.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#18181B] font-medium hover:text-[#FFB300] underline underline-offset-2"
            >
              https://differentthought.com/
            </a>
          </p>
        </div>
      </section>
    </div>
  </main>
);

export const Footer: React.FC = () => (
  <footer className="bg-[#FAF8F5] border-t border-[#E8E3DC] pt-16 pb-12 mt-20">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#E8E3DC]">
        <div className="md:col-span-6 space-y-4">
          <Link to="/" className="inline-block">
            <img
              src="/logo.png"
              alt="The Different Thought"
              className="h-14 w-auto object-contain"
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
  const [displayedFeatured, setDisplayedFeatured] = useState<Article[]>([]);
  const [latest, setLatest] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    async function load() {
      const articles = await dbEngine.getArticles();
      const pub = articles.filter(a => a.status === 'published');
     const featuredList = pub.filter(a => a.featured).slice(0, 3);
setDisplayedFeatured(featuredList.length > 0 ? featuredList : pub.slice(0, 1));
setLatest(pub);
      setAuthor(await dbEngine.getAuthorProfile());
    }
    load();
  }, []);

  const handleSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail.trim()) return;

    setSubStatus('loading');

    try {
      const res = await fetch('/subscribers.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: subEmail.trim()
        })
      });

      if (!res.ok) throw new Error('Subscription failed');

      setSubStatus('success');
      setTimeout(() => {
        setIsModalOpen(false);
        setSubStatus('idle');
        setFirstName('');
        setLastName('');
        setSubEmail('');
      }, 2000);
    } catch (err) {
      console.error(err);
      setSubStatus('idle');
      alert('Could not complete subscription. Please try again.');
    }
  };
const featured = displayedFeatured[0];
  
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
            <span className="text-xs uppercase tracking-widest text-[#71717A] font-semibold">Featured Monogram</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-2xl border border-[#E8E3DC] p-6 sm:p-8">
            {/* Uncropped Image Container */}
            <div className="lg:col-span-7 w-full bg-[#FAF8F5] rounded-xl overflow-hidden flex items-center justify-center border border-[#E8E3DC]/60 p-2">
              <img
                src={featured.cover_image_url}
                alt={featured.title}
                className="w-full h-auto max-h-[420px] object-contain rounded-lg"
              />
            </div>

            {/* Content Side */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs text-[#71717A] flex items-center gap-2">
                {featured.category && (
                  <span className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E3DC] text-[10px] uppercase font-bold tracking-wider rounded text-[#18181B]">
                    {featured.category.name}
                  </span>
                )}
                {featured.reading_time && <span>{featured.reading_time}</span>}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#18181B] leading-snug">
                <Link to={`/blog/${featured.slug}`} className="hover:text-[#FFB300] transition-colors">
                  {featured.title}
                </Link>
              </h2>
              <p className="text-[#52525B] text-sm leading-relaxed">
                {featured.excerpt}
              </p>
              <Link
                to={`/blog/${featured.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#18181B] hover:text-[#FFB300] transition-colors"
              >
                <span>Read Full Essay &rarr;</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent Dispatches (All Articles, Uncropped Covers) */}
      <section className="px-6 max-w-6xl mx-auto">
        <div className="border-t border-[#E8E3DC] pt-12 mb-8 flex justify-between items-center">
          <h2 className="font-serif text-2xl font-bold text-[#18181B]">Recent Dispatches</h2>
          <Link to="/blog" className="text-xs uppercase tracking-wider font-semibold text-[#18181B] hover:text-[#FFB300]">
            All Stories &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latest.map((article) => (
            <article key={article.id} className="bg-white rounded-xl border border-[#E8E3DC] overflow-hidden flex flex-col">
              <Link to={`/blog/${article.slug}`} className="w-full bg-[#FAF8F5] p-2 flex items-center justify-center border-b border-[#E8E3DC]">
                <img
                  src={article.cover_image_url}
                  alt={article.title}
                  className="w-full h-auto max-h-[220px] object-contain hover:scale-105 transition-transform"
                />
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

      {/* Newsletter Trigger Section */}
      <section className="px-6 max-w-xl mx-auto text-center space-y-4">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#18181B]">Receive The Unhurried Dispatch</h2>
        <p className="text-sm text-[#52525B] leading-relaxed">
          Delivered bi-weekly. Direct thoughts on living, wandering, and making.
        </p>
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-[#18181B] text-white hover:bg-black px-8 py-3 rounded-full text-xs font-semibold tracking-wider transition uppercase shadow-sm"
          >
            Subscribe
          </button>
        </div>
      </section>

      {/* Subscription Modal (Matching Navigation Bar) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#FAF8F5] border border-[#E8E3DC] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setSubStatus('idle');
              }}
              className="absolute top-6 right-6 text-[#71717A] hover:text-[#18181B] text-2xl font-bold leading-none cursor-pointer"
            >
              &times;
            </button>

            {/* Header */}
            <div className="space-y-2 text-center pt-2">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#18181B] tracking-tight">
                Join the Dispatch
              </h2>
              <p className="text-sm text-[#52525B] leading-relaxed max-w-sm mx-auto">
                Essays on deliberate craft, quiet observations, and slow journeys — delivered straight to your inbox.
              </p>
            </div>

            {subStatus === 'success' ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center text-sm font-medium">
                Thank you for subscribing! Welcome aboard.
              </div>
            ) : (
              <form onSubmit={handleSub} className="space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] uppercase font-bold tracking-wider text-[#71717A]">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#E8E3DC] rounded-2xl text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#18181B] transition shadow-xs"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[11px] uppercase font-bold tracking-wider text-[#71717A]">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-[#E8E3DC] rounded-2xl text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#18181B] transition shadow-xs"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] uppercase font-bold tracking-wider text-[#71717A]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#E8E3DC] rounded-2xl text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#18181B] transition shadow-xs"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={subStatus === 'loading'}
                  className="w-full py-3.5 bg-[#18181B] hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition disabled:opacity-50 shadow-md cursor-pointer mt-2"
                >
                  {subStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
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
          <h1 className="font-serif text-4xl font-bold text-[#18181B]">Hi, I&apos;m Anush Iyer.</h1>
          <p className="font-serif italic text-[#FFB300]">&ldquo;Entrepreneur, observer, traveller, and always curious.&rdquo;</p>
          <p className="text-sm text-[#52525B] leading-relaxed">
            I&apos;m a second-generation entrepreneur in the world of design, brought up around creativity, ideas and the process of turning them into something real. Outside of work, I enjoy travelling, good conversations, great coffee, discovering new places and noticing the little things that often go unseen.
          </p>
        </div>
      </div>

      <div className="space-y-6 border-t border-[#E8E3DC] pt-8 text-[#52525B] text-base leading-relaxed text-justify hyphens-auto">
        <h2 className="font-serif text-2xl font-bold text-[#18181B] text-left">My Story</h2>
        
        <p>
          Growing up around design and creativity gave me an early appreciation for ideas and the effort it takes to bring them to life. As a second-generation entrepreneur, my journey has been a mix of business, new experiences, travel and meeting people from different walks of life. Each has offered me a fresh perspective and, occasionally, a few lessons I didn&apos;t know I needed.
        </p>

        <p>
          Beyond work, I enjoy exploring new places, discovering different cultures and finding stories in the little things around me. I&apos;m naturally curious about how things work, why people think the way they do and what makes everyday experiences worth remembering.
        </p>

        <p>
          The <strong className="font-bold text-[#18181B]">Different Thought</strong> is where I bring these interests together. From travel and design to business, technology and everyday observations, this is a space for sharing ideas, exploring perspectives and looking at familiar things a little differently. After all, there&apos;s always another way to see things.
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
          href="mailto:hello@differentthought.com"
          className="inline-flex items-center text-xl md:text-2xl font-serif font-bold text-[#18181B] hover:text-[#FFB300] transition"
        >
          hello@differentthought.com &rarr;
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
            href="mailto:hello@differentthought.com"
            className="inline-block text-sm font-semibold text-[#18181B] hover:text-[#FFB300] transition"
          >
            hello@differentthought.com &rarr;
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
          <div className="flex items-center gap-2">
  <img 
    src="/logo.png" 
    alt="The Different Thought" 
    className="h-12 w-auto object-contain" 
  />
  <span className="text-xs uppercase tracking-wider font-semibold text-[#71717A]">&bull; CMS</span>
</div>
          <Link to="/admin/articles/new" className="block text-center py-2 bg-[#FFB300] text-white text-xs uppercase font-semibold rounded-lg">
            + New Essay
          </Link>
          <nav className="space-y-1 text-xs uppercase tracking-wider font-semibold text-[#52525B]">
          <NavLink to="/admin/dashboard" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-[#18181B] text-white' : 'hover:bg-[#FAF8F5]'}`}>Dashboard</NavLink>
          <NavLink to="/admin/articles" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-[#18181B] text-white' : 'hover:bg-[#FAF8F5]'}`}>Articles</NavLink>
          <NavLink to="/admin/categories" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-[#18181B] text-white' : 'hover:bg-[#FAF8F5]'}`}>Categories</NavLink>
          <NavLink to="/admin/subscribers" className={({isActive}) => `block p-2 rounded ${isActive ? 'bg-[#18181B] text-white' : 'hover:bg-[#FAF8F5]'}`}>Subscribers</NavLink>
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
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
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
<input 
  type="email" 
  value={email} 
  onChange={e => setEmail(e.target.value)} 
  placeholder="Email ID (e.g. admin@differentthought.com)" 
  className="w-full p-2.5 border rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black" 
  required
/>
<input 
  type="password" 
  value={pass} 
  onChange={e => setPass(e.target.value)} 
  placeholder="Enter Password" 
  className="w-full p-2.5 border rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-black" 
  required
/>
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

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execute = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-[#E8E3DC] rounded-xl overflow-hidden bg-white">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#FBFBFA] border-b border-[#E8E3DC] text-xs">
        {/* Bold */}
        <button
          type="button"
          onClick={() => execute('bold')}
          className="w-7 h-7 font-bold hover:bg-neutral-200 rounded border border-[#E8E3DC] bg-white transition flex items-center justify-center"
          title="Bold"
        >
          B
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => execute('italic')}
          className="w-7 h-7 italic hover:bg-neutral-200 rounded border border-[#E8E3DC] bg-white transition flex items-center justify-center"
          title="Italic"
        >
          I
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => execute('underline')}
          className="w-7 h-7 underline hover:bg-neutral-200 rounded border border-[#E8E3DC] bg-white transition flex items-center justify-center"
          title="Underline"
        >
          U
        </button>

        <div className="w-[1px] h-5 bg-[#E8E3DC] mx-1" />

        {/* Font Size */}
        <select
          onChange={(e) => execute('fontSize', e.target.value)}
          defaultValue="3"
          className="h-7 px-2 border border-[#E8E3DC] rounded bg-white text-xs focus:outline-none"
          title="Font Size"
        >
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Extra Large</option>
        </select>

        {/* Font Color */}
        <label className="flex items-center gap-1.5 h-7 px-2 border border-[#E8E3DC] rounded bg-white cursor-pointer hover:bg-neutral-50" title="Text Color">
          <span className="font-semibold">Color:</span>
          <input
            type="color"
            defaultValue="#18181B"
            onChange={(e) => execute('foreColor', e.target.value)}
            className="w-4 h-4 cursor-pointer border-0 p-0 bg-transparent"
          />
        </label>

        <div className="w-[1px] h-5 bg-[#E8E3DC] mx-1" />

        {/* Unordered / Bullet List */}
        <button
          type="button"
          onClick={() => execute('insertUnorderedList')}
          className="px-2 h-7 hover:bg-neutral-200 rounded border border-[#E8E3DC] bg-white transition flex items-center justify-center text-xs"
          title="Bullet List"
        >
          • List
        </button>

        {/* Numbered List */}
        <button
          type="button"
          onClick={() => execute('insertOrderedList')}
          className="px-2 h-7 hover:bg-neutral-200 rounded border border-[#E8E3DC] bg-white transition flex items-center justify-center text-xs"
          title="Numbered List"
        >
          1. List
        </button>

        {/* Remove Formatting */}
        <button
          type="button"
          onClick={() => execute('removeFormat')}
          className="px-2 h-7 text-[#71717A] hover:bg-neutral-200 rounded border border-[#E8E3DC] bg-white transition flex items-center justify-center text-xs ml-auto"
          title="Clear Formatting"
        >
          Clear
        </button>
      </div>

      {/* Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
        className="min-h-[350px] p-4 font-sans text-sm focus:outline-none overflow-y-auto leading-relaxed"
      />
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isFeaturedMonogram, setIsFeaturedMonogram] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const maxWidth = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setUploading(false);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

        const formData = new FormData();
        formData.append('image_base64', compressedBase64);

        try {
          const res = await fetch('/upload.php', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          if (res.ok && data.status === 'success') {
            setCoverUrl(data.url);
          } else {
            alert(data.message || 'Image upload failed');
          }
        } catch (err) {
          console.error(err);
          alert('Failed to upload image. Server rejected the request.');
        } finally {
          setUploading(false);
        }
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      alert('Failed to read the file locally.');
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  useEffect(() => {
    dbEngine.getCategories().then(cats => {
      setCategories(cats);
    });

    if (!isNew && id) {
      dbEngine.getArticles().then(arts => {
        const found = arts.find(a => a.id === id);
        if (found) {
          setTitle(found.title);
          setSlug(found.slug);
          setExcerpt(found.excerpt);
          setContent(found.content);
          setCoverUrl(found.cover_image_url || '');
          setSelectedCategoryId(found.category?.id || '');
          setIsFeaturedMonogram(Boolean(found.featured));
        }
      });
    }
  }, [id, isNew]);

 const handleSave = async (status: 'draft' | 'published') => {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      alert('Please enter an essay title before saving.');
      return;
    }

    const selectedCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];

    try {
      await dbEngine.saveArticle({
        id: isNew ? undefined : id,
        title: cleanTitle,
        slug: slug.trim() || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        excerpt: excerpt.trim(),
        content,
        cover_image_url: coverUrl,
        category: selectedCategory,
        featured: isFeaturedMonogram,
        status
      });

      alert(`Article ${status === 'published' ? 'published' : 'saved'} successfully!`);
      navigate('/admin/articles');
    } catch (err: any) {
      console.error('Save failed:', err);
      alert('Failed to save article: ' + (err.message || 'Check console or network response.'));
    }
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
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full font-serif text-2xl p-2 border-b focus:outline-none" />
        <input type="text" placeholder="Slug" value={slug} onChange={e => setSlug(e.target.value)} className="w-full text-xs font-mono p-2 border rounded" />
        <textarea rows={2} placeholder="Excerpt" value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full text-sm p-2 border rounded" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-[#FBFBFA] p-4 rounded-lg border border-[#E8E3DC]">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#71717A] mb-1">
              Category
            </label>
            <select
              value={selectedCategoryId}
              onChange={e => setSelectedCategoryId(e.target.value)}
              className="w-full text-sm bg-white p-2 border border-[#E8E3DC] rounded-lg focus:outline-none focus:border-[#18181B]"
            >
              <option value="">Select a Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4 md:pt-2">
            <input
              type="checkbox"
              id="featuredMonogram"
              checked={isFeaturedMonogram}
              onChange={e => setIsFeaturedMonogram(e.target.checked)}
              className="w-4 h-4 text-[#18181B] border-gray-300 rounded focus:ring-[#18181B] cursor-pointer"
            />
            <label htmlFor="featuredMonogram" className="text-xs uppercase tracking-wider font-semibold text-[#18181B] cursor-pointer select-none">
              Featured Monogram (Display on Homepage)
            </label>
          </div>
        </div>

        <div className="space-y-2 pt-1 pb-1">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer px-4 py-2 bg-[#18181B] text-white text-xs uppercase font-semibold rounded-lg hover:bg-neutral-800 transition shrink-0">
              {uploading ? 'Uploading...' : 'Upload Image'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
            <input
              type="text"
              placeholder="Or enter Cover Image URL directly"
              value={coverUrl}
              onChange={e => setCoverUrl(e.target.value)}
              className="w-full text-xs font-mono p-2 border rounded-lg"
            />
          </div>

          {coverUrl && (
            <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-[#E8E3DC] mt-2">
              <img
                src={coverUrl}
                alt="Cover Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <RichTextEditor value={content} onChange={setContent} />
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
export const AdminSubscribersPage: React.FC = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/subscribers.php');
      if (res.ok) {
        const data = await res.json();
        setSubscribers(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const formatDate = (dateVal: any) => {
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? String(dateVal) : d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#18181B]">Subscribers</h1>
          <p className="text-sm text-[#71717A] mt-1">View audience subscriptions.</p>
        </div>
        <button
          onClick={fetchSubscribers}
          className="text-xs font-semibold uppercase tracking-wider px-4 py-2 border border-[#E8E3DC] bg-white rounded-lg hover:border-[#18181B] transition"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white border border-[#E8E3DC] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-[#71717A]">Loading subscribers...</div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#71717A]">No subscribers found yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E8E3DC] bg-[#FAF8F5] text-xs uppercase tracking-wider text-[#71717A]">
                  <th className="py-3 px-6 font-semibold">Name</th>
                  <th className="py-3 px-6 font-semibold">Email</th>
                  <th className="py-3 px-6 font-semibold">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E3DC]">
                {subscribers.map((sub, idx) => {
                  const firstName = sub.first_name || sub.firstName || '';
                  const lastName = sub.last_name || sub.lastName || '';
                  const fullName = `${firstName} ${lastName}`.trim() || 'Anonymous';
                  const email = sub.email || '—';
                  const dateStr = formatDate(sub.created_at || sub.createdAt || sub.subscribedAt || sub.date);

                  return (
                    <tr key={sub.id || idx} className="hover:bg-[#FAF8F5]/50 transition">
                      <td className="py-3.5 px-6 font-medium text-[#18181B]">
                        {fullName}
                      </td>
                      <td className="py-3.5 px-6 text-[#52525B] font-mono text-xs">
                        {email}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-[#71717A]">
                        {dateStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

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
           <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
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
