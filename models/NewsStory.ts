import mongoose, { Schema } from 'mongoose';
import { categories } from '@/lib/data';

const newsStorySchema = new Schema({
  category: { type: String, required: true, enum: categories, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: null },
  source: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now, index: true },
  url: { type: String, required: true, unique: true },
}, { timestamps: true });

newsStorySchema.index({ category: 1, publishedAt: -1 });
export const NewsStoryModel = mongoose.models.NewsStory || mongoose.model('NewsStory', newsStorySchema);
