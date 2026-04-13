import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', verifyToken, upload.array('images', 10), (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) || [];
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = typeof forwardedProto === 'string' ? forwardedProto.split(',')[0] : req.protocol;
  const host = req.get('host');
  const baseUrl = host ? `${protocol}://${host}` : '';
  const urls = files.map((file) =>
    baseUrl ? `${baseUrl}/api/uploads/${file.filename}` : `/api/uploads/${file.filename}`
  );
  res.json({ urls });
});

export default router;
