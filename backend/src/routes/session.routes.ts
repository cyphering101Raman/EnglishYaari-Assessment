import { Router } from 'express';
import { sessionController } from '../controllers/session.controller';

const router = Router();

// Create Session
router.post('/', sessionController.createSession);

// Available Sessions for Booking
router.get('/available', sessionController.getAvailableSessions);

// Book Session
router.post('/:id/book', sessionController.bookSession);

// Mark Session Complete
router.patch('/:id/complete', sessionController.completeSession);

export default router;
