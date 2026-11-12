import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { BookmarkModel } from '@/models/Bookmark';
import { articles } from '@/lib/data';
import { ArticleCard } from '@/components/article-card';
import { Footer } from '@/components/footer';
import { PublishedArticleModel } from '@/models/PublishedArticle';
import { PublishedArticleCard } from '@/components/published-article-card';

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) return <><main className="shell flex min-h-[70vh] items-center justify-center py-16"><div className="max-w-md text-center"><div className="eyebrow">Your library</div><h1 className="serif mt-3 text-5xl font-bold">Saved articles</h1><p className="mt-4" style={{color:'var(--muted)'}}>Sign in to keep your favorite stories in one place.</p><Link href="/login" className="mt-6 inline-block rounded-full bg-[var(--accent)] px-5 py-3 text-sm text-white">Sign in</Link></div></main><Footer/></>;
  const bookmarks = await BookmarkModel.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
  const communityIds = bookmarks.filter(bookmark => bookmark.articleType === 'community').map(bookmark => bookmark.articleId);
  const communityArticles = communityIds.length ? await PublishedArticleModel.find({ _id: { $in: communityIds }, status: 'published' }).lean() : [];
  const communityById = new Map(communityArticles.map(article => [String(article._id), article]));
  const savedItems = bookmarks.map(bookmark => bookmark.articleType === 'community'
    ? { type: 'community' as const, article: communityById.get(bookmark.articleId) }
    : { type: 'editorial' as const, article: articles.find(article => article.id === bookmark.articleId) }).filter(item => Boolean(item.article));
  return <><main className="shell min-h-[70vh] pb-10 pt-16"><div className="eyebrow">Your library</div><h1 className="serif mt-3 text-6xl font-bold">Saved articles</h1><p className="mt-4" style={{color:'var(--muted)'}}>Stories you want to return to, {user.name}.</p>{savedItems.length?<div className="mt-12 grid gap-6 md:grid-cols-3">{savedItems.map(item => item.type === 'community'
    ? <PublishedArticleCard key={`community-${String(item.article!._id)}`} article={item.article!}/>
    : <ArticleCard key={`editorial-${item.article!.id}`} article={item.article!}/>)}</div>:<div className="mt-12 rounded border p-8" style={{borderColor:'var(--line)'}}><h2 className="serif text-2xl font-bold">Nothing saved yet.</h2><p className="mt-2 text-sm" style={{color:'var(--muted)'}}>Use the Save button on any article to add it to your library.</p><Link href="/" className="mt-5 inline-block text-sm underline">Browse the latest stories</Link></div>}</main><Footer/></>;
}
