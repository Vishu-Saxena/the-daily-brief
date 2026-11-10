import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PublishedArticleModel } from '@/models/PublishedArticle';
import { NewsStoryModel } from '@/models/NewsStory';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q')?.trim().slice(0, 100) || '';
  if (query.length < 2) return NextResponse.json({ community: [], news: [] });

  const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  try {
    await connectToDatabase();
    const [community, news] = await Promise.all([
      PublishedArticleModel.find({ status: 'published', $or: [
        { title: regex }, { dek: regex }, { category: regex },
        { 'sections.heading': regex }, { 'sections.paragraphs': regex },
      ] }).sort({ publishedAt: -1 }).limit(30).select('title dek category publishedAt imageId').lean(),
      NewsStoryModel.find({ $or: [
        { title: regex }, { description: regex }, { category: regex }, { source: regex },
      ] }).sort({ publishedAt: -1 }).limit(30).select('title description imageUrl source publishedAt url').lean(),
    ]);

    return NextResponse.json({
      community: community.map(article => ({ ...article, _id: String(article._id) })),
      news: news.map(story => ({ ...story, _id: String(story._id), publishedAt: new Date(story.publishedAt).toISOString() })),
    });
  } catch (error) {
    console.error('Search failed:', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'Search is unavailable right now. Please try again.' }, { status: 500 });
  }
}
