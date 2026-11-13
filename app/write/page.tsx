import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { PublishArticleForm } from '@/components/publish-article-form';
import { Footer } from '@/components/footer';
import { connectToDatabase } from '@/lib/mongodb';
import { PublishedArticleModel } from '@/models/PublishedArticle';

export default async function WritePage({ searchParams }: { searchParams: { edit?: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/write');
  let rejectedArticle: { id: string; title: string; dek: string; category: string; sections: { heading: string; paragraphs: string[] }[]; imageId: string | null } | null = null;
  if (searchParams.edit) {
    await connectToDatabase();
    const article = await PublishedArticleModel.findOne({ _id: searchParams.edit, authorId: user._id, status: 'rejected' }).lean();
    if (!article) redirect('/dashboard');
    rejectedArticle = { id: String(article._id), title: article.title, dek: article.dek, category: article.category, sections: article.sections.map((section: { heading: string; paragraphs: string[] }) => ({ heading: section.heading, paragraphs: section.paragraphs })), imageId: article.imageId || null };
  }
  return <><main className="shell min-h-[70vh] pb-16 pt-14"><div className="eyebrow">Community publishing</div><h1 className="serif mt-3 text-5xl font-bold md:text-6xl">{rejectedArticle ? 'Revise your article.' : 'Write a news story.'}</h1><p className="mt-4 max-w-2xl text-base leading-7" style={{ color: 'var(--muted)' }}>{rejectedArticle ? 'Edit the article based on the reviewer feedback, then submit the revised version for screening again.' : 'Write your own article or start with a topic. Review and edit the complete article, add an image, and submit it for publication.'}</p><p className="mt-4 max-w-2xl rounded border p-4 text-sm leading-6" style={{ borderColor: 'var(--line)', background: 'var(--accent-soft)' }}>Before publication, the article text and any uploaded image are sent to OpenAI’s moderation service for screening. Flagged submissions may be held for moderator review or rejected; rejected articles appear separately on your dashboard.</p><PublishArticleForm rejectedArticle={rejectedArticle}/></main><Footer/></>;
}
