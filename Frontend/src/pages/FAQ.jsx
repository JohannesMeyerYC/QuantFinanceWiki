import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Helmet } from 'react-helmet';

function cn(...inputs) { return twMerge(clsx(inputs)); }

function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndices, setOpenIndices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetch('/api/faq')
      .then(res => res.json())
      .then(data => { setFaqs(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  useEffect(() => { setOpenIndices([]); }, [searchTerm, selectedCategory]);

  const categories = ['all', ...new Set(faqs.map(faq => faq.category).filter(Boolean))];

  const filteredFaqs = faqs.filter(faq => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      faq.question?.toLowerCase().includes(searchLower) ||
      faq.answer?.toLowerCase().includes(searchLower);
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (index) => {
    setOpenIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center" role="status" aria-busy="true">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <p className="text-teal-500 font-mono text-xs">Loading Answers...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      <Helmet>
        <title>Common Questions | Quant.com</title>
        <meta name="description" content="Frequently asked questions about quantitative finance careers, mathematics requirements, and interview preparation." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Helmet>
      
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden" aria-hidden="true">
           <div className="absolute top-0 right-10 w-48 h-48 md:w-64 md:h-64 bg-teal-500/5 rounded-full blur-[60px] md:blur-[80px]"></div>
        </div>

        <header className="text-center mb-8 md:mb-16 relative z-10 pt-12 md:pt-0">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 md:mb-6 tracking-tight">
            Common Questions
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-2">
            Read answers to questions about math, interviews, and jobs.
          </p>
        </header>

        <section className="sticky top-2 md:top-4 z-30 mb-6 md:mb-8" aria-label="Search and Filters">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-2xl flex flex-col gap-3 md:gap-4">
            <div className="w-full">
              <label htmlFor="faq-search" className="sr-only">Search for answers</label>
              <input 
                id="faq-search"
                type="text" 
                placeholder="Search for answers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                // Text-base prevents iOS zoom
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-base md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
            
            <div 
              className={cn(
                "flex items-center gap-2 overflow-x-auto w-full",
                "pb-1", 
                "snap-x",
                "[&::-webkit-scrollbar]:h-1.5",
                "[&::-webkit-scrollbar-track]:bg-transparent",
                "[&::-webkit-scrollbar-thumb]:bg-slate-800",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "[&::-webkit-scrollbar-thumb]:hover:bg-teal-500/50"
              )}
              role="tablist"
              aria-label="Filter by category"
            >
              <span className="text-xs font-bold text-slate-500 uppercase mr-1 flex-shrink-0" id="filter-label">Filter:</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  role="tab"
                  aria-selected={selectedCategory === cat}
                  aria-controls="faq-list"
                  className={cn(
                    "px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border snap-center",
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
        </section>

        <div id="faq-list" className="space-y-3 md:space-y-4 relative z-10 pb-12" role="presentation">
          <LayoutGroup>
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndices.includes(index);
              const answerId = `faq-answer-${index}`;
              const headerId = `faq-header-${index}`;

              return (
                <motion.article 
                  layout
                  key={index}
                  className={cn(
                    "bg-slate-900 border rounded-xl md:rounded-2xl overflow-hidden transition-colors duration-300",
                    isOpen ? "border-teal-500/50 bg-slate-900/80 shadow-lg shadow-black/20" : "border-slate-800 hover:border-slate-700"
                  )}
                  itemScope
                  itemType="https://schema.org/Question"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    id={headerId}
                    className="w-full text-left px-5 py-4 md:px-6 md:py-5 flex justify-between items-start gap-3 md:gap-4 cursor-pointer active:bg-slate-800 transition-colors"
                  >
                    <div className="flex-1">
                      <h2 
                        className={cn("font-bold text-base md:text-lg leading-snug transition-colors", isOpen ? "text-teal-100" : "text-slate-200")}
                        itemProp="name"
                      >
                        {faq.question}
                      </h2>
                      {faq.category && (
                        <span className="inline-block mt-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          {faq.category}
                        </span>
                      )}
                    </div>
                    <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 flex-shrink-0 mt-0.5",
                        isOpen ? "bg-teal-500/10 border-teal-500/50 text-teal-400" : "bg-slate-800 border-slate-700 text-slate-500"
                    )} aria-hidden="true">
                        <span className={cn("text-lg leading-none transform transition-transform duration-300", isOpen ? "rotate-45" : "rotate-0")}>
                          +
                        </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        id={answerId}
                        role="region"
                        aria-labelledby={headerId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                        itemScope
                        itemType="https://schema.org/Answer"
                        itemProp="acceptedAnswer"
                      >
                        <div className="px-5 pb-5 md:px-6 md:pb-6 pt-0">
                          <div 
                            className="pt-3 md:pt-4 border-t border-slate-800/50 text-slate-300 leading-relaxed whitespace-pre-line text-sm md:text-base"
                            itemProp="text"
                          >
                            {faq.answer}
                          </div>
                          {faq.answeredBy && (
                            <div className="mt-4 flex justify-end">
                              <span className="text-[10px] md:text-xs text-teal-500 font-mono bg-teal-950/30 px-2 py-1 rounded border border-teal-900/30">
                                Answered by: <span itemProp="author">{faq.answeredBy}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </LayoutGroup>
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 mt-8" role="alert">
            <h3 className="text-base font-bold text-slate-300 mb-2">No results found</h3>
            <p className="text-sm text-slate-500 mb-6">We could not find any questions for your search.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
              className="text-teal-400 hover:text-teal-300 font-bold text-sm hover:underline p-2"
            >
              Clear Search
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default FAQ;