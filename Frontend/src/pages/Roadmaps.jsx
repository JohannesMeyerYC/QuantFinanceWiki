import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Helmet } from 'react-helmet-async';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 9;
const SEARCH_DEBOUNCE_DELAY = 300;

// Icon mapping for roadmap types
const RoadmapIcon = ({ type }) => {
  const icons = {
    trading: (
      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    research: (
      <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    development: (
      <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    risk: (
      <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    default: (
      <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )
  };

  const typeLower = type?.toLowerCase() || 'default';
  const iconKey = Object.keys(icons).find(key => typeLower.includes(key)) || 'default';
  
  return (
    <div className="w-12 h-12 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-center">
      {icons[iconKey]}
    </div>
  );
};

// Difficulty badge component
const DifficultyBadge = ({ level }) => {
  const colors = {
    beginner: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    intermediate: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    advanced: 'bg-red-500/20 text-red-300 border-red-500/30',
    expert: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  };
  
  const color = colors[level?.toLowerCase()] || colors.beginner;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${color}`}>
      {level || 'Beginner'}
    </span>
  );
};

// Roadmap card component with memoization
const RoadmapCard = React.memo(({ roadmap, onTrackClick, index }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const handleClick = useCallback(() => {
    // Track analytics event
    if (window.gtag) {
      window.gtag('event', 'select_item', {
        event_category: 'Roadmaps',
        event_label: roadmap.title,
        items: [{ id: roadmap.id, name: roadmap.title }]
      });
    }
    onTrackClick?.(roadmap.id);
  }, [roadmap.id, roadmap.title, onTrackClick]);

  return (
    <article
      role="listitem"
      className="relative animate-in opacity-0"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
    >
      <Link
        to={`/roadmaps/${roadmap.id}`}
        className="group flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-teal-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-15px_rgba(20,184,166,0.3)] relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-500/50"
        aria-label={`View roadmap for ${roadmap.title} - ${roadmap.difficulty || 'Beginner'} level, estimated ${roadmap.estimatedTime || 'Varies'}`}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all duration-500" aria-hidden="true"></div>
        
        {/* Tooltip preview on hover */}
        {showTooltip && (
          <div className="absolute bottom-full left-0 right-0 mb-2 p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <p className="text-sm text-slate-300 line-clamp-3">{roadmap.description}</p>
            <div className="absolute bottom-[-8px] left-6 w-4 h-4 bg-slate-800 border-r border-b border-slate-700 transform rotate-45"></div>
          </div>
        )}

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <RoadmapIcon type={roadmap.type} />
            <DifficultyBadge level={roadmap.difficulty} />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-100 mb-3 group-hover:text-teal-400 transition-colors">
            {roadmap.title}
          </h2>
          
          <p className="text-slate-300 leading-relaxed mb-6 flex-grow line-clamp-3">
            {roadmap.description}
          </p>
          
          {/* Metadata row */}
          <div className="flex flex-wrap gap-2 mb-6">
            {roadmap.type && (
              <span className="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs font-medium rounded border border-slate-700">
                {roadmap.type}
              </span>
            )}
            {roadmap.estimatedTime && (
              <span className="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs font-medium rounded border border-slate-700 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {roadmap.estimatedTime}
              </span>
            )}
            {roadmap.topics && (
              <span className="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs font-medium rounded border border-slate-700">
                {roadmap.topics.length} topics
              </span>
            )}
          </div>

          <div className="flex items-center text-sm font-bold text-teal-500 mt-auto uppercase tracking-wide" aria-hidden="true">
            <span className="group-hover:-translate-x-1 transition-transform duration-300">Read Guide</span>
            <span className="text-lg leading-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ml-2">→</span>
          </div>
        </div>
      </Link>
    </article>
  );
});

RoadmapCard.displayName = 'RoadmapCard';

// Custom hook for debounced search
function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

function Roadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  
  const debouncedSearchQuery = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_DELAY);
  const searchInputRef = useRef(null);

  // Fetch roadmaps with error handling
  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/api/roadmaps`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch roadmaps: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }
        
        setRoadmaps(data);
      } catch (err) {
        console.error('Error fetching roadmaps:', err);
        setError('Unable to load roadmaps. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoadmaps();
  }, []);

  // Extract unique categories from roadmaps
  const categories = useMemo(() => {
    const allCategories = roadmaps
      .map(r => r.category || r.type)
      .filter(Boolean);
    
    return ['all', ...new Set(allCategories)];
  }, [roadmaps]);

  // Memoized filtered roadmaps with debounced search
  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter(roadmap => {
      // Category filter
      if (selectedCategory !== 'all') {
        const roadmapCategory = roadmap.category || roadmap.type;
        if (roadmapCategory !== selectedCategory) return false;
      }
      
      // Search filter
      if (!debouncedSearchQuery.trim()) return true;
      
      const query = debouncedSearchQuery.toLowerCase();
      return (
        roadmap.title?.toLowerCase().includes(query) ||
        roadmap.description?.toLowerCase().includes(query) ||
        roadmap.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    });
  }, [roadmaps, selectedCategory, debouncedSearchQuery]);

  // Memoized visible roadmaps for pagination
  const visibleRoadmaps = useMemo(() => 
    filteredRoadmaps.slice(0, visibleCount), 
    [filteredRoadmaps, visibleCount]
  );

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategory, debouncedSearchQuery]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredRoadmaps.length));
  }, [filteredRoadmaps.length]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  // Analytics tracking
  const handleTrackClick = useCallback((roadmapId) => {
    // This would be integrated with your analytics service
    console.log(`Roadmap ${roadmapId} clicked`);
  }, []);

  // Structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Quantitative Finance Career Roadmaps",
    "description": "Comprehensive guides for quantitative finance careers, including algorithmic trading, risk management, and financial engineering.",
    "url": "https://QuantFinanceWiki.com/roadmaps",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://QuantFinanceWiki.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Roadmaps",
          "item": "https://QuantFinanceWiki.com/roadmaps"
        }
      ]
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": filteredRoadmaps.slice(0, 10).map((roadmap, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://QuantFinanceWiki.com/roadmaps/${roadmap.id}`,
        "name": roadmap.title,
        "description": roadmap.description,
        "timeRequired": roadmap.estimatedTime,
        "difficulty": roadmap.difficulty
      }))
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4" role="status" aria-busy="true">
        <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" aria-hidden="true"></div>
        <p className="text-teal-500 font-mono text-sm animate-pulse">Loading Roadmaps...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/50 border border-red-500/20 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Unable to Load Roadmaps</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30">
      <Helmet>
        <title>Career Roadmaps | QuantFinanceWiki.com</title>
        <meta name="description" content="Explore step-by-step career guides for Quantitative Research, Trading, and Development. Find the right path for your skills." />
        <meta property="og:title" content="QuantFinanceWiki.com Career Roadmaps" />
        <meta property="og:description" content="Choose your path in quantitative finance." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://QuantFinanceWiki.com/roadmaps" />
        <link rel="canonical" href="https://QuantFinanceWiki.com/roadmaps" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <style type="text/css">{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-in {
            animation: fadeInUp 0.4s ease-out forwards;
          }
        `}</style>
      </Helmet>

      <header className="relative border-b border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none" aria-hidden="true">
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10 animate-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider mb-6">
            Career Guides
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
            Choose Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              Path
            </span>
          </h1>
          <p className="text-slate-300 text-xl max-w-2xl leading-relaxed">
            Guides for quantitative finance jobs. Learn about trading, risk management, and more. Find the right path for you.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Search and Filter Section */}
        <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl p-6 mb-12 shadow-2xl">
          <div className="relative mb-6" role="search">
            <label htmlFor="search" className="sr-only">Search roadmaps</label>
            <div className="relative">
              <input
                ref={searchInputRef}
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a career path, skill, or topic..."
                className="block w-full px-6 py-4 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                aria-controls="roadmap-list"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-slate-300 focus:outline-none focus:text-teal-400"
                  aria-label="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-sm text-slate-400 font-medium mr-2 shrink-0">Filter by:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold uppercase border transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500/50",
                  selectedCategory === cat
                    ? "bg-teal-500 border-teal-500 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                )}
                aria-label={`Filter by ${cat}`}
                aria-pressed={selectedCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-slate-400">
            Showing <span className="font-bold text-white">{visibleRoadmaps.length}</span> of{" "}
            <span className="font-bold text-white">{filteredRoadmaps.length}</span> roadmaps
            {debouncedSearchQuery && (
              <span> for "<span className="text-teal-400">{debouncedSearchQuery}</span>"</span>
            )}
          </p>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-sm text-teal-400 hover:text-teal-300 focus:outline-none focus:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Roadmaps Grid */}
        <div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          id="roadmap-list"
        >
          {visibleRoadmaps.length > 0 ? (
            visibleRoadmaps.map((roadmap, index) => (
              <RoadmapCard
                key={roadmap.id}
                roadmap={roadmap}
                index={index}
                onTrackClick={handleTrackClick}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20" role="alert">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-500 mb-2">No roadmaps found</p>
              <p className="text-slate-400 text-sm mb-4">Try adjusting your search or filter criteria</p>
              <button 
                onClick={handleClearSearch} 
                className="text-teal-400 hover:text-teal-300 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/50 px-3 py-1 rounded"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {visibleCount < filteredRoadmaps.length && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={handleLoadMore}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-teal-400 font-bold rounded-xl border border-slate-800 hover:border-teal-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Load ${Math.min(ITEMS_PER_PAGE, filteredRoadmaps.length - visibleCount)} more roadmaps`}
            >
              Load More ({filteredRoadmaps.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default Roadmaps;