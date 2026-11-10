import Link from 'next/link';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { PublishedArticleModel } from '@/models/PublishedArticle';
import { UserModel } from '@/models/User';
import { Footer } from '@/components/footer';
import { ArticleImageEditor } from '@/components/article-image-editor';
import { GistPanel } from '@/components/gist-panel';
import { getCurrentUser } from '@/lib/auth';
import { cleanMarkdownText } from '@/lib/clean-markdown';

export default async function PublishedArticlePage({ params }: { params: { id: string } }) {
  if (!mongoose.isValidObjectId(params.id)) notFound();
  await connectToDatabase();
  const article = await PublishedArticleModel.findOne({ _id: params.id, status: 'published' }).lean();
  if (!article) notFound();
  const [author, viewer] = await Promise.all([
    UserModel.findById(article.authorId).select('name').lean(),
    getCurrentUser(),
  ]);
  const sections = article.sections as Array<{ heading: string; paragraphs: string[] }>;
  const articleText = `${cleanMarkdownText(article.dek)}\n\n${sections.map(section => `${cleanMarkdownText(section.heading)}\n${section.paragraphs.map(cleanMarkdownText).join('\n\n')}`).join('\n\n')}`;

  return <><main className="shell max-w-[980px] pb-16 pt-14">
    <Link href="/my-posts" className="eyebrow">← My Posts</Link>
    <article className="mt-10">
      <div className="eyebrow">{article.category} · Community story</div>
      <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,1fr)_260px] md:items-center"><h1 className="serif max-w-4xl text-5xl font-bold leading-[1.05] md:text-7xl">{cleanMarkdownText(article.title)}</h1><GistPanel article={{ title: cleanMarkdownText(article.title), content: articleText }}/></div>
      <p className="mt-6 max-w-2xl text-xl leading-8" style={{ color: 'var(--muted)' }}>{cleanMarkdownText(article.dek)}</p>
      <div className="mt-7 flex flex-wrap gap-4 text-sm" style={{ color: 'var(--muted)' }}>
        <span>By {author?.name || 'Daily Brief community'}</span><span>·</span>
        <span>{new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(article.publishedAt))}</span>
      </div>
      {article.imageId && <img src={`/api/uploads/${article.imageId}`} alt="Article illustration" className="image mt-10 aspect-[16/8]"/>}
      {viewer && String(viewer._id) === String(article.authorId) && <ArticleImageEditor articleId={params.id}/>}
      <div className="prose prose-lg mx-auto mt-10 max-w-2xl">{sections.map((section, index) => <section key={index}><h2>{cleanMarkdownText(section.heading)}</h2>{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{cleanMarkdownText(paragraph)}</p>)}</section>)}</div>
    </article>
  </main><Footer/></>;
}
