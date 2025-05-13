import { useState, useEffect } from 'react';
import { useAuth } from '../services/AuthContext';
import { getCourses, getUserProgress } from '../services/supabase';
import { Course, UserProgress } from '../types';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { authState } = useAuth();
  const { user } = authState;
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch courses
        const { data: coursesData, error: coursesError } = await getCourses();
        if (coursesError) throw new Error(coursesError.message);
        
        // Fetch user progress
        const { data: progressData, error: progressError } = await getUserProgress(user.id);
        if (progressError) throw new Error(progressError.message);
        
        setCourses(coursesData || []);
        setUserProgress(progressData || []);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Calculate course completion percentage
  const calculateProgress = (courseId: string) => {
    if (!userProgress.length) return 0;
    
    const courseProgress = userProgress.filter(p => 
      courses.find(c => c.id === courseId)?.id === courseId
    );
    
    if (!courseProgress.length) return 0;
    
    const completedLessons = courseProgress.filter(p => p.completed).length;
    const totalLessons = courseProgress.length;
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading your dashboard...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Dashboard</h1>
      
      {/* User welcome section */}
      <div className="bg-blue-50 rounded-lg p-6 mb-10">
        <h2 className="text-2xl font-semibold mb-2">Welcome back, {user?.email?.split('@')[0]}</h2>
        <p className="text-gray-600">
          Track your progress and continue learning where you left off.
        </p>
      </div>
      
      {/* In-progress courses */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Continue Learning</h2>
        
        {courses.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
              const progress = calculateProgress(course.id);
              return (
                <div key={course.id} className="bg-white rounded-lg overflow-hidden shadow border">
                  <img 
                    src={course.image_url || "https://via.placeholder.com/600x400"} 
                    alt={course.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {progress}% complete
                      </p>
                    </div>
                    <Link 
                      to={`/courses/${course.id}`} 
                      className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    >
                      {progress > 0 ? 'Continue' : 'Start'} Course
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg border text-center">
            <p className="text-gray-600 mb-4">
              You haven't started any courses yet.
            </p>
            <Link 
              to="/courses" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
      
      {/* Stats section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Your Learning Stats</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border text-center">
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {courses.length}
            </p>
            <p className="text-gray-600">Enrolled Courses</p>
          </div>
          <div className="bg-white p-6 rounded-lg border text-center">
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {userProgress.filter(p => p.completed).length}
            </p>
            <p className="text-gray-600">Completed Lessons</p>
          </div>
          <div className="bg-white p-6 rounded-lg border text-center">
            <p className="text-3xl font-bold text-blue-600 mb-2">
              {/* This would need additional tracking */}
              0
            </p>
            <p className="text-gray-600">Hours of Learning</p>
          </div>
        </div>
      </div>
      
      {/* Recommended courses */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Recommended for You</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* This would be dynamic based on user interests and behavior */}
          <div className="bg-white rounded-lg overflow-hidden shadow border">
            <img 
              src="https://via.placeholder.com/600x400" 
              alt="Recommended Course" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Advanced Programming Concepts</h3>
              <p className="text-gray-600 mb-4">
                Take your programming skills to the next level with advanced algorithms and data structures.
              </p>
              <Link 
                to="/courses/recommended" 
                className="text-blue-600 font-medium hover:underline"
              >
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};