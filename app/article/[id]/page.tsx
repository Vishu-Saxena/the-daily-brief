import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleTools } from '@/components/article-tools';
import { GistPanel } from '@/components/gist-panel';
import { getArticle } from '@/lib/data';
import { Footer } from '@/components/footer';

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = getArticle(params.id);
  if (!article) notFound();
  const fullText = `${article.title}. ${article.dek}. By ${article.author}. ${article.content} The story is still developing, but the direction is clear. Small shifts in everyday life often become visible only after they have already changed the way we work, make decisions, and pay attention. That is why context matters. The most useful news does not ask us to react to everything. It helps us understand what is changing — and what deserves a closer look.`;

  return <><main className="shell max-w-[980px] pb-16 pt-14">
    <Link href="/" className="eyebrow">← Back to the brief</Link>
    <article className="mt-10">
      <div className="eyebrow">{article.category}</div>
      <div className="mt-4 grid gap-6 md:grid-cols-[minmax(0,1fr)_260px] md:items-center"><h1 className="serif max-w-4xl text-5xl font-bold leading-[1.05] md:text-7xl">{article.title}</h1><GistPanel article={article}/></div>
      <p className="mt-6 max-w-2xl text-xl leading-8" style={{ color: 'var(--muted)' }}>{article.dek}</p>
      <div className="mt-7 flex flex-wrap gap-4 text-sm" style={{ color: 'var(--muted)' }}><span>By {article.author}</span><span>·</span><span>{article.date}</span><span>·</span><span>{article.readTime}</span></div>
      <Image src={article.image} alt="" width={1400} height={800} className="image mt-10 aspect-[16/8]"/>
      <div className="mx-auto mt-10 max-w-2xl">
        <ArticleTools article={article} fullText={fullText}/>
        <div className="prose prose-lg mt-10 max-w-none"><p>{article.content}</p><p>The story is still developing, but the direction is clear. Small shifts in everyday life often become visible only after they have already changed the way we work, make decisions, and pay attention.</p><p>That is why context matters. The most useful news does not ask us to react to everything. It helps us understand what is changing — and what deserves a closer look.</p></div>
      </div>
    </article>
  </main><Footer/></>;
}
