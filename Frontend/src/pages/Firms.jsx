import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

function Firms() {
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/firms')
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

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-teal-500 font-mono text-xs">Loading Data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30">
      
      {/* Header */}
      <header className="relative bg-slate-900/50 border-b border-slate-800 pt-20 pb-16 overflow-hidden">
         {/* Background Decor */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
           <div className="absolute top-[-50px] right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Top Companies
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            See the best companies in the industry. Look at what skills they want. Find open jobs.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        
        {/* Search & Filter Container (Matched to FAQ style) */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 mb-12 shadow-2xl flex flex-col gap-6">
          
          {/* Search */}
          <div className="w-full">
            <label htmlFor="search" className="sr-only">Search firms</label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for companies or jobs..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-sm focus:border-teal-500 focus:outline-none transition-colors placeholder-slate-600"
            />
          </div>

          {/* Category Tabs (Exact Scrollbar from FAQ) */}
          <div className={cn(
            "flex items-center gap-2 overflow-x-auto w-full",
            "pb-2", 
            "[&::-webkit-scrollbar]:h-1.5",
            "[&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:bg-slate-800",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "[&::-webkit-scrollbar-thumb]:hover:bg-teal-500/50"
          )}>
            <span className="text-slate-500 text-xs font-bold uppercase mr-2 flex-shrink-0">Filter:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
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

        {/* Results Info */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="flex items-center justify-between mb-8 text-sm">
            <span className="text-slate-500">Found {filteredFirms.length} companies</span>
            <button onClick={clearFilters} className="text-rose-400 hover:text-rose-300 font-medium hover:underline">
              Clear Filters
            </button>
          </div>
        )}

        {/* Firm List */}
        <div className="space-y-6 pb-24">
          <AnimatePresence>
            {filteredFirms.map(firm => (
              <motion.article
                key={firm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                layout
                className="group bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden hover:border-teal-500/30 transition-all hover:shadow-lg hover:shadow-black/20"
              >
                <div className="p-6 md:p-8">
                  {/* Top Row: Name & Metadata */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-white tracking-tight">{firm.name}</h2>
                        {firm.category && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {firm.category}
                          </span>
                        )}
                      </div>
                      {firm.location && (
                        <div className="text-slate-500 text-sm font-medium">
                           {firm.location}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-400 mb-8 max-w-4xl leading-relaxed text-base">
                    {firm.description}
                  </p>

                  {/* Data Grid */}
                  <div className="grid md:grid-cols-2 gap-8 py-8 border-t border-slate-800/50">
                    <div>
                      <h3 className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-4">What You Need</h3>
                      <ul className="space-y-3">
                        {firm.requirements?.map((req, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-300">
                            <span className="text-teal-500 mr-3 mt-0.5">▪</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-4">What They Want</h3>
                      <div className="flex flex-wrap gap-2">
                        {firm.qualities?.map((q, i) => (
                          <span key={i} className="px-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300">
                            {q}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Job Board Section */}
                  {firm.roles && firm.roles.length > 0 && (
                    <div className="bg-slate-950/30 -mx-6 -mb-6 md:-mx-8 md:-mb-8 p-6 md:p-8 border-t border-slate-800 flex flex-col md:flex-row items-center gap-6">
                      <div className="text-slate-400 text-sm font-bold uppercase tracking-wider">
                        Open Jobs:
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {firm.roles.map((role, i) => {
                          const isLink = role.startsWith('http') || role.startsWith('www');
                          return isLink ? (
                            <a
                              key={i}
                              href={role.startsWith('http') ? role : `https://${role}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-5 py-2.5 bg-teal-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-teal-400 transition-colors flex items-center shadow-lg shadow-teal-900/20"
                            >
                              View Openings <span className="ml-2">→</span>
                            </a>
                          ) : (
                            <span key={i} className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-300 border border-slate-700">
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
            <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
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