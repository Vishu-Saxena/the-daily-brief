import mongoose, { Schema } from 'mongoose';

const articleReportSchema = new Schema({
  articleKey: { type: String, required: true, index: true },
  articleType: { type: String, enum: ['editorial', 'community'], required: true },
  articleId: { type: String, required: true },
  articleTitle: { type: String, required: true },
  reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true, trim: true, maxlength: 500 },
  status: { type: String, enum: ['open', 'confirmed', 'dismissed'], default: 'open', required: true, index: true },
  reviewedAt: { type: Date, default: null },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

articleReportSchema.index({ articleKey: 1, reporterId: 1 }, { unique: true });
export const ArticleReportModel = mongoose.models.ArticleReport || mongoose.model('ArticleReport', articleReportSchema);
