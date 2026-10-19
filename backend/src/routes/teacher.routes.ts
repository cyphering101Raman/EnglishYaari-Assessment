import { Router } from 'express';
import { teacherController } from '../controllers/teacher.controller';

const router = Router();

// Create Teacher
router.post('/', teacherController.createTeacher);

// Get Teacher
router.get('/', teacherController.getTeachers);

export default router;
