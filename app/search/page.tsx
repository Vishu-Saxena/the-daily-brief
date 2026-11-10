'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { articles } from '@/lib/data';
import { ArticleCard } from '@/components/article-card';
import { PublishedArticleCard } from '@/components/published-article-card';
import { LiveNewsCard } from '@/components/live-news-card';
import type { LiveHeadline } from '@/lib/news';
import { Footer } from '@/components/footer';

type CommunityResult = { _id: string; title: string; dek: string; category: string; publishedAt: string; imageId?: string | null };

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [community, setCommunity] = useState<CommunityResult[]>([]);
  const [news, setNews] = useState<LiveHeadline[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const localResults = articles.filter(article => `${article.title} ${article.dek} ${article.category} ${article.content}`.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) { setCommunity([]); setNews([]); setLoading(false); setError(''); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true); setError('');
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Search is unavailable right now.');
        setCommunity(data.community || []);
        setNews(data.news || []);
      } catch (cause) {
        if (cause instanceof Error && cause.name === 'AbortError') return;
        setError(cause instanceof Error ? cause.message : 'Search is unavailable right now.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  const resultCount = localResults.length + community.length + news.length;
  return <><main className="shell min-h-[70vh] pb-10 pt-16">
    <div className="eyebrow">Discovery</div><h1 className="serif mt-3 text-6xl font-bold">Search</h1>
    <div className="mt-8 flex max-w-2xl items-center gap-3 border-b pb-3" style={{ borderColor: 'var(--ink)' }}><Search/><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search stories, topics, or ideas" className="w-full bg-transparent text-xl outline-none"/></div>
    {loading && <p className="mt-8 text-sm" style={{ color: 'var(--muted)' }}>Searching stories…</p>}
    {error && <p role="alert" className="mt-8 text-sm text-red-700">{error}</p>}
    {!loading && !error && query.trim().length >= 2 && resultCount === 0 && <p className="mt-12" style={{ color: 'var(--muted)' }}>No stories found. Try another search.</p>}
    {localResults.length > 0 && <section className="mt-12"><h2 className="serif mb-5 text-2xl font-bold">The Daily Brief</h2><div className="grid gap-6 md:grid-cols-3">{localResults.map(article => <ArticleCard key={article.id} article={article}/>)}</div></section>}
    {community.length > 0 && <section className="mt-12"><h2 className="serif mb-5 text-2xl font-bold">Community articles</h2><div className="grid gap-6 md:grid-cols-3">{community.map(article => <PublishedArticleCard key={article._id} article={article}/>)}</div></section>}
    {news.length > 0 && <section className="mt-12"><h2 className="serif mb-5 text-2xl font-bold">News</h2><div className="grid gap-6 md:grid-cols-3">{news.map(story => <LiveNewsCard key={story.url} story={story}/>)}</div></section>}
  </main><Footer/></>;
}
