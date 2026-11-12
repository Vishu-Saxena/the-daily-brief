import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { WriterFollowModel } from '@/models/WriterFollow';
import { UserModel } from '@/models/User';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ writers: [] }, { status: 401 });
  await connectToDatabase();
  const follows = await WriterFollowModel.find({ followerId: user._id }).sort({ createdAt: -1 }).select('writerId').lean();
  const writers = await UserModel.find({ _id: { $in: follows.map(follow => follow.writerId) } }).select('name').lean();
  const byId = new Map(writers.map(writer => [String(writer._id), writer]));
  return NextResponse.json({ writers: follows.map(follow => ({ id: String(follow.writerId), name: byId.get(String(follow.writerId))?.name || 'Daily Brief writer' })).filter(writer => byId.has(writer.id)) });
}
