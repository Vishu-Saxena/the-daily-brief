import mongoose, { Schema } from 'mongoose';
import { categories } from '@/lib/data';

const sectionSchema = new Schema({
  heading: { type: String, required: true, trim: true, maxlength: 160 },
  paragraphs: { type: [String], required: true, validate: (paragraphs: string[]) => paragraphs.length > 0 },
}, { _id: false });

const publishedArticleSchema = new Schema({
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  dek: { type: String, required: true, trim: true, maxlength: 400 },
  category: { type: String, required: true, enum: categories },
  sections: { type: [sectionSchema], required: true, validate: (sections: unknown[]) => sections.length > 0 },
  imageId: { type: String, default: null },
  status: { type: String, enum: ['published'], default: 'published', required: true },
  publishedAt: { type: Date, default: Date.now, required: true },
}, { timestamps: true });

publishedArticleSchema.index({ authorId: 1, publishedAt: -1 });
export const PublishedArticleModel = mongoose.models.PublishedArticle || mongoose.model('PublishedArticle', publishedArticleSchema);
