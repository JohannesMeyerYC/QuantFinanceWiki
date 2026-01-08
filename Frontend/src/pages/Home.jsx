import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const socials = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/johannes-meyer-young-and-calculated',
    color: 'hover:text-[#0077b5]',
    icon: <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
  },
  {
    name: 'GitHub',
    url: 'https://github.com/JohannesMeyerYC',
    color: 'hover:text-white',
    icon: <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
  },
  {
    name: 'Discord',
    url: 'https://discord.gg/JenRWVCfzh',
    color: 'hover:text-[#5865F2]',
    icon: <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" /></svg>
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@quantenthusiasts',
    color: 'hover:text-[#FF0000]',
    icon: <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/quant_enthusiasts',
    color: 'hover:text-[#E1306C]',
    icon: <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
  },
 {
  name: 'PayPal',
  url: 'https://paypal.me/youngandcalculated',
  color: 'hover:text-[#0070BA]',
  icon: (
    <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
<path d="M20.43705,7.10449a3.82273,3.82273,0,0,0-.57281-.5238,4.72529,4.72529,0,0,0-1.15766-3.73987C17.6226,1.61914,15.77494,1,13.2144,1H7.00053A1.89234,1.89234,0,0,0,5.13725,2.5918L2.5474,18.99805A1.53317,1.53317,0,0,0,4.063,20.7832H6.72709l-.082.52051A1.46684,1.46684,0,0,0,8.0933,23h3.23438a1.76121,1.76121,0,0,0,1.751-1.46973l.64063-4.03125.01074-.05468h.29883c4.03223,0,6.55078-1.99317,7.28516-5.7627A5.149,5.149,0,0,0,20.43705,7.10449ZM7.84233,13.7041l-.71448,4.53528-.08631.54382H4.606L7.09721,3H13.2144c1.93554,0,3.31738.4043,3.99218,1.16406a2.96675,2.96675,0,0,1,.60791,2.73334l-.01861.11224c-.01215.07648-.0232.15119-.0434.24622a5.84606,5.84606,0,0,1-2.00512,3.67053,6.67728,6.67728,0,0,1-4.21753,1.183H9.70658A1.87969,1.87969,0,0,0,7.84233,13.7041Zm11.50878-2.40527c-.55078,2.82812-2.24218,4.14551-5.32226,4.14551h-.4834a1.76109,1.76109,0,0,0-1.751,1.47265l-.64941,4.07422L8.71733,21l.47815-3.03387.61114-3.85285h1.7193c.1568,0,.29541-.02356.44812-.02893.35883-.01239.71661-.02618,1.05267-.06787.20526-.02557.39362-.07221.59034-.1087.27252-.05036.54522-.10016.80108-.17127.19037-.053.368-.12121.54907-.18561.23926-.0849.4748-.174.69757-.27868.168-.0791.32807-.16706.48658-.25727a6.77125,6.77125,0,0,0,.61236-.39172c.14228-.1026.28192-.20789.415-.321a6.56392,6.56392,0,0,0,.53693-.51892c.113-.12055.2287-.23755.33331-.36725a7.09,7.09,0,0,0,.48-.69263c.07648-.12219.16126-.23523.23163-.36383a8.33175,8.33175,0,0,0,.52075-1.15326c.00867-.02386.02106-.044.02954-.068.004-.01123.00989-.02057.01386-.03186A4.29855,4.29855,0,0,1,19.35111,11.29883Z"/>
    </svg>
  )
}
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "QuantFinanceWiki.com",
    "url": "https://QuantFinanceWiki.com",
    "author": {
      "@type": "Person",
      "name": "Johannes Meyer",
      "url": "https://www.linkedin.com/in/johannes-meyer-young-and-calculated"
    },
    "description": "The best place to learn about quantitative finance, roadmaps, and career resources.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://QuantFinanceWiki.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "QuantFinanceWiki.com",
    "url": "https://QuantFinanceWiki.com",
    "logo": "logoImg",
    "sameAs": [
      "https://www.linkedin.com/in/johannes-meyer-young-and-calculated",
      "https://github.com/JohannesMeyerYC",
      "https://www.youtube.com/@quantenthusiasts"
    ]
  }
];

