import express from 'express';
import {
  createSupportTicket,
  getSupportTickets,
  toggleTicketReadStatus,
  deleteSupportTicket,
} from '../controllers/supportController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, createSupportTicket);
router.get('/', protect, adminOnly, getSupportTickets);
router.put('/:id/read', protect, adminOnly, toggleTicketReadStatus);
router.delete('/:id', protect, adminOnly, deleteSupportTicket);

export default router;
