import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student': return '👨‍🎓';
      case 'teacher': return '👩‍🏫';
      case 'admin': return '👨‍💼';
      default: return '👤';
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900">Classroom Portal</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {user && (
              <>
                <Link 
                  to={`/${user.role}/dashboard`}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActiveLink(`/${user.role}/dashboard`) 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                
                {user.role === 'teacher' && (
                  <>
                    <Link 
                      to="/teacher/classes"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActiveLink('/teacher/classes') 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                      }`}
                    >
                      Classes
                    </Link>
                    <Link 
                      to="/teacher/submissions"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActiveLink('/teacher/submissions') 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                      }`}
                    >
                      Submissions
                    </Link>
                  </>
                )}
                
                {user.role === 'student' && (
                  <Link 
                    to="/student/classes"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActiveLink('/student/classes') 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    My Classes
                  </Link>
                )}

                {user.role === 'admin' && (
                  <>
                    <Link 
                      to="/admin/users"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActiveLink('/admin/users') 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                      }`}
                    >
                      Users
                    </Link>
                    <Link 
                      to="/admin/analytics"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActiveLink('/admin/analytics') 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                      }`}
                    >
                      Analytics
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Profile */}
                <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                    <span className="text-sm">{getRoleIcon(user.role)}</span>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:block">Logout</span>
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && user && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-1">
              <Link 
                to={`/${user.role}/dashboard`}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              
              {user.role === 'teacher' && (
                <>
                  <Link 
                    to="/teacher/classes"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Classes
                  </Link>
                  <Link 
                    to="/teacher/submissions"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Submissions
                  </Link>
                </>
              )}
              
              {user.role === 'student' && (
                <Link 
                  to="/student/classes"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Classes
                </Link>
              )}

              {user.role === 'admin' && (
                <>
                  <Link 
                    to="/admin/users"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Users
                  </Link>
                  <Link 
                    to="/admin/analytics"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Analytics
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