function Home() {
  
  // Lazy load images
  useEffect(() => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    return () => imageObserver.disconnect();
  }, []);
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      <Helmet>
        <title>QuantFinanceWiki.com | Ultimate Quantitative Finance Career Roadmaps & Resources</title>
        <meta name="description" content="Master quantitative finance with expert roadmaps, top firm insights, and interview prep resources. Built by Johannes Meyer for aspiring quants." />
        <meta name="keywords" content="quant finance, quantitative analyst, quant roadmaps, algo trading, financial engineering, johannes meyer, quant jobs, mathematics" />
        
        <meta property="og:title" content="QuantFinanceWiki.com | Quantitative Finance Career Hub" />
        <meta property="og:description" content="The best place to learn about quantitative finance. Get free roadmaps, firm insights, and resources." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://QuantFinanceWiki.com" />
        <meta property="og:site_name" content="QuantFinanceWiki.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@JohannesMeyer" />
        <meta name="twitter:title" content="QuantFinanceWiki.com | Quantitative Finance Career Hub" />
        <meta name="twitter:description" content="The best place to learn about quantitative finance." />
        
        <link rel="canonical" href="https://QuantFinanceWiki.com" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <style type="text/css">{`
          .hero-container { padding-top: 3rem; padding-bottom: 3rem; text-align: center; }
          .hero-title { font-size: clamp(2rem, 5vw, 4rem); line-height: 1.1; font-weight: 800; color: #fff; margin-bottom: 1.25rem; letter-spacing: -0.025em; }
          .hero-desc { font-size: clamp(1rem, 3vw, 1.25rem); line-height: 1.6; color: #cbd5e1; margin-bottom: 2rem; font-weight: 300; max-width: 100%; margin-left: auto; margin-right: auto; padding: 0 0.5rem; }
          @media (min-width: 768px) { 
            .hero-container { padding-top: 6rem; padding-bottom: 6rem; } 
            .hero-desc { max-width: 56rem; }
          }
        `}</style>
      </Helmet>

      <header className="relative border-b border-slate-800 bg-slate-950 py-12 md:py-24 overflow-hidden hero-container">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none" aria-hidden="true">
  <div className="absolute top-10 left-10 w-32 h-32 md:w-72 md:h-72 bg-emerald-500/10 rounded-full blur-[40px] md:blur-[100px] will-change-transform" style={{contain: 'paint'}}></div>
  <div className="absolute bottom-10 right-10 w-40 h-40 md:w-96 md:h-96 bg-teal-500/10 rounded-full blur-[40px] md:blur-[100px] will-change-transform" style={{contain: 'paint'}}></div>
    </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center">
            <h1 className="hero-title opacity-100">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">QFW.com</span>
            </h1>
            <p className="hero-desc opacity-100">
              The best place to learn about quantitative finance. Read detailed roadmaps, check out the blog, download free resources, and practice interview questions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-2">
              <Link to="/roadmaps" className="bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 w-full sm:w-auto text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                Explore Roadmaps
              </Link>
              <Link to="/interview-questions" className="bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-500 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold transition-all hover:-translate-y-1 active:scale-95 w-full sm:w-auto text-sm sm:text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                Practice Questions
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-16">
        <div className="mb-8 md:mb-16" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">What You Can Do Here</h2>
          <p className="text-slate-300 text-center max-w-2xl mx-auto mb-8">
            Everything you need for a quant finance career in one place.
          </p>
        </div>

        <div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-12 md:mb-24"
          role="list"
        >
          {/* Column 1 */}
          <div className="space-y-4 md:space-y-6">
            <article 
              className="bg-slate-900/50 backdrop-blur-sm p-5 md:p-6 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 group hover:bg-slate-900 shadow-sm hover:shadow-lg hover:shadow-emerald-900/20 active:scale-[0.98]" 
              role="listitem"
              style={{ animationDelay: '0.15s' }}
            >
              <div className="w-10 h-1.5 bg-gradient-to-r from-emerald-600 to-emerald-400 mb-4 md:mb-6 rounded-full group-hover:w-16 transition-all duration-500" aria-hidden="true"></div>
              <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">Career Roadmaps</h2>
              <p className="text-slate-300 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                Step-by-step guides for different quant roles. See what skills you need and how to build them over time. Covers trading, research, development, and risk management.
              </p>
              <Link to="/roadmaps" className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center group/link text-sm md:text-base focus:outline-none focus-visible:underline" aria-label="Explore Career Roadmaps">
                Explore Roadmaps <span className="ml-2 group-hover/link:translate-x-1 transition-transform" aria-hidden="true">→</span>
              </Link>
            </article>

            <article 
              className="bg-slate-900/50 backdrop-blur-sm p-5 md:p-6 rounded-xl border border-slate-800 hover:border-teal-500/50 transition-all duration-300 group hover:bg-slate-900 shadow-sm hover:shadow-lg hover:shadow-teal-900/20 active:scale-[0.98]" 
              role="listitem"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="w-10 h-1.5 bg-gradient-to-r from-teal-600 to-teal-400 mb-4 md:mb-6 rounded-full group-hover:w-16 transition-all duration-500" aria-hidden="true"></div>
              <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">Top Firms</h2>
              <p className="text-slate-300 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                Detailed information on leading quantitative finance companies. Learn about their hiring process, culture, and what they look for in candidates. Updated regularly.
              </p>
              <Link to="/firms" className="text-teal-400 hover:text-teal-300 font-medium inline-flex items-center group/link text-sm md:text-base focus:outline-none focus-visible:underline" aria-label="View Top Firms">
                View Firms <span className="ml-2 group-hover/link:translate-x-1 transition-transform" aria-hidden="true">→</span>
              </Link>
            </article>

            <article 
              className="bg-slate-900/50 backdrop-blur-sm p-5 md:p-6 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-all duration-300 group hover:bg-slate-900 shadow-sm hover:shadow-lg hover:shadow-purple-900/20 active:scale-[0.98]" 
              role="listitem"
              style={{ animationDelay: '0.25s' }}
            >
              <div className="w-10 h-1.5 bg-gradient-to-r from-purple-600 to-purple-400 mb-4 md:mb-6 rounded-full group-hover:w-16 transition-all duration-500" aria-hidden="true"></div>
              <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">Resource Library</h2>
              <p className="text-slate-300 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                Download PDFs, cheatsheets, and carousel slides. Curated collection of learning materials, technical guides, and reference documents for quant finance topics.
              </p>
              <Link to="/resources" className="text-purple-400 hover:text-purple-300 font-medium inline-flex items-center group/link text-sm md:text-base focus:outline-none focus-visible:underline" aria-label="View Resource Library">
                View Resources <span className="ml-2 group-hover/link:translate-x-1 transition-transform" aria-hidden="true">→</span>
              </Link>
            </article>
          </div>

          {/* Column 2 */}
          <div className="space-y-4 md:space-y-6">
            <article 
              className="bg-slate-900/50 backdrop-blur-sm p-5 md:p-6 rounded-xl border border-slate-800 hover:border-slate-600 transition-all duration-300 group hover:bg-slate-900 shadow-sm hover:shadow-lg hover:shadow-slate-900/50 active:scale-[0.98]" 
              role="listitem"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="w-10 h-1.5 bg-gradient-to-r from-slate-600 to-slate-400 mb-4 md:mb-6 rounded-full group-hover:w-16 transition-all duration-500" aria-hidden="true"></div>
              <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">FAQ</h2>
              <p className="text-slate-300 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                Read answers to common questions about quantitative finance careers, mathematics requirements, interview preparation, and industry insights. Updated weekly.
              </p>
              <Link to="/faq" className="text-slate-300 hover:text-white font-medium inline-flex items-center group/link text-sm md:text-base focus:outline-none focus-visible:underline" aria-label="Browse Frequently Asked Questions">
                Browse FAQ <span className="ml-2 group-hover/link:translate-x-1 transition-transform" aria-hidden="true">→</span>
              </Link>
            </article>

            <article 
              className="bg-slate-900/50 backdrop-blur-sm p-5 md:p-6 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all duration-300 group hover:bg-slate-900 shadow-sm hover:shadow-lg hover:shadow-blue-900/20 active:scale-[0.98]" 
              role="listitem"
              style={{ animationDelay: '0.35s' }}
            >
              <div className="w-10 h-1.5 bg-gradient-to-r from-blue-600 to-blue-400 mb-4 md:mb-6 rounded-full group-hover:w-16 transition-all duration-500" aria-hidden="true"></div>
              <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">Insights Blog</h2>
              <p className="text-slate-300 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                Read latest articles on careers, mathematics, and market trends. Technical deep dives, career advice, and industry analysis from experienced practitioners.
              </p>
              <Link to="/blog" className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center group/link text-sm md:text-base focus:outline-none focus-visible:underline" aria-label="Read Insights Blog">
                Read Blog <span className="ml-2 group-hover/link:translate-x-1 transition-transform" aria-hidden="true">→</span>
              </Link>
            </article>

            <article 
              className="bg-slate-900/50 backdrop-blur-sm p-5 md:p-6 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-all duration-300 group hover:bg-slate-900 shadow-sm hover:shadow-lg hover:shadow-amber-900/20 active:scale-[0.98]" 
              role="listitem"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="w-10 h-1.5 bg-gradient-to-r from-amber-600 to-amber-400 mb-4 md:mb-6 rounded-full group-hover:w-16 transition-all duration-500" aria-hidden="true"></div>
              <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white">Interview Questions</h2>
              <p className="text-slate-300 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
                Practice with 1000+ quantitative finance interview questions. Detailed solutions included. Probability, brainteasers, finance, programming, and statistics problems from top firms.
              </p>
              <Link to="/interview-questions" className="text-amber-400 hover:text-amber-300 font-medium inline-flex items-center group/link text-sm md:text-base focus:outline-none focus-visible:underline" aria-label="Practice Interview Questions">
                Practice Now <span className="ml-2 group-hover/link:translate-x-1 transition-transform" aria-hidden="true">→</span>
              </Link>
            </article>
          </div>
        </div>

        {/* Newsletter Section */}
