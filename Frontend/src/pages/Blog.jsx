import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { debounce } from 'lodash';

const API_URL = import.meta.env.VITE_API_URL;
const POSTS_PER_PAGE = 6;
const SITE_URL = "https://QuantFinanceWiki.com";

// Custom debounce hook
const useDebounce = (callback, delay) => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    debounce((...args) => callbackRef.current(...args), delay),
    [delay]
  );
};

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Changed from currentPage to visibleCount for "Load More" style
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  
  const [searchResultsInfo, setSearchResultsInfo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const totalPostsRef = useRef(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/blog`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(sortedData);
        totalPostsRef.current = sortedData.length;
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const categories = useMemo(() => {
    const cats = posts.reduce((acc, post) => {
      if (post.category && !acc.includes(post.category)) {
        acc.push(post.category);
      }
      return acc;
    }, []);
    return ['all', ...cats.sort()];
  }, [posts]);

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = [...posts];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      const searchTerms = lowerQuery.split(" ").filter(term => term.length > 0);

      filtered = filtered.filter(post => {
        const searchableText = `
          ${post.title || ''} 
          ${post.excerpt || ''} 
          ${post.category || ''} 
          ${post.author || ''}
          ${post.tags ? post.tags.join(' ') : ''}
        `.toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.date) - new Date(a.date);
        case 'date-asc': return new Date(a.date) - new Date(b.date);
        case 'title-asc': return (a.title || '').localeCompare(b.title || '');
        case 'title-desc': return (b.title || '').localeCompare(a.title || '');
        default: return 0;
      }
    });

    return filtered;
  }, [posts, selectedCategory, searchQuery, sortBy]);

  // Slices the array based on how many are currently visible
  const visiblePosts = filteredAndSortedPosts.slice(0, visibleCount);

  useEffect(() => {
    let info = '';
    if (searchQuery) {
      info = `Found ${filteredAndSortedPosts.length} result${filteredAndSortedPosts.length !== 1 ? 's' : ''} for "${searchQuery}"`;
    } else if (selectedCategory !== 'all') {
      info = `Showing ${filteredAndSortedPosts.length} article${filteredAndSortedPosts.length !== 1 ? 's' : ''} in ${selectedCategory}`;
    }
    setSearchResultsInfo(info);
    
    // Reset to initial count when filters change
    setVisibleCount(POSTS_PER_PAGE);
  }, [filteredAndSortedPosts.length, searchQuery, selectedCategory]);

  const debouncedSetSearchQuery = useDebounce((value) => {
    setSearchQuery(value);
  }, 300);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSetSearchQuery(value);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + POSTS_PER_PAGE);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('date-desc');
    setVisibleCount(POSTS_PER_PAGE);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Quantitative Finance Articles & Insights",
    "description": "Comprehensive library of articles on quantitative finance, algorithmic trading strategies, financial mathematics, and quant career development.",
    "url": `${SITE_URL}/blog`,
    "inLanguage": "en-US",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": visiblePosts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt,
          "author": { "@type": "Person", "name": post.author || "Johannes Meyer" },
          "datePublished": post.date,
          "dateModified": post.date,
          "url": `${SITE_URL}/blog/${post.id}`,
          "articleSection": post.category || "Quantitative Finance"
        }
      }))
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${SITE_URL}/blog` }
      ]
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/blog?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center" role="status" aria-live="polite" aria-label="Loading blog posts">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-teal-500 font-mono text-xs animate-pulse">Loading Articles...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      <Helmet>
        <title>Quantitative Finance Articles & Insights | QuantFinanceWiki</title>
        <meta name="description" content="Explore comprehensive articles on quantitative finance, algorithmic trading strategies, financial mathematics, and quant career development." />
        <meta name="keywords" content="quantitative finance, algorithmic trading, financial mathematics, quant career, trading strategies, risk management, derivatives pricing" />
        <link rel="canonical" href={`${SITE_URL}/blog`} />
        <meta property="og:title" content="Quantitative Finance Articles & Insights | QuantFinanceWiki" />
        <meta property="og:description" content="Explore comprehensive articles on quantitative finance, algorithmic trading strategies, financial mathematics, and quant career development." />
        <meta property="og:url" content={`${SITE_URL}/blog`} />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image" />
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

      <header className="relative border-b border-slate-800 bg-slate-900/40 pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center animate-in">
          <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Insights</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-3xl leading-relaxed mx-auto">
            Comprehensive library of articles on quantitative finance, algorithmic trading strategies, financial mathematics, and quant career development.
          </p>
          <div className="mt-8 text-sm text-slate-500" aria-live="polite">
            {totalPostsRef.current} articles published and counting
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        
        <div className="mb-16 space-y-8" id="blog-feed-top">
          {/* Search and Filters Section */}
          <section aria-label="Search and filter articles" className="space-y-6">
            <div className="relative w-full group">
              <label htmlFor="search-input" className="sr-only">Search articles</label>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-500 group-focus-within:text-teal-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search-input"
                type="search"
                placeholder="Search by title, topic, or keyword..."
                className="block w-full pl-12 pr-12 py-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-lg"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded"
                  aria-label="Clear search"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex flex-wrap gap-3">
                <label htmlFor="category-filter" className="sr-only">Filter by category</label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>

                <label htmlFor="sort-select" className="sr-only">Sort articles by</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                </select>

                {(searchQuery || selectedCategory !== 'all') && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="text-sm font-mono text-slate-500">
                Showing <span className="text-white font-bold">{visiblePosts.length}</span> of{' '}
                <span className="text-white font-bold">{filteredAndSortedPosts.length}</span> articles
                {searchResultsInfo && (
                  <span className="ml-3 text-teal-400" aria-live="polite">
                    {searchResultsInfo}
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Articles Grid */}
          <section 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            role="feed"
            aria-busy={loading}
          >
            {visiblePosts.map((post) => (
              <article 
                key={post.id}
                className="flex animate-in"
                itemScope
                itemType="https://schema.org/BlogPosting"
              >
                <Link 
                  to={`/blog/${post.id}`} 
                  className="w-full group flex flex-col bg-[#0B1221] border border-slate-800/60 rounded-2xl overflow-hidden hover:border-teal-500/40 hover:bg-[#0f1729] transition-all duration-300 hover:shadow-2xl hover:shadow-teal-900/10 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <div className="p-8 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-bold tracking-widest uppercase bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full border border-teal-500/20 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                        {post.category}
                      </span>
                      <time className="text-xs text-slate-500 font-mono" dateTime={post.date} itemProp="datePublished">
                        {post.date}
                      </time>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight group-hover:text-teal-400 transition-colors" itemProp="headline">
                      {post.title}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed mb-8 flex-grow line-clamp-3" itemProp="description">
                      {post.excerpt}
                    </p>

                    <div className="pt-6 border-t border-slate-800/60 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300" aria-hidden="true">
                          {post.author ? post.author[0] : 'A'}
                        </div>
                        <span className="text-xs text-slate-300 font-medium group-hover:text-slate-300 transition-colors" itemProp="author">
                          {post.author || 'Contributor'}
                        </span>
                      </div>
                      
                      <div className="flex gap-4 text-slate-600 text-xs font-mono" aria-hidden="true">
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          {post.likes || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </section>

          {/* No Results State */}
          {filteredAndSortedPosts.length === 0 && (
            <div className="text-center py-32 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800 animate-in" role="status" aria-live="polite">
              <p className="text-slate-500 text-lg mb-4">
                No articles found {searchQuery ? `for "${searchQuery}"` : `in ${selectedCategory}`}
              </p>
              <button 
                onClick={handleClearFilters}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                View All Articles
              </button>
            </div>
          )}

          {/* Load More Button - Only shows if there are more posts to see */}
          {visibleCount < filteredAndSortedPosts.length && (
            <div className="flex justify-center mt-12">
              <button
                onClick={handleLoadMore}
                className="px-8 py-4 bg-slate-800 text-slate-200 font-bold rounded-xl border border-slate-700 hover:border-teal-500 hover:text-teal-400 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 active:scale-95 w-full md:w-auto"
                aria-label={`Load ${Math.min(POSTS_PER_PAGE, filteredAndSortedPosts.length - visibleCount)} more articles`}
              >
                Load More Articles ({filteredAndSortedPosts.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Blog;