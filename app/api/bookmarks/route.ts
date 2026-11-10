import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { BookmarkModel } from '@/models/Bookmark';
import { articles } from '@/lib/data';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to view saved articles.' }, { status: 401 });
  const bookmarks = await BookmarkModel.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ bookmarks });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to save articles.' }, { status: 401 });
  const { articleId } = await request.json();
  if (!articles.some(article => article.id === articleId)) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
  const bookmark = await BookmarkModel.findOneAndUpdate({ userId: user._id, articleId }, { $setOnInsert: { userId: user._id, articleId } }, { upsert: true, new: true }).lean();
  return NextResponse.json({ bookmark }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to manage saved articles.' }, { status: 401 });
  const { articleId } = await request.json();
  await BookmarkModel.deleteOne({ userId: user._id, articleId });
  return NextResponse.json({ ok: true });
}
