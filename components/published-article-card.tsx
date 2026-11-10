import Link from 'next/link';

export function PublishedArticleCard({ article }: { article: { _id: unknown; title: string; dek: string; category: string; publishedAt: Date | string; imageId?: string | null } }) {
  const date = new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(article.publishedAt));
  return <Link href={`/posts/${String(article._id)}`} className="card group flex min-h-[250px] flex-col">
    {article.imageId&&<img src={`/api/uploads/${article.imageId}`} alt="" loading="lazy" className="image aspect-[16/10]"/>}<div className="flex flex-1 flex-col justify-between p-6"><div><div className="eyebrow mb-4">{article.category} · Community story</div><h3 className="serif text-2xl font-bold leading-tight group-hover:text-[var(--accent)]">{article.title}</h3><p className="mt-3 text-sm leading-6" style={{ color: 'var(--muted)' }}>{article.dek}</p></div>
    <div className="mt-6 flex items-center justify-between text-xs" style={{ color: 'var(--muted)' }}><span>Daily Brief community</span><span>{date}</span></div>
  </div></Link>;
}
