import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const bookmarkSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  articleId: { type: String, required: true },
  articleType: { type: String, enum: ['editorial', 'community'], default: 'editorial', required: true },
}, { timestamps: true });

bookmarkSchema.index({ userId: 1, articleId: 1, articleType: 1 }, { unique: true });
export type Bookmark = InferSchemaType<typeof bookmarkSchema>;
export const BookmarkModel = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema);
