import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { PublishedArticleModel } from '@/models/PublishedArticle';
import { BookmarkModel } from '@/models/Bookmark';
import { deleteArticleImage } from '@/lib/article-images';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to delete an article.' }, { status: 401 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });

  await connectToDatabase();
  const article = await PublishedArticleModel.findOneAndDelete({ _id: params.id, authorId: user._id });
  if (!article) return NextResponse.json({ error: 'Article not found or you do not have permission to delete it.' }, { status: 404 });

  await BookmarkModel.deleteMany({ articleId: params.id });
  if (article.imageId) await deleteArticleImage(article.imageId).catch(error => console.error('Unable to remove deleted article image:', error instanceof Error ? error.name : 'unknown'));
  return NextResponse.json({ success: true });
}
