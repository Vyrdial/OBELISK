import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLessonById, getCourseById, getLessonsByCourseId, updateUserProgress } from '../services/supabase';
import { useAuth } from '../services/AuthContext';
import { Lesson, Course } from '../types';

export const LessonDetail = () => {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const { authState } = useAuth();
  const { user } = authState;
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!courseId || !lessonId) return;
      
      try {
        setLoading(true);
        
        // Fetch lesson details
        const { data: lessonData, error: lessonError } = await getLessonById(lessonId);
        if (lessonError) throw new Error(lessonError.message);
        
        // Fetch course details
        const { data: courseData, error: courseError } = await getCourseById(courseId);
        if (courseError) throw new Error(courseError.message);
        
        // Fetch all lessons for this course (for navigation)
        const { data: lessonsData, error: lessonsError } = await getLessonsByCourseId(courseId);
        if (lessonsError) throw new Error(lessonsError.message);
        
        setLesson(lessonData || null);
        setCourse(courseData || null);
        setCourseLessons(lessonsData?.sort((a, b) => a.order - b.order) || []);
        
      } catch (err) {
        setError('Failed to load lesson data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLessonData();
  }, [courseId, lessonId]);

  const handleMarkComplete = async () => {
    if (!user || !lessonId) return;
    
    try {
      await updateUserProgress(user.id, lessonId, true);
      setIsCompleted(true);
    } catch (err) {
      console.error('Failed to update lesson progress', err);
    }
  };

  const navigateToNextLesson = () => {
    if (!courseId || !lessonId || !courseLessons.length) return;
    
    const currentIndex = courseLessons.findIndex(l => l.id === lessonId);
    if (currentIndex === -1 || currentIndex === courseLessons.length - 1) {
      // If this is the last lesson, go back to course page
      navigate(`/courses/${courseId}`);
      return;
    }
    
    const nextLesson = courseLessons[currentIndex + 1];
    navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
  };

  // Get prev/next lesson for navigation
  const currentIndex = courseLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? courseLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1] : null;
  const isLastLesson = currentIndex === courseLessons.length - 1;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading lesson...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !lesson || !course) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Lesson not found'}</p>
          {courseId && (
            <Link to={`/courses/${courseId}`} className="font-medium underline mt-2 inline-block">
              Return to course
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Course navigation breadcrumb */}
      <div className="mb-6">
        <Link to={`/courses/${courseId}`} className="text-blue-600 hover:underline">
          ← Back to {course.title}
        </Link>
      </div>
      
      {/* Lesson content */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
          <div className="text-sm text-gray-500 mb-6">
            Lesson {currentIndex + 1} of {courseLessons.length}
          </div>
          
          {/* Lesson content - in a real app, this would be rich content */}
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
          </div>
        </div>
      </div>
      
      {/* Lesson navigation */}
      <div className="flex justify-between items-center border-t pt-6">
        <div>
          {prevLesson ? (
            <Link 
              to={`/courses/${courseId}/lessons/${prevLesson.id}`}
              className="flex items-center text-blue-600 hover:underline"
            >
              <span className="mr-2">←</span>
              <span>Previous: {prevLesson.title}</span>
            </Link>
          ) : (
            <div className="text-gray-400">This is the first lesson</div>
          )}
        </div>
        <div className="flex gap-4">
          {!isCompleted && (
            <button
              onClick={handleMarkComplete}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded"
            >
              Mark as Complete
            </button>
          )}
          {nextLesson ? (
            <Link 
              to={`/courses/${courseId}/lessons/${nextLesson.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded flex items-center"
            >
              <span>Next Lesson</span>
              <span className="ml-2">→</span>
            </Link>
          ) : (
            <Link 
              to={`/courses/${courseId}`}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded flex items-center"
            >
              <span>Finish Course</span>
              <span className="ml-2">→</span>
            </Link>
          )}
        </div>
      </div>
      
      {/* Lesson completion modal - this would be triggered when marking a lesson complete */}
      {isCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Lesson Completed!</h3>
              <p className="text-gray-600 mb-6">
                Great job! You've completed this lesson.
              </p>
              <div className="flex gap-3 justify-center">
                {isLastLesson ? (
                  <Link 
                    to={`/courses/${courseId}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
                  >
                    Back to Course
                  </Link>
                ) : (
                  <button
                    onClick={navigateToNextLesson}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
                  >
                    Next Lesson
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};