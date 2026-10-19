import { Request, Response, NextFunction } from 'express';
import { sessionService } from '../services/session.service';
import { ApiError } from '../utils/apiError';

export class SessionController {
  // API 2 - Create Session (POST /sessions)
  createSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { teacherId, startTime, endTime } = req.body;

      if (!teacherId || !startTime || !endTime) {
        throw new ApiError(400, 'teacherId, startTime, and endTime are required');
      }

      const session = await sessionService.createSession({ teacherId, startTime, endTime });
      res.status(201).json({
        success: true,
        message: 'Session created successfully',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  // API 3 - Available Sessions for Booking (GET /sessions/available?dateTimestamp={timestamp})
  getAvailableSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { dateTimestamp } = req.query;

      if (!dateTimestamp) {
        throw new ApiError(400, 'dateTimestamp query parameter is required');
      }

      const sessions = await sessionService.getAvailableSessions(dateTimestamp as string);
      res.status(200).json({
        success: true,
        message: 'Available sessions retrieved successfully',
        count: sessions.length,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  };

  // API 4 - Book Session (POST /sessions/:id/book)
  bookSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        throw new ApiError(400, 'userId is required in request body');
      }

      const session = await sessionService.bookSession(id as string, userId);
      res.status(200).json({
        success: true,
        message: 'Session booked successfully',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  // API 5 - Mark Session Complete (PATCH /sessions/:id/complete)
  completeSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const session = await sessionService.completeSession(id as string);
      res.status(200).json({
        success: true,
        message: 'Session marked as completed',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const sessionController = new SessionController();
