import React, { useState, useEffect, Suspense, lazy, useDeferredValue } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Helmet } from 'react-helmet-async';

// Eager load Home (it's the most visited page)
import Home from './pages/Home';

// Lazy load everything else with prefetching
const Roadmaps = lazy(() => import(/* webpackPrefetch: true */ './pages/Roadmaps'));
const RoadmapDetail = lazy(() => import('./pages/RoadmapDetail'));
const Firms = lazy(() => import('./pages/Firms'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Resources = lazy(() => import('./pages/Resources'));
const About = lazy(() => import('./pages/About'));
const InterviewQuestions = lazy(() => import(/* webpackPrefetch: true */ './pages/InterviewQuestions'));
const InterviewQuestionDetail = lazy(() => import('./pages/InterviewQuestionDetail'));
const ResourceDetail = lazy(() => import('./pages/ResourceDetail'));
const EarlyCareer = lazy(() => import('./pages/EarlyCareerDetail'));
const FirmDetail = lazy(() => import('./pages/FirmDetail'));

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/roadmaps', label: 'Career Roadmaps' },
  { path: '/blog', label: 'Insights Blog' },
  { path: '/resources', label: 'Resource Library' },
  { path: '/firms', label: 'Top Firms' },
  { path: '/faq', label: 'FAQ' },
  { path: '/about', label: 'About' },
  { path: '/interview-questions', label: 'Interview Questions' }
];

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const SkipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] px-6 py-3 bg-teal-500 text-slate-900 font-bold rounded-lg shadow-xl outline-none ring-2 ring-white transition-transform"
  >
    Skip to main content
  </a>
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const deferredIsOpen = useDeferredValue(isOpen);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-slate-950 fixed w-full z-50 top-0 start-0 border-b border-slate-800">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"></span>
          <span className="self-center text-xl font-extrabold text-white whitespace-nowrap">
            QuantFinanceWiki<span className="hidden xs:inline text-slate-500">.com</span>
          </span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-slate-400 rounded-lg md:hidden hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-700"
          aria-controls="navbar-default"
          aria-expanded={deferredIsOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
          </svg>
        </button>

        <div className={cn("w-full md:block md:w-auto", deferredIsOpen ? "block" : "hidden")} id="navbar-default">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-slate-800 rounded-lg bg-slate-900 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-transparent">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "block py-2 px-3 rounded md:p-0 transition-colors",
                      active
                        ? "text-white bg-teal-500 md:bg-transparent md:text-teal-400"
                        : "text-slate-300 hover:bg-slate-800 md:hover:bg-transparent md:hover:text-teal-400"
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Helmet>
        <title>QuantFinanceWiki - Quantitative Finance Careers & Roadmaps</title>
        <meta name="description" content="Your comprehensive guide to quantitative finance. Career roadmaps, firm lists, interview questions, and educational resources for aspiring quants." />
        <link rel="preload" href="/fonts/inter-v20-latin-600.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
      </Helmet>

      <SkipLink />
      <ScrollToTop />
      <Navigation />

      <main id="main-content" className="flex-grow w-full max-w-[100vw] overflow-x-hidden pt-16">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/roadmaps" element={<Roadmaps />} />
            <Route path="/roadmaps/:id" element={<RoadmapDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/firms" element={<Firms />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/about" element={<About />} />
            <Route path="/interview-questions" element={<InterviewQuestions />} />
            <Route path="/interview-questions/:slug" element={<InterviewQuestionDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/resources/:slug" element={<ResourceDetail />} />
            <Route path="/early-career" element={<EarlyCareer />} />
            <Route path="/firms/:slug" element={<FirmDetail />} />
          </Routes>
        </Suspense>
      </main>
    </Router>
  );
}

export default App;