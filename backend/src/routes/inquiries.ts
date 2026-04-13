import express from 'express';
import { createInquiry, getInquiries } from '../controllers/inquiryController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getInquiries);
router.post('/', createInquiry);

export default router;
