import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { m, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;
const POSTS_PER_PAGE = 6;

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  useEffect(() => {
    fetch(`${API_URL}/api/blog`)
      .then(res => res.json())
      .then(data => {
        const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(sortedData);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;

    const lowerQuery = searchQuery.toLowerCase();
    const searchTerms = lowerQuery.split(" ").filter(term => term.length > 0);

    return posts.filter(post => {
      const searchableText = `
        ${post.title} 
        ${post.excerpt} 
        ${post.category} 
        ${post.author}
      `.toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });
  }, [posts, searchQuery]);

  useEffect(() => {
    setVisibleCount(POSTS_PER_PAGE);
  }, [searchQuery]);

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, filteredPosts.length));
  };

  const handleShowLess = () => {
    setVisibleCount(POSTS_PER_PAGE);
    const listTop = document.getElementById('blog-feed-top');
    if (listTop) listTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "QuantFinanceWiki Insights",
    "description": "Guides and thoughts on quantitative finance.",
    "url": "https://QuantFinanceWiki.com/blog",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": visiblePosts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://QuantFinanceWiki.com/blog/${post.id}`,
        "name": post.title
      }))
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-teal-500 font-mono text-xs animate-pulse">Initializing Feed...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      <Helmet>
        <title>Insights & Articles | QuantFinanceWiki</title>
        <meta name="description" content="Explore articles on quantitative finance, algorithmic trading, and career advice." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <header className="relative border-b border-slate-800 bg-slate-900/40 pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center md:text-left">
          <m.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
              Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Insights</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl leading-relaxed mx-auto md:mx-0">
              Deep dives into algorithmic trading strategies, financial mathematics, and the career landscape for modern quants.
            </p>
          </m.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-16" id="blog-feed-top">
          
          <div className="relative w-full md:w-[480px] group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by title, topic, or keyword..."
              className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              </button>
            )}
          </div>

          <div className="text-sm font-mono text-slate-500">
            Showing <span className="text-white font-bold">{Math.min(visibleCount, filteredPosts.length)}</span> of <span className="text-white font-bold">{filteredPosts.length}</span> articles
          </div>
        </div>

        <div 
           className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8" 
           role="feed"
        >
          <AnimatePresence mode='popLayout'>
            {visiblePosts.map((post, index) => (
              <m.article 
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                key={post.id} 
                className="flex"
              >
                <Link 
                  to={`/blog/${post.id}`} 
                  className="w-full group flex flex-col bg-[#0B1221] border border-slate-800/60 rounded-2xl overflow-hidden hover:border-teal-500/40 hover:bg-[#0f1729] transition-all duration-300 hover:shadow-2xl hover:shadow-teal-900/10 active:scale-[0.98]"
                >
                  <div className="p-8 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-bold tracking-widest uppercase bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full border border-teal-500/20 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                        {post.category}
                      </span>
                      <time className="text-xs text-slate-500 font-mono">{post.date}</time>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight group-hover:text-teal-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-8 flex-grow line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="pt-6 border-t border-slate-800/60 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                           {post.author ? post.author[0] : 'A'}
                        </div>
                        <span className="text-xs text-slate-300 font-medium group-hover:text-slate-300 transition-colors">
                          {post.author || 'Contributor'}
                        </span>
                      </div>
                      
                      <div className="flex gap-4 text-slate-600 text-xs font-mono">
                        <span className="flex items-center gap-1.5">
                           <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                           {post.likes || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </m.article>
            ))}
          </AnimatePresence>
        </div>

        {filteredPosts.length === 0 && (
          <m.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-32 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800"
          >
            <p className="text-slate-500 text-lg mb-2">No matches found for "{searchQuery}"</p>
            <button onClick={() => setSearchQuery('')} className="text-teal-400 font-bold hover:underline">
               Clear Search Filters
            </button>
          </m.div>
        )}

        {filteredPosts.length > 0 && (
  <div className="mt-20 flex justify-center">
    
    <div className="flex items-center gap-4">
      
      {visibleCount < filteredPosts.length && (
        <button 
          onClick={handleLoadMore}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold rounded-lg transition-colors border border-slate-700"
        >
          Load More Articles
        </button>
      )}

      {visibleCount > POSTS_PER_PAGE && (
        <button 
          onClick={handleShowLess}
          className="px-6 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-medium text-sm transition-colors border border-slate-700"
        >
          Show Less
        </button>
      )}

      {visibleCount >= filteredPosts.length && filteredPosts.length > POSTS_PER_PAGE && (
        <span className="px-6 py-3 text-slate-500 text-sm font-medium">
          You’ve reached the end
        </span>
      )}

    </div>
  </div>
        )}

      </main>
    </div>
  );
}

export default Blog;