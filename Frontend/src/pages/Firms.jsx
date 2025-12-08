import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Helmet } from 'react-helmet';
const API_URL = import.meta.env.VITE_API_URL;

function cn(...inputs) { return twMerge(clsx(inputs)); }

function Firms() {
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/firms`)
      .then(res => res.json())
      .then(data => { setFirms(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const categories = ['all', ...new Set(firms.map(firm => firm.category).filter(Boolean))];

  const filteredFirms = firms.filter(firm => {
    const categoryMatch = selectedCategory === 'all' || firm.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const searchMatch = query === '' || 
      firm.name?.toLowerCase().includes(query) ||
      firm.description?.toLowerCase().includes(query) ||
      firm.location?.toLowerCase().includes(query) ||
      firm.roles?.some(role => role.toLowerCase().includes(query));
    return categoryMatch && searchMatch;
  });

  const clearFilters = () => { setSelectedCategory('all'); setSearchQuery(''); };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Top Quantitative Finance Firms & Jobs",
    "description": "A curated list of top quantitative finance firms, hedge funds, and their current job openings.",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": filteredFirms.map((firm, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Organization",
          "name": firm.name,
          "description": firm.description,
          "location": {
            "@type": "Place",
            "name": firm.location || "Global"
          }
        }
      }))
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center" role="status" aria-busy="true">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <p className="text-teal-500 font-mono text-xs">Loading Data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      <Helmet>
        <title>Top Quant Firms & Hedge Funds | QuantFinanceWiki.com</title>
        <meta name="description" content="Explore the top quantitative finance firms, hedge funds, and prop trading shops. View requirements, skills needed, and apply to open roles." />
        <meta property="og:title" content="Top Quant Firms & Hedge Funds | QuantFinanceWiki.com" />
        <meta property="og:description" content="Browse our curated list of top quant firms. See what skills they need and find your next role." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://QuantFinanceWiki.com/firms" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Header */}
      <header className="relative bg-slate-900/50 border-b border-slate-800 pt-24 pb-12 md:pt-20 md:pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none" aria-hidden="true">
           <div className="absolute top-[-50px] right-0 w-48 h-48 md:w-64 md:h-64 bg-teal-500/10 rounded-full blur-[60px] md:blur-[80px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6 tracking-tight">
            Top Companies
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
            See the best companies in the industry. Look at what skills they want. Find open jobs.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 md:-mt-8 relative z-20">
        
        {/* Search & Filter Container */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-4 md:p-6 mb-8 md:mb-12 shadow-2xl flex flex-col gap-4 md:gap-6" role="search">
          <div className="w-full">
            <label htmlFor="search" className="sr-only">Search firms</label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for companies or jobs..."
              aria-label="Search for companies or jobs"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-base md:text-sm focus:border-teal-500 focus:outline-none transition-colors placeholder-slate-600"
            />
          </div>

          <div 
            className={cn(
              "flex items-center gap-2 overflow-x-auto w-full",
              "pb-2 -mx-1 px-1",
              "snap-x",
              "[&::-webkit-scrollbar]:h-1.5",
              "[&::-webkit-scrollbar-track]:bg-transparent",
              "[&::-webkit-scrollbar-thumb]:bg-slate-800",
              "[&::-webkit-scrollbar-thumb]:rounded-full",
              "[&::-webkit-scrollbar-thumb]:hover:bg-teal-500/50"
            )}
            role="tablist"
            aria-label="Filter companies by category"
          >
            <span className="text-slate-500 text-xs font-bold uppercase mr-2 flex-shrink-0" id="filter-label">Filter:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                role="tab"
                aria-selected={selectedCategory === cat}
                aria-controls="firm-feed"
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border snap-center",
                  "active:scale-95",
                  selectedCategory === cat
                    ? "bg-teal-500/10 border-teal-500 text-teal-400 shadow-[0_0_10px_-3px_rgba(20,184,166,0.3)]"
                    : "bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {(searchQuery || selectedCategory !== 'all') && (
          <div className="flex items-center justify-between mb-6 md:mb-8 text-sm" role="status" aria-live="polite">
            <span className="text-slate-500">Found {filteredFirms.length} companies</span>
            <button onClick={clearFilters} className="text-rose-400 hover:text-rose-300 font-medium hover:underline p-2 -mr-2" aria-label="Clear all filters">
              Clear Filters
            </button>
          </div>
        )}

        <div id="firm-feed" className="space-y-4 md:space-y-6 pb-24" role="feed" aria-busy={loading}>
          <AnimatePresence>
            {filteredFirms.map(firm => (
              <motion.article
                key={firm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                layout
                role="article"
                className="group bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden hover:border-teal-500/30 transition-all hover:shadow-lg hover:shadow-black/20 active:scale-[0.99]"
              >
                <div className="p-5 md:p-8">
                  <header className="flex flex-col md:flex-row justify-between items-start gap-3 md:gap-4 mb-4 md:mb-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{firm.name}</h2>
                        {firm.category && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {firm.category}
                          </span>
                        )}
                      </div>
                      {firm.location && (
                        <div className="text-slate-500 text-sm font-medium flex items-center gap-1">
                           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                           {firm.location}
                        </div>
                      )}
                    </div>
                  </header>

                  <p className="text-slate-400 mb-6 md:mb-8 max-w-4xl leading-relaxed text-sm md:text-base">
                    {firm.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 md:gap-8 py-6 md:py-8 border-t border-slate-800/50">
                    <div>
                      <h3 className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-3 md:mb-4">What You Need</h3>
                      <ul className="space-y-2 md:space-y-3">
                        {firm.requirements?.map((req, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-300">
                            <span className="text-teal-500 mr-3 mt-0.5 text-xs" aria-hidden="true">▪</span>
                            <span className="leading-snug">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-3 md:mb-4">What They Want</h3>
                      <div className="flex flex-wrap gap-2">
                        {firm.qualities?.map((q, i) => (
                          <span key={i} className="px-2.5 py-1 md:px-3 md:py-1.5 rounded bg-slate-950 border border-slate-800 text-[11px] md:text-xs font-medium text-slate-300">
                            {q}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {firm.roles && firm.roles.length > 0 && (
                    <div className="bg-slate-950/30 -mx-5 -mb-5 p-5 md:-mx-8 md:-mb-8 md:p-8 border-t border-slate-800 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mt-2">
                      <div className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-wider">
                        Open Jobs:
                      </div>
                      <div className="flex flex-wrap gap-3 w-full">
                        {firm.roles.map((role, i) => {
                          const isLink = role.startsWith('http') || role.startsWith('www');
                          return isLink ? (
                            <a
                              key={i}
                              href={role.startsWith('http') ? role : `https://${role}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full md:w-auto text-center px-5 py-3 md:py-2.5 bg-teal-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-teal-400 transition-colors flex items-center justify-center shadow-lg shadow-teal-900/20 active:scale-95"
                            >
                              View Openings <span className="ml-2" aria-hidden="true">→</span>
                            </a>
                          ) : (
                            <span key={i} className="px-3 py-1.5 md:px-4 md:py-2 bg-slate-800 rounded-lg text-xs md:text-sm text-slate-300 border border-slate-700 whitespace-nowrap">
                              {role}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
          
          {filteredFirms.length === 0 && (
            <div className="text-center py-12 md:py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-800" role="alert">
              <p className="text-slate-500">No companies found.</p>
              <button onClick={clearFilters} className="mt-4 text-teal-400 hover:underline">
                 Reset Search
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Firms;