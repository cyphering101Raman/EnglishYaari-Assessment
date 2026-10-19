import { Teacher, ITeacher } from '../models/teacher.model';
import { ApiError } from '../utils/apiError';

export interface CreateTeacherData {
  fullName: string;
  email: string;
  specialization: string;
  experience: number;
}

export class TeacherService {
  async createTeacher(data: CreateTeacherData): Promise<ITeacher> {
    const existing = await Teacher.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new ApiError(409, 'A teacher with this email already exists');
    }

    const teacher = await Teacher.create({
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      specialization: data.specialization,
      experience: data.experience,
    });

    return teacher;
  }

  async getAllTeachers(): Promise<ITeacher[]> {
    return Teacher.find();
  }
}

export const teacherService = new TeacherService();
