import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import logoImg from '../assets/Logo.png';

const API_URL = import.meta.env.VITE_API_URL;


function Home() {
  const socials = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/johannes-meyer-young-and-calculated',
      color: 'hover:text-[#0077b5]',
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" role="img" aria-labelledby="linkedin-icon">
          <title id="linkedin-icon">LinkedIn</title>
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    },
    {
      name: 'GitHub',
      url: 'https://github.com/JohannesMeyerYC',
      color: 'hover:text-white',
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" role="img" aria-labelledby="github-icon">
          <title id="github-icon">GitHub</title>
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      )
    },
    {
      name: 'Discord',
      url: 'https://discord.gg/JenRWVCfzh', 
      color: 'hover:text-[#5865F2]',
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" role="img" aria-labelledby="discord-icon">
          <title id="discord-icon">Discord</title>
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/>
        </svg>
      )
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@quantenthusiasts',
      color: 'hover:text-[#FF0000]',
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" role="img" aria-labelledby="youtube-icon">
          <title id="youtube-icon">YouTube</title>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/quant_enthusiasts',
      color: 'hover:text-[#E1306C]',
      icon: (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" role="img" aria-labelledby="instagram-icon">
          <title id="instagram-icon">Instagram</title>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
    name: 'PayPal',
    url: 'https://paypal.me/youngandcalculated',
    color: 'hover:text-[#0070BA]',
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" role="img" aria-labelledby="paypal-icon">
        <title id="paypal-icon">PayPal</title>
        <path d="M20.067 8.478c.97-1.894.146-4.01-1.64-4.845-1.137-.53-2.62-.633-4.39-.633h-5.91c-.636 0-1.192.427-1.332 1.045L3.25 18.903c-.1.46.253.908.723.908h3.337l.634 3.09c.06.305.33.523.64.523h3.55c.422 0 .73-.396.643-.807l-.607-2.956.126-.486c.125-.486.562-.82 1.062-.82h1.34c4.084 0 6.64-2.204 7.505-6.43.344-1.675.143-3.17-.184-4.32z"/>
      </svg>
    )
}
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

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
      </Helmet>

      {/* Hero Section */}
      <header className="relative border-b border-slate-800 bg-slate-950 py-16 md:py-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none" aria-hidden="true">
           <div className="absolute top-10 left-10 w-40 h-40 md:w-72 md:h-72 bg-emerald-500/10 rounded-full blur-[60px] md:blur-[100px]"></div>
           <div className="absolute bottom-10 right-10 w-60 h-60 md:w-96 md:h-96 bg-teal-500/10 rounded-full blur-[60px] md:blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 md:mb-8 text-white tracking-tight leading-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">QFW.com</span>
            </h1>
            <p className="text-lg md:text-2xl mb-8 md:mb-12 text-slate-400 leading-relaxed font-light px-2">
              The best place to learn about quantitative finance. Read my roadmaps, check out the blog, and download free resources.
            </p>
            <nav className="flex flex-col sm:flex-row justify-center gap-4 sm:space-y-0 sm:space-x-6 px-4">
              <Link to="/roadmaps" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-lg font-semibold transition-all shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_-5px_rgba(16,185,129,0.6)] active:scale-95 w-full sm:w-auto">
                Explore Roadmaps
              </Link>
              <Link to="/firms" className="bg-slate-900/50 backdrop-blur-sm hover:bg-slate-800 text-white border border-slate-700 hover:border-slate-500 px-8 py-4 rounded-lg font-semibold transition-all hover:-translate-y-1 active:scale-95 w-full sm:w-auto">
                View Top Firms
              </Link>
            </nav>
          </motion.div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-24"
          role="list"
        >
          
          <motion.article variants={itemVariants} className="bg-slate-900/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 group hover:bg-slate-900 hover:shadow-2xl hover:shadow-emerald-900/20 active:scale-[0.98]" role="listitem">
            <div className="w-12 h-1.5 bg-gradient-to-r from-emerald-600 to-emerald-400 mb-6 rounded-full group-hover:w-24 transition-all duration-500" aria-hidden="true"></div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white">Career Roadmaps</h2>
            <p className="text-slate-400 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
              Read guides for different jobs. See what skills you need.
            </p>
            <Link to="/roadmaps" className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center group/link text-sm md:text-base" aria-label="Explore Career Roadmaps">
              Explore Roadmaps <span className="ml-2 group-hover/link:translate-x-1 transition-transform" aria-hidden="true">→</span>
            </Link>
          </motion.article>

          <motion.article variants={itemVariants} className="bg-slate-900/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-800 hover:border-teal-500/50 transition-all duration-300 group hover:bg-slate-900 hover:shadow-2xl hover:shadow-teal-900/20 active:scale-[0.98]" role="listitem">
            <div className="w-12 h-1.5 bg-gradient-to-r from-teal-600 to-teal-400 mb-6 rounded-full group-hover:w-24 transition-all duration-500" aria-hidden="true"></div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white">Top Firms</h2>
            <p className="text-slate-400 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
              Find out what companies want. See where to apply.
            </p>
            <Link to="/firms" className="text-teal-400 hover:text-teal-300 font-medium inline-flex items-center group/link text-sm md:text-base" aria-label="View Top Firms">
              View Firms <span className="ml-2 group-hover/link:translate-x-1 transition-transform" aria-hidden="true">→</span>
            </Link>
          </motion.article>

          <motion.article variants={itemVariants} className="bg-slate-900/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all duration-300 group hover:bg-slate-900 hover:shadow-2xl hover:shadow-blue-900/20 active:scale-[0.98]" role="listitem">
            <div className="w-12 h-1.5 bg-gradient-to-r from-blue-600 to-blue-400 mb-6 rounded-full group-hover:w-24 transition-all duration-500" aria-hidden="true"></div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white">Insights Blog</h2>
            <p className="text-slate-400 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
              Read my latest articles on careers, math, and market trends.
            </p>
            <Link to="/blog" className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center group/link text-sm md:text-base" aria-label="Read Insights Blog">
              Read Blog <span className="ml-2 group-hover/link:translate-x-1 transition-transform" aria-hidden="true">→</span>
            </Link>
          </motion.article>

          <motion.article variants={itemVariants} className="bg-slate-900/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all duration-300 group hover:bg-slate-900 hover:shadow-2xl hover:shadow-purple-900/20 active:scale-[0.98]" role="listitem">
             <div className="w-12 h-1.5 bg-gradient-to-r from-purple-600 to-purple-400 mb-6 rounded-full group-hover:w-24 transition-all duration-500" aria-hidden="true"></div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white">Resource Library</h2>
            <p className="text-slate-400 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
              Download PDFs, cheatsheets, and carousel slides.
            </p>
            <Link to="/resources" className="text-purple-400 hover:text-purple-300 font-medium inline-flex items-center group/link text-sm md:text-base" aria-label="View Resource Library">
              View Resources <span className="ml-2 group-hover/link:translate-x-1 transition-transform" aria-hidden="true">→</span>
            </Link>
          </motion.article>

          <motion.article variants={itemVariants} className="bg-slate-900/50 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-slate-800 hover:border-slate-600 transition-all duration-300 group hover:bg-slate-900 hover:shadow-2xl hover:shadow-slate-900/50 active:scale-[0.98]" role="listitem">
             <div className="w-12 h-1.5 bg-gradient-to-r from-slate-600 to-slate-400 mb-6 rounded-full group-hover:w-24 transition-all duration-500" aria-hidden="true"></div>
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white">FAQ</h2>
            <p className="text-slate-400 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
              Read answers to questions people ask often.
            </p>
            <Link to="/faq" className="text-slate-300 hover:text-white font-medium inline-flex items-center group/link text-sm md:text-base" aria-label="Browse Frequently Asked Questions">
              Browse FAQ <span className="ml-2 group-hover/link:translate-x-1 transition-transform" aria-hidden="true">→</span>
            </Link>
          </motion.article>

        </motion.div>

        <footer className="border-t border-slate-800 pt-12 md:pt-20 pb-8">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Join the Community</h2>
              <p className="text-slate-400">Follow us for updates.</p>
            </div>
            
            <nav className="flex flex-wrap justify-center gap-4 md:gap-8" aria-label="Social media links">
                {socials.map((social) => (
                    <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group p-4 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1 active:scale-95 ${social.color} hover:bg-slate-800`}
                        aria-label={`Follow us on ${social.name}`}
                    >
                        {social.icon}
                    </a>
                ))}
            </nav>
            
            <div className="mt-12 md:mt-16 text-center text-slate-600 text-sm">
                <p>© {new Date().getFullYear()} QuantFinanceWiki.com. Built by Johannes Meyer.</p>
            </div>
        </footer>
      </main>
    </div>
  )
}

export default Home;