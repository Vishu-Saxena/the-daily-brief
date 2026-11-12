import mongoose, { Schema } from 'mongoose';

const postLikeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  articleId: { type: Schema.Types.ObjectId, ref: 'PublishedArticle', required: true, index: true },
}, { timestamps: true });

postLikeSchema.index({ userId: 1, articleId: 1 }, { unique: true });
export const PostLikeModel = mongoose.models.PostLike || mongoose.model('PostLike', postLikeSchema);
