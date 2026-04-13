import mongoose from 'mongoose';

const NewsArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true },
    date: { type: String, required: true },
    imageUrl: { type: String },
    sourceName: { type: String, required: true },
    sourceUrl: { type: String, required: true },
    fetchedAt: { type: Date, default: Date.now },
    publishedAt: { type: Date, required: true },
    isCurated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NewsArticleSchema.index({ fetchedAt: -1 });
NewsArticleSchema.index({ publishedAt: -1 });

export const NewsArticle = mongoose.model('NewsArticle', NewsArticleSchema);
