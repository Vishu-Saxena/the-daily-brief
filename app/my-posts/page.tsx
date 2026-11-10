import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PenLine, Plus } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { PublishedArticleModel } from '@/models/PublishedArticle';
import { Footer } from '@/components/footer';
import { ArticleImageEditor } from '@/components/article-image-editor';
import { DeleteArticleButton } from '@/components/delete-article-button';

export default async function MyPostsPage({ searchParams }: { searchParams: { published?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/my-posts');
  const posts = await PublishedArticleModel.find({ authorId: user._id }).sort({ publishedAt: -1 }).lean();
  return <><main className="shell min-h-[70vh] pb-16 pt-16"><div className="flex flex-wrap items-end justify-between gap-5"><div><div className="eyebrow">Your author space</div><h1 className="serif mt-3 text-5xl font-bold md:text-6xl">My Posts</h1><p className="mt-4" style={{ color: 'var(--muted)' }}>Articles you have published under {user.name}.</p></div><Link href="/write" className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm text-white"><Plus size={17}/> Write an article</Link></div>
    {searchParams.published === '1' && <div role="status" className="mt-8 rounded border p-4 text-sm" style={{ borderColor: 'var(--line)', background: 'var(--accent-soft)' }}>Your article has been published.</div>}
    {posts.length ? <div className="mt-10 space-y-4">{posts.map(post => <article key={String(post._id)} className="rounded border p-6" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}><div className="eyebrow">{post.category} · Published {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(post.publishedAt))}</div><h2 className="serif mt-3 text-2xl font-bold"><Link href={`/posts/${post._id}`} className="hover:text-[var(--accent)]">{post.title}</Link></h2><p className="mt-3 max-w-3xl text-sm leading-6" style={{ color: 'var(--muted)' }}>{post.dek}</p><Link href={`/posts/${post._id}`} className="mt-4 inline-flex items-center gap-1 text-sm text-[var(--accent)]">Read published article <PenLine size={14}/></Link><ArticleImageEditor articleId={String(post._id)}/><DeleteArticleButton articleId={String(post._id)}/></article>)}</div> : <div className="mt-12 rounded border p-8" style={{ borderColor: 'var(--line)' }}><h2 className="serif text-2xl font-bold">Your publication list is empty.</h2><p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Start with a complete article draft and review the AI prepared version before publishing.</p><Link href="/write" className="mt-5 inline-block text-sm underline">Write your first article</Link></div>}
  </main><Footer/></>;
}
