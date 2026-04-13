import express from 'express';
import { getAgentProfile, upsertAgentProfile } from '../controllers/agentProfileController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAgentProfile);
router.put('/', verifyToken, upsertAgentProfile);

export default router;
