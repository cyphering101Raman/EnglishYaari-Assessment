import mongoose from 'mongoose';
import { Session, ISession } from '../models/session.model';
import { Teacher } from '../models/teacher.model';
import { User } from '../models/user.model';
import { ApiError } from '../utils/apiError';

export interface CreateSessionData {
  teacherId: string;
  startTime: string | Date;
  endTime: string | Date;
}

export class SessionService {
  // Create Session
  async createSession(data: CreateSessionData): Promise<ISession> {
    const { teacherId, startTime, endTime } = data;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      throw new ApiError(400, 'Invalid teacher ID format');
    }

    if (new Date(endTime) <= new Date(startTime)) {
      throw new ApiError(400, 'endTime must be greater than startTime');
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      throw new ApiError(404, 'Teacher not found');
    }

    return Session.create({ teacherId, startTime, endTime });
  }

  // Available Sessions for Booking using MongoDB Aggregation Pipeline
  async getAvailableSessions(dateTimestamp: string | number) {
    if (!dateTimestamp) {
      throw new ApiError(400, 'dateTimestamp query parameter is required');
    }

    let parsedDate: Date;
    if (typeof dateTimestamp === 'string' && !isNaN(Number(dateTimestamp))) {
      parsedDate = new Date(Number(dateTimestamp));
    } else {
      parsedDate = new Date(dateTimestamp);
    }

    if (isNaN(parsedDate.getTime())) {
      throw new ApiError(400, 'Invalid dateTimestamp value');
    }

    // Set bounds for the whole day in UTC
    const startOfDay = new Date(parsedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(parsedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          status: 'AVAILABLE',
          startTime: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $lookup: {
          from: 'teachers',
          localField: 'teacherId',
          foreignField: '_id',
          as: 'teacher',
        },
      },
      {
        $unwind: {
          path: '$teacher',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { startTime: 1 },
      },
    ];

    const availableSessions = await Session.aggregate(pipeline);
    return availableSessions;
  }

  // Book Session
  async bookSession(sessionId: string, userId: string): Promise<ISession> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw new ApiError(400, 'Invalid session ID format');
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, 'Valid userId is required in request body');
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Atomic update to prevent double-booking race conditions
    const updatedSession = await Session.findOneAndUpdate(
      { _id: sessionId, status: 'AVAILABLE' },
      { status: 'BOOKED', userId: new mongoose.Types.ObjectId(userId) },
      { new: true }
    );

    if (!updatedSession) {
      const session = await Session.findById(sessionId);
      if (!session) {
        throw new ApiError(404, 'Session not found');
      }
      throw new ApiError(400, `Cannot book session with status '${session.status}'. Only AVAILABLE sessions can be booked.`);
    }

    return updatedSession;
  }

  // Mark Session Complete
  async completeSession(sessionId: string): Promise<ISession> {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw new ApiError(400, 'Invalid session ID format');
    }

    const session = await Session.findOneAndUpdate(
      { _id: sessionId, status: 'BOOKED' },
      { status: 'COMPLETED', completedAt: new Date() },
      { new: true }
    );

    if (!session) {
      const existing = await Session.findById(sessionId);
      if (!existing) {
        throw new ApiError(404, 'Session not found');
      }
      throw new ApiError(400, `Only BOOKED sessions can be marked as completed. Current status is '${existing.status}'`);
    }

    return session;
  }
}

export const sessionService = new SessionService();
