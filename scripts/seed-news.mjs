import mongoose from 'mongoose';

const categories = [
  { name: 'Technology', query: 'technology' },
  { name: 'Business', query: 'business' },
  { name: 'Politics', query: 'politics' },
  { name: 'Science', query: 'science' },
  { name: 'Sports', query: 'sports' },
  { name: 'Culture', query: 'entertainment' },
  { name: 'World', query: 'world news' },
  { name: 'Health', query: 'health' },
];

const { MONGODB_URI, NEWS_COUNTRY = 'in' } = process.env;
if (!MONGODB_URI) {
  console.error('Set MONGODB_URI in .env.local before seeding.');
  process.exit(1);
}

const schema = new mongoose.Schema({
  category: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: null },
  source: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now, index: true },
  url: { type: String, required: true, unique: true },
}, { timestamps: true, collection: 'newsstories' });
schema.index({ category: 1, publishedAt: -1 });
const NewsStory = mongoose.models.NewsStory || mongoose.model('NewsStory', schema);

function xmlValue(item, tag) {
  const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return match?.[1]?.replace(/^<!\[CDATA\[|\]\]>$/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").trim() || '';
}

async function fetchRss(category) {
  const url = new URL('https://news.google.com/rss/search');
  url.searchParams.set('q', category.query);
  url.searchParams.set('hl', 'en-IN');
  url.searchParams.set('gl', NEWS_COUNTRY.toUpperCase());
  url.searchParams.set('ceid', `${NEWS_COUNTRY.toUpperCase()}:en`);
  const response = await fetch(url, { headers: { 'User-Agent': 'DailyBriefNewsSeeder/1.0' } });
  if (!response.ok) throw new Error(`Google News RSS returned ${response.status} for ${category.name}.`);
  const xml = await response.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(([, item]) => {
    const title = xmlValue(item, 'title');
    const source = xmlValue(item, 'source') || title.split(' - ').at(-1) || 'News publisher';
    return { title: title.replace(/\s+-\s+[^-]+$/, '').trim(), url: xmlValue(item, 'link'), description: xmlValue(item, 'description'), source, publishedAt: xmlValue(item, 'pubDate') };
  }).filter(article => article.title && article.url);
}

try {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000, family: 4, appName: 'daily-brief-news-seed' });
  const counts = {};
  for (const category of categories) {
    const existing = await NewsStory.find({ category: category.name }).sort({ publishedAt: -1 }).limit(4).lean();
    if (existing.length >= 4) {
      counts[category.name] = await NewsStory.countDocuments({ category: category.name });
      continue;
    }
    const candidates = await fetchRss(category);
    const existingUrls = new Set(existing.map(article => article.url));
    const items = candidates.filter(article => article.title?.trim() && article.url?.trim() && article.title !== '[Removed]' && !existingUrls.has(article.url)).slice(0, 4 - existing.length);
    if (items.length < 4 - existing.length) throw new Error(`Only ${existing.length + items.length} unique stories were available for ${category.name}; four are required.`);
    for (const article of items) {
      await NewsStory.updateOne({ url: article.url }, { $set: {
        category: category.name,
        title: article.title.trim(),
        description: article.description?.trim() || 'Open the publisher for the full story and latest updates.',
        imageUrl: article.imageUrl || null,
        source: article.source || 'News publisher',
        publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
        url: article.url,
      } }, { upsert: true });
    }
    counts[category.name] = await NewsStory.countDocuments({ category: category.name });
  }
  const storedCounts = {};
  for (const category of categories) storedCounts[category.name] = await NewsStory.countDocuments({ category: category.name });
  console.log('Verified stored news records by category:', storedCounts);
  const shortCategories = Object.entries(storedCounts).filter(([, count]) => count < 4).map(([name]) => name);
  if (shortCategories.length) throw new Error(`Fewer than four stored stories in: ${shortCategories.join(', ')}.`);
} finally {
  await mongoose.disconnect();
}
