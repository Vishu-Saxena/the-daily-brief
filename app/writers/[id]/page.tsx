import Link from 'next/link';
import mongoose from 'mongoose';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/footer';
import { FollowWriterButton } from '@/components/follow-writer-button';
import { PublishedArticleCard } from '@/components/published-article-card';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { PostLikeModel } from '@/models/PostLike';
import { PublishedArticleModel } from '@/models/PublishedArticle';
import { UserModel } from '@/models/User';
import { WriterFollowModel } from '@/models/WriterFollow';

export default async function WriterPage({ params }: { params: { id: string } }) {
  if (!mongoose.isValidObjectId(params.id)) notFound();
  await connectToDatabase();
  const [writer, viewer] = await Promise.all([UserModel.findById(params.id).select('name').lean(), getCurrentUser()]);
  if (!writer) notFound();
  const [posts, followerCount, following] = await Promise.all([
    PublishedArticleModel.find({ authorId: writer._id, status: 'published' }).sort({ publishedAt: -1 }).lean(),
    WriterFollowModel.countDocuments({ writerId: writer._id }),
    viewer && String(viewer._id) !== String(writer._id) ? WriterFollowModel.exists({ followerId: viewer._id, writerId: writer._id }) : null,
  ]);
  const totalLikes = await PostLikeModel.countDocuments({ articleId: { $in: posts.map(post => post._id) } });
  return <><main className="shell min-h-[70vh] pb-16 pt-16"><Link href="/dashboard" className="eyebrow">← Dashboard</Link><section className="mt-6 rounded border p-8 md:p-10" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}><div className="eyebrow">Community writer</div><h1 className="serif mt-3 text-5xl font-bold">{writer.name}</h1><p className="mt-3" style={{ color: 'var(--muted)' }}>{posts.length} published {posts.length === 1 ? 'article' : 'articles'} · {totalLikes} likes received</p><div className="mt-5"><FollowWriterButton writerId={String(writer._id)} initialFollowing={Boolean(following)} initialFollowers={followerCount} isWriter={Boolean(viewer && String(viewer._id) === String(writer._id))}/></div></section>
    <section className="mt-12"><div className="eyebrow">Latest writing</div><h2 className="serif mt-2 text-3xl font-bold">Articles by {writer.name}</h2>{posts.length ? <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{posts.map(post => <PublishedArticleCard key={String(post._id)} article={post}/>)}</div> : <p className="mt-5 text-sm" style={{ color: 'var(--muted)' }}>This writer has not published any articles yet.</p>}</section>
  </main><Footer/></>;
}
