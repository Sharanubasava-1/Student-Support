import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/dashboard', requireRole('ADMIN', 'STAFF'), getDashboardAnalytics);

export default router;
