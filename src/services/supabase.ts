import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// You will need to replace these with your actual Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or anon key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User related functions
export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password });
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

// Course related functions
export const getCourses = async () => {
  return await supabase.from('courses').select('*');
};

export const getCourseById = async (id: string) => {
  return await supabase.from('courses').select('*').eq('id', id).single();
};

// Lesson related functions
export const getLessonsByCourseId = async (courseId: string) => {
  return await supabase.from('lessons').select('*').eq('course_id', courseId);
};

export const getLessonById = async (id: string) => {
  return await supabase.from('lessons').select('*').eq('id', id).single();
};

// User progress related functions
export const getUserProgress = async (userId: string) => {
  return await supabase.from('user_progress').select('*').eq('user_id', userId);
};

export const updateUserProgress = async (userId: string, lessonId: string, completed: boolean) => {
  return await supabase.from('user_progress').upsert({
    user_id: userId,
    lesson_id: lessonId,
    completed,
    last_accessed: new Date().toISOString(),
  });
};