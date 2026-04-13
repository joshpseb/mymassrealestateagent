import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    propertyId: { type: String, trim: true },
    propertyAddress: { type: String, trim: true },
  },
  { timestamps: true }
);

InquirySchema.index({ createdAt: -1 });

export const Inquiry = mongoose.model('Inquiry', InquirySchema);
