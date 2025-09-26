export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  lessons: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  duration: number; // in minutes
  isCompleted?: boolean;
}

export interface CourseProgress {
  courseId: string;
  userId: string;
  completedLessons: string[];
  progress: number; // percentage
  lastAccessed: Date;
}
