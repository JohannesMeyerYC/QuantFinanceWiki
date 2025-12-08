import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Page Imports
import Home from './pages/Home';
import Roadmaps from './pages/Roadmaps';
import RoadmapDetail from './pages/RoadmapDetail';
import Firms from './pages/Firms';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';         // NEW
import BlogPost from './pages/BlogPost'; // NEW
import Resources from './pages/Resources';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/roadmaps', label: 'Career Guides' },
    { path: '/blog', label: 'Blog' },
    { path: '/resources', label: 'Library' },
    { path: '/firms', label: 'Companies' },
    { path: '/faq', label: 'Questions' }
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <Link to="/" className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            QuantFinanceWiki.com
          </Link>

          <div className="hidden md:flex space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200",
                  isActive(link.path) 
                    ? "text-teal-400 bg-teal-500/10" 
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                )}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span className={cn("w-full h-0.5 bg-current rounded-full transition-all duration-300", isOpen && "rotate-45 translate-y-2")} />
                <span className={cn("w-full h-0.5 bg-current rounded-full transition-all duration-300", isOpen && "opacity-0")} />
                <span className={cn("w-full h-0.5 bg-current rounded-full transition-all duration-300", isOpen && "-rotate-45 -translate-y-2.5")} />
              </div>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-slate-950 border-b border-slate-800"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-base font-medium transition-colors border",
                    isActive(link.path)
                      ? "bg-teal-500/10 border-teal-500/20 text-teal-400"
                      : "bg-transparent border-transparent text-slate-400 hover:bg-slate-900 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30 selection:text-emerald-200">
        <ScrollToTop />
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/roadmaps" element={<Roadmaps />} />
          <Route path="/roadmaps/:id" element={<RoadmapDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/firms" element={<Firms />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/resources" element={<Resources />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;