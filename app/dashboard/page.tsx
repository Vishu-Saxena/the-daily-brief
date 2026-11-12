import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Footer } from '@/components/footer';
import { getCurrentUser } from '@/lib/auth';
import { PublishedArticleModel } from '@/models/PublishedArticle';
import { WriterFollowModel } from '@/models/WriterFollow';
import { PostLikeModel } from '@/models/PostLike';
import { UserModel } from '@/models/User';
import { FollowWriterButton } from '@/components/follow-writer-button';
import { ArticleImageEditor } from '@/components/article-image-editor';
import { DeleteArticleButton } from '@/components/delete-article-button';

export default async function WriterDashboardPage({ searchParams }: { searchParams: { published?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const [followerCount, posts, followedWriters] = await Promise.all([
    WriterFollowModel.countDocuments({ writerId: user._id }),
    PublishedArticleModel.find({ authorId: user._id, status: 'published' }).sort({ publishedAt: -1 }).lean(),
    WriterFollowModel.find({ followerId: user._id }).sort({ createdAt: -1 }).select('writerId').lean(),
  ]);
  const postIds = posts.map(post => post._id);
  const writerIds = followedWriters.map(follow => follow.writerId);
  const [likeCounts, followedUsers, followedCounts] = await Promise.all([
    postIds.length ? PostLikeModel.aggregate([{ $match: { articleId: { $in: postIds } } }, { $group: { _id: '$articleId', count: { $sum: 1 } } }]) : [],
    writerIds.length ? UserModel.find({ _id: { $in: writerIds } }).select('name').lean() : [],
    writerIds.length ? WriterFollowModel.aggregate([{ $match: { writerId: { $in: writerIds } } }, { $group: { _id: '$writerId', count: { $sum: 1 } } }]) : [],
  ]);
  const likesByPost = new Map(likeCounts.map(item => [String(item._id), item.count as number]));
  const totalLikes = likeCounts.reduce((total, item) => total + (item.count as number), 0);
  const usersById = new Map(followedUsers.map(writer => [String(writer._id), writer]));
  const followersByWriter = new Map(followedCounts.map(item => [String(item._id), item.count as number]));

  return <><main className="shell min-h-[70vh] pb-16 pt-16"><div className="flex flex-wrap items-end justify-between gap-5"><div><div className="eyebrow">Your account hub</div><h1 className="serif mt-3 text-5xl font-bold md:text-6xl">Dashboard</h1><p className="mt-4" style={{ color: 'var(--muted)' }}>Welcome back, {user.name}. Manage your writing and reading from here.</p></div><Link href="/write" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm text-white">Write an article</Link></div>
    {searchParams.published === '1' && <div role="status" className="mt-8 rounded border p-4 text-sm" style={{ borderColor: 'var(--line)', background: 'var(--accent-soft)' }}>Your article has been published and added to your dashboard.</div>}
    <div className="mt-10 grid gap-4 sm:grid-cols-3"><div className="rounded border p-6" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}><div className="eyebrow">Followers</div><div className="serif mt-3 text-4xl font-bold">{followerCount}</div></div><div className="rounded border p-6" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}><div className="eyebrow">Likes received</div><div className="serif mt-3 text-4xl font-bold">{totalLikes}</div></div><div className="rounded border p-6" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}><div className="eyebrow">Published articles</div><div className="serif mt-3 text-4xl font-bold">{posts.length}</div></div></div>

    <section className="mt-12"><div className="eyebrow">Your writing</div><h2 className="serif mt-2 text-3xl font-bold">Published posts</h2>
      {posts.length ? <div className="mt-6 space-y-4">{posts.map(post => <article key={String(post._id)} className="rounded border p-6" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="eyebrow">{post.category} · Published {new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(post.publishedAt))}</div><h3 className="serif mt-2 text-2xl font-bold"><Link href={`/posts/${String(post._id)}`} className="hover:text-[var(--accent)]">{post.title}</Link></h3><p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>{post.dek}</p></div><div className="rounded-full border px-4 py-2 text-sm" style={{ borderColor: 'var(--line)' }}>♥ {likesByPost.get(String(post._id)) || 0} likes</div></div><ArticleImageEditor articleId={String(post._id)}/><DeleteArticleButton articleId={String(post._id)}/></article>)}</div> : <div className="mt-6 rounded border p-8" style={{ borderColor: 'var(--line)' }}><h3 className="serif text-2xl font-bold">No published posts yet</h3><p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Write your first article and track its performance here.</p><Link href="/write" className="mt-4 inline-block text-sm underline">Start writing</Link></div>}
    </section>

    <section className="mt-14"><div className="eyebrow">Your reading community</div><h2 className="serif mt-2 text-3xl font-bold">Writers you follow</h2><p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Follow or unfollow writers and keep your reading list in one place.</p>
      {followedWriters.length ? <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{followedWriters.map(follow => { const writer = usersById.get(String(follow.writerId)); return writer ? <article key={String(follow.writerId)} className="rounded border p-5" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}><div className="eyebrow">Community writer</div><Link href={`/writers/${String(follow.writerId)}`} className="serif mt-2 inline-block text-xl font-bold hover:text-[var(--accent)]">{writer.name}</Link><div className="mt-4"><FollowWriterButton writerId={String(follow.writerId)} initialFollowing initialFollowers={followersByWriter.get(String(follow.writerId)) || 0} hideWhenUnfollowed/></div></article> : null; })}</div> : <div className="mt-6 rounded border p-6 text-sm" style={{ borderColor: 'var(--line)' }}><p style={{ color: 'var(--muted)' }}>You are not following any writers yet.</p><Link href="/" className="mt-3 inline-block underline">Discover community articles</Link></div>}
    </section>
  </main><Footer/></>;
}
