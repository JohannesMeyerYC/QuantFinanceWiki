import { useState, useEffect } from 'react'

function FAQ() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  // Changed to array to support multiple open items (Expand All feature)
  const [openIndices, setOpenIndices] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetch('/api/faq')
      .then(res => res.json())
      .then(data => {
        setFaqs(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching FAQs:', err)
        setLoading(false)
      })
  }, [])

  // Auto-collapse items when filters change to prevent index mismatch confusion
  useEffect(() => {
    setOpenIndices([])
  }, [searchTerm, selectedCategory])

  // Derive unique categories dynamically
  const categories = ['all', ...new Set(faqs.map(faq => faq.category).filter(Boolean))]

  // Advanced Filtering Logic
  const filteredFaqs = faqs.filter(faq => {
    // Ensure properties exist
    const question = faq.question || ''
    const answer = faq.answer || ''
    const category = faq.category || ''
    const searchLower = searchTerm.toLowerCase()

    const matchesSearch = 
      question.toLowerCase().includes(searchLower) ||
      answer.toLowerCase().includes(searchLower)
    
    const matchesCategory = selectedCategory === 'all' || category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Toggle single item logic
  const toggleFAQ = (index) => {
    setOpenIndices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    )
  }

  // Global actions
  const expandAll = () => setOpenIndices(filteredFaqs.map((_, i) => i))
  const collapseAll = () => setOpenIndices([])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-emerald-500 font-mono text-lg animate-pulse">Loading knowledge base...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Deep dive into the mechanics of quantitative finance careers, interviews, and algorithms.
          </p>
        </div>

        {/* Controls Dashboard */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 mb-8 shadow-xl">
            
            {/* Search Bar */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search by keyword, topic, or concept..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
            </div>

            {/* Filter & Action Row */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            

                {/* Bulk Actions */}
                <div className="flex gap-4 text-sm font-medium whitespace-nowrap">
                    <button 
                        onClick={expandAll}
                        className="text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                        Expand All
                    </button>
                    <span className="text-slate-700 hidden md:inline">|</span>
                    <button 
                        onClick={collapseAll}
                        className="text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                        Collapse All
                    </button>
                </div>
            </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndices.includes(index)
            return (
                <div 
                    key={index} 
                    className={`bg-slate-900 rounded-xl border transition-all duration-300 ${
                        isOpen ? 'border-emerald-500/30 shadow-[0_0_20px_-10px_rgba(16,185,129,0.1)]' : 'border-slate-800 hover:border-slate-700'
                    }`}
                >
                    <button
                        onClick={() => toggleFAQ(index)}
                        className="w-full px-6 py-5 text-left flex justify-between items-start gap-4"
                    >
                        <div className="flex-1">
                            <h3 className={`font-semibold text-lg leading-snug transition-colors ${isOpen ? 'text-emerald-400' : 'text-slate-200'}`}>
                                {faq.question}
                            </h3>
                            {faq.category && (
                                <div className="mt-2 flex items-center gap-2">
                                     <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                     <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">{faq.category}</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Chevron Icon */}
                        <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-emerald-500/20 border-emerald-500 rotate-180' : 'bg-slate-800'}`}>
                             <svg className={`w-3 h-3 ${isOpen ? 'text-emerald-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </button>
                    
                    {/* Accordion Content */}
                    <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        <div className="px-6 pb-6 pt-0 text-slate-400 leading-relaxed border-t border-slate-800/50 mt-2">
                            <div className="pt-4 whitespace-pre-line">
                                {faq.answer}
                            </div>
                            {faq.answeredBy && (
                                <div className="mt-4 flex justify-end">
                                    <span className="text-xs font-mono text-emerald-500/60 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/30">
                                        Answered by: {faq.answeredBy}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredFaqs.length === 0 && (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 mt-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 mb-4">
                <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">No results found</h3>
            <p className="text-slate-500 mb-6">We couldn't find any questions matching your current filters.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
              className="text-emerald-400 hover:text-emerald-300 font-medium text-sm hover:underline"
            >
              Clear filters and search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default FAQ