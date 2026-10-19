import mongoose from 'mongoose';
import { User, IUser } from '../models/user.model';
import { Session } from '../models/session.model';
import { ApiError } from '../utils/apiError';

export interface CreateUserData {
  fullName: string;
  email: string;
  phone: string;
}

export class UserService {
  async createUser(data: CreateUserData): Promise<IUser> {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new ApiError(409, 'A user with this email already exists');
    }

    const user = await User.create({
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      phone: data.phone,
    });

    return user;
  }

  async getUserById(userId: string): Promise<IUser> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, 'Invalid user ID format');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  // User Session List using MongoDB Aggregation Pipeline
  async getUserSessions(userId: string) {
    await this.getUserById(userId);

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await Session.aggregate([
      {
        $match: {
          userId: userObjectId,
        },
      },
      {
        $facet: {
          upcomingSessions: [
            {
              $match: {
                status: 'BOOKED',
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
          ],
          completedSessions: [
            {
              $match: {
                status: 'COMPLETED',
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
              $sort: { completedAt: -1 },
            },
          ],
        },
      },
    ]);

    const sessions = result[0] || { upcomingSessions: [], completedSessions: [] };

    return {
      upcomingSessions: sessions.upcomingSessions,
      completedSessions: sessions.completedSessions,
    };
  }
}

export const userService = new UserService();
