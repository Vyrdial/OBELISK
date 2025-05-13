import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Transform Your Learning Experience
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Access high-quality educational content, track your progress, and achieve your learning goals with our comprehensive learning platform.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/courses"
              className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium text-lg"
            >
              Explore Courses
            </Link>
            <Link
              to="/register"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 px-6 py-3 rounded-lg font-medium text-lg"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose OBELISK Learning</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 border rounded-lg shadow-sm">
              <div className="text-blue-600 text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Curriculum</h3>
              <p className="text-gray-600">
                Access a wide range of courses designed by experts in various fields.
              </p>
            </div>
            <div className="text-center p-6 border rounded-lg shadow-sm">
              <div className="text-blue-600 text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">Self-Paced Learning</h3>
              <p className="text-gray-600">
                Learn at your own pace with flexible schedules and on-demand content.
              </p>
            </div>
            <div className="text-center p-6 border rounded-lg shadow-sm">
              <div className="text-blue-600 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-gray-600">
                Monitor your learning journey with detailed progress analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Courses</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Course cards would be dynamically generated, this is a placeholder */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img 
                src="https://via.placeholder.com/600x400" 
                alt="Course" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Web Development Fundamentals</h3>
                <p className="text-gray-600 mb-4">
                  Learn the core skills needed to build modern websites and applications.
                </p>
                <Link 
                  to="/courses/1" 
                  className="text-blue-600 font-medium hover:underline"
                >
                  Learn More →
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img 
                src="https://via.placeholder.com/600x400" 
                alt="Course" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Data Science Essentials</h3>
                <p className="text-gray-600 mb-4">
                  Master the fundamentals of data analysis and machine learning.
                </p>
                <Link 
                  to="/courses/2" 
                  className="text-blue-600 font-medium hover:underline"
                >
                  Learn More →
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img 
                src="https://via.placeholder.com/600x400" 
                alt="Course" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Digital Marketing Strategy</h3>
                <p className="text-gray-600 mb-4">
                  Develop effective marketing strategies for the digital landscape.
                </p>
                <Link 
                  to="/courses/3" 
                  className="text-blue-600 font-medium hover:underline"
                >
                  Learn More →
                </Link>
              </div>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link
              to="/courses"
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-medium"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Students Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-gray-600 mb-4">
                "OBELISK Learning has transformed the way I approach education. The platform is intuitive and the course content is exceptional."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-gray-500">Web Development Student</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-gray-600 mb-4">
                "The self-paced nature of the courses allowed me to learn while maintaining my full-time job. I couldn't be happier with my progress."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Michael Chen</h4>
                  <p className="text-gray-500">Data Science Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Start Your Learning Journey Today</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of students already learning on our platform.
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium text-lg"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
};