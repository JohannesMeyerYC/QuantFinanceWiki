import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Helmet } from 'react-helmet-async';
import { debounce } from 'lodash';

const API_URL = import.meta.env.VITE_API_URL;
const SITE_URL = "https://QuantFinanceWiki.com";
const FAQS_PER_PAGE = 10;

function cn(...inputs) { return twMerge(clsx(inputs)); }

// Custom debounce hook for search
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

// Share functionality for individual FAQs
const FAQShareButton = ({ slug, question }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${SITE_URL}/faq#${slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: question,
          text: `Check out this FAQ: ${question}`,
          url: url,
        });
      } catch (err) {
        if (err.name !== 'AbortError') copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        aria-label={`Share question about ${question}`}
        className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-teal-500/30 hover:bg-slate-700 transition-all text-xs text-slate-300 hover:text-slate-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3 h-3"
        >
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        Share
      </button>

      {copied && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-teal-500 text-slate-900 text-xs font-bold px-2 py-1 rounded pointer-events-none">
          Link Copied!
        </div>
      )}
    </div>
  );
};

function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSlugs, setOpenSlugs] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedAll, setExpandedAll] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [highlightedText, setHighlightedText] = useState('');

  // Load initial state from URL hash
  useEffect(() => {
    const hash = window.location.hash.substring(1); // Remove #
    if (hash && hash.startsWith('faq-')) {
      const slug = hash.replace('faq-', '');
      setOpenSlugs(new Set([slug]));
      
      // Scroll to the FAQ after a short delay to ensure it's rendered
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }, []);

  // Fetch FAQs with error handling
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/faq`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const processedData = data.map(faq => ({
          ...faq,
          slug: faq.slug || faq.question
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 100),
          category: faq.category || 'General'
        }));
        
        setFaqs(processedData);
        
        // Calculate category counts
        const counts = {};
        processedData.forEach(faq => {
          const cat = faq.category;
          counts[cat] = (counts[cat] || 0) + 1;
          counts['all'] = (counts['all'] || 0) + 1;
        });
        setCategoryCounts(counts);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching FAQs:", err);
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  // Debounced search
  const debouncedSetSearchTerm = useDebounce((value) => {
    setDebouncedSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  }, 300);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSetSearchTerm(value);
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(faqs.map(faq => faq.category).filter(Boolean))].sort();
    return ['all', ...cats];
  }, [faqs]);

  // Filter and highlight FAQs
  const filteredFaqs = useMemo(() => {
    let filtered = faqs;
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }
    
    // Apply search filter
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase().trim();
      const searchTerms = searchLower.split(" ").filter(term => term.length > 2);
      
      if (searchTerms.length > 0) {
        filtered = filtered.filter(faq => {
          const searchableText = `
            ${faq.question || ''} 
            ${faq.answer || ''} 
            ${faq.category || ''}
            ${faq.tags ? faq.tags.join(' ') : ''}
          `.toLowerCase();
          
          return searchTerms.every(term => searchableText.includes(term));
        });
      }
    }
    
    return filtered;
  }, [faqs, selectedCategory, debouncedSearchTerm]);

  // Highlight search terms in text
  const highlightText = useCallback((text) => {
    if (!debouncedSearchTerm.trim()) return text;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    const searchTerms = searchLower.split(" ").filter(term => term.length > 2);
    
    if (searchTerms.length === 0) return text;
    
    let highlighted = text;
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark class="bg-yellow-500/20 text-yellow-300 rounded px-0.5">$1</mark>');
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  }, [debouncedSearchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredFaqs.length / FAQS_PER_PAGE);
  const startIndex = (currentPage - 1) * FAQS_PER_PAGE;
  const endIndex = startIndex + FAQS_PER_PAGE;
  const paginatedFaqs = filteredFaqs.slice(startIndex, endIndex);

  // FAQ interaction handlers
  const toggleFAQ = useCallback((slug) => {
    setOpenSlugs(prev => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
        // Update URL hash without scrolling
        window.history.replaceState(null, '', `#faq-${slug}`);
      }
      return next;
    });
  }, []);

  const toggleAllFAQs = useCallback(() => {
    if (expandedAll) {
      setOpenSlugs(new Set());
    } else {
      const allSlugs = new Set(paginatedFaqs.map(faq => faq.slug));
      setOpenSlugs(allSlugs);
    }
    setExpandedAll(!expandedAll);
  }, [expandedAll, paginatedFaqs]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setOpenSlugs(new Set());
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedCategory('all');
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    // Scroll to top of FAQ list
    const listTop = document.getElementById('faq-list-top');
    if (listTop) {
      listTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    let prev = 0;
    for (const i of range) {
      if (i - prev > 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      prev = i;
    }

    return rangeWithDots;
  };

  // Enhanced JSON-LD structured data
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "name": "Quantitative Finance FAQ",
    "description": "Frequently asked questions about quantitative finance careers, mathematics requirements, interview preparation, and industry insights.",
    "url": `${SITE_URL}/faq`,
    "inLanguage": "en-US",
    "mainEntity": filteredFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
        "author": {
          "@type": "Person",
          "name": faq.answeredBy || "QuantFinanceWiki Contributor"
        },
        "dateCreated": faq.dateCreated || new Date().toISOString().split('T')[0]
      },
      "keywords": [faq.category, ...(faq.tags || [])].filter(Boolean).join(", "),
      "category": faq.category
    })),
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": SITE_URL
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "FAQ",
          "item": `${SITE_URL}/faq`
        }
      ]
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/faq?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }), [filteredFaqs]);

  if (loading) return (
    <div 
      className="min-h-screen bg-slate-950 flex items-center justify-center"
      role="status"
      aria-busy="true"
      aria-label="Loading frequently asked questions"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <p className="text-teal-500 font-mono text-xs">Loading Answers...</p>
        <span className="sr-only">Loading frequently asked questions, please wait.</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      <Helmet>
        <title>Quantitative Finance FAQ | Common Questions Answered | QuantFinanceWiki.com</title>
        <meta 
          name="description" 
          content="Frequently asked questions about quantitative finance careers, mathematics requirements, interview preparation, and industry insights. Find answers to common questions from aspiring quants." 
        />
        <meta 
          name="keywords" 
          content="quantitative finance FAQ, quant career questions, finance mathematics, interview preparation, quant salary, financial engineering, algorithmic trading FAQ" 
        />
        <link rel="canonical" href={`${SITE_URL}/faq`} />
        <meta property="og:title" content="Quantitative Finance FAQ | Common Questions Answered" />
        <meta 
          property="og:description" 
          content="Find answers to frequently asked questions about quantitative finance careers, mathematics requirements, interview preparation, and industry insights." 
        />
        <meta property="og:url" content={`${SITE_URL}/faq`} />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20 relative" id="faq-list-top">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 right-10 w-48 h-48 md:w-64 md:h-64 bg-teal-500/5 rounded-full blur-[60px] md:blur-[80px]"></div>
        </div>

        <header className="text-center mb-8 md:mb-16 relative z-10 pt-12 md:pt-0">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 md:mb-6 tracking-tight">
            Common Questions
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-2">
            Read answers to questions about math, interviews, and jobs.
          </p>
          <div className="mt-4 text-sm text-slate-500">
            {faqs.length} questions answered and counting
          </div>
        </header>

        <section 
          className="sticky top-2 md:top-4 z-30 mb-6 md:mb-8"
          aria-label="Search and filter questions"
        >
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-2xl space-y-3 md:space-y-4">
            {/* Search Input */}
            <div className="w-full relative">
              <label htmlFor="faq-search" className="sr-only">Search for answers</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg 
                  className="h-5 w-5 text-slate-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="faq-search"
                type="search"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-10 text-base md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                aria-describedby="search-help"
              />
              <div id="search-help" className="sr-only">
                Search through question text, answers, and categories
              </div>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded"
                  aria-label="Clear search"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category Filter with Counts */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                className="flex items-center gap-2 overflow-x-auto w-full pb-2 -mx-1 px-1 snap-x scrollbar-thin scrollbar-thumb-slate-800"
                role="tablist"
                aria-label="Filter by category"
              >
                <span className="text-xs font-bold text-slate-500 uppercase mr-1 flex-shrink-0">Filter:</span>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    role="tab"
                    aria-selected={selectedCategory === cat}
                    aria-controls="faq-list"
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap border snap-center transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20",
                      selectedCategory === cat
                        ? "bg-teal-500 border-teal-500 text-teal-50"
                        : "bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-200"
                    )}
                  >
                    {cat === 'all' ? 'All' : cat}
                    <span className="ml-2 text-xs opacity-75">
                      ({categoryCounts[cat] || 0})
                    </span>
                  </button>
                ))}
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAllFAQs}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  aria-label={expandedAll ? "Collapse all questions" : "Expand all questions"}
                >
                  {expandedAll ? 'Collapse All' : 'Expand All'}
                </button>

                {(searchTerm || selectedCategory !== 'all') && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Results Info */}
            <div className="text-sm text-slate-500 flex justify-between items-center">
              <span aria-live="polite">
                {debouncedSearchTerm ? `Found ${filteredFaqs.length} result${filteredFaqs.length !== 1 ? 's' : ''} for "${debouncedSearchTerm}"` : 
                 selectedCategory !== 'all' ? `Showing ${filteredFaqs.length} question${filteredFaqs.length !== 1 ? 's' : ''} in ${selectedCategory}` :
                 `Showing ${filteredFaqs.length} questions`}
              </span>
              {filteredFaqs.length > FAQS_PER_PAGE && (
                <span className="text-xs font-mono">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
          </div>
        </section>

        <div id="faq-list" className="space-y-3 md:space-y-4 relative z-10 pb-12" role="presentation">
          {paginatedFaqs.map((faq, index) => {
            const isOpen = openSlugs.has(faq.slug);
            const answerId = `faq-answer-${faq.slug}`;
            const headerId = `faq-header-${faq.slug}`;

            return (
              <m.article
                key={`${faq.slug}-${index}`}
                id={`faq-${faq.slug}`}
                className={cn(
                  "bg-slate-900 border rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300",
                  isOpen ? "border-teal-500/50 bg-slate-900/80 shadow-lg shadow-black/20" : "border-slate-800 hover:border-slate-700"
                )}
                itemScope
                itemType="https://schema.org/Question"
              >
                <button
                  onClick={() => toggleFAQ(faq.slug)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  id={headerId}
                  className="w-full text-left px-5 py-4 md:px-6 md:py-5 flex justify-between items-start gap-3 md:gap-4 cursor-pointer active:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <div className="flex-1">
                    <h2
                      className={cn("font-bold text-base md:text-lg leading-snug transition-colors text-left", isOpen ? "text-teal-100" : "text-slate-200")}
                      itemProp="name"
                    >
                      {highlightText(faq.question)}
                    </h2>
                    {faq.category && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          {faq.category}
                        </span>
                        <FAQShareButton slug={faq.slug} question={faq.question} />
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 flex-shrink-0 mt-0.5",
                    isOpen ? "bg-teal-500/10 border-teal-500/50 text-teal-400" : "bg-slate-800 border-slate-700 text-slate-500"
                  )} aria-hidden="true">
                    <svg 
                      className={cn("w-3 h-3 transition-transform duration-300", isOpen ? "rotate-180" : "rotate-0")}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <m.div
                      id={answerId}
                      role="region"
                      aria-labelledby={headerId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                      itemScope
                      itemType="https://schema.org/Answer"
                      itemProp="acceptedAnswer"
                    >
                      <div className="px-5 pb-5 md:px-6 md:pb-6 pt-0">
                        <div
                          className="pt-3 md:pt-4 border-t border-slate-800/50 text-slate-300 leading-relaxed whitespace-pre-line text-sm md:text-base space-y-3"
                          itemProp="text"
                        >
                          {highlightText(faq.answer)}
                        </div>
                        {(faq.answeredBy || faq.dateCreated) && (
                          <div className="mt-4 flex justify-between items-center">
                            {faq.answeredBy && (
                              <span className="text-[10px] md:text-xs text-teal-500 font-mono bg-teal-950/30 px-2 py-1 rounded border border-teal-900/30">
                                Answered by: <span itemProp="author">{faq.answeredBy}</span>
                              </span>
                            )}
                            {faq.dateCreated && (
                              <time 
                                className="text-[10px] md:text-xs text-slate-500"
                                dateTime={faq.dateCreated}
                              >
                                {faq.dateCreated}
                              </time>
                            )}
                          </div>
                        )}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.article>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav 
            className="mt-8 mb-12"
            aria-label="FAQ pagination"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-500">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredFaqs.length)} of {filteredFaqs.length} questions
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  aria-label="Previous page"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-slate-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
                          currentPage === page
                            ? 'bg-teal-500 border-teal-500 text-white'
                            : 'border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                        aria-label={`Go to page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          </nav>
        )}

        {filteredFaqs.length === 0 && (
          <div 
            className="text-center py-16 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 mt-8"
            role="alert"
            aria-live="polite"
          >
            <h3 className="text-base font-bold text-slate-300 mb-2">No results found</h3>
            <p className="text-sm text-slate-500 mb-6">We could not find any questions for your search.</p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              View All Questions
            </button>
          </div>
        )}

        {/* Related Resources */}
        <section className="mt-12 pt-8 border-t border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">Related Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/blog"
              className="p-4 rounded-lg bg-slate-900 border border-slate-800 hover:border-teal-500/30 hover:bg-slate-800 transition-colors"
            >
              <h3 className="font-bold text-white mb-2">Quantitative Finance Articles</h3>
              <p className="text-sm text-slate-300">Deep dive into algorithms, strategies, and career advice.</p>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default FAQ;