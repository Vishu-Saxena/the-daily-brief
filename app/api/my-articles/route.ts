import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { PublishedArticleModel } from '@/models/PublishedArticle';
import { categories } from '@/lib/data';
import { deleteArticleImage, storeArticleImage } from '@/lib/article-images';
import { cleanMarkdownText } from '@/lib/clean-markdown';
import { moderateSubmission } from '@/lib/content-moderation';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to view your publications.' }, { status: 401 });
  await connectToDatabase();
  const articles = await PublishedArticleModel.find({ authorId: user._id }).sort({ publishedAt: -1 }).lean();
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to publish an article.' }, { status: 401 });
  let uploadedImageId: string | null = null;
  try {
    const form = await request.formData();
    const payload = form.get('article');
    if (typeof payload !== 'string') return NextResponse.json({ error: 'Article content is required.' }, { status: 400 });
    const { title, dek, category, sections } = JSON.parse(payload);
    const imageWasSelected = form.get('imageAttached') === 'true';
    const imageEntry = form.get('image');
    if (imageWasSelected && !(imageEntry instanceof File)) return NextResponse.json({ error: 'The selected image did not reach the server. Please select it again and retry.' }, { status: 400 });
    if (typeof title !== 'string' || title.trim().length < 5 || title.trim().length > 180) return NextResponse.json({ error: 'Headline must be between 5 and 180 characters.' }, { status: 400 });
    if (typeof dek !== 'string' || dek.trim().length < 10 || dek.trim().length > 400) return NextResponse.json({ error: 'Summary must be between 10 and 400 characters.' }, { status: 400 });
    if (!categories.includes(category)) return NextResponse.json({ error: 'Select a valid category.' }, { status: 400 });
    if (!Array.isArray(sections) || sections.length < 1 || sections.length > 8) return NextResponse.json({ error: 'An article must contain between 1 and 8 sections.' }, { status: 400 });
    const cleanSections = sections.map((section: { heading?: unknown; paragraphs?: unknown }) => ({
      heading: typeof section.heading === 'string' ? cleanMarkdownText(section.heading).slice(0, 160) : '',
      paragraphs: Array.isArray(section.paragraphs) ? section.paragraphs.filter((paragraph): paragraph is string => typeof paragraph === 'string').map(cleanMarkdownText).filter(Boolean) : [],
    }));
    if (cleanSections.some(section => !section.heading || !section.paragraphs.length)) return NextResponse.json({ error: 'Every section needs a heading and at least one paragraph.' }, { status: 400 });
    const articleLength = cleanSections.reduce((total, section) => total + section.paragraphs.join('').length, 0);
    if (articleLength < 250 || articleLength > 40000) return NextResponse.json({ error: 'The article must contain between 250 and 40,000 characters.' }, { status: 400 });
    await connectToDatabase();
    let imageBuffer: Buffer | null = null;
    let imageContentType = '';
    if (imageEntry instanceof File && imageEntry.size > 0) {
      if (imageEntry.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Image must be 5 MB or smaller.' }, { status: 413 });
      imageBuffer = Buffer.from(await imageEntry.arrayBuffer());
      const isPng = imageBuffer.length >= 8 && imageBuffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const isJpeg = imageBuffer.length >= 3 && imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8 && imageBuffer[2] === 0xff;
      const isWebp = imageBuffer.length >= 12 && imageBuffer.toString('ascii', 0, 4) === 'RIFF' && imageBuffer.toString('ascii', 8, 12) === 'WEBP';
      const actualType = isPng ? 'image/png' : isJpeg ? 'image/jpeg' : isWebp ? 'image/webp' : '';
      if (!actualType || imageEntry.type !== actualType) return NextResponse.json({ error: 'Upload a valid JPEG, PNG, or WebP image.' }, { status: 400 });
      imageContentType = actualType;
    }
    const cleanTitle = cleanMarkdownText(title).trim();
    const cleanDek = cleanMarkdownText(dek).trim();
    const moderationText = [cleanTitle, cleanDek, ...cleanSections.flatMap(section => [section.heading, ...section.paragraphs])].join('\n\n');
    const moderation = await moderateSubmission(moderationText, imageBuffer ? { buffer: imageBuffer, contentType: imageContentType } : undefined);
    if (imageBuffer) uploadedImageId = await storeArticleImage(imageBuffer, imageContentType, String(user._id));
    const article = await PublishedArticleModel.create({
      authorId: user._id,
      title: cleanTitle,
      dek: cleanDek,
      category,
      sections: cleanSections,
      imageId: uploadedImageId,
      status: moderation.status,
      moderationState: moderation.state,
      moderationCategories: moderation.categories,
      moderationNote: moderation.note,
      publishedAt: moderation.status === 'published' ? new Date() : null,
      appealStatus: 'none',
    });
    return NextResponse.json({ article: { id: String(article._id), title: article.title, imageAttached: Boolean(uploadedImageId) }, status: article.status, message: moderation.note || 'Your article passed screening and is now published.' }, { status: 201 });
  } catch (error) {
    console.error('Publish article error:', error instanceof Error ? error.name : 'unknown');
    if (uploadedImageId) await deleteArticleImage(uploadedImageId).catch(() => undefined);
    return NextResponse.json({ error: 'Unable to publish this article right now. Please try again.' }, { status: 500 });
  }
}
