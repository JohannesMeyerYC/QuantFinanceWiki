import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Helmet } from 'react-helmet';
const API_URL = import.meta.env.VITE_API_URL;

function cn(...inputs) { return twMerge(clsx(inputs)); }

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetch(`${API_URL}/api/resources`)
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "QuantFinanceWiki.com Resource Library",
    "description": "Free downloadable guides, cheat sheets, and PDF resources for quantitative finance.",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": filteredResources.map((item, index) => ({
        "@type": "DigitalDocument",
        "position": index + 1,
        "name": item.title,
        "description": item.description,
        "fileFormat": "application/pdf",
        "url": `https://QuantFinanceWiki.com/pdfs/${item.filename}`,
        "author": {
          "@type": "Person",
          "name": "Johannes Meyer"
        }
      }))
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center" role="status" aria-busy="true">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <p className="text-teal-500 font-mono text-xs">Loading Library...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      <Helmet>
        <title>Resource Library | QuantFinanceWiki.com</title>
        <meta name="description" content="Download free quantitative finance resources, including cheat sheets, career guides, and interview prep slides." />
        <meta property="og:title" content="QuantFinanceWiki.com Resource Library" />
        <meta property="og:description" content="Access free PDF guides and slides for aspiring quants." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://QuantFinanceWiki.com/resources" />
        <link rel="canonical" href="https://QuantFinanceWiki.com/resources" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      
      {/* Header */}
      <header className="relative bg-slate-900/50 border-b border-slate-800 pt-24 pb-12 md:pt-20 md:pb-16 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none" aria-hidden="true">
           <div className="absolute top-[-50px] left-[-50px] w-64 h-64 md:w-96 md:h-96 bg-teal-500/5 rounded-full blur-[80px] md:blur-[100px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-6 tracking-tight leading-tight">
            Resource Library
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
            Download my guides, carousels, and cheat sheets. These are the same documents I share on LinkedIn.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        
        {/* Search & Filter */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-4 md:p-6 mb-8 md:mb-12 shadow-2xl flex flex-col gap-4 md:gap-6" role="search">
          
          <div className="w-full">
            <label htmlFor="resource-search" className="sr-only">Search resources</label>
            <input
              id="resource-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides, slides..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-base md:text-sm focus:border-teal-500 focus:outline-none transition-colors placeholder-slate-600"
            />
          </div>

          <div 
            className={cn(
              "flex items-center gap-2 overflow-x-auto w-full",
              "pb-2 -mx-1 px-1", 
              "snap-x", 
              "scrollbar-none" 
            )}
            role="tablist"
            aria-label="Filter resources by category"
          >
            <span className="text-slate-500 text-xs font-bold uppercase mr-2 flex-shrink-0" id="filter-label">Filter:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                role="tab"
                aria-selected={selectedCategory === cat}
                aria-controls="resource-grid"
                className={cn(
                  "px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border snap-center",
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

        <div id="resource-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" role="feed" aria-busy={loading}>
          <AnimatePresence>
            {filteredResources.map((item) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                role="article"
                className="group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-teal-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-900/10 active:scale-[0.98]"
              >
                <div className="h-32 md:h-40 bg-slate-950 border-b border-slate-800 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-900/80 transition-colors" aria-hidden="true">
                   <div className="absolute inset-0 bg-grid-slate-800/[0.1] bg-[size:20px_20px]"></div>
                   <div className="w-12 h-16 md:w-16 md:h-20 border-2 border-slate-700 rounded-lg flex flex-col items-center justify-center bg-slate-900 relative shadow-xl group-hover:scale-110 group-hover:border-teal-500/50 transition-all duration-300">
                      <div className="w-6 md:w-8 h-1 bg-slate-700 mb-1 rounded-full group-hover:bg-teal-500/50"></div>
                      <div className="w-6 md:w-8 h-1 bg-slate-700 mb-1 rounded-full group-hover:bg-teal-500/50"></div>
                      <div className="w-4 md:w-5 h-1 bg-slate-700 rounded-full group-hover:bg-teal-500/50"></div>
                      <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 rounded uppercase">
                        {item.type}
                      </span>
                   </div>
                </div>

                <div className="p-5 md:p-6 flex flex-col flex-grow">
                  <header className="flex justify-between items-start mb-3 md:mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-teal-500">
                      {item.category}
                    </span>
                    <time className="text-[10px] text-slate-600" dateTime={item.date}>
                      {item.date}
                    </time>
                  </header>
                  
                  <h2 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3 group-hover:text-teal-400 transition-colors">
                    {item.title}
                  </h2>
                  
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
                    {item.description}
                  </p>

                  <a 
                    href={`/pdfs/${item.filename}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label={`Download ${item.title}`}
                    className="w-full py-3 bg-slate-950 border border-slate-800 rounded-lg text-sm font-bold text-center text-slate-300 hover:bg-teal-500 hover:text-slate-900 hover:border-teal-500 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Download / View
                    <span className="text-lg leading-none" aria-hidden="true">↓</span>
                  </a>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12 md:py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-800" role="alert">
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