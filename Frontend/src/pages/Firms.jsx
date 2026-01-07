import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';


const API_URL = import.meta.env.VITE_API_URL;
const SITE_URL = "https://QuantFinanceWiki.com";

function cn(...inputs) { return twMerge(clsx(inputs)); }

// Custom debounce hook
export const useDebounce = (callback, delay) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedFn = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFn;
};

// Text highlighting component
const HighlightedText = ({ text, highlight }) => {
  if (!highlight.trim() || !text) return text;

  try {
    const escapedHighlight = highlight.trim()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <mark key={i} className="bg-yellow-500/20 text-yellow-300 rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  } catch (error) {
    console.error('Error in text highlighting:', error);
    return text;
  }
};

// Opportunity Card Component
const OpportunityCard = React.memo(({ item, searchTerm = '', type = 'firm' }) => {
  if (!item) return null;

  const highlightSearch = (text) => {
    if (!searchTerm || !text) return text;
    return <HighlightedText text={String(text)} highlight={searchTerm} />;
  };

  const getUniqueKey = item.id ?? `${item.name}-${item.location ?? 'global'}`;
  const detailUrl = `/${type === 'firm' ? 'firms' : 'early-career'}/${item.slug || item.id}`;

  return (
    <article
      className="group bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden hover:border-teal-500/30 transition-all hover:shadow-lg hover:shadow-black/20 animate-in cursor-pointer"
      itemScope
      itemType="https://schema.org/JobPosting"
      aria-labelledby={`opportunity-${getUniqueKey}`}
      onClick={() => window.location.href = detailUrl}
    >
      <div className="p-5 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="w-full">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2
                id={`opportunity-${getUniqueKey}`}
                className="text-xl md:text-2xl font-bold text-white tracking-tight hover:text-teal-400 transition-colors"
                itemProp="title"
              >
                <Link
                  to={detailUrl}
                  className="hover:no-underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {highlightSearch(item.name)}
                </Link>
              </h2>
              {item.category && (
                <span
                  className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                  aria-label={`Category: ${item.category}`}
                >
                  {item.category}
                </span>
              )}
            </div>
            {item.location && (
              <div className="text-slate-500 text-sm font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span itemProp="jobLocation" itemScope itemType="https://schema.org/Place">
                  <span itemProp="address">{highlightSearch(item.location)}</span>
                </span>
              </div>
            )}
          </div>

          {/* View Details Button */}
          <div className="md:ml-4">
            <Link
              to={detailUrl}
              className="inline-flex items-center text-sm text-teal-400 hover:text-teal-300 font-medium px-3 py-1 border border-teal-500/30 rounded-lg hover:bg-teal-500/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
              onClick={(e) => e.stopPropagation()}
            >
              View Details
              <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </header>

        <p
          className="text-slate-300 mb-6 md:mb-8 max-w-4xl leading-relaxed text-sm md:text-base"
          itemProp="description"
        >
          {highlightSearch(item.description)}
        </p>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 py-6 md:py-8 border-t border-slate-800/50">
          <div>
            <h3 className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-3 md:mb-4">
              Requirements
            </h3>
            <ul className="space-y-2 md:space-y-3" aria-label="Requirements">
              {item.requirements?.map((req, i) => (
                <li key={i} className="flex items-start text-sm text-slate-300">
                  <span className="text-teal-500 mr-3 mt-0.5 text-xs" aria-hidden="true">▪</span>
                  <span className="leading-snug">{highlightSearch(req)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-3 md:mb-4">
              Qualities
            </h3>
            <div className="flex flex-wrap gap-2" aria-label="Desired qualities">
              {item.qualities?.map((q, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 md:px-3 md:py-1.5 rounded bg-slate-950 border border-slate-800 text-[11px] md:text-xs font-medium text-slate-300"
                >
                  {highlightSearch(q)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {item.roles && item.roles.length > 0 && (
          <div className="bg-slate-950/30 -mx-5 -mb-5 p-5 md:-mx-8 md:-mb-8 md:p-8 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mt-2">
            <div className="text-slate-300 text-xs md:text-sm font-bold uppercase tracking-wider">
              Links:
            </div>
            <div className="flex flex-wrap gap-3 w-full">
              {item.roles.map((role, i) => {
                const isLink = role.startsWith('http') || role.startsWith('www');
                return isLink ? (
                  <a
                    key={`role-${i}`}
                    href={role.startsWith('http') ? role : `https://${role}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto text-center px-5 py-3 md:py-2.5 bg-teal-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-teal-400 transition-colors flex items-center justify-center shadow-lg shadow-teal-900/20 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label={`Apply or view details for ${item.name}`}
                    itemProp="url"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Apply / View <span className="ml-2" aria-hidden="true">→</span>
                  </a>
                ) : (
                  <span
                    key={`role-${i}`}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-slate-800 rounded-lg text-xs md:text-sm text-slate-300 border border-slate-700 whitespace-nowrap"
                  >
                    {highlightSearch(role)}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </article>
  );
});

OpportunityCard.displayName = 'OpportunityCard';

function Firms() {
  const [firms, setFirms] = useState([]);
  const [earlyCareer, setEarlyCareer] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const [visibleFirmsCount, setVisibleFirmsCount] = useState(5);
  const [visibleEarlyCareerCount, setVisibleEarlyCareerCount] = useState(5);

  const debouncedSetSearchQuery = useDebounce((value) => {
    setDebouncedSearchQuery(value);
    setVisibleFirmsCount(5);
    setVisibleEarlyCareerCount(5);
  }, 300);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetSearchQuery(value);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [firmsRes, careerRes] = await Promise.all([
          fetch(`${API_URL}/api/firms`),
          fetch(`${API_URL}/api/early-career`)
        ]);

        if (!firmsRes.ok) throw new Error(`Firms API failed: ${firmsRes.status}`);
        if (!careerRes.ok) throw new Error(`Early Career API failed: ${careerRes.status}`);

        const [firmsData, careerData] = await Promise.all([
          firmsRes.json(),
          careerRes.json()
        ]);

        setFirms(Array.isArray(firmsData) ? firmsData : []);
        setEarlyCareer(Array.isArray(careerData) ? careerData : []);

      } catch (err) {
        console.error("Error loading data:", err);
        setFirms([]);
        setEarlyCareer([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const allCategories = useMemo(() => {
    const categories = { all: firms.length + earlyCareer.length };
    const addCategory = (category) => {
      if (category) {
        categories[category] = (categories[category] || 0) + 1;
      }
    };
    firms.forEach(f => addCategory(f.category));
    earlyCareer.forEach(c => addCategory(c.category));

    return Object.keys(categories).map(cat => ({
      name: cat,
      count: categories[cat]
    }));
  }, [firms, earlyCareer]);

  const filterItems = useCallback((items) => {
    return items.filter(item => {
      const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
      if (!categoryMatch) return false;

      if (!debouncedSearchQuery.trim()) return true;

      const query = debouncedSearchQuery.toLowerCase().trim();
      const searchTerms = query.split(" ").filter(term => term.length > 2);
      if (searchTerms.length === 0) return true;

      const searchableText = `
        ${item.name || ''} 
        ${item.description || ''} 
        ${item.location || ''}
        ${item.requirements?.join(' ') || ''}
        ${item.qualities?.join(' ') || ''}
        ${item.roles?.join(' ') || ''}
      `.toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });
  }, [selectedCategory, debouncedSearchQuery]);

  const filteredFirms = useMemo(() => filterItems(firms), [firms, filterItems]);
  const filteredEarlyCareer = useMemo(() => filterItems(earlyCareer), [earlyCareer, filterItems]);

  const clearFilters = useCallback(() => {
    setSelectedCategory('all');
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setVisibleFirmsCount(5);
    setVisibleEarlyCareerCount(5);
  }, []);

  const loadMoreFirms = useCallback(() => setVisibleFirmsCount(prev => prev + 5), []);
  const loadMoreEarlyCareer = useCallback(() => setVisibleEarlyCareerCount(prev => prev + 5), []);

  const totalResults = filteredFirms.length + filteredEarlyCareer.length;
  const hasActiveFilters = selectedCategory !== 'all' || debouncedSearchQuery.trim();

  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Quantitative Finance Firms & Career Opportunities",
    "description": "A curated directory of top quantitative finance firms, hedge funds, proprietary trading firms, and early career opportunities for students and professionals.",
    "url": `${SITE_URL}/firms`,
    "inLanguage": "en-US",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": [
        ...filteredFirms.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Organization",
            "@id": `${SITE_URL}/firms#${item.id || item.name}`,
            "name": item.name,
            "description": item.description,
            "location": { "@type": "Place", "name": item.location || "Global" },
            "jobPosting": item.roles?.map(role => ({
              "@type": "JobPosting",
              "title": item.name,
              "description": item.description,
              "jobLocation": { "@type": "Place", "name": item.location || "Global" },
              "qualifications": item.requirements?.join(' ') || '',
              "skills": item.qualities?.join(', ') || ''
            }))
          }
        })),
        ...filteredEarlyCareer.map((item, index) => ({
          "@type": "ListItem",
          "position": filteredFirms.length + index + 1,
          "item": {
            "@type": "EducationalOccupationalProgram",
            "name": item.name,
            "description": item.description,
            "occupationalCategory": item.category || "Early Career",
            "programPrerequisites": item.requirements?.join(' ') || '',
            "offers": item.roles?.map(role => ({
              "@type": "Offer",
              "url": role.startsWith('http') ? role : `https://${role}`
            }))
          }
        }))
      ]
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
        { "@type": "ListItem", "position": 2, "name": "Career Directory", "item": `${SITE_URL}/firms` }
      ]
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/firms?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }), [filteredFirms, filteredEarlyCareer]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center" role="status" aria-busy="true" aria-label="Loading career opportunities">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-teal-500 font-mono text-xs">Loading Data...</p>
        <span className="sr-only">Loading career opportunities, please wait.</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      <Helmet>
        <title>Quantitative Finance Firms & Career Opportunities | QuantFinanceWiki</title>
        <meta name="description" content="Explore a curated directory of top quantitative finance firms, hedge funds, proprietary trading firms, and early career opportunities for students and professionals." />
        <meta name="keywords" content="quantitative finance firms, hedge fund careers, prop trading jobs, quant internship, finance career opportunities, student programs, quant trading firms" />
        <link rel="canonical" href={`${SITE_URL}/firms`} />
        <meta property="og:title" content="Quantitative Finance Firms & Career Opportunities" />
        <meta property="og:description" content="Explore top quantitative finance firms and early career student opportunities in quantitative trading, hedge funds, and financial engineering." />
        <meta property="og:url" content={`${SITE_URL}/firms`} />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <style type="text/css">{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-in {
            animation: fadeInUp 0.3s ease-out forwards;
          }
        `}</style>
      </Helmet>

      <header className="relative bg-slate-900/50 border-b border-slate-800 pt-24 pb-12 md:pt-20 md:pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none" aria-hidden="true">
          <div className="absolute top-[-50px] right-0 w-48 h-48 md:w-64 md:h-64 bg-teal-500/10 rounded-full blur-[60px] md:blur-[80px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6 tracking-tight">
            Career Directory
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl leading-relaxed">
            Browse top industry firms and exclusive opportunities for students.
          </p>
          <div className="mt-4 text-sm text-slate-500" aria-live="polite">
            {firms.length + earlyCareer.length} opportunities listed
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 md:-mt-8 relative z-20 pb-24">

        {/* Search and Filters */}
        <section
          className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-4 md:p-6 mb-8 md:mb-12 shadow-2xl flex flex-col gap-4 md:gap-6"
          aria-label="Search and filter opportunities"
        >
          <div className="relative">
            <label htmlFor="opportunity-search" className="sr-only">Search firms, programs, or skills</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="opportunity-search"
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search firms, programs, or skills..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-10 text-base md:text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors placeholder-slate-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded"
                aria-label="Clear search"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 -mx-1 px-1 snap-x scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full" role="tablist">
              <span className="text-slate-500 text-xs font-bold uppercase mr-2 flex-shrink-0">Filter:</span>
              {allCategories.map(cat => (
                <button
                  key={`category-${cat.name}`}
                  onClick={() => setSelectedCategory(cat.name)}
                  role="tab"
                  aria-selected={selectedCategory === cat.name}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap border snap-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20",
                    selectedCategory === cat.name
                      ? "bg-teal-500 border-teal-500 text-teal-50"
                      : "bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  {cat.name === 'all' ? 'All' : cat.name}
                  <span className="ml-2 text-xs opacity-75">({cat.count})</span>
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20 whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="text-sm text-slate-500 flex justify-between items-center" aria-live="polite">
            <span>
              {hasActiveFilters ? (
                <>Found <span className="text-white font-bold">{totalResults}</span> result{totalResults !== 1 ? 's' : ''}</>
              ) : (
                <>Showing <span className="text-white font-bold">{totalResults}</span> opportunit{totalResults !== 1 ? 'ies' : 'y'}</>
              )}
              {debouncedSearchQuery && <span className="ml-2 text-teal-400">for "{debouncedSearchQuery}"</span>}
            </span>
          </div>
        </section>

        {/* Established Firms Section */}
        {filteredFirms.length > 0 && (
          <section className="mb-16" id="firms-list" aria-labelledby="established-firms-heading">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <h2 id="established-firms-heading" className="text-2xl font-bold text-white">Established Firms</h2>
              <div className="h-px flex-grow bg-slate-800"></div>
              <span className="text-sm text-slate-500 font-mono">{filteredFirms.length} firm{filteredFirms.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="space-y-4 md:space-y-6" role="list" aria-label="List of established firms">
              {filteredFirms.slice(0, visibleFirmsCount).map(firm => (
                <OpportunityCard
                  key={`firm-${firm.id || firm.name}`}
                  item={firm}
                  searchTerm={debouncedSearchQuery}
                  type="firm"
                />
              ))}
            </div>

            {visibleFirmsCount < filteredFirms.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMoreFirms}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold rounded-lg transition-colors border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  Load More Firms ({filteredFirms.length - visibleFirmsCount} remaining)
                </button>
              </div>
            )}
          </section>
        )}

        {/* Student Opportunities Section */}
        {filteredEarlyCareer.length > 0 && (
          <section id="early-career-list" aria-labelledby="student-opportunities-heading">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <h2 id="student-opportunities-heading" className="text-2xl font-bold text-white">Student Opportunities</h2>
              <div className="h-px flex-grow bg-slate-800"></div>
              <span className="text-sm text-slate-500 font-mono">{filteredEarlyCareer.length} opportunit{filteredEarlyCareer.length !== 1 ? 'ies' : 'y'}</span>
            </div>

            <div className="space-y-4 md:space-y-6" role="list" aria-label="List of student opportunities">
              {filteredEarlyCareer.slice(0, visibleEarlyCareerCount).map(opp => (
                <OpportunityCard
                  key={`career-${opp.id || opp.name}`}
                  item={opp}
                  searchTerm={debouncedSearchQuery}
                  type="early-career"
                />
              ))}
            </div>

            {visibleEarlyCareerCount < filteredEarlyCareer.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMoreEarlyCareer}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold rounded-lg transition-colors border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  Load More Opportunities ({filteredEarlyCareer.length - visibleEarlyCareerCount} remaining)
                </button>
              </div>
            )}
          </section>
        )}

        {totalResults === 0 && (
          <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-800" role="alert" aria-live="polite">
            <div className="mb-6" aria-hidden="true">
              <svg className="w-16 h-16 mx-auto text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-300 mb-3">No opportunities found</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              {hasActiveFilters ? "We couldn't find any opportunities matching your search criteria." : "Currently no opportunities are listed. Check back soon for updates."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                View All Opportunities
              </button>
            )}
          </div>
        )}

        {(filteredFirms.length > 0 || filteredEarlyCareer.length > 0) && (
          <div className="mt-12 pt-8 border-t border-slate-800 text-sm text-slate-500">
            <p>
              Showing {Math.min(visibleFirmsCount, filteredFirms.length) + Math.min(visibleEarlyCareerCount, filteredEarlyCareer.length)} of {totalResults} opportunities
              {debouncedSearchQuery && ` matching "${debouncedSearchQuery}"`}
            </p>
            <p className="mt-2">All opportunities are curated and verified. Apply directly through the official links provided.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Firms;