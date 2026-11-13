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
  status: { type: String, enum: ['pending', 'published', 'rejected'], default: 'pending', required: true, index: true },
  moderationState: { type: String, enum: ['clean', 'flagged', 'unavailable'], default: 'unavailable', required: true },
  moderationCategories: { type: [String], default: [] },
  moderationNote: { type: String, default: '' },
  reviewedAt: { type: Date, default: null },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  reviewReason: { type: String, default: '' },
  appealMessage: { type: String, default: '' },
  appealStatus: { type: String, enum: ['none', 'pending', 'accepted', 'denied'], default: 'none', required: true },
  publishedAt: { type: Date, default: null },
}, { timestamps: true });

publishedArticleSchema.index({ authorId: 1, publishedAt: -1 });
export const PublishedArticleModel = mongoose.models.PublishedArticle || mongoose.model('PublishedArticle', publishedArticleSchema);
