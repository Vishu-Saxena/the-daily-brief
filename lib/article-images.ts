import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

export function getArticleImagesBucket() {
  const database = mongoose.connection.db;
  if (!database) throw new Error('MongoDB is not connected.');
  return new GridFSBucket(database, { bucketName: 'articleImages' });
}

export async function storeArticleImage(buffer: Buffer, contentType: string, ownerId: string) {
  const id = new ObjectId();
  const upload = getArticleImagesBucket().openUploadStream(`article-image-${id.toHexString()}`, {
    id,
    metadata: { contentType, ownerId },
  });
  await pipeline(Readable.from(buffer), upload);
  return id.toHexString();
}

export async function deleteArticleImage(id: string) {
  if (!ObjectId.isValid(id)) return;
  await getArticleImagesBucket().delete(new ObjectId(id));
}
