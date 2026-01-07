import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Helmet } from 'react-helmet-async';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL;
const QUESTIONS_PER_PAGE = 15;
const SEARCH_DEBOUNCE_DELAY = 300;

// Reusing your badge components
const DifficultyBadge = ({ level }) => {
  const colors = {
    easy: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    hard: 'bg-red-500/20 text-red-300 border-red-500/30',
    expert: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  };
  const color = colors[level?.toLowerCase()] || colors.medium;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${color} uppercase`}>
      {level || 'Medium'}
    </span>
  );
};

const CategoryBadge = ({ category }) => {
  const colors = {
    probability: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    brainteasers: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    finance: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    programming: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    statistics: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    markets: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    options: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    stochastic: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
  };
  const color = colors[category?.toLowerCase()] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${color}`}>
      {category || 'General'}
    </span>
  );
};

const QuestionCard = React.memo(({ question, index, onExpand }) => {
  const [expanded, setExpanded] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const navigate = useNavigate();

  const toggleExpanded = useCallback(() => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (newExpanded) {
      onExpand?.(question.id);
    }
  }, [expanded, question.id, onExpand]);

  const handleShowAnswer = useCallback((e) => {
    e.stopPropagation();
    setShowAnswer(!showAnswer);
  }, [showAnswer]);

  const handleViewDetails = useCallback((e) => {
    e.stopPropagation();
    if (question.slug) {
      navigate(`/interview-questions/${question.slug}`);
    } else {
      // Fallback to ID if no slug
      navigate(`/interview-questions/${question.id}`);
    }
  }, [navigate, question.slug, question.id]);

  // Also update the card to show the slug in development if needed:
  {
    process.env.NODE_ENV === 'development' && question.slug && (
      <div className="text-xs text-slate-600 mt-2 font-mono">
        Slug: {question.slug}
      </div>
    )
  }

  return (
    <article
      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all duration-300 animate-in group cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
      id={`question-${question.id}`}
      onClick={toggleExpanded}
    >
      <div className="w-full text-left p-6 md:p-8">
        <div className="cursor-pointer flex flex-col md:flex-row md:items-start justify-between gap-4 outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 rounded-lg"
          role="button"
          aria-expanded={expanded}
          aria-controls={`answer-${question.id}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleExpanded();
            }
          }}
        >
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-sm font-bold text-slate-500">Q{question.id}</span>
              <DifficultyBadge level={question.difficulty} />
              <CategoryBadge category={question.category} />
              {question.firm && (
                <span className="text-xs font-bold text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700">
                  {question.firm}
                </span>
              )}
            </div>

            <h3 className="text-lg md:text-xl font-bold text-slate-100 mb-3 leading-relaxed group-hover:text-teal-300 transition-colors">
              {question.question}
            </h3>

            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-800/50 text-slate-400 text-xs rounded border border-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between md:justify-end md:w-40 gap-3">
            <button
              onClick={handleViewDetails}
              className="hidden md:inline-flex items-center px-3 py-1.5 text-xs font-medium text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 border border-teal-500/30 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
              aria-label={`View full details for question ${question.id}`}
            >
              Full Solution
            </button>
            <span className={`transition-transform duration-200 text-slate-500 ${expanded ? 'rotate-90' : ''}`} aria-hidden="true">
              ›
            </span>
          </div>
        </div>

        {/* CSS Grid Accordion Animation */}
        <div
          id={`answer-${question.id}`}
          className={`grid transition-[grid-template-rows] duration-200 ease-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          role="region"
          aria-labelledby={`question-${question.id}`}
        >
          <div className="overflow-hidden">
            <div className="pt-6 border-t border-slate-800 mt-6">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <button
                  onClick={handleShowAnswer}
                  className="px-4 py-2 text-sm font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-lg hover:bg-teal-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                >
                  {showAnswer ? 'Hide Solution' : 'Show Solution'}
                </button>

                <button
                  onClick={handleViewDetails}
                  className="px-4 py-2 text-sm font-bold bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                >
                  View Full Page
                </button>
              </div>

              {/* Answer Content Accordion */}
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${showAnswer ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
              >
                <div className="overflow-hidden">
                  <div className="text-slate-300 leading-relaxed space-y-4 prose prose-invert max-w-none">
                    {question.approach && (
                      <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                        <strong className="text-teal-400 block mb-1">Approach</strong>
                        <p className="line-clamp-3">{question.approach}</p>
                      </div>
                    )}

                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                      <strong className="text-white block mb-2">Answer</strong>
                      {typeof question.answer === 'string' ? (
                        <p className="whitespace-pre-wrap m-0 line-clamp-4">{question.answer}</p>
                      ) : (
                        <ul className="list-disc pl-5 space-y-2 m-0">
                          {question.answer?.slice(0, 3).map((point, idx) => (
                            <li key={idx} className="line-clamp-2">{point}</li>
                          ))}
                          {question.answer?.length > 3 && (
                            <li className="text-slate-500">... and {question.answer.length - 3} more points</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
});

QuestionCard.displayName = 'QuestionCard';

function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function InterviewQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(QUESTIONS_PER_PAGE);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const debouncedSearchQuery = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_DELAY);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/api/interview-questions`);

        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received');
        }

        setQuestions(data);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Unable to load questions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const categories = useMemo(() => {
    const allCategories = questions
      .map(q => q.category)
      .filter(Boolean);

    return ['all', ...new Set(allCategories)].sort();
  }, [questions]);

  const difficulties = ['all', 'easy', 'medium', 'hard', 'expert'];

  const filteredQuestions = useMemo(() => {
    return questions.filter(question => {
      if (selectedDifficulty !== 'all') {
        if (question.difficulty?.toLowerCase() !== selectedDifficulty) return false;
      }

      if (selectedCategory !== 'all') {
        if (question.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      }

      if (!debouncedSearchQuery.trim()) return true;

      const query = debouncedSearchQuery.toLowerCase();
      return (
        question.question?.toLowerCase().includes(query) ||
        question.answer?.toString().toLowerCase().includes(query) ||
        question.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        question.key_concepts?.some(concept => concept.toLowerCase().includes(query)) ||
        question.firm?.toLowerCase().includes(query)
      );
    });
  }, [questions, selectedDifficulty, selectedCategory, debouncedSearchQuery]);

  const visibleQuestions = useMemo(() =>
    filteredQuestions.slice(0, visibleCount),
    [filteredQuestions, visibleCount]
  );

  useEffect(() => {
    setVisibleCount(QUESTIONS_PER_PAGE);
  }, [selectedDifficulty, selectedCategory, debouncedSearchQuery]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + QUESTIONS_PER_PAGE, filteredQuestions.length));
  }, [filteredQuestions.length]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  const handleExpandQuestion = useCallback((questionId) => {
    setExpandedQuestionId(questionId);
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": filteredQuestions.slice(0, 50).map(question => ({
      "@type": "Question",
      "name": question.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": typeof question.answer === 'string' ? question.answer : question.answer?.join('\n')
      }
    }))
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4" role="status" aria-busy="true">
        <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" aria-hidden="true"></div>
        <p className="text-teal-500 font-mono text-sm animate-pulse">Loading Questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/50 border border-red-500/20 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Unable to Load Questions</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30">
      <Helmet>
        <title>Quantitative Finance Interview Questions | QuantFinanceWiki.com</title>
        <meta name="description" content="Comprehensive collection of quantitative finance interview questions with detailed solutions. Practice for trading, research, risk, and development roles." />
        <meta name="keywords" content="quant interview questions, quantitative finance interview, trading interview, risk interview, programming interview, brainteasers, probability questions, statistics interview" />
        <meta property="og:title" content="Quantitative Finance Interview Questions" />
        <meta property="og:description" content="Practice with 1000+ quant interview questions from top firms. Detailed solutions included." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://QuantFinanceWiki.com/interview-questions" />
        <link rel="canonical" href="https://QuantFinanceWiki.com/interview-questions" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <style type="text/css">{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-in {
            animation: fadeInUp 0.4s ease-out forwards;
            opacity: 0;
          }
        `}</style>
      </Helmet>

      <header className="relative border-b border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none" aria-hidden="true">
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10 animate-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider mb-6">
            Interview Preparation
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
            Quantitative Interview <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              Questions
            </span>
          </h1>
          <p className="text-slate-300 text-xl max-w-3xl leading-relaxed mb-8">
            Practice with questions from actual quantitative finance interviews.
            Includes probability, brainteasers, finance, programming, and statistics problems
            from top firms like Jane Street, Two Sigma, Citadel, and more.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-slate-300">{questions.length > 0 ? questions.length : '1000'}+ Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-sm text-slate-300">Detailed Solutions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-slate-300">Multiple Categories</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-[#0B1221] border border-slate-800/60 rounded-2xl p-6 mb-12 shadow-2xl">
          <div className="relative mb-6" role="search">
            <label htmlFor="search" className="sr-only">Search questions</label>
            <div className="relative">
              <input
                ref={searchInputRef}
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions, topics, or firms..."
                className="block w-full px-6 py-4 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                aria-controls="questions-list"
              />
              {searchQuery ? (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-slate-300 focus:outline-none focus:text-teal-400"
                  aria-label="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <span className="text-sm text-slate-400 font-medium mb-2 block">Difficulty</span>
              <div className="flex flex-wrap gap-2">
                {difficulties.map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold uppercase border transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500/50",
                      selectedDifficulty === diff
                        ? "bg-teal-500 border-teal-500 text-white"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                    )}
                    aria-label={`Filter by ${diff} difficulty`}
                    aria-pressed={selectedDifficulty === diff}
                  >
                    {diff === 'all' ? 'All Levels' : diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <span className="text-sm text-slate-400 font-medium mb-2 block">Category</span>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-bold border transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-teal-500/50",
                      selectedCategory === cat
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                    )}
                    aria-label={`Filter by ${cat} category`}
                    aria-pressed={selectedCategory === cat}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-slate-400">
            Showing <span className="font-bold text-white">{visibleQuestions.length}</span> of{" "}
            <span className="font-bold text-white">{filteredQuestions.length}</span> questions
            {debouncedSearchQuery && (
              <span> for "<span className="text-teal-400">{debouncedSearchQuery}</span>"</span>
            )}
            {selectedCategory !== 'all' && (
              <span> in <span className="text-blue-400">{selectedCategory}</span></span>
            )}
          </p>
          {(selectedDifficulty !== 'all' || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSelectedDifficulty('all');
                setSelectedCategory('all');
              }}
              className="text-sm text-teal-400 hover:text-teal-300 focus:outline-none focus:underline"
            >
              Clear all filters
            </button>
          )}
        </div>

        <div className="space-y-6" role="list" id="questions-list">
          {visibleQuestions.length > 0 ? (
            visibleQuestions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                onExpand={handleExpandQuestion}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20" role="alert">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-500 mb-2">No questions found</p>
              <p className="text-slate-400 text-sm mb-4">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDifficulty('all');
                  setSelectedCategory('all');
                }}
                className="text-teal-400 hover:text-teal-300 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/50 px-3 py-1 rounded"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        {visibleCount < filteredQuestions.length && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={handleLoadMore}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-teal-400 font-bold rounded-xl border border-slate-800 hover:border-teal-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Load ${Math.min(QUESTIONS_PER_PAGE, filteredQuestions.length - visibleCount)} more questions`}
            >
              Load More ({filteredQuestions.length - visibleCount} remaining)
            </button>
          </div>
        )}

        <div className="mt-20 p-8 bg-slate-900/30 rounded-2xl border border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-6">How to Use This Resource</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-800/20 rounded-xl border border-slate-800">
              <div className="w-12 h-12 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-teal-400">1</span>
              </div>
              <h3 className="font-bold text-slate-100 mb-2">Practice Regularly</h3>
              <p className="text-slate-400 text-sm">Work through questions daily. Start with easy problems and gradually increase difficulty.</p>
            </div>
            <div className="p-6 bg-slate-800/20 rounded-xl border border-slate-800">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-400">2</span>
              </div>
              <h3 className="font-bold text-slate-100 mb-2">Understand Solutions</h3>
              <p className="text-slate-400 text-sm">Don't just read answers. Work through the solution approach and understand the underlying concepts.</p>
            </div>
            <div className="p-6 bg-slate-800/20 rounded-xl border border-slate-800">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-amber-400">3</span>
              </div>
              <h3 className="font-bold text-slate-100 mb-2">Time Yourself</h3>
              <p className="text-slate-400 text-sm">Simulate real interview conditions. Time your responses and practice explaining your thought process out loud.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>Questions are compiled from actual quantitative finance interviews and publicly available sources.</p>
          <p className="mt-2">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </main>
    </div>
  );
}

export default InterviewQuestions;