import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { RenderBlock } from './RenderBlock';

const API_URL = import.meta.env.VITE_API_URL;
const SITE_URL = "https://QuantFinanceWiki.com";

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
            <header className="mb-16 border-b border-slate-800/60 pb-12">
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

            <div className="blog-content">
              {post.content.map((block, index) => (
                <RenderBlock key={index} block={block} />
              ))}
            </div>
          </article>

          <TableOfContents content={post.content} />
        </div>
      </div>
    </div>
  );
}

export default BlogPost;