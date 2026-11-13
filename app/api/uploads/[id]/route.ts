import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { Readable } from 'node:stream';
import { connectToDatabase } from '@/lib/mongodb';
import { getArticleImagesBucket } from '@/lib/article-images';
import { PublishedArticleModel } from '@/models/PublishedArticle';
import { getCurrentUser } from '@/lib/auth';
import { isModerationAdmin } from '@/lib/moderation-auth';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  if (!ObjectId.isValid(params.id)) return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
  await connectToDatabase();
  const imageId = new ObjectId(params.id);
  const [publishedArticle, imageFile, viewer] = await Promise.all([
    PublishedArticleModel.exists({ imageId: params.id, status: 'published' }),
    getArticleImagesBucket().find({ _id: imageId }).next(),
    getCurrentUser(),
  ]);
  const moderatorArticle = !publishedArticle && isModerationAdmin(viewer)
    ? await PublishedArticleModel.exists({ imageId: params.id, status: { $in: ['pending', 'rejected'] } })
    : false;
  const ownedArticle = !publishedArticle && viewer
    ? await PublishedArticleModel.exists({ imageId: params.id, authorId: viewer._id })
    : false;
  if ((!publishedArticle && !moderatorArticle && !ownedArticle) || !imageFile) return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
  const contentType = imageFile.metadata?.contentType;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) return NextResponse.json({ error: 'Image not found.' }, { status: 404 });

  const download = getArticleImagesBucket().openDownloadStream(imageId);
  const body = Readable.toWeb(download) as ReadableStream;
  return new Response(body, { headers: {
    'Content-Type': contentType,
    'Content-Length': String(imageFile.length),
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    'Content-Disposition': 'inline',
  } });
}
