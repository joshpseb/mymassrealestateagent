import express from 'express';
import {
  getProperties,
  getProperty,
  getPropertyCities,
  getPropertyMapPins,
  createProperty,
  updateProperty,
  deleteProperty
} from '../controllers/propertyController.js';
import { getMlsSyncStatus, triggerMlsSync } from '../controllers/mlsSyncController.js';
import { verifyToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { propertySchema } from '../schemas/property.js';

const router = express.Router();

router.get('/', getProperties);
router.get('/map', getPropertyMapPins);
router.get('/cities', getPropertyCities);
router.get('/sync/status', getMlsSyncStatus);
router.get('/:id', getProperty);

// Protected and validated routes
router.post('/sync', verifyToken, triggerMlsSync);
router.post('/', verifyToken, validate(propertySchema), createProperty);
router.put('/:id', verifyToken, validate(propertySchema), updateProperty);
router.delete('/:id', verifyToken, deleteProperty);

export default router;
