import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
const API_URL = import.meta.env.VITE_API_URL;

function cn(...inputs) { return twMerge(clsx(inputs)); }

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/blog`)
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "QuantFinanceWiki.com Insights",
    "description": "Read guides and thoughts on quantitative finance, algorithms, and career advice.",
    "url": "https://QuantFinanceWiki.com/blog",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": filteredPosts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://QuantFinanceWiki.com/blog/${post.id}`,
        "name": post.title,
        "description": post.excerpt
      }))
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center" role="status" aria-busy="true">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <p className="text-teal-500 font-mono text-xs animate-pulse">Loading Articles...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      <Helmet>
        <title>Insights & Blog | QuantFinanceWiki.com</title>
        <meta name="description" content="Explore the latest articles, guides, and industry insights on quantitative finance, algorithmic trading, and career development." />
        <meta name="keywords" content="quantitative finance blog, quant trading, algo trading, career advice, finance mathematics" />
        
        <meta property="og:title" content="Insights & Blog | QuantFinanceWiki.com" />
        <meta property="og:description" content="Read guides and thoughts on quantitative finance." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://QuantFinanceWiki.com/blog" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Insights & Blog | QuantFinanceWiki.com" />
        <meta name="twitter:description" content="Read guides and thoughts on quantitative finance." />
        
        <link rel="canonical" href="https://QuantFinanceWiki.com/blog" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Header */}
      <header className="relative border-b border-slate-800 bg-slate-900/50 pt-24 pb-12 md:pt-20 md:pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-teal-500/5 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" aria-hidden="true"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 md:mb-6 tracking-tight leading-tight">
            Insights
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
            Read guides and thoughts on quantitative finance.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        
        {/* Search Bar */}
        <div className="mb-8 md:mb-12 relative" role="search">
            <label htmlFor="blog-search" className="sr-only">Search articles</label>
            <div className="relative w-full md:w-96">
                <input 
                  id="blog-search"
                  type="text" 
                  placeholder="Search articles..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-3 pl-4 pr-10 text-base md:text-sm text-slate-200 focus:border-teal-500 focus:outline-none transition-colors placeholder-slate-500 shadow-sm"
                />
                <svg className="absolute right-3 top-3 w-5 h-5 text-slate-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
        </div>

        <div 
           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" 
           role="feed"
        >
          <AnimatePresence>
            {filteredPosts.map((post) => (
                <motion.article 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    key={post.id} 
                    className="h-full"
                >
                  <Link 
                    to={`/blog/${post.id}`} 
                    className="group flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-teal-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 active:scale-[0.99] h-full"
                    aria-label={`Read article: ${post.title}`}
                  >
                    <div className="p-6 md:p-8 flex flex-col h-full">
                      <header className="flex items-center justify-between text-[10px] md:text-xs text-slate-500 mb-4 font-mono uppercase tracking-wide">
                        <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800">{post.category}</span>
                        <time dateTime={post.date}>{post.date}</time>
                      </header>
                      
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4 group-hover:text-teal-400 transition-colors leading-snug">
                        {post.title}
                      </h2>
                      
                      <p className="text-slate-400 text-sm md:text-base mb-6 md:mb-8 leading-relaxed flex-grow">
                        {post.excerpt}
                      </p>

                      <footer className="pt-5 md:pt-6 border-t border-slate-800 flex items-center justify-between text-xs md:text-sm">
                          <span className="font-bold text-teal-500 group-hover:underline flex items-center gap-1">
                             Read Article <span className="text-lg leading-none" aria-hidden="true">→</span>
                          </span>
                          <div className="flex gap-3 text-slate-600 font-medium" aria-label="Engagement stats">
                            <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                {post.likes}
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
                                {post.comment_count}
                            </span>
                          </div>
                      </footer>
                    </div>
                  </Link>
                </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-800" role="alert">
            <p className="text-slate-500">No articles found matching "{searchQuery}".</p>
            <button onClick={() => setSearchQuery('')} className="mt-4 text-teal-400 hover:underline font-bold text-sm">
                Clear Search
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

export default Blog;