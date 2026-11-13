import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { PublishedArticleModel } from '@/models/PublishedArticle';
import { BookmarkModel } from '@/models/Bookmark';
import { deleteArticleImage } from '@/lib/article-images';
import { PostLikeModel } from '@/models/PostLike';
import { categories } from '@/lib/data';
import { storeArticleImage } from '@/lib/article-images';
import { cleanMarkdownText } from '@/lib/clean-markdown';
import { moderateSubmission } from '@/lib/content-moderation';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to edit this article.' }, { status: 401 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });

  let uploadedImageId: string | null = null;
  try {
    const form = await request.formData();
    const payload = form.get('article');
    if (typeof payload !== 'string') return NextResponse.json({ error: 'Article content is required.' }, { status: 400 });
    const { title, dek, category, sections } = JSON.parse(payload);
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
    const article = await PublishedArticleModel.findOne({ _id: params.id, authorId: user._id, status: 'rejected' });
    if (!article) return NextResponse.json({ error: 'Only your rejected articles can be revised here.' }, { status: 404 });
    let imageBuffer: Buffer | undefined;
    let imageContentType = '';
    const imageEntry = form.get('image');
    if (imageEntry instanceof File && imageEntry.size > 0) {
      if (imageEntry.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Image must be 5 MB or smaller.' }, { status: 413 });
      imageBuffer = Buffer.from(await imageEntry.arrayBuffer());
      const isPng = imageBuffer.length >= 8 && imageBuffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const isJpeg = imageBuffer.length >= 3 && imageBuffer[0] === 0xff && imageBuffer[1] === 0xd8 && imageBuffer[2] === 0xff;
      const isWebp = imageBuffer.length >= 12 && imageBuffer.toString('ascii', 0, 4) === 'RIFF' && imageBuffer.toString('ascii', 8, 12) === 'WEBP';
      imageContentType = isPng ? 'image/png' : isJpeg ? 'image/jpeg' : isWebp ? 'image/webp' : '';
      if (!imageContentType || imageEntry.type !== imageContentType) return NextResponse.json({ error: 'Upload a valid JPEG, PNG, or WebP image.' }, { status: 400 });
    }
    const cleanTitle = cleanMarkdownText(title).trim();
    const cleanDek = cleanMarkdownText(dek).trim();
    const screening = await moderateSubmission([cleanTitle, cleanDek, ...cleanSections.flatMap(section => [section.heading, ...section.paragraphs])].join('\n\n'), imageBuffer ? { buffer: imageBuffer, contentType: imageContentType } : undefined);
    if (imageBuffer) uploadedImageId = await storeArticleImage(imageBuffer, imageContentType, String(user._id));
    const previousImageId = article.imageId;
    article.title = cleanTitle;
    article.dek = cleanDek;
    article.category = category;
    article.sections = cleanSections;
    if (uploadedImageId) article.imageId = uploadedImageId;
    article.status = screening.status;
    article.moderationState = screening.state;
    article.moderationCategories = screening.categories;
    article.moderationNote = screening.note;
    article.reviewedAt = null;
    article.reviewedBy = null;
    article.reviewReason = '';
    article.publishedAt = screening.status === 'published' ? new Date() : null;
    await article.save();
    if (uploadedImageId && previousImageId) await deleteArticleImage(previousImageId).catch(() => undefined);
    return NextResponse.json({ status: article.status, message: screening.note });
  } catch (error) {
    if (uploadedImageId) await deleteArticleImage(uploadedImageId).catch(() => undefined);
    console.error('Resubmit revised article error:', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'Unable to resubmit this article right now. Please try again.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to delete an article.' }, { status: 401 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });

  await connectToDatabase();
  const article = await PublishedArticleModel.findOneAndDelete({ _id: params.id, authorId: user._id });
  if (!article) return NextResponse.json({ error: 'Article not found or you do not have permission to delete it.' }, { status: 404 });

  await Promise.all([BookmarkModel.deleteMany({ articleId: params.id }), PostLikeModel.deleteMany({ articleId: params.id })]);
  if (article.imageId) await deleteArticleImage(article.imageId).catch(error => console.error('Unable to remove deleted article image:', error instanceof Error ? error.name : 'unknown'));
  return NextResponse.json({ success: true });
}
