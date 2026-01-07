import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Giscus from '@giscus/react';
import { RenderBlock } from './RenderBlock';

const API_URL = import.meta.env.VITE_API_URL;
const SITE_URL = "https://QuantFinanceWiki.com";

// Badge components
const DifficultyBadge = ({ level }) => {
  const colors = {
    easy: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    hard: 'bg-red-500/20 text-red-300 border-red-500/30',
    expert: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  };
  const color = colors[level?.toLowerCase()] || colors.medium;
  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-bold border ${color} uppercase`}>
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
    <span className={`px-3 py-1.5 rounded-full text-sm font-bold border ${color}`}>
      {category || 'General'}
    </span>
  );
};

// Utils
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const getQuestionPath = q => `/interview-questions/${q.slug ?? q.id}`;

const convertAnswerToBlocks = (answer) => {
  if (!answer) return [];
  if (typeof answer === 'string') {
    if (answer.includes('\n\n') || answer.includes('##') || answer.includes('* ') || answer.includes('1. ')) {
      return parseMarkdownToBlocks(answer);
    }
    return [{ type: 'paragraph', text: answer }];
  } else if (Array.isArray(answer)) {
    const listItems = answer.map((item, index) => `${index + 1}. ${item}`).join('\n');
    return parseMarkdownToBlocks(listItems);
  }
  return [];
};

const parseMarkdownToBlocks = (text) => {
  if (!text) return [];
  const blocks = [];
  const lines = text.split('\n');
  let currentParagraph = '';
  let inList = false;
  let listItems = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (currentParagraph) {
        blocks.push({ type: 'paragraph', text: currentParagraph });
        currentParagraph = '';
      }
      if (listItems.length > 0) {
        blocks.push({ type: 'paragraph', text: listItems.join('\n') });
        listItems = [];
        inList = false;
      }
      continue;
    }

    if (line.startsWith('#')) {
      if (currentParagraph) {
        blocks.push({ type: 'paragraph', text: currentParagraph });
        currentParagraph = '';
      }
      const level = (line.match(/^#+/)?.[0] || '').length;
      const headingText = line.replace(/^#+\s*/, '');
      blocks.push({ type: 'heading', level: Math.min(level, 4), text: headingText });
      continue;
    }

    if (line.match(/^[*-]\s/) || line.match(/^\d+\.\s/)) {
      if (currentParagraph) {
        blocks.push({ type: 'paragraph', text: currentParagraph });
        currentParagraph = '';
      }
      listItems.push(line);
      inList = true;
      continue;
    }

    if (line.startsWith('$$') && line.endsWith('$$')) {
      if (currentParagraph) {
        blocks.push({ type: 'paragraph', text: currentParagraph });
        currentParagraph = '';
      }
      blocks.push({ type: 'latex', text: line.slice(2, -2).trim() });
      continue;
    }

    if (line.includes('$') && line.includes('$$')) {
      currentParagraph += currentParagraph ? ' ' + line : line;
      continue;
    }

    if (inList) {
      blocks.push({ type: 'paragraph', text: listItems.join('\n') });
      listItems = [];
      inList = false;
    }

    currentParagraph += currentParagraph ? ' ' + line : line;
  }

  if (currentParagraph) blocks.push({ type: 'paragraph', text: currentParagraph });
  if (listItems.length > 0) blocks.push({ type: 'paragraph', text: listItems.join('\n') });

  return blocks;
};

// Main Component
export default function InterviewQuestionDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const scrollProgressRef = useRef(0);

  // --- MOVED UP: Hooks must be called before any conditional returns ---
  const convertToBlocks = useCallback((text) => text ? parseMarkdownToBlocks(text) : [], []);

  const shuffledRelatedQuestions = useMemo(() => {
    return shuffleArray(relatedQuestions);
  }, [relatedQuestions]);
  // --------------------------------------------------------------------

  const fetchRelatedQuestions = async (currentQuestion) => {
    try {
      const response = await fetch(
        `${API_URL}/api/interview-questions/search?` + 
        new URLSearchParams({
          category: currentQuestion.category,
          difficulty: currentQuestion.difficulty,
          limit: '8'
        })
      );
      if (response.ok) {
        const data = await response.json();
        const filtered = data.results.filter(q => q.slug !== slug && q.id !== currentQuestion.id && q.question !== currentQuestion.question);
        const sorted = filtered.sort((a, b) => {
          let scoreA = 0, scoreB = 0;
          if (currentQuestion.tags && a.tags) scoreA += a.tags.filter(tag => currentQuestion.tags.includes(tag)).length * 2;
          if (currentQuestion.tags && b.tags) scoreB += b.tags.filter(tag => currentQuestion.tags.includes(tag)).length * 2;
          if (currentQuestion.key_concepts && a.key_concepts) scoreA += a.key_concepts.filter(k => currentQuestion.key_concepts.includes(k)).length;
          if (currentQuestion.key_concepts && b.key_concepts) scoreB += b.key_concepts.filter(k => currentQuestion.key_concepts.includes(k)).length;
          if (currentQuestion.firm && a.firm === currentQuestion.firm) scoreA += 1;
          if (currentQuestion.firm && b.firm === currentQuestion.firm) scoreB += 1;
          return scoreB - scoreA;
        });
        setRelatedQuestions(sorted.slice(0, 4));
      }
    } catch (err) {
      console.error('Error fetching related questions:', err);
    }
  };

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/interview-questions/${slug}`);
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Question not found' : 'Failed to load question');
        }
        const data = await response.json();
        setQuestion(data);
        if (data.category) fetchRelatedQuestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchQuestion();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      scrollProgressRef.current = totalHeight > 0 ? scrollPosition / totalHeight : 0;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
      <p className="text-teal-500 font-mono text-sm animate-pulse">Loading Question...</p>
    </div>
  );

  if (error || !question) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Question Not Found</h2>
        <p className="text-slate-400 mb-8">{error || 'The question could not be loaded.'}</p>
        <Link to="/interview-questions" className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold transition-colors inline-block">
          Back to All Questions
        </Link>
      </div>
    </div>
  );

  const canonicalUrl = `${SITE_URL}/interview-questions/${slug}`;
  const answerBlocks = convertAnswerToBlocks(question.answer);
  const approachBlocks = convertToBlocks(question.approach || '');

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "mainEntity": {
      "@type": "Question",
      "name": question.question,
      "text": question.question,
      "answerCount": 1,
      "dateCreated": new Date().toISOString(),
      "author": { "@type": "Organization", "name": "QuantFinanceWiki" },
      "acceptedAnswer": {
        "@type": "Answer",
        "text": typeof question.answer === 'string' ? question.answer : question.answer?.join('\n'),
        "dateCreated": new Date().toISOString(),
        "author": { "@type": "Organization", "name": "QuantFinanceWiki" }
      },
      "keywords": question.tags?.join(', ') || question.category
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-teal-500/30">
      <Helmet>
        <title>{`${question.question.substring(0, 60)}... | QuantFinanceWiki Interview Questions`}</title>
        <meta name="description" content={`Quant interview question solution: ${question.question.substring(0, 150)}...`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${question.question.substring(0, 60)}... | QuantFinanceWiki`} />
        <meta property="og:description" content={`Solution to a ${question.difficulty} ${question.category} interview question from ${question.firm || 'top quant firms'}.`} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <style type="text/css">{`
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slideUpFade 0.4s ease-out forwards;
          }
        `}</style>
      </Helmet>

      {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-600 to-emerald-400 origin-left z-50 transition-transform duration-100 ease-out"
        style={{ transform: `scaleX(${scrollProgressRef.current})` }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-16">
        <Link 
          to="/interview-questions" 
          className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-teal-400 mb-8 transition-colors group focus:outline-none focus:text-teal-400"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> 
          <span>Back to All Questions</span>
        </Link>

        <div className="animate-slide-up">
          {/* Question Header */}
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-mono border border-slate-700">
                ID: #{question.id}
              </span>
              <DifficultyBadge level={question.difficulty} />
              <CategoryBadge category={question.category} />
              {question.firm && (
                <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-bold border border-slate-600">
                  {question.firm}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-6">
              {question.question}
            </h1>

            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag, idx) => (
                  <span key={idx} className="text-sm text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Solution Container */}
          <div className="space-y-8">
            {/* Approach Section */}
            {approachBlocks.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-teal-400 mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Approach & Thought Process
                </h3>
                <div className="space-y-6">
                  {approachBlocks.map((block, index) => (
                    <RenderBlock key={`approach-${index}`} block={block} />
                  ))}
                </div>
                
                {question.key_concepts && question.key_concepts.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-slate-800">
                    <h4 className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-4">Key Concepts</h4>
                    <div className="flex flex-wrap gap-3">
                      {question.key_concepts.map((concept, i) => (
                        <span key={i} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium border border-slate-700">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Main Answer Section */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-700 rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-teal-500/10 transition-all duration-700"></div>
              
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <svg className="w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Solution
              </h3>
              
              <div className="relative z-10 space-y-6">
                {answerBlocks.length > 0 ? (
                  answerBlocks.map((block, index) => (
                    <RenderBlock key={`answer-${index}`} block={block} />
                  ))
                ) : (
                  <div className="text-slate-300 text-lg leading-relaxed">
                    {typeof question.answer === 'string' ? (
                      <p>{question.answer}</p>
                    ) : (
                      <ul className="list-disc pl-5 space-y-3">
                        {question.answer?.map((point, idx) => (
                          <li key={idx} className="leading-relaxed">{point}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Follow Up & Reference */}
            {(question.follow_up || question.reference) && (
              <div className="grid md:grid-cols-2 gap-6">
                {question.follow_up && (
                  <div className="bg-slate-900/30 border border-amber-500/20 rounded-xl p-6">
                    <h4 className="text-amber-400 font-bold mb-2 text-sm uppercase tracking-wide flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Follow-up Question
                    </h4>
                    <p className="text-slate-300 font-medium">{question.follow_up}</p>
                  </div>
                )}
                
                {question.reference && (
                  <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
                    <h4 className="text-slate-500 font-bold mb-2 text-sm uppercase tracking-wide flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Reference / Topic
                    </h4>
                    <p className="text-slate-300 font-medium">{question.reference}</p>
                  </div>
                )}
              </div>
            )}

            {shuffledRelatedQuestions.length > 0 && (
              <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Related Questions</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {shuffledRelatedQuestions.map((relatedQ) => (
                    <Link
                      key={relatedQ.id}
                      to={`/interview-questions/${relatedQ.slug || relatedQ.id}`}
                      className="p-4 bg-slate-800/30 border border-slate-700 rounded-xl hover:border-teal-500/50 transition-colors group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <DifficultyBadge level={relatedQ.difficulty} />
                        <span className="text-xs text-slate-400">{relatedQ.category}</span>
                      </div>
                      <p className="text-slate-300 group-hover:text-teal-300 transition-colors line-clamp-2">
                        {relatedQ.question}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="bg-slate-900/20 border border-slate-800 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Community Discussion</h3>
              <p className="text-slate-300 mb-8">
                Discuss this question, share alternative solutions, or ask for clarification. 
                The comment section is moderated to maintain high-quality discussions.
              </p>
              
              <Giscus
                id="comments"
                repo="JohannesMeyerYC/comments"
                repoId="R_kgDOQtFBRg"
                category="Announcements"
                categoryId="DIC_kwDOQtFBRs4C0Hee"
                mapping="pathname"
                strict="0"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="top"
                theme="dark"
                lang="en"
                loading="lazy"
              />
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <Link 
                  to="/interview-questions"
                  className="group inline-flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700"
                >
                  <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to All Questions
                </Link>
              </div>
              
              <div className="flex items-center gap-3">
                <Link
                  to={`/interview-questions?category=${encodeURIComponent(question.category)}`}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
                >
                  More {question.category} Questions →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-12 p-6 bg-slate-900/30 border border-slate-800 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Quantitative Interview Preparation</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            This {question.difficulty?.toLowerCase()} {question.category?.toLowerCase()} question is part of the QuantFinanceWiki interview question database. 
            The database contains {question.firm ? `questions from ${question.firm} and ` : ''}other top quantitative finance firms. 
            Practice with questions categorized by difficulty, topic, and firm to prepare for interviews in quantitative trading, 
            research, risk management, and software engineering roles.
          </p>
        </div>
      </div>
    </div>
  );
}