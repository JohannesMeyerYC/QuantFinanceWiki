import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Helmet } from 'react-helmet-async';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Link } from 'react-router-dom';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 9;
const RESIZE_DEBOUNCE_DELAY = 150;
const SEARCH_DEBOUNCE_DELAY = 300;

function cn(...inputs) { return twMerge(clsx(inputs)); }

// Icon Components
const PdfIcon = memo(() => (
  <div className="w-12 h-16 bg-slate-800 border border-slate-700 rounded flex flex-col items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform">
    <span className="text-[8px] font-bold text-slate-500 mb-1">PDF</span>
    <div className="w-6 h-0.5 bg-slate-600 mb-1 rounded-full"></div>
    <div className="w-6 h-0.5 bg-slate-600 mb-1 rounded-full"></div>
    <div className="w-4 h-0.5 bg-slate-600 rounded-full"></div>
  </div>
));

const BookIcon = memo(() => (
  <div className="w-12 h-16 bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-r-md rounded-l-sm flex flex-col items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform relative">
    <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-indigo-500/20"></div>
    <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  </div>
));

const CourseIcon = memo(() => (
  <div className="w-16 h-16 rounded-full bg-slate-800 border border-emerald-500/30 flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform">
    <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  </div>
));

const DefaultIcon = memo(() => (
  <div className="w-14 h-14 rounded-xl bg-slate-800 border border-teal-500/30 flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform">
    <svg className="w-7 h-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  </div>
));

const ICON_MAP = {
  pdf: PdfIcon,
  cheatsheet: PdfIcon,
  book: BookIcon,
  course: CourseIcon,
  certificate: CourseIcon,
  default: DefaultIcon
};

