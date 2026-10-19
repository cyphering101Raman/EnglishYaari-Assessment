import { Router } from 'express';
import userRoutes from './user.routes';
import sessionRoutes from './session.routes';
import teacherRoutes from './teacher.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/sessions', sessionRoutes);
router.use('/teachers', teacherRoutes);

export default router;
