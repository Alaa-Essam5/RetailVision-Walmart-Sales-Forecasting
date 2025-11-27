import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Predict from './pages/Predict';
import Dashboard from './pages/Dashboard';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col selection:bg-apple-blue selection:text-white relative">
        <div className="mesh-bg"></div>
        <Navbar />
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/predict" element={<Predict />} />
          </Routes>
        </main>
        <footer className="py-12 bg-white/50 backdrop-blur-md border-t border-gray-200/50">
          <div className="max-w-5xl mx-auto px-6 text-center text-apple-secondary text-sm">
            <p>© 2025 RetailForecast AI. Engineered with XGBoost & Optuna.</p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;