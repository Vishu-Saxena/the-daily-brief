import { connectToDatabase } from '@/lib/mongodb';
import { categories } from '@/lib/data';
import { NewsStoryModel } from '@/models/NewsStory';

export type LiveHeadline = {
  title: string;
  description: string;
  imageUrl: string | null;
  source: string;
  publishedAt: string;
  url: string;
};

export async function getCategoryHeadlines(category: string): Promise<LiveHeadline[]> {
  const storedCategory = categories.find(item => item.toLowerCase() === category.toLowerCase());
  if (!storedCategory) return [];

  try {
    await connectToDatabase();
    const stories = await NewsStoryModel.find({ category: storedCategory }).sort({ publishedAt: -1 }).limit(4).lean();
    return stories.map(story => ({
      title: story.title,
      description: story.description,
      imageUrl: story.imageUrl,
      source: story.source,
      publishedAt: new Date(story.publishedAt).toISOString(),
      url: story.url,
    }));
  } catch (error) {
    console.error(`Stored news lookup failed for ${storedCategory}:`, error instanceof Error ? error.name : 'unknown');
    return [];
  }
}
