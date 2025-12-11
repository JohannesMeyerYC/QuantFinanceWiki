import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { RenderBlock } from './RenderBlock';

const API_URL = import.meta.env.VITE_API_URL;
const SITE_URL = "https://QuantFinanceWiki.com";

// --- ICONS (Lightweight SVGs for speed) ---
const HeartIcon = ({ filled }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill={filled ? "currentColor" : "none"} 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-5 h-5 transition-colors duration-300 ${filled ? 'text-rose-500' : 'text-slate-400 group-hover:text-rose-400'}`}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const ShareIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="w-5 h-5 text-slate-400 group-hover:text-teal-400 transition-colors duration-300"
  >
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);

// --- COMPONENT: Share & Like ---
const ShareAndLike = ({ title, url, slug }) => {
  const [liked, setLiked] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');

  // Check local storage on load (Client-side only)
  useEffect(() => {
    const isLiked = localStorage.getItem(`like-${slug}`);
    if (isLiked) setLiked(true);
  }, [slug]);

  // Handle Like (Local Storage toggle)
  const handleLike = () => {
    const newState = !liked;
    setLiked(newState);
    if (newState) {
      localStorage.setItem(`like-${slug}`, 'true');
    } else {
      localStorage.removeItem(`like-${slug}`);
    }
  };

  // Handle Share (Native Mobile vs Desktop Clipboard)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this article: ${title}`,
          url: url,
        });
      } catch (err) {
        // Fallback if user cancels or browser throws error
        if (err.name !== 'AbortError') copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setShareFeedback('Copied Link!');
    setTimeout(() => setShareFeedback(''), 2000);
  };

  return (
    <div className="flex items-center gap-4 py-6 border-y border-slate-800/60 my-10">
      <button 
        onClick={handleLike}
        aria-label="Like post"
        className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 hover:border-rose-500/30 transition-all active:scale-95"
      >
        <HeartIcon filled={liked} />
        <span className={`text-sm font-medium ${liked ? 'text-slate-200' : 'text-slate-400'}`}>
          {liked ? 'Liked' : 'Like'}
        </span>
      </button>

      <div className="relative">
        <button 
          onClick={handleShare}
          aria-label="Share post"
          className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 hover:border-teal-500/30 transition-all active:scale-95"
        >
          <ShareIcon />
          <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200">Share</span>
        </button>

        <AnimatePresence>
          {shareFeedback && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="absolute left-0 -top-10 w-32 bg-teal-500 text-slate-900 text-xs font-bold px-2 py-1 rounded text-center shadow-lg pointer-events-none"
            >
              {shareFeedback}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TableOfContents = ({ content }) => {
  const headings = content.filter(b => b.type === 'heading');
  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block sticky top-32 h-fit w-64 ml-12">
      <div className="border-l border-slate-800 pl-6 py-2">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Contents</h4>
        <ul className="space-y-4">
          {headings.map((block, i) => {
            const id = block.text.toLowerCase().replace(/[^\w]+/g, '-');
            return (
              <li key={i}>
                <a href={`#${id}`} className="text-sm text-slate-400 hover:text-teal-400 transition-colors block leading-snug line-clamp-2">
                  {block.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 90, restDelta: 0.001 });

  useEffect(() => {
    fetch(`${API_URL}/api/blog/${id}`)
      .then(res => res.json())
      .then(data => { setPost(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );
  
  if (!post) return null;

  const currentSlug = post.slug || post.id;
  const canonicalUrl = `${SITE_URL}/blog/${currentSlug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "author": { 
      "@type": "Person", 
      "name": post.author || "Johannes Meyer" 
    },
    "datePublished": post.date,
    "mainEntityOfPage": { 
      "@type": "WebPage", 
      "@id": canonicalUrl 
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-teal-500/30">
      <Helmet>
        <title>{post.title} | QuantFinanceWiki</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={post.title} />
        <meta property="twitter:description" content={post.excerpt} />
        
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-600 to-emerald-400 origin-left z-50" 
        style={{ scaleX }} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32">
        <Link to="/blog" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-teal-400 mb-12 transition-colors group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Quant Notes
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-16">
          <article className="min-w-0">
            <header className="mb-10 border-b border-slate-800/60 pb-12">
              <div className="flex flex-wrap gap-3 text-xs font-mono uppercase text-teal-500 mb-6">
                <span className="px-2 py-1 rounded bg-teal-500/10 border border-teal-500/20">{post.category || 'Algorithm'}</span>
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400">{post.date}</span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
                {post.title}
              </h1>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center font-bold text-slate-400 border border-slate-600">
                    {post.author ? post.author[0] : 'J'}
                 </div>
                 <div className="text-sm">
                    <p className="text-white font-medium">{post.author || 'Johannes Meyer'}</p>
                    <p className="text-slate-500">Quantitative Developer</p>
                 </div>
              </div>
            </header>

            {/* --- Added Share/Like Component --- */}
            <ShareAndLike 
              title={post.title} 
              url={canonicalUrl} 
              slug={currentSlug} 
            />

            <div className="blog-content">
              {post.content.map((block, index) => (
                <RenderBlock key={index} block={block} />
              ))}
            </div>

            {/* --- Repeat buttons at bottom --- */}
            <div className="mt-16">
              <h3 className="text-slate-500 text-sm font-bold uppercase mb-4">Enjoyed this article?</h3>
              <ShareAndLike 
                title={post.title} 
                url={canonicalUrl} 
                slug={currentSlug} 
              />
            </div>
          </article>

          <TableOfContents content={post.content} />
        </div>
      </div>
    </div>
  );
}

export default BlogPost;