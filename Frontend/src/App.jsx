import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import logoImg from './assets/Logo.png';
import './index.css';

// Page Imports
import Home from './pages/Home';
import Roadmaps from './pages/Roadmaps';
import RoadmapDetail from './pages/RoadmapDetail';
import Firms from './pages/Firms';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
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

const SkipLink = () => (
  <a 
    href="#main-content" 
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] px-6 py-3 bg-teal-500 text-slate-900 font-bold rounded-lg shadow-xl outline-none ring-2 ring-white transition-transform"
  >
    Skip to main content
  </a>
);

function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

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
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 supports-[backdrop-filter]:bg-slate-950/60" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 transition-all">
          
          <Link 
            to="/" 
            className="text-lg md:text-xl font-extrabold text-white tracking-tight flex items-center gap-2 z-50" 
            aria-label="QuantFinanceWiki Home"
            onClick={() => setIsOpen(false)}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" aria-hidden="true"></span>
            QuantFinanceWiki<span className="hidden xs:inline text-slate-500">.com</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200",
                    active 
                      ? "text-teal-400 bg-teal-500/10" 
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  )}
                >
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center z-50">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white focus:outline-none p-3 -mr-3"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <div className="w-6 h-5 relative flex flex-col justify-between" aria-hidden="true">
                <span className={cn("w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-left", isOpen && "rotate-45 translate-x-px")} />
                <span className={cn("w-full h-0.5 bg-current rounded-full transition-all duration-300", isOpen && "opacity-0")} />
                <span className={cn("w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-left", isOpen && "-rotate-45 translate-x-px")} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden fixed inset-0 top-16 bg-slate-950 z-40 overflow-y-auto"
          >
            <div className="px-4 py-6 space-y-2 pb-24">
              {navLinks.map((link, i) => {
                const active = isActive(link.path);
                return (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        "block px-6 py-4 rounded-xl text-lg font-bold transition-all border active:scale-[0.98]",
                        active
                          ? "bg-teal-500/10 border-teal-500/20 text-teal-400"
                          : "bg-slate-900/50 border-transparent text-slate-400 hover:bg-slate-900 hover:text-white"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        {link.label}
                        {active && <span className="text-teal-500 text-sm">●</span>}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Mobile Menu Footer/Decoration */}
            <div className="absolute bottom-20 left-0 w-full pointer-events-none opacity-20">
                 <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px]"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function App() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "QuantFinanceWiki",
    "url": "https://QuantFinanceWiki.com",
    "logo": "logoImg",
    "description": "The ultimate resource for quantitative finance careers, roadmaps, and educational material."
  };

  return (
    <HelmetProvider>
      <Router>
        <Helmet titleTemplate="%s | QuantFinanceWiki" defaultTitle="QuantFinanceWiki - Quantitative Finance Careers & Roadmaps">
          <meta name="description" content="Your comprehensive guide to quantitative finance. Career roadmaps, firm lists, interview questions, and educational resources for aspiring quants." />
          <meta name="theme-color" content="#020617" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
          <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        </Helmet>
        
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30 selection:text-emerald-200 flex flex-col">
          <SkipLink />
          <ScrollToTop />
          <Navigation />
          
          <div id="main-content" className="flex-grow w-full max-w-[100vw] overflow-x-hidden">
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
          
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;