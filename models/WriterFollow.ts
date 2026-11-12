import mongoose, { Schema } from 'mongoose';

const writerFollowSchema = new Schema({
  followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  writerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });

writerFollowSchema.index({ followerId: 1, writerId: 1 }, { unique: true });
export const WriterFollowModel = mongoose.models.WriterFollow || mongoose.model('WriterFollow', writerFollowSchema);
