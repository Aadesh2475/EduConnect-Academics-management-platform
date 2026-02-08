import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const studentSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const teacherSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(1, "Department is required"),
  subject: z.string().min(1, "Subject is required"),
  university: z.string().min(1, "University name is required"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const adminSignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const createClassSchema = z.object({
  name: z.string().min(2, "Class name is required"),
  department: z.string().min(1, "Department is required"),
  semester: z.coerce.number().min(1).max(12),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
});

export const joinClassSchema = z.object({
  code: z.string().length(7, "Class code must be 7 characters"),
});

export const createAssignmentSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  instructions: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  totalMarks: z.coerce.number().min(1, "Total marks must be at least 1"),
  classId: z.string().min(1, "Class is required"),
});

export const createExamSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["QUIZ", "MIDTERM", "FINAL", "PRACTICE"]),
  classId: z.string().min(1, "Class is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  totalMarks: z.coerce.number().min(1),
  passingMarks: z.coerce.number().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  shuffleQuestions: z.boolean().optional(),
  showResults: z.boolean().optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  type: z.string().min(1, "Event type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  allDay: z.boolean().optional(),
  location: z.string().optional(),
  color: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).optional(),
  dueDate: z.string().optional(),
});

export const feedbackSchema = z.object({
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  rating: z.coerce.number().min(1).max(5).optional(),
  type: z.enum(["GENERAL", "BUG", "FEATURE", "COMPLAINT"]).optional(),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  semester: z.coerce.number().optional(),
  section: z.string().optional(),
  batch: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  subject: z.string().optional(),
  university: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.coerce.number().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type StudentSignupInput = z.infer<typeof studentSignupSchema>;
export type TeacherSignupInput = z.infer<typeof teacherSignupSchema>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type JoinClassInput = z.infer<typeof joinClassSchema>;
