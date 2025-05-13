import { useAuth } from '../services/AuthContext';
import { Link } from 'react-router-dom';

export const Header = () => {
  const { authState, logout } = useAuth();
  const { user } = authState;

  return (
    <header className="bg-primary text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          OBELISK Learning
        </Link>
        
        <nav className="flex gap-4">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/courses" className="hover:underline">
            Courses
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <button 
                onClick={() => logout()} 
                className="hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
              <Link to="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};