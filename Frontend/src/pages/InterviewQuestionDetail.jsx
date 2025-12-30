import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { m } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const API_URL = import.meta.env.VITE_API_URL;

const DifficultyBadge = ({ level }) => {
  const colors = {
    easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    hard: 'bg-red-500/10 text-red-400 border-red-500/20',
    expert: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };
  const color = colors[level?.toLowerCase()] || colors.medium;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${color} uppercase tracking-wider`}>
      {level || 'Medium'}
    </span>
  );
};

export default function InterviewQuestionDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        // This hits your Python endpoint: /api/interview-questions/<slug>
        const response = await fetch(`${API_URL}/api/interview-questions/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) throw new Error('Question not found');
          throw new Error('Failed to load question');
        }

        const data = await response.json();
        setQuestion(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchQuestion();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
        <p className="text-teal-500 font-mono text-sm animate-pulse">Loading Question...</p>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Question Not Found</h2>
          <p className="text-slate-400 mb-8">The question you are looking for doesn't exist or has been moved.</p>
          <Link to="/interview-questions" className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold transition-colors">
            Back to All Questions
          </Link>
        </div>
      </div>
    );
  }

  // Schema Markup for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "mainEntity": {
      "@type": "Question",
      "name": question.question,
      "text": question.question,
      "answerCount": 1,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": Array.isArray(question.answer) ? question.answer.join(' ') : question.answer,
        "upvoteCount": 0
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30">
      <Helmet>
        <title>{`Q${question.id}: ${question.category} Question | QuantFinanceWiki`}</title>
        <meta name="description" content={`Quant interview question from ${question.firm || 'Top Firms'}: ${question.question.substring(0, 150)}...`} />
        <link rel="canonical" href={`https://QuantFinanceWiki.com/interview-questions/${slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Header / Breadcrumb */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-teal-400 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/interview-questions" className="hover:text-teal-400 transition-colors">Interview Questions</Link>
            <span>/</span>
            <span className="text-slate-300 truncate max-w-[200px]">{question.category}</span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Question Header */}
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-mono border border-slate-700">
                ID: #{question.id}
              </span>
              <DifficultyBadge level={question.difficulty} />
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold border border-blue-500/20 uppercase">
                {question.category}
              </span>
              {question.firm && (
                <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-bold border border-slate-600">
                  {question.firm}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-6">
              {question.question}
            </h1>

            {question.tags && (
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag, idx) => (
                  <span key={idx} className="text-sm text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Solution Container */}
          <div className="space-y-8">
            {/* Approach Section */}
            {question.approach && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-teal-400 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Approach & Intuition
                </h3>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {question.approach}
                </p>
                
                {question.key_concepts && question.key_concepts.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <span className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-3 block">Key Concepts</span>
                    <div className="flex flex-wrap gap-2">
                      {question.key_concepts.map((concept, i) => (
                        <span key={i} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-sm font-medium">
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
              
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <svg className="w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Formal Solution
              </h3>
              
              <div className="prose prose-invert max-w-none relative z-10">
                {typeof question.answer === 'string' ? (
                  <div className="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                    {question.answer}
                  </div>
                ) : (
                  <ul className="list-disc pl-5 space-y-3 text-slate-200 text-lg">
                    {question.answer.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Follow Up & Reference */}
            <div className="grid md:grid-cols-2 gap-6">
              {question.follow_up && (
                <div className="bg-slate-900/30 border border-amber-500/20 rounded-xl p-6">
                  <h4 className="text-amber-400 font-bold mb-2 text-sm uppercase tracking-wide">Follow-up Question</h4>
                  <p className="text-slate-300 font-medium">{question.follow_up}</p>
                </div>
              )}
              
              {question.reference && (
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
                  <h4 className="text-slate-500 font-bold mb-2 text-sm uppercase tracking-wide">Reference / Topic</h4>
                  <p className="text-slate-300 font-medium">{question.reference}</p>
                </div>
              )}
            </div>

            <div className="pt-12 mt-12 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
  <div>
    <Link 
      to="/interview-questions"
      className="group inline-flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg"
    >
      <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to All Questions
    </Link>
  </div>
  
  {/* Next/Previous Navigation */}
  <div className="flex items-center gap-3">
    <button
      onClick={() => navigate(-1)}
      className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
    >
      ← Previous
    </button>
    <button
      onClick={() => {
        // You could implement logic to go to next question by ID
        const nextId = parseInt(question.id) + 1;
        // This would require fetching the next question's slug
        // For now, go back to list
        navigate('/interview-questions');
      }}
      className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
    >
      Random Question →
    </button>
  </div>
</div>
          </div>
        </m.div>
      </main>
    </div>
  );
}