import express from 'express';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty
} from '../controllers/propertyController.js';
import { verifyToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { propertySchema } from '../schemas/property.js';

const router = express.Router();

router.get('/', getProperties);
router.get('/:id', getProperty);

// Protected and validated routes
router.post('/', verifyToken, validate(propertySchema), createProperty);
router.put('/:id', verifyToken, validate(propertySchema), updateProperty);
router.delete('/:id', verifyToken, deleteProperty);

export default router;