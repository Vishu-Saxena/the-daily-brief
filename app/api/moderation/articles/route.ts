import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { isModerationAdmin } from '@/lib/moderation-auth';
import { PublishedArticleModel } from '@/models/PublishedArticle';

export async function GET() {
  const user = await getCurrentUser();
  if (!isModerationAdmin(user)) return NextResponse.json({ error: 'Moderator access required.' }, { status: 403 });
  await connectToDatabase();
  const articles = await PublishedArticleModel.find({ status: 'pending' })
    .populate('authorId', 'name email').sort({ createdAt: 1 }).lean();
  return NextResponse.json({ articles });
}
