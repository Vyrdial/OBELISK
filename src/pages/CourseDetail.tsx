import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseById, getLessonsByCourseId, getUserProgress, updateUserProgress } from '../services/supabase';
import { useAuth } from '../services/AuthContext';
import { Course, Lesson, UserProgress } from '../types';

export const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { authState } = useAuth();
  const { user } = authState;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons'>('overview');

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch course details
        const { data: courseData, error: courseError } = await getCourseById(id);
        if (courseError) throw new Error(courseError.message);
        
        // Fetch course lessons
        const { data: lessonsData, error: lessonsError } = await getLessonsByCourseId(id);
        if (lessonsError) throw new Error(lessonsError.message);
        
        setCourse(courseData || null);
        setLessons(lessonsData || []);
        
        // If user is logged in, fetch their progress for this course
        if (user) {
          const { data: progressData, error: progressError } = await getUserProgress(user.id);
          if (progressError) throw new Error(progressError.message);
          
          setUserProgress(progressData || []);
        }
      } catch (err) {
        setError('Failed to load course data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [id, user]);

  const handleLessonClick = async (lessonId: string) => {
    if (!user) return;
    
    try {
      // Update lesson as accessed
      await updateUserProgress(user.id, lessonId, false);
      
      // Refresh progress data
      const { data: progressData } = await getUserProgress(user.id);
      if (progressData) setUserProgress(progressData);
    } catch (err) {
      console.error('Failed to update lesson progress', err);
    }
  };

  const getLessonStatus = (lessonId: string) => {
    if (!user || !userProgress.length) return 'not-started';
    
    const progress = userProgress.find(p => p.lesson_id === lessonId);
    if (!progress) return 'not-started';
    if (progress.completed) return 'completed';
    return 'in-progress';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading course...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Course not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Course header */}
      <div className="mb-10">
        <div className="bg-blue-600 text-white p-8 rounded-lg">
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          <p className="text-lg mb-6">{course.description}</p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 px-4 py-2 rounded">
              <span className="font-semibold">{lessons.length}</span> lessons
            </div>
            <div className="bg-white/10 px-4 py-2 rounded">
              <span className="font-semibold">6</span> hours
            </div>
            {/* This would be dynamically calculated based on what level the course is */}
            <div className="bg-white/10 px-4 py-2 rounded">
              Intermediate
            </div>
          </div>
        </div>
      </div>
      
      {/* Course tabs */}
      <div className="mb-8">
        <div className="border-b">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } font-medium`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`py-4 px-1 border-b-2 ${
                activeTab === 'lessons'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } font-medium`}
            >
              Lessons
            </button>
          </nav>
        </div>
      </div>
      
      {/* Tab content */}
      <div className="mb-12">
        {activeTab === 'overview' ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">About this course</h2>
            <div className="prose max-w-none">
              <p className="mb-4">
                This comprehensive course is designed to provide you with a deep understanding of {course.title}. 
                Whether you're a beginner or looking to upgrade your skills, this course has something for everyone.
              </p>
              
              <h3 className="text-xl font-semibold mt-8 mb-4">What you'll learn</h3>
              <ul className="list-disc pl-5 space-y-2 mb-6">
                <li>Core concepts and principles of {course.title}</li>
                <li>Practical applications and real-world problem solving</li>
                <li>Advanced techniques and best practices</li>
                <li>How to build your own projects from scratch</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-8 mb-4">Prerequisites</h3>
              <ul className="list-disc pl-5 space-y-2 mb-6">
                <li>Basic understanding of related concepts</li>
                <li>Access to a computer with internet connection</li>
                <li>Eagerness to learn and apply new concepts</li>
              </ul>
              
              <h3 className="text-xl font-semibold mt-8 mb-4">Instructor</h3>
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Dr. Jane Smith</h4>
                  <p className="text-gray-600">Expert in {course.title} with 10+ years of experience</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Course Content</h2>
            
            {lessons.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                {lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson, index) => {
                    const status = getLessonStatus(lesson.id);
                    return (
                      <div key={lesson.id} className="border-b last:border-b-0">
                        <div className="flex items-center p-4 hover:bg-gray-50">
                          <div className="mr-4">
                            {status === 'completed' ? (
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                                ✓
                              </div>
                            ) : status === 'in-progress' ? (
                              <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center text-blue-500">
                                ▶
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400">
                                {index + 1}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <Link 
                              to={`/courses/${course.id}/lessons/${lesson.id}`}
                              onClick={() => handleLessonClick(lesson.id)}
                              className="block font-medium text-gray-900 hover:text-blue-600"
                            >
                              {lesson.title}
                            </Link>
                            <p className="text-sm text-gray-500">
                              {/* This would be actual metadata from your lessons */}
                              15 min • Video
                            </p>
                          </div>
                          <div>
                            <Link 
                              to={`/courses/${course.id}/lessons/${lesson.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {status === 'completed' ? 'Review' : status === 'in-progress' ? 'Continue' : 'Start'}
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-10 border rounded-lg">
                <p className="text-gray-600">No lessons available yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Enrollment CTA */}
      {!user ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-4">Ready to start learning?</h3>
          <p className="text-gray-600 mb-6">
            Create an account to track your progress and unlock all course features.
          </p>
          <Link 
            to="/register" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-medium"
          >
            Sign Up and Enroll
          </Link>
        </div>
      ) : (
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-4">Ready to continue your learning journey?</h3>
          <Link 
            to={lessons.length > 0 ? `/courses/${course.id}/lessons/${lessons[0].id}` : '#'}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-medium"
            onClick={() => lessons.length > 0 && handleLessonClick(lessons[0].id)}
          >
            {userProgress.length > 0 ? 'Continue Course' : 'Start Course'}
          </Link>
        </div>
      )}
    </div>
  );
};