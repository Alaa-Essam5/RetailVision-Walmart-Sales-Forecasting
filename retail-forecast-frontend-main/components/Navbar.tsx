import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, ArrowRight } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel transition-all duration-300">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-2 bg-gradient-to-br from-gray-900 to-black rounded-xl text-white shadow-lg transition-transform group-hover:scale-105 duration-300">
            <BarChart3 size={18} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-apple-text tracking-tight text-lg">
            RetailForecast AI
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 
              ${isHome
                ? 'bg-black/5 text-black'
                : 'text-apple-secondary hover:text-black hover:bg-black/5'
              }`}
          >
            Analysis
          </Link>
          <Link
            to="/dashboard"
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 
              ${location.pathname === '/dashboard'
                ? 'bg-black/5 text-black'
                : 'text-apple-secondary hover:text-black hover:bg-black/5'
              }`}
          >
            Dashboard
          </Link>
          <Link
            to="/predict"
            className={`pl-4 pr-3 py-2 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-2 group
              ${!isHome
                ? 'bg-apple-blue text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600'
                : 'bg-white/80 text-apple-text border border-gray-200/50 hover:bg-white'
              }`}
          >
            Live Model
            <div className={`p-1 rounded-full ${!isHome ? 'bg-white/20' : 'bg-gray-100'} group-hover:translate-x-0.5 transition-transform`}>
              <ArrowRight size={12} />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;