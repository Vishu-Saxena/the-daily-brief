import { notFound } from 'next/navigation';
import { articles, categories } from '@/lib/data';
import { connectToDatabase } from '@/lib/mongodb';
import { PublishedArticleModel } from '@/models/PublishedArticle';
import { ArticleCard } from '@/components/article-card';
import { PublishedArticleCard } from '@/components/published-article-card';
import { Footer } from '@/components/footer';
import { LiveNewsCard } from '@/components/live-news-card';
import { NewsStoryModel } from '@/models/NewsStory';

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const requestedCategory = decodeURIComponent(params.category);
  const category = categories.find(item => item.toLowerCase() === requestedCategory.toLowerCase());
  if (!category) notFound();

  await connectToDatabase();
  const [editorialArticles, communityArticles, newsStories] = await Promise.all([
    Promise.resolve(articles.filter(article => article.category.toLowerCase() === category.toLowerCase())),
    PublishedArticleModel.find({ category, status: 'published' }).sort({ publishedAt: -1 }).lean(),
    NewsStoryModel.find({ category }).sort({ publishedAt: -1 }).limit(4).lean(),
  ]);

  const hasStories = editorialArticles.length > 0 || communityArticles.length > 0 || newsStories.length > 0;
  return <><main className="shell min-h-[70vh] pb-10 pt-16"><div className="eyebrow">Section</div><h1 className="serif mt-3 text-6xl font-bold">{category}</h1><p className="mt-4 max-w-xl" style={{ color: 'var(--muted)' }}>Stories, ideas, and reporting from the {category.toLowerCase()} beat.</p>
    {hasStories ? <div className="mt-12 grid gap-6 md:grid-cols-3">{newsStories.map(story => <LiveNewsCard key={story.url} story={{ title: story.title, description: story.description, imageUrl: story.imageUrl, source: story.source, publishedAt: new Date(story.publishedAt).toISOString(), url: story.url }}/ >)}{communityArticles.map(article => <PublishedArticleCard key={String(article._id)} article={article}/ >)}{editorialArticles.map(article => <ArticleCard key={article.id} article={article}/>)}</div> : <div className="mt-12 rounded border p-8" style={{ borderColor: 'var(--line)' }}><h2 className="serif text-2xl font-bold">No {category.toLowerCase()} stories yet.</h2><p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>Published community stories and news from this section will appear here.</p></div>}
  </main><Footer/></>;
}
