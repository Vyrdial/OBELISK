export interface User {
  id: string;
  email: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order: number;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  last_accessed: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}