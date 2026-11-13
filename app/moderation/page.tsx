import { notFound, redirect } from 'next/navigation';
import { Footer } from '@/components/footer';
import { ModerationReviewActions } from '@/components/moderation-review-actions';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { isModerationAdmin } from '@/lib/moderation-auth';
import { PublishedArticleModel } from '@/models/PublishedArticle';
import { ArticleReportModel } from '@/models/ArticleReport';
import { ReportReviewActions } from '@/components/report-review-actions';

export default async function ModerationPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!isModerationAdmin(user)) notFound();
  await connectToDatabase();
  const [articles, reports] = await Promise.all([
    PublishedArticleModel.find({ status: 'pending' }).populate('authorId', 'name email').sort({ createdAt: 1 }).lean(),
    ArticleReportModel.find({ status: 'open' }).populate('reporterId', 'name email').sort({ createdAt: 1 }).lean(),
  ]);
  return <><main className="shell min-h-[70vh] pb-16 pt-16"><div className="eyebrow">Editorial review</div><h1 className="serif mt-3 text-5xl font-bold md:text-6xl">Moderation queue</h1><p className="mt-4 max-w-2xl text-sm leading-6" style={{ color: 'var(--muted)' }}>Review flagged submissions and reader reports about potentially false or misleading facts.</p>
    {articles.length ? <div className="mt-10 space-y-6">{articles.map(article => { const author = article.authorId as unknown as { _id: unknown; name?: string; email?: string }; return <article key={String(article._id)} className="rounded border p-6 md:p-8" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}><div className="eyebrow">{article.category} · Awaiting review · Submitted {new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(article.createdAt))}</div><h2 className="serif mt-3 text-3xl font-bold">{article.title}</h2><p className="mt-3 text-base leading-7" style={{ color: 'var(--muted)' }}>{article.dek}</p><p className="mt-3 text-sm">By {author?.name || 'Unknown author'}{author?.email ? ` · ${author.email}` : ''}</p>
      {article.moderationCategories.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{article.moderationCategories.map((category: string) => <span key={category} className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: 'var(--line)' }}>{category}</span>)}</div>}
      {article.moderationNote && <p className="mt-4 rounded bg-[var(--accent-soft)] p-3 text-sm">Automated screening: {article.moderationNote}</p>}
      {article.imageId && <img src={`/api/uploads/${article.imageId}`} alt="Submitted article image for moderation" className="image mt-5 max-h-[420px] w-full object-contain"/>}
      <div className="prose prose-sm mt-6 max-w-none">{article.sections.map((section: { heading: string; paragraphs: string[] }, index: number) => <section key={index}><h3>{section.heading}</h3>{section.paragraphs.map((paragraph: string, paragraphIndex: number) => <p key={paragraphIndex}>{paragraph}</p>)}</section>)}</div>
      <ModerationReviewActions articleId={String(article._id)}/></article>; })}</div> : <div className="mt-10 rounded border p-8" style={{ borderColor: 'var(--line)' }}><h2 className="serif text-2xl font-bold">The review queue is clear.</h2><p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Flagged submissions will appear here.</p></div>}
    <section className="mt-16"><div className="eyebrow">Reader reports</div><h2 className="serif mt-2 text-3xl font-bold">Accuracy flags</h2>{reports.length ? <div className="mt-6 space-y-4">{reports.map(report => { const reporter = report.reporterId as unknown as { name?: string; email?: string }; const href = report.articleType === 'community' ? `/posts/${report.articleId}` : `/article/${report.articleId}`; return <article key={String(report._id)} className="rounded border p-6" style={{ borderColor: 'var(--line)', background: 'var(--surface)' }}><div className="eyebrow">{report.articleType} article · Reported {new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(report.createdAt))}</div><h3 className="serif mt-2 text-2xl font-bold"><a href={href} target="_blank" rel="noreferrer" className="hover:text-[var(--accent)]">{report.articleTitle}</a></h3><p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Reason: {report.reason}</p><p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>Submitted by {reporter?.name || 'reader'}{reporter?.email ? ` · ${reporter.email}` : ''}.</p><ReportReviewActions reportId={String(report._id)}/></article>; })}</div> : <div className="mt-6 rounded border p-6 text-sm" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>No open accuracy flags.</div>}</section>
  </main><Footer/></>;
}
