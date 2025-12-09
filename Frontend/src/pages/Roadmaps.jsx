import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Helmet } from 'react-helmet-async';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL;


function Roadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/roadmaps`)
      .then(res => res.json())
      .then(data => {
        setRoadmaps(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching roadmaps:', err);
        setLoading(false);
      });
  }, []);

  const filteredRoadmaps = roadmaps.filter(roadmap =>
    roadmap.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    roadmap.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Quantitative Finance Career Roadmaps",
    "description": "Comprehensive guides for quantitative finance careers, including algorithmic trading, risk management, and financial engineering.",
    "url": "https://QuantFinanceWiki.com/roadmaps",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": filteredRoadmaps.map((roadmap, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://QuantFinanceWiki.com/roadmaps/${roadmap.id}`,
        "name": roadmap.title,
        "description": roadmap.description
      }))
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4" role="status" aria-busy="true">
        <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" aria-hidden="true"></div>
        <p className="text-teal-500 font-mono text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30">
      <Helmet>
        <title>Career Roadmaps | QuantFinanceWiki.com</title>
        <meta name="description" content="Explore step-by-step career guides for Quantitative Research, Trading, and Development. Find the right path for your skills." />
        <meta property="og:title" content="QuantFinanceWiki.com Career Roadmaps" />
        <meta property="og:description" content="Choose your path in quantitative finance." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://QuantFinanceWiki.com/roadmaps" />
        <link rel="canonical" href="https://QuantFinanceWiki.com/roadmaps" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <header className="relative border-b border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none" aria-hidden="true">
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider mb-6">
            Career Guides
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
            Choose Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              Path
            </span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl leading-relaxed">
            Guides for quantitative finance jobs. Learn about trading, risk management, and more. Find the right path for you.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">

        <div className="relative max-w-lg mb-12" role="search">
          <label htmlFor="search" className="sr-only">Filter guides</label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a career path..."
            className="block w-full px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
        >
          {filteredRoadmaps.length > 0 ? (
            filteredRoadmaps.map(roadmap => (
              <motion.article key={roadmap.id} variants={item} role="listitem">
                <Link
                  to={`/roadmaps/${roadmap.id}`}
                  className="group flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-teal-500/50 transition-all duration-300 hover:shadow-[0_0_30px_-15px_rgba(20,184,166,0.3)] relative overflow-hidden"
                  aria-label={`View roadmap for ${roadmap.title}`}
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all duration-500" aria-hidden="true"></div>

                  <div className="relative z-10 flex flex-col h-full">
                    <h2 className="text-2xl font-bold text-slate-100 mb-3 group-hover:text-teal-400 transition-colors">
                      {roadmap.title}
                    </h2>
                    <p className="text-slate-400 leading-relaxed mb-8 flex-grow">
                      {roadmap.description.split('. ')[0] + (roadmap.description.includes('.') ? '.' : '')}
                    </p>


                    <div className="flex items-center text-sm font-bold text-teal-500 mt-auto uppercase tracking-wide" aria-hidden="true">
                      <span className="group-hover:-translate-x-1 transition-transform duration-300">Read Guide</span>
                      <span className="text-lg leading-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 ml-2">→</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20" role="alert">
              <p className="text-slate-500">No guides found for "{searchQuery}"</p>
              <button onClick={() => setSearchQuery('')} className="mt-2 text-teal-400 hover:underline">Clear Search</button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default Roadmaps;