import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { m, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { RenderBlock } from './RenderBlock';

const API_URL = import.meta.env.VITE_API_URL;
const SITE_URL = "https://QuantFinanceWiki.com";

const Icons = {
  Share: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-slate-300 group-hover:text-teal-400 transition-colors duration-300"
    >
      <circle cx="18" cy="5" r="3"></circle>
      <circle cx="6" cy="12" r="3"></circle>
      <circle cx="18" cy="19" r="3"></circle>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
  )
};

const socials = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/johannes-meyer-young-and-calculated',
    color: 'hover:text-[#0077b5]',
    icon: (
      <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" role="img" aria-labelledby="linkedin-icon">
        <title id="linkedin-icon">LinkedIn</title>
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
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
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
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
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
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
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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
        <path d="M20.067 8.478c.97-1.894.146-4.01-1.64-4.845-1.137-.53-2.62-.633-4.39-.633h-5.91c-.636 0-1.192.427-1.332 1.045L3.25 18.903c-.1.46.253.908.723.908h3.337l.634 3.09c.06.305.33.523.64.523h3.55c.422 0 .73-.396.643-.807l-.607-2.956.126-.486c.125-.486.562-.82 1.062-.82h1.34c4.084 0 6.64-2.204 7.505-6.43.344-1.675.143-3.17-.184-4.32z" />
      </svg>
    )
  }
];

const RelatedPost = ({ currentCategory }) => {
  return (
    <Link 
      to="/blog" 
      className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-[#020617] border border-slate-800 hover:border-teal-500/30 transition-all group block cursor-pointer"
    >
      <h3 className="text-slate-400 text-sm font-mono uppercase tracking-widest mb-4">
        Deepen Your Knowledge
      </h3>
      <div className="flex flex-col gap-2">
        <p className="text-slate-300 italic text-base md:text-lg">
          "Found this insightful? Explore more notes on {currentCategory || 'Quantitative Finance'}."
        </p>
        <div className="flex items-center gap-2">
          <span className="text-2xl md:text-3xl font-bold text-white group-hover:text-teal-400 transition-colors leading-tight">
            Browse the full Quant Library
          </span>
        </div>
      </div>
    </Link>
  );
};

const ShareSection = ({ title, url }) => {
  const [shareFeedback, setShareFeedback] = useState('');

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this article: ${title}`,
          url: url,
        });
      } catch (err) {
        if (err.name !== 'AbortError') copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setShareFeedback('Link Copied!');
    setTimeout(() => setShareFeedback(''), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-8 border-t border-slate-800/60 mt-12">
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={handleShare}
            aria-label="Share post"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-teal-500/30 hover:bg-slate-800 transition-all active:scale-95"
          >
            <Icons.Share />
            <span className="text-sm font-medium text-slate-300 group-hover:text-slate-200">Share Article</span>
          </button>

          <AnimatePresence>
            {shareFeedback && (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute left-0 -top-12 w-32 bg-teal-500 text-slate-900 text-xs font-bold px-2 py-1.5 rounded text-center shadow-lg pointer-events-none"
              >
                {shareFeedback}
                <div className="absolute bottom-[-4px] left-6 w-2 h-2 bg-teal-500 rotate-45"></div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <p className="text-slate-500 text-sm hidden sm:block ml-auto italic">
        Found this useful? Share it with a friend.
      </p>
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
                <a href={`#${id}`} className="text-sm text-slate-300 hover:text-teal-400 transition-colors block leading-snug line-clamp-2">
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
  const [relatedPost, setRelatedPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchContent = async () => {
    setLoading(true); // Ensure loading starts on ID change
    try {
      // 1. Fetch current post
      const postRes = await fetch(`${API_URL}/api/blog/${id}`);
      const currentPost = await postRes.json();
      setPost(currentPost);

      // 2. Fetch list for related logic
      const allRes = await fetch(`${API_URL}/api/blog`);
      const allPosts = await allRes.json();

      // 3. Robust filtering
      const related = allPosts.find(p => 
        p.category === currentPost.category && 
        p.id !== currentPost.id && 
        p.slug !== currentPost.slug
      ) || allPosts.find(p => p.id !== currentPost.id); // Fallback to any other post

      setRelatedPost(related);
    } catch (err) {
      console.error("Error fetching post data:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchContent();
  window.scrollTo(0, 0);
}, [id]);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 90, restDelta: 0.001 });

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
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

      <m.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-600 to-emerald-400 origin-left z-50"
        style={{ scaleX }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-32">
        <Link to="/blog" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-teal-400 mb-12 transition-colors group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Quant Notes
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-16">
          <article className="min-w-0">
            <header className="mb-12 border-b border-slate-800/60 pb-12">
              <div className="flex flex-wrap gap-3 text-xs font-mono uppercase text-teal-500 mb-6">
                <span className="px-2 py-1 rounded bg-teal-500/10 border border-teal-500/20">{post.category || 'Algorithm'}</span>
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">{post.date}</span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
                {post.title}
              </h1>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center font-bold text-slate-300 border border-slate-600">
                  {post.author ? post.author[0] : 'J'}
                </div>
                <div className="text-sm">
                  <p className="text-white font-medium">{post.author || 'Johannes Meyer'}</p>
                  <p className="text-slate-500">Quantitative Developer</p>
                </div>
              </div>
            </header>

            <div className="blog-content">
              {post.content.map((block, index) => (
                <RenderBlock key={index} block={block} />
              ))}
            </div>

            {/* New Section */}
<RelatedPost currentCategory={post.category} />

            <ShareSection
              title={post.title}
              url={canonicalUrl}
            />
          </article>

          <TableOfContents content={post.content} />
        </div>

        <footer className="border-t border-slate-800 pt-12 md:pt-20 pb-8 mt-24">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Join the Community</h2>
            <p className="text-slate-300">Follow us for updates.</p>
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
      </div>
    </div>
  );
}

export default BlogPost;