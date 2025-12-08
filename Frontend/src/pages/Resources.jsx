import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) { return twMerge(clsx(inputs)); }

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetch('/api/resources')
      .then(res => res.json())
      .then(data => {
        setResources(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const categories = ['all', ...new Set(resources.map(r => r.category).filter(Boolean))];

  const filteredResources = resources.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-teal-500 font-mono text-xs">Loading Library...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30">
      
      {/* Hero Header */}
      <header className="relative bg-slate-900/50 border-b border-slate-800 pt-20 pb-16 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-teal-500/5 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Resource Library
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Download my guides, carousels, and cheat sheets. These are the same documents I share on LinkedIn.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Search & Filter Toolbar */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-6 mb-12 shadow-2xl flex flex-col gap-6">
          
          {/* Search Input */}
          <div className="w-full">
            <label htmlFor="search" className="sr-only">Search resources</label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for guides, slides, or cheat sheets..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-sm focus:border-teal-500 focus:outline-none transition-colors placeholder-slate-600"
            />
          </div>

          {/* Category Tabs */}
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
                  "px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
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

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredResources.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-teal-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-900/10"
              >
                {/* Visual Preview (CSS Only) */}
                <div className="h-40 bg-slate-950 border-b border-slate-800 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-900/80 transition-colors">
                   <div className="absolute inset-0 bg-grid-slate-800/[0.1] bg-[size:20px_20px]"></div>
                   {/* Document Icon made of CSS */}
                   <div className="w-16 h-20 border-2 border-slate-700 rounded-lg flex flex-col items-center justify-center bg-slate-900 relative shadow-xl group-hover:scale-110 group-hover:border-teal-500/50 transition-all duration-300">
                      <div className="w-8 h-1 bg-slate-700 mb-1 rounded-full group-hover:bg-teal-500/50"></div>
                      <div className="w-8 h-1 bg-slate-700 mb-1 rounded-full group-hover:bg-teal-500/50"></div>
                      <div className="w-5 h-1 bg-slate-700 rounded-full group-hover:bg-teal-500/50"></div>
                      <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 rounded uppercase">
                        {item.type}
                      </span>
                   </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-teal-500">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {item.date}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mb-3 group-hover:text-teal-400 transition-colors">
                    {item.title}
                  </h2>
                  
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                    {item.description}
                  </p>

                  <a 
                    href={`/pdfs/${item.filename}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-slate-950 border border-slate-800 rounded-lg text-sm font-bold text-center text-slate-300 hover:bg-teal-500 hover:text-slate-900 hover:border-teal-500 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Download / View
                    <span className="text-lg leading-none">↓</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
            <p className="text-slate-500">No resources found.</p>
            <button onClick={() => {setSearchQuery(''); setSelectedCategory('all')}} className="mt-4 text-teal-400 hover:underline">
               Reset Filters
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

export default Resources;