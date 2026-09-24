import express from 'express';
import { getSupportStaff } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/staff', getSupportStaff);

export default router;
