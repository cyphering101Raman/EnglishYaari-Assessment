import { Request, Response, NextFunction } from 'express';
import { teacherService } from '../services/teacher.service';
import { ApiError } from '../utils/apiError';

export class TeacherController {
  createTeacher = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fullName, email, specialization, experience } = req.body;

      if (!fullName || !email || !specialization || experience === undefined) {
        throw new ApiError(400, 'fullName, email, specialization, and experience are required');
      }

      const teacher = await teacherService.createTeacher({
        fullName,
        email,
        specialization,
        experience: Number(experience),
      });

      res.status(201).json({
        success: true,
        message: 'Teacher created successfully',
        data: teacher,
      });
    } catch (error) {
      next(error);
    }
  };

  getTeachers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teachers = await teacherService.getAllTeachers();
      res.status(200).json({
        success: true,
        data: teachers,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const teacherController = new TeacherController();
