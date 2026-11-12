import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { WriterFollowModel } from '@/models/WriterFollow';

type Context = { params: { writerId: string } };

export async function GET(_request: Request, { params }: Context) {
  if (!mongoose.isValidObjectId(params.writerId)) return NextResponse.json({ error: 'Writer not found.' }, { status: 404 });
  await connectToDatabase();
  const writer = await UserModel.findById(params.writerId).select('_id').lean();
  if (!writer) return NextResponse.json({ error: 'Writer not found.' }, { status: 404 });
  const [viewer, followerCount] = await Promise.all([getCurrentUser(), WriterFollowModel.countDocuments({ writerId: writer._id })]);
  const following = viewer ? Boolean(await WriterFollowModel.exists({ followerId: viewer._id, writerId: writer._id })) : false;
  return NextResponse.json({ following, followerCount });
}

export async function POST(_request: Request, { params }: Context) {
  const viewer = await getCurrentUser();
  if (!viewer) return NextResponse.json({ error: 'Sign in to follow writers.' }, { status: 401 });
  if (!mongoose.isValidObjectId(params.writerId)) return NextResponse.json({ error: 'Writer not found.' }, { status: 404 });
  await connectToDatabase();
  if (String(viewer._id) === params.writerId) return NextResponse.json({ error: 'You cannot follow yourself.' }, { status: 400 });
  const writer = await UserModel.findById(params.writerId).select('_id').lean();
  if (!writer) return NextResponse.json({ error: 'Writer not found.' }, { status: 404 });
  await WriterFollowModel.updateOne({ followerId: viewer._id, writerId: writer._id }, { $setOnInsert: { followerId: viewer._id, writerId: writer._id } }, { upsert: true });
  return NextResponse.json({ following: true, followerCount: await WriterFollowModel.countDocuments({ writerId: writer._id }) });
}

export async function DELETE(_request: Request, { params }: Context) {
  const viewer = await getCurrentUser();
  if (!viewer) return NextResponse.json({ error: 'Sign in to manage followed writers.' }, { status: 401 });
  if (!mongoose.isValidObjectId(params.writerId)) return NextResponse.json({ error: 'Writer not found.' }, { status: 404 });
  await connectToDatabase();
  await WriterFollowModel.deleteOne({ followerId: viewer._id, writerId: params.writerId });
  return NextResponse.json({ following: false, followerCount: await WriterFollowModel.countDocuments({ writerId: params.writerId }) });
}
