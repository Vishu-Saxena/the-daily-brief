import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('Missing MONGODB_URI in .env.local');
const mongoUri: string = MONGODB_URI;

type Cached = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalWithMongo = globalThis as typeof globalThis & { __mongoose?: Cached };
const cached: Cached = globalWithMongo.__mongoose ?? { conn: null, promise: null };
globalWithMongo.__mongoose = cached;

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) cached.promise = mongoose.connect(mongoUri, { bufferCommands: false, serverSelectionTimeoutMS: 8000, family: 4, appName: 'daily-brief' });
  cached.conn = await cached.promise;
  return cached.conn;
}
