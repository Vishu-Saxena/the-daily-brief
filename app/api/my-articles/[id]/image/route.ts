import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { deleteArticleImage, storeArticleImage } from '@/lib/article-images';
import { PublishedArticleModel } from '@/models/PublishedArticle';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to update this article image.' }, { status: 401 });
  if (!ObjectId.isValid(params.id)) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });

  let newImageId: string | null = null;
  try {
    const form = await request.formData();
    const image = form.get('image');
    if (!(image instanceof File) || image.size === 0) return NextResponse.json({ error: 'Choose an image to upload.' }, { status: 400 });
    if (image.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Image must be 5 MB or smaller.' }, { status: 413 });
    const buffer = Buffer.from(await image.arrayBuffer());
    const isPng = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isWebp = buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
    const actualType = isPng ? 'image/png' : isJpeg ? 'image/jpeg' : isWebp ? 'image/webp' : '';
    if (!actualType || image.type !== actualType) return NextResponse.json({ error: 'Upload a valid JPEG, PNG, or WebP image.' }, { status: 400 });

    await connectToDatabase();
    const article = await PublishedArticleModel.findOne({ _id: params.id, authorId: user._id, status: 'published' });
    if (!article) return NextResponse.json({ error: 'Published article not found.' }, { status: 404 });
    const previousImageId = article.imageId;
    newImageId = await storeArticleImage(buffer, actualType, String(user._id));
    article.imageId = newImageId;
    await article.save();
    if (previousImageId) await deleteArticleImage(previousImageId).catch(() => undefined);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (newImageId) await deleteArticleImage(newImageId).catch(() => undefined);
    console.error('Article image update failed:', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'Could not save the image. Please try again.' }, { status: 500 });
  }
}
