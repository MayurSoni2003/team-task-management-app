import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/projects" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl text-blue-600">TaskManager</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-700 font-medium">Hello, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded hover:bg-slate-200 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
