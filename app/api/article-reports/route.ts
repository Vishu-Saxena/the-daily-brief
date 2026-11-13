import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { getArticle } from '@/lib/data';
import { PublishedArticleModel } from '@/models/PublishedArticle';
import { ArticleReportModel } from '@/models/ArticleReport';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to flag an article.' }, { status: 401 });
  try {
    const { articleId, articleType, reason } = await request.json();
    if (typeof articleId !== 'string' || !['editorial', 'community'].includes(articleType)) return NextResponse.json({ error: 'Invalid article.' }, { status: 400 });
    if (typeof reason !== 'string' || reason.trim().length < 10 || reason.trim().length > 500) return NextResponse.json({ error: 'Explain the accuracy concern in 10 to 500 characters.' }, { status: 400 });
    await connectToDatabase();
    let title: string;
    let articleKey: string;
    if (articleType === 'community') {
      if (!mongoose.isValidObjectId(articleId)) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
      const article = await PublishedArticleModel.findOne({ _id: articleId, status: 'published' }).select('title authorId').lean();
      if (!article) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
      if (String(article.authorId) === String(user._id)) return NextResponse.json({ error: 'You cannot flag your own article.' }, { status: 400 });
      title = article.title;
      articleKey = `community:${articleId}`;
    } else {
      const article = getArticle(articleId);
      if (!article || article.id !== articleId) return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
      title = article.title;
      articleKey = `editorial:${articleId}`;
    }
    const report = await ArticleReportModel.findOneAndUpdate(
      { articleKey, reporterId: user._id },
      { $setOnInsert: { articleKey, articleType, articleId, articleTitle: title, reporterId: user._id, reason: reason.trim(), status: 'open' } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    const [count, hasReported] = await Promise.all([
      ArticleReportModel.countDocuments({ articleKey, status: { $in: ['open', 'confirmed'] } }),
      ArticleReportModel.exists({ articleKey, reporterId: user._id, status: { $in: ['open', 'confirmed'] } }),
    ]);
    return NextResponse.json({ reported: Boolean(hasReported) || Boolean(report), count }, { status: 201 });
  } catch (error) {
    if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) return NextResponse.json({ error: 'You have already flagged this article.' }, { status: 409 });
    console.error('Article accuracy flag failed:', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'Could not flag this article right now.' }, { status: 500 });
  }
}
