import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { ApiError } from '../utils/apiError';

export class UserController {
  // Create User (POST /users)
  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fullName, email, phone } = req.body;

      if (!fullName || !email || !phone) {
        throw new ApiError(400, 'fullName, email, and phone are required fields');
      }

      const user = await userService.createUser({ fullName, email, phone });
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  // User Session List (GET /users/:id/sessions)
  getUserSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const sessions = await userService.getUserSessions(id as string);

      res.status(200).json({
        success: true,
        message: 'User sessions retrieved successfully',
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
