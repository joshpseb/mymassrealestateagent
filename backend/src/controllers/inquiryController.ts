import { Request, Response } from 'express';
import { Inquiry } from '../models/Inquiry.js';
import { sendInquiryNotification } from '../services/emailService.js';

export const createInquiry = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message, propertyId, propertyAddress } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      message,
      propertyId,
      propertyAddress,
    });

    void sendInquiryNotification(inquiry).catch((error) => {
      console.error('Failed to send inquiry notification email:', error);
    });

    res.status(201).json({
      message: 'Inquiry submitted successfully',
      inquiryId: inquiry._id,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
};

export const getInquiries = async (_req: Request, res: Response) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
};
