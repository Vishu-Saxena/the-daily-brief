import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { articles } from '@/lib/data';
import { ArticleCard } from '@/components/article-card';
import { PublishedArticleCard } from '@/components/published-article-card';
import { LiveNewsCard } from '@/components/live-news-card';
import { Footer } from '@/components/footer';
import { getCategoryHeadlines } from '@/lib/news';
import { connectToDatabase } from '@/lib/mongodb';
import { PublishedArticleModel } from '@/models/PublishedArticle';

export const dynamic = 'force-dynamic';

const liveSections = [
  { label: 'Technology', query: 'technology' },
  { label: 'Business', query: 'business' },
  { label: 'Politics', query: 'politics' },
  { label: 'Science', query: 'science' },
  { label: 'Sports', query: 'sports' },
  { label: 'Entertainment', query: 'culture' },
  { label: 'World', query: 'world' },
  { label: 'Health', query: 'health' },
];

export default async function Home() {
  const hero = articles[0];
  await connectToDatabase();
  const communityStories = await PublishedArticleModel.find({ status: 'published' }).sort({ publishedAt: -1 }).limit(9).lean();
  const bestPicks: Array<{ kind: 'editorial'; article: (typeof articles)[number] } | { kind: 'community'; article: (typeof communityStories)[number] }> = [];
  let editorialIndex = 0;
  let communityIndex = 0;
  while (bestPicks.length < 9 && (editorialIndex < articles.length || communityIndex < communityStories.length)) {
    if (editorialIndex < articles.length) bestPicks.push({ kind: 'editorial', article: articles[editorialIndex++] });
    if (bestPicks.length < 9 && communityIndex < communityStories.length) bestPicks.push({ kind: 'community', article: communityStories[communityIndex++] });
  }
  const headlines = await Promise.all(liveSections.map(async section => ({
    ...section,
    stories: await getCategoryHeadlines(section.query),
  })));
  const sectionsWithStories = headlines.filter(section => section.stories.length > 0);
  const today = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  return <><main className="shell pb-10 pt-12 md:pt-20">
    <section className="mb-10 flex flex-col justify-between gap-5 rounded border p-6 md:flex-row md:items-center" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}><div><div className="eyebrow">News, made easier</div><p className="serif mt-2 text-2xl font-bold">Get the gist with AI. Publish your own post in seconds.</p><p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: 'var(--muted)' }}>Summarize stories with AI, or create and edit your own article with AI assistance. Free to use.</p></div><Link href="/write" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white">Try AI writing <ArrowUpRight size={16}/></Link></section>
    <div className="mb-12 flex items-end justify-between"><div><div className="eyebrow">{today}</div><h1 className="serif mt-3 text-5xl font-bold tracking-tight md:text-7xl">A clearer view<br/>of the world.</h1></div><p className="hidden max-w-xs pb-2 text-sm leading-6 md:block" style={{color:'var(--muted)'}}>Thoughtful reporting, useful context, and a few good things to read — delivered daily.</p></div>
    <section className="grid gap-6 md:grid-cols-[1.45fr_.8fr]"><Link href={`/article/${hero.id}`} className="group relative min-h-[480px] overflow-hidden rounded-sm"><Image src={hero.image} alt="" fill className="object-cover transition duration-500 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent"/><div className="absolute bottom-0 p-7 text-white md:p-10"><div className="eyebrow text-[#efb093]">{hero.category} · Featured</div><h2 className="serif mt-3 max-w-2xl text-4xl font-bold leading-tight md:text-6xl">{hero.title}</h2><p className="mt-4 max-w-xl text-sm leading-6 text-white/75">{hero.dek}</p><div className="mt-6 flex items-center gap-2 text-sm">Read the story <ArrowUpRight size={16}/></div></div></Link><div className="flex flex-col gap-6"><ArticleCard article={articles[1]} compact/><ArticleCard article={articles[2]} compact/></div></section>
    <section className="mt-20"><div className="mb-6 flex items-end justify-between"><div><div className="eyebrow">The latest</div><h2 className="serif mt-2 text-4xl font-bold">Worth your time.</h2></div><Link href="/trending" className="text-sm underline underline-offset-4">View all</Link></div><div className="grid gap-6 md:grid-cols-3">{articles.slice(2).map(article=><ArticleCard key={article.id} article={article}/>)}</div></section>
    {sectionsWithStories.length>0&&<section className="mt-20"><div className="mb-10"><div className="eyebrow">Updated headlines · publisher links</div><h2 className="serif mt-2 text-4xl font-bold">Across the news.</h2><p className="mt-3 max-w-2xl text-sm leading-6" style={{color:'var(--muted)'}}>We fetch up to 10 recent stories for each section and show the three latest here. Open a story to read it at its original publisher.</p></div><div className="space-y-14">{sectionsWithStories.map(section=><div key={section.label}><div className="mb-5 flex items-baseline justify-between border-b pb-3" style={{borderColor:'var(--line)'}}><h3 className="serif text-2xl font-bold">{section.label}</h3><Link href={`/category/${encodeURIComponent(section.label==='Entertainment'?'Culture':section.label)}`} className="text-sm text-[var(--accent)]">More {section.label} →</Link></div><div className="grid gap-5 md:grid-cols-3">{section.stories.slice(0,3).map(story=><LiveNewsCard key={story.url} story={story}/>)}</div></div>)}</div></section>}
    <section className="mt-20 border-y py-12" style={{borderColor:'var(--line)'}}><div className="mb-8"><div className="eyebrow">A selection from The Daily Brief</div><h2 className="serif mt-2 text-4xl font-bold">Best picks for you.</h2><p className="mt-3 max-w-2xl text-sm leading-6" style={{color:'var(--muted)'}}>A mix of our latest stories and articles published by the community.</p></div><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{bestPicks.map((pick, index) => pick.kind === 'editorial' ? <ArticleCard key={`editorial-${pick.article.id}`} article={pick.article}/> : <PublishedArticleCard key={`community-${String(pick.article._id)}`} article={pick.article}/>)}</div></section>
  </main><Footer/></>;
}
