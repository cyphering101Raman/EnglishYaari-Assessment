import { Router } from 'express';
import { userController } from '../controllers/user.controller';

const router = Router();

// Create User
router.post('/', userController.createUser);

// User Session List
router.get('/:id/sessions', userController.getUserSessions);

export default router;
