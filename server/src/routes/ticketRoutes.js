import express from 'express';
import {
  createTicket,
  checkDuplicateTickets,
  getTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket,
  updateTicketPriority,
  addComment,
  deleteTicket,
  reopenTicket
} from '../controllers/ticketController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/check-duplicate', checkDuplicateTickets);
router.post('/', createTicket);
router.get('/', getTickets);
router.get('/:id', getTicketById);

router.patch('/:id/status', requireRole('STAFF', 'ADMIN'), updateTicketStatus);
router.patch('/:id/assign', requireRole('ADMIN', 'STAFF'), assignTicket);
router.patch('/:id/priority', requireRole('ADMIN', 'STAFF'), updateTicketPriority);
router.post('/:id/comments', addComment);
router.delete('/:id', deleteTicket);
router.post('/:id/reopen', reopenTicket);

export default router;