<div 
  className="mb-12 md:mb-24"
  style={{ animationDelay: '0.5s' }}
>
  <div className="bg-slate-900/50 backdrop-blur-sm p-5 md:p-8 rounded-xl border border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300 group hover:bg-slate-900 shadow-sm hover:shadow-xl hover:shadow-emerald-900/10">
    <div className="flex items-center gap-3 mb-4 md:mb-6">
      <div className="w-10 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full group-hover:w-16 transition-all duration-500" aria-hidden="true"></div>
      <h2 className="text-xl md:text-2xl font-bold text-white">Daily Quant Insights</h2>
    </div>

    <div className="mb-8">
      <p className="text-slate-300 text-sm md:text-base leading-relaxed">
        Roadmaps, firm breakdowns, math intuition, and career strategy delivered daily. 
        Join the community staying ahead in quantitative finance.
      </p>
    </div>

    {/* New Subscription Link Area */}
    <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 md:p-10 group-hover:border-emerald-500/30 transition-all duration-300 text-center">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <h3 className="text-white font-semibold text-lg mb-4">Get the latest insights in your inbox</h3>
        
        <a 
          href="https://youngandcalculated.substack.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-lg transition-all duration-300 shadow-lg shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Subscribe to Quant Enthusiasts
        </a>
        
        <p className="mt-4 text-slate-500 text-xs">
          Join over 5,000+ readers.
        </p>
      </div>
    </div>

    <div className="mt-6 pt-6 border-t border-slate-800/50">
      <div className="flex items-center justify-between text-sm">
        <a 
          href="https://youngandcalculated.substack.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 group/link text-sm focus:outline-none focus-visible:underline"
        >
          View archive
          <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
        <span className="text-slate-500 text-xs">Free to subscribe</span>
      </div>
    </div>
  </div>
</div>

        <footer className="border-t border-slate-800 pt-8 md:pt-12 pb-6 md:pb-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3">Connect and Follow</h2>
              <p className="text-slate-300 text-sm md:text-base">Join the community for updates and discussions.</p>
            </div>
            
            <nav className="flex flex-wrap justify-center gap-3 md:gap-4 mb-6 md:mb-8" aria-label="Social media links">
                {socials.map((social) => (
                    <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group p-3 md:p-4 bg-slate-900 rounded-lg md:rounded-xl border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 active:scale-95 ${social.color} hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400`}
                        aria-label={`Follow us on ${social.name}`}
                    >
                        {social.icon}
                    </a>
                ))}
            </nav>
            
            <div className="text-center text-slate-500 text-xs md:text-sm space-y-2">
                <p>© {new Date().getFullYear()} QuantFinanceWiki.com. All content created by Johannes Meyer.</p>
                <p className="text-slate-600">Built for aspiring quantitative finance professionals.</p>
            </div>
        </footer>
      </main>
    </div>
  )
}

export default Home;