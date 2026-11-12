import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { PublishedArticleModel } from '@/models/PublishedArticle';
import { PostLikeModel } from '@/models/PostLike';

type Context = { params: { articleId: string } };

export async function GET(_request: Request, { params }: Context) {
  if (!mongoose.isValidObjectId(params.articleId)) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
  await connectToDatabase();
  const article = await PublishedArticleModel.findOne({ _id: params.articleId, status: 'published' }).select('_id').lean();
  if (!article) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
  const [viewer, count] = await Promise.all([getCurrentUser(), PostLikeModel.countDocuments({ articleId: article._id })]);
  const liked = viewer ? Boolean(await PostLikeModel.exists({ userId: viewer._id, articleId: article._id })) : false;
  return NextResponse.json({ liked, count });
}

export async function PUT(request: Request, { params }: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to like articles.' }, { status: 401 });
  if (!mongoose.isValidObjectId(params.articleId)) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
  await connectToDatabase();
  const article = await PublishedArticleModel.findOne({ _id: params.articleId, status: 'published' }).select('_id').lean();
  if (!article) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
  const { liked } = await request.json();
  if (liked) await PostLikeModel.updateOne({ userId: user._id, articleId: article._id }, { $setOnInsert: { userId: user._id, articleId: article._id } }, { upsert: true });
  else await PostLikeModel.deleteOne({ userId: user._id, articleId: article._id });
  return NextResponse.json({ liked: Boolean(liked), count: await PostLikeModel.countDocuments({ articleId: article._id }) });
}
