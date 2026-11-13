import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { isModerationAdmin } from '@/lib/moderation-auth';
import { PublishedArticleModel } from '@/models/PublishedArticle';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const reviewer = await getCurrentUser();
  if (!isModerationAdmin(reviewer)) return NextResponse.json({ error: 'Moderator access required.' }, { status: 403 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
  const { decision, reason = '' } = await request.json();
  if (!['publish', 'reject'].includes(decision)) return NextResponse.json({ error: 'Choose publish or reject.' }, { status: 400 });
  const cleanReason = typeof reason === 'string' ? reason.trim().slice(0, 1000) : '';
  if (decision === 'reject' && cleanReason.length < 10) return NextResponse.json({ error: 'Add a rejection reason of at least 10 characters.' }, { status: 400 });
  await connectToDatabase();
  const article = await PublishedArticleModel.findOne({ _id: params.id, status: 'pending' });
  if (!article) return NextResponse.json({ error: 'This article is no longer awaiting review.' }, { status: 404 });
  article.status = decision === 'publish' ? 'published' : 'rejected';
  article.publishedAt = decision === 'publish' ? new Date() : null;
  article.reviewedAt = new Date();
  article.reviewedBy = reviewer!._id;
  article.reviewReason = cleanReason || (decision === 'publish' ? 'Approved after moderator review.' : 'Rejected after moderator review.');
  await article.save();
  return NextResponse.json({ status: article.status });
}
