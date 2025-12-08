import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-teal-500 font-mono text-xs">Loading Answers...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30">
      
      <main className="max-w-4xl mx-auto px-4 py-20 relative">
        
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
           <div className="absolute top-0 right-10 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px]"></div>
        </div>

        {/* Header */}
        <header className="text-center mb-16 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Common Questions
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Read answers to questions about math, interviews, and jobs.
          </p>
        </header>

        {/* Search & Filter Container */}
        <div className="sticky top-4 z-20 mb-8">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl flex flex-col gap-4">
            
            {/* Search Input */}
            <div className="w-full">
              <input 
                type="text" 
                placeholder="Search for answers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
            
            {/* Categories */}
            <div className={cn(
              "flex items-center gap-2 overflow-x-auto w-full",
              "pb-2", 
              "[&::-webkit-scrollbar]:h-1.5",
              "[&::-webkit-scrollbar-track]:bg-transparent",
              "[&::-webkit-scrollbar-thumb]:bg-slate-800",
              "[&::-webkit-scrollbar-thumb]:rounded-full",
              "[&::-webkit-scrollbar-thumb]:hover:bg-teal-500/50"
            )}>
              <span className="text-xs font-bold text-slate-500 uppercase mr-2 flex-shrink-0">Filter:</span>
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
        </div>

        {/* FAQ List */}
        <div className="space-y-4 relative z-10">
          <LayoutGroup>
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndices.includes(index);
              return (
                <motion.article 
                  layout
                  key={index}
                  className={cn(
                    "bg-slate-900 border rounded-2xl overflow-hidden transition-colors duration-300",
                    isOpen ? "border-teal-500/50 bg-slate-900/80 shadow-lg shadow-black/20" : "border-slate-800 hover:border-slate-700"
                  )}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left px-6 py-5 flex justify-between items-start gap-4"
                  >
                    <div className="flex-1">
                      <h2 className={cn("font-bold text-lg leading-snug transition-colors", isOpen ? "text-teal-100" : "text-slate-200")}>
                        {faq.question}
                      </h2>
                      {faq.category && (
                        <span className="inline-block mt-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          {faq.category}
                        </span>
                      )}
                    </div>
                    {/* CSS Only Arrow/State Indicator */}
                    <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-300 flex-shrink-0",
                        isOpen ? "bg-teal-500/10 border-teal-500/50 text-teal-400" : "bg-slate-800 border-slate-700 text-slate-500"
                    )}>
                        <span className={cn("text-lg leading-none transform transition-transform duration-300", isOpen ? "rotate-45" : "rotate-0")}>
                          +
                        </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-0">
                          <div className="pt-4 border-t border-slate-800/50 text-slate-300 leading-relaxed whitespace-pre-line text-base">
                            {faq.answer}
                          </div>
                          {faq.answeredBy && (
                            <div className="mt-4 flex justify-end">
                              <span className="text-xs text-teal-500 font-mono bg-teal-950/30 px-2 py-1 rounded border border-teal-900/30">
                                Answered by: {faq.answeredBy}
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
          <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 mt-8">
            <h3 className="text-lg font-bold text-slate-300 mb-2">No results found</h3>
            <p className="text-slate-500 mb-6">We could not find any questions for your search.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
              className="text-teal-400 hover:text-teal-300 font-bold text-sm hover:underline"
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