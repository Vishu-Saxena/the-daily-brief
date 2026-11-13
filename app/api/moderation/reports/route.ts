import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { isModerationAdmin } from '@/lib/moderation-auth';
import { ArticleReportModel } from '@/models/ArticleReport';

export async function GET() {
  const user = await getCurrentUser();
  if (!isModerationAdmin(user)) return NextResponse.json({ error: 'Moderator access required.' }, { status: 403 });
  await connectToDatabase();
  const reports = await ArticleReportModel.find({ status: 'open' }).populate('reporterId', 'name email').sort({ createdAt: 1 }).lean();
  return NextResponse.json({ reports });
}
