import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Courses } from './pages/Courses';
import { CourseDetail } from './pages/CourseDetail';
import { LessonDetail } from './pages/LessonDetail';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authState } = useAuth();
  const { user, loading } = authState;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Register success page
const RegisterSuccess = () => (
  <div className="container mx-auto px-4 py-12 text-center">
    <h1 className="text-3xl font-bold mb-4">Registration Successful!</h1>
    <p className="mb-8">
      Thank you for registering. Please check your email to verify your account.
    </p>
    <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded">
      Go to Login
    </a>
  </div>
);

// Not found page
const NotFound = () => (
  <div className="container mx-auto px-4 py-12 text-center">
    <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
    <p className="mb-8">
      Sorry, the page you are looking for does not exist.
    </p>
    <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded">
      Return to Home
    </a>
  </div>
);

// Main app component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-success" element={<RegisterSuccess />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonDetail />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;