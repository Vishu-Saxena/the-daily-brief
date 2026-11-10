import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { PublishArticleForm } from '@/components/publish-article-form';
import { Footer } from '@/components/footer';

export default async function WritePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/write');
  return <><main className="shell min-h-[70vh] pb-16 pt-14"><div className="eyebrow">Community publishing</div><h1 className="serif mt-3 text-5xl font-bold md:text-6xl">Write a news story.</h1><p className="mt-4 max-w-2xl text-base leading-7" style={{ color: 'var(--muted)' }}>Write your own article or start with a topic. Review and edit the complete article, add an image, and approve it before publishing.</p><PublishArticleForm/></main><Footer/></>;
}
