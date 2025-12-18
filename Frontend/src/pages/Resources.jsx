import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Helmet } from 'react-helmet-async';

// --- IMPORTS FOR PDF RENDERING ---
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const API_URL = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 9;

function cn(...inputs) { return twMerge(clsx(inputs)); }

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  
  const [previewResource, setPreviewResource] = useState(null);
  
  // PDF State
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfWidth, setPdfWidth] = useState(600); 

  // Fetch Logic
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

  // Lock scroll & Reset PDF state on open
  useEffect(() => {
    if (previewResource) {
      document.body.style.overflow = 'hidden';
      setPageNumber(1); 
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [previewResource]);

  // Adjust PDF width based on window size
  useEffect(() => {
    function handleResize() {
      const newWidth = Math.min(window.innerWidth - 48, 1000); 
      setPdfWidth(newWidth);
    }
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  // --- FILTER LOGIC ---
  const categories = useMemo(() => {
    return ['all', ...new Set(resources.map(r => r.category).filter(Boolean))];
  }, [resources]);

  const filteredResources = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const searchTerms = lowerQuery.split(" ").filter(term => term.length > 0);

    return resources.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (searchTerms.length === 0) return true;
      const searchableText = `${item.title} ${item.description} ${item.type}`.toLowerCase();
      return searchTerms.every(term => searchableText.includes(term));
    });
  }, [resources, searchQuery, selectedCategory]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedCategory]);

  const visibleResources = filteredResources.slice(0, visibleCount);

  const handleLoadMore = () => setVisibleCount(prev => Math.min(prev + 9, filteredResources.length));

  // --- HELPER: ICON RENDERER ---
  const renderIcon = (type) => {
    const typeLower = type?.toLowerCase() || '';
    
    // PDF / Document
    if (typeLower === 'pdf' || typeLower === 'cheatsheet') {
        return (
            <div className="w-12 h-16 bg-slate-800 border border-slate-700 rounded flex flex-col items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform">
                <span className="text-[8px] font-bold text-slate-500 mb-1">{type === 'PDF' ? 'PDF' : 'DOC'}</span>
                <div className="w-6 h-0.5 bg-slate-600 mb-1 rounded-full"></div>
                <div className="w-6 h-0.5 bg-slate-600 mb-1 rounded-full"></div>
                <div className="w-4 h-0.5 bg-slate-600 rounded-full"></div>
            </div>
        );
    }
    
    // Book
    if (typeLower === 'book') {
        return (
             <div className="w-12 h-16 bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-r-md rounded-l-sm flex flex-col items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform relative">
                <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-indigo-500/20"></div>
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
             </div>
        );
    }

    // Course / Certificate
    if (typeLower === 'course' || typeLower === 'certificate') {
        return (
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-emerald-500/30 flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform">
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
            </div>
        );
    }

    // Default (Web/Tool)
    return (
        <div className="w-14 h-14 rounded-xl bg-slate-800 border border-teal-500/30 flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform">
             <svg className="w-7 h-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
        </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      <Helmet>
        <title>Resource Library | QuantFinanceWiki</title>
      </Helmet>
      
      {/* HEADER */}
      <header className="relative bg-slate-900/50 border-b border-slate-800 pt-32 pb-16 overflow-hidden">
        <div className="absolute top-[-50px] left-[-50px] w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Library</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Curated PDFs, books, courses, and technical guides.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        
        {/* FILTERS */}
        <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl p-6 mb-12 shadow-2xl flex flex-col gap-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides, algorithms, cheat sheets..."
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 px-4 text-slate-200 focus:border-teal-500 focus:outline-none"
          />
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold uppercase border transition-all whitespace-nowrap",
                  selectedCategory === cat
                    ? "bg-teal-500 border-teal-500 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-400"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode='popLayout'>
            {visibleResources.map((item) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col bg-[#0f1623] border border-slate-800 rounded-2xl overflow-hidden hover:border-teal-500/30 transition-all"
              >
                {/* Visual Header */}
                <div className="h-40 bg-slate-900/50 flex items-center justify-center relative border-b border-slate-800 group">
                    {renderIcon(item.type)}
                    <div className="absolute top-4 right-4 bg-slate-950 border border-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {item.type}
                    </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold text-white mb-2">{item.title}</h2>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-3">{item.description}</p>
                  
                  <div className="mt-auto">
                    {item.type === 'PDF' || item.type === 'Cheatsheet' ? (
                        <div className="flex gap-3">
                            <button 
                              onClick={() => setPreviewResource(item)}
                              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold transition-all"
                            >
                              Preview
                            </button>
                            <a 
                              href={`/pdfs/${item.filename}`} 
                              download={item.filename}
                              className="flex-1 flex items-center justify-center py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all"
                            >
                              Download
                            </a>
                        </div>
                    ) : (
                        <a 
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="w-full flex items-center justify-center py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-teal-500/50 text-teal-400 font-bold transition-all gap-2"
                        >
                          <span>Open {item.type}</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        {visibleCount < filteredResources.length && (
            <div className="mt-16 flex justify-center">
              <button onClick={handleLoadMore} className="px-6 py-3 bg-slate-800 text-teal-400 font-bold rounded-lg border border-slate-700">Load More</button>
            </div>
        )}
      </main>

      {/* --- REACT-PDF PREVIEW MODAL --- */}
      <AnimatePresence>
        {previewResource && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setPreviewResource(null)} 
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl h-auto max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              
              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950 shrink-0">
                <h3 className="text-slate-200 font-semibold truncate max-w-[50%] text-sm sm:text-base">
                    {previewResource.title}
                </h3>
                
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Pagination Controls */}
                    {numPages && (
                        <div className="flex items-center gap-1 sm:gap-2 bg-slate-900 rounded-lg p-1 border border-slate-800">
                            <button 
                                disabled={pageNumber <= 1}
                                onClick={() => setPageNumber(p => p - 1)}
                                className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 text-white"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <span className="text-[10px] sm:text-xs font-mono text-slate-400 min-w-[40px] sm:min-w-[60px] text-center">
                                {pageNumber} / {numPages}
                            </span>
                            <button 
                                disabled={pageNumber >= numPages}
                                onClick={() => setPageNumber(p => p + 1)}
                                className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 text-white"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    )}

                    {/* Close */}
                    <button 
                        onClick={() => setPreviewResource(null)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg"
                    >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
              </div>

              {/* PDF Container */}
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
                            <p>Failed to load PDF.</p>
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

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Resources;