import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { isModerationAdmin } from '@/lib/moderation-auth';
import { ArticleReportModel } from '@/models/ArticleReport';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const reviewer = await getCurrentUser();
  if (!isModerationAdmin(reviewer)) return NextResponse.json({ error: 'Moderator access required.' }, { status: 403 });
  if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
  const { decision } = await request.json();
  if (!['confirm', 'dismiss'].includes(decision)) return NextResponse.json({ error: 'Choose confirm or dismiss.' }, { status: 400 });
  await connectToDatabase();
  const report = await ArticleReportModel.findOne({ _id: params.id, status: 'open' });
  if (!report) return NextResponse.json({ error: 'This report has already been reviewed.' }, { status: 404 });
  report.status = decision === 'confirm' ? 'confirmed' : 'dismissed';
  report.reviewedAt = new Date();
  report.reviewedBy = reviewer!._id;
  await report.save();
  return NextResponse.json({ status: report.status });
}
