import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../services/supabase';
import { Course } from '../types';

export const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // These would come from your database in a real app
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'programming', name: 'Programming' },
    { id: 'data-science', name: 'Data Science' },
    { id: 'design', name: 'Design' },
    { id: 'business', name: 'Business' },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const { data, error } = await getCourses();
        
        if (error) throw new Error(error.message);
        
        setCourses(data || []);
      } catch (err) {
        setError('Failed to load courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  // Filter courses based on search term and category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // In a real app, you would have a category field on your courses
    const matchesCategory = selectedCategory === 'all' || course.id.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading courses...</h2>
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
      <h1 className="text-3xl font-bold mb-8">Explore Our Courses</h1>
      
      {/* Search and filter */}
      <div className="mb-10 flex flex-col md:flex-row gap-4">
        <div className="md:w-2/3">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:w-1/3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Course grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img 
                src={course.image_url || "https://via.placeholder.com/600x400"} 
                alt={course.title} 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4 h-20 overflow-hidden">
                  {course.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {/* In a real app, you would have this metadata */}
                    12 lessons • 6 hours
                  </span>
                  <Link 
                    to={`/courses/${course.id}`} 
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-600 mb-4">No courses found matching your criteria.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};