const ResourceItem = memo(({ item, onPreview }) => {
  const typeLower = item.type?.toLowerCase() || 'default';
  const IconComponent = ICON_MAP[typeLower] || ICON_MAP.default;
  const isPdf = typeLower === 'pdf' || typeLower === 'cheatsheet';
  const isExternalLink = item.link && !isPdf;
  
  return (
    <article className="flex flex-col bg-[#0f1623] border border-slate-800 rounded-2xl overflow-hidden hover:border-teal-500/30 transition-all animate-fade-in opacity-0 fill-mode-forwards">
      <div className="h-40 bg-slate-900/50 flex items-center justify-center relative border-b border-slate-800 group">
        <IconComponent />
        <div className="absolute top-4 right-4 bg-slate-950 border border-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-300 uppercase tracking-wider">
          {item.type}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-xl font-bold text-white mb-2">{item.title}</h2>
        <p className="text-slate-300 text-sm mb-6 line-clamp-3">{item.description}</p>
        
        <div className="mt-auto">
          {isPdf ? (
            <div className="flex gap-3">
              <button 
                onClick={() => onPreview(item)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                aria-label={`Preview ${item.title}`}
              >
                Preview
              </button>
              <a 
                href={`/pdfs/${item.filename}`} 
                download={item.filename}
                className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                aria-label={`Download ${item.title}`}
              >
                Download
              </a>
            </div>
          ) : isExternalLink ? (
            // Change to Link for resources with detail pages
            <Link 
              to={`/resources/${item.slug || item.id}`}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-teal-500/50 text-teal-400 font-bold transition-all gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
              aria-label={`View details for ${item.type}: ${item.title}`}
            >
              <span>View Details</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          ) : (
            // Logic Simplified: If it's not a PDF, it's a Detail View resource.
            // We use the slug if available, otherwise fallback to ID.
            // The Backend Fix above ensures ID works.
            <Link 
              to={`/resources/${item.slug || item.id}`}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-teal-500/50 text-teal-400 font-bold transition-all gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
            >
              <span>View Details</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
});

ResourceItem.displayName = 'ResourceItem';

function normalizeString(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [previewResource, setPreviewResource] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfWidth, setPdfWidth] = useState(600);
  
  const abortControllerRef = useRef(null);
  const modalRef = useRef(null);

  // Fetch resources
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/api/resources`, {
          signal: abortControllerRef.current.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid API response format');
        }
        
        const normalizedData = data.map(resource => ({
          ...resource,
          type: resource.type?.charAt(0).toUpperCase() + resource.type?.slice(1).toLowerCase() || 'Other'
        }));
        
        setResources(normalizedData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Fetch error:', err);
          setError('Failed to load resources. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
    
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_DELAY);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Modal focus trap & effects
  useEffect(() => {
    if (previewResource) {
      document.body.style.overflow = 'hidden';
      setPageNumber(1);
      
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setPreviewResource(null);
        }
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [previewResource]);

  // Resize handler
  useEffect(() => {
    const handleResize = throttle(() => {
      const newWidth = Math.min(window.innerWidth - 48, 1000);
      setPdfWidth(newWidth);
    }, RESIZE_DEBOUNCE_DELAY);
    
    window.addEventListener('resize', handleResize);
    handleResize(); 
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
  }, []);

  const categories = useMemo(() => {
    return ['all', ...new Set(resources.map(r => r.category).filter(Boolean))];
  }, [resources]);

  const filteredResources = useMemo(() => {
    const normalizedQuery = normalizeString(debouncedSearchQuery);
    const searchTerms = normalizedQuery.split(" ").filter(term => term.length > 0);
    
    return resources.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;
      
      if (searchTerms.length === 0) return true;
      
      const searchableText = normalizeString(
        `${item.title} ${item.description} ${item.type} ${item.category || ''}`
      );
      
      return searchTerms.every(term => searchableText.includes(term));
    });
  }, [resources, debouncedSearchQuery, selectedCategory]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [debouncedSearchQuery, selectedCategory]);

  const visibleResources = useMemo(() => 
    filteredResources.slice(0, visibleCount), 
    [filteredResources, visibleCount]
  );

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredResources.length));
  }, [filteredResources.length]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCloseModal = useCallback(() => {
    setPreviewResource(null);
  }, []);

  const handlePageNavigation = useCallback((direction) => {
    setPageNumber(prev => {
      if (direction === 'prev' && prev > 1) return prev - 1;
      if (direction === 'next' && prev < numPages) return prev + 1;
      return prev;
    });
  }, [numPages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center" role="status" aria-label="Loading resources">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Resources</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      <Helmet>
        <title>Resource Library | QuantFinanceWiki</title>
        <style type="text/css">{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }
          .animate-scale-in {
            animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .fill-mode-forwards {
            animation-fill-mode: forwards;
          }
        `}</style>
      </Helmet>
      
      <header className="relative bg-slate-900/50 border-b border-slate-800 pt-32 pb-16 overflow-hidden">
        <div className="absolute top-[-50px] left-[-50px] w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Library</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
            Curated PDFs, books, courses, and technical guides.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl p-6 mb-12 shadow-2xl flex flex-col gap-6">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search guides, algorithms, cheat sheets..."
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 px-4 text-slate-200 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            aria-label="Search resources"
          />
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold uppercase border transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50",
                  selectedCategory === cat
                    ? "bg-teal-500 border-teal-500 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600"
                )}
                aria-label={`Filter by ${cat}`}
                aria-pressed={selectedCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredResources.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No resources found</h3>
            <p className="text-slate-300">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleResources.map((item) => (
                <ResourceItem
                  key={item.id}
                  item={item}
                  onPreview={setPreviewResource}
                />
              ))}
            </div>

            {visibleCount < filteredResources.length && (
              <div className="mt-16 flex justify-center">
                <button 
                  onClick={handleLoadMore} 
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold rounded-lg border border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                  aria-label="Load more resources"
                >
                  Load More ({filteredResources.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal - Rendered conditionally without AnimatePresence */}
      {previewResource && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in fill-mode-forwards"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          ref={modalRef}
        >
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={handleCloseModal}
            aria-label="Close modal"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCloseModal()}
          />

          <div 
            className="relative w-full max-w-5xl h-auto max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in fill-mode-forwards opacity-0"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950 shrink-0">
              <h3 
                id="modal-title"
                className="text-slate-200 font-semibold truncate max-w-[50%] text-sm sm:text-base"
              >
                {previewResource.title}
              </h3>
              
              <div className="flex items-center gap-2 sm:gap-4">
                {numPages && (
                  <div className="flex items-center gap-1 sm:gap-2 bg-slate-900 rounded-lg p-1 border border-slate-800">
                    <button 
                      disabled={pageNumber <= 1}
                      onClick={() => handlePageNavigation('prev')}
                      className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                      aria-label="Previous page"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="text-[10px] sm:text-xs font-mono text-slate-300 min-w-[40px] sm:min-w-[60px] text-center">
                      {pageNumber} / {numPages}
                    </span>
                    <button 
                      disabled={pageNumber >= numPages}
                      onClick={() => handlePageNavigation('next')}
                      className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                      aria-label="Next page"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                <button 
                  onClick={handleCloseModal}
                  className="p-2 text-slate-300 hover:text-red-400 hover:bg-slate-900 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                  aria-label="Close preview"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-auto bg-slate-800/50 flex justify-center p-4 min-h-[200px]">
              <Document
                file={`/pdfs/${previewResource.filename}`}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex flex-col items-center mt-10 gap-4">
                    <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-teal-500 text-xs animate-pulse">Rendering...</p>
                  </div>
                }
                error={
                  <div className="flex flex-col items-center mt-10 text-red-400">
                    <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-semibold">Failed to load PDF</p>
                    <p className="text-sm">The file may be corrupted or unavailable</p>
                  </div>
                }
                className="shadow-2xl"
              >
                <Page 
                  pageNumber={pageNumber} 
                  width={pdfWidth}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="bg-white" 
                />
              </Document>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Resources;