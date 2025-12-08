import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll } from 'framer-motion';
import { Helmet } from 'react-helmet';
const API_URL = import.meta.env.VITE_API_URL;

// --- Helpers ---

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     
    .replace(/[^\w-]+/g, '')    
    .replace(/--+/g, '-');    
};

const scrollToId = (id) => {
  const element = document.getElementById(id);
  if (element) {
    const offset = 100;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
    window.history.pushState(null, null, `#${id}`);
  }
};

// --- Components ---

const CodeBlock = ({ code, language = 'python' }) => (
  <div className="my-8 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
    <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
      <span className="text-xs font-mono text-slate-500 lowercase">{language}</span>
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
        <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
        <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
      </div>
    </div>
    <div className="p-4 overflow-x-auto">
      <pre className="text-sm font-mono text-emerald-400">
        <code>{code}</code>
      </pre>
    </div>
  </div>
);

const TableOfContents = ({ content }) => {
  const headings = content.filter(b => b.type === 'heading');
  if (headings.length === 0) return null;

  return (
    <nav className="hidden lg:block sticky top-32 h-fit w-64 ml-12 border-l border-slate-800 pl-6">
      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">On this page</h4>
      <ul className="space-y-3">
        {headings.map((block, i) => {
          const id = slugify(block.text);
          return (
            <li key={i}>
              <button 
                onClick={() => scrollToId(id)}
                className="text-sm text-left text-slate-400 hover:text-teal-400 transition-colors block leading-snug w-full"
              >
                {block.text}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

// --- Main Page ---

function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const { scrollYProgress } = useScroll();

  useEffect(() => {
    fetch(`${API_URL}/api/blog/${id}`)
      .then(res => res.json())
      .then(data => {
        setPost(data);
        setLikes(data.likes || 0);
        setLoading(false);
      })
      .catch(err => setLoading(false));

    const likedPosts = JSON.parse(localStorage.getItem('quant_liked_posts') || '[]');
    if (likedPosts.includes(id)) {
      setHasLiked(true);
    }
  }, [id]);

  const handleLikeToggle = async () => {
    const likedPosts = JSON.parse(localStorage.getItem('quant_liked_posts') || '[]');
    if (hasLiked) {
      setLikes(prev => Math.max(0, prev - 1));
      setHasLiked(false);
      const updatedLikes = likedPosts.filter(pid => pid !== id);
      localStorage.setItem('quant_liked_posts', JSON.stringify(updatedLikes));
      try { await fetch(`${API_URL}/api/blog/${id}/unlike`, { method: 'POST' }); } catch (err) {}
    } else {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      if (!likedPosts.includes(id)) {
        likedPosts.push(id);
        localStorage.setItem('quant_liked_posts', JSON.stringify(likedPosts));
      }
      try { await fetch(`${API_URL}/api/blog/${id}/like`, { method: 'POST' }); } catch (err) {}
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculateReadingTime = (content) => {
    const text = content.map(b => b.text).join(' ');
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center" role="status" aria-busy="true">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-teal-500 font-mono text-xs">Loading...</p>
      </div>
    </div>
  );

  if (!post || post.error) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      <p>Article not found.</p>
      <Link to="/blog" className="text-teal-500 mt-4 hover:underline">Back to Blog</Link>
    </div>
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.image || "https://QuantFinanceWiki.com/default-og.jpg",
    "author": { "@type": "Person", "name": post.author },
    "publisher": { "@type": "Organization", "name": "QuantFinanceWiki.com" },
    "datePublished": post.date,
    "description": post.description
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30">
      <Helmet>
        <title>{post.title} | QuantFinanceWiki.com Blog</title>
        <meta name="description" content={post.description} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-400 origin-left z-[100]"
        style={{ scaleX: scrollYProgress }}
      />

      <div className="max-w-7xl mx-auto px-4 py-20">
        
        <nav aria-label="Breadcrumb" className="mb-12">
            <Link to="/blog" className="text-slate-500 hover:text-white text-sm font-bold inline-flex items-center group">
            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Back to Articles
            </Link>
        </nav>

        <article itemScope itemType="http://schema.org/BlogPosting" className="grid lg:grid-cols-[1fr_300px] gap-12">
          
          <div className="min-w-0">
            <header className="mb-12 border-b border-slate-800 pb-12">
               <div className="flex flex-wrap items-center gap-4 text-xs font-mono uppercase text-teal-500 mb-6 tracking-wider">
                 <span className="bg-teal-500/10 px-2 py-1 rounded border border-teal-500/20" itemProp="articleSection">
                   {post.category}
                 </span>
                 <span className="text-slate-700">|</span>
                 <time dateTime={post.date} itemProp="datePublished" className="text-slate-400">{post.date}</time>
                 <span className="text-slate-700">|</span>
                 <span className="text-slate-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {calculateReadingTime(post.content)}
                 </span>
               </div>
               
               <h1 itemProp="headline" className="text-3xl md:text-5xl font-extrabold text-white mb-8 leading-tight tracking-tight">
                 {post.title}
               </h1>
               
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4" itemProp="author" itemScope itemType="http://schema.org/Person">
                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 font-bold text-lg shadow-inner">
                     {post.author.charAt(0)}
                   </div>
                   <div className="flex flex-col">
                     <span itemProp="name" className="text-white text-sm font-bold">{post.author}</span>
                     <span className="text-slate-500 text-xs">Quantitative Analyst</span>
                   </div>
                 </div>

                 <button 
                   onClick={handleShare}
                   className="hidden md:flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
                 >
                   {copied ? (
                       <span className="text-teal-400">Copied!</span>
                   ) : (
                       <>
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                           Share
                       </>
                   )}
                 </button>
               </div>
            </header>

            <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-slate-300 prose-a:text-teal-400 hover:prose-a:text-teal-300 prose-strong:text-white mb-20" itemProp="articleBody">
               {post.content.map((block, index) => {
                 if (block.type === 'code') {
                   return <CodeBlock key={index} code={block.text} language={block.language || 'python'} />;
                 }
                 if (block.type === 'heading') {
                   const headingId = slugify(block.text);
                   return (
                     <h2 id={headingId} key={index} className="scroll-mt-32 text-2xl md:text-3xl font-bold text-white mt-16 mb-6 tracking-tight relative group">
                       <span className="absolute -left-8 text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => scrollToId(headingId)}>#</span>
                       {block.text}
                     </h2>
                   );
                 }
                 return (
                   <p key={index} className="text-lg text-slate-300 leading-8 mb-8 whitespace-pre-line">
                     {block.text}
                   </p>
                 );
               })}
            </div>

            <section className="border-t border-slate-800 pt-12 flex flex-col sm:flex-row gap-6 justify-between items-center" aria-label="Article Actions">
               <button 
                 onClick={handleLikeToggle}
                 aria-pressed={hasLiked}
                 className={`flex items-center gap-3 px-8 py-4 rounded-full border transition-all active:scale-95 ${
                   hasLiked 
                     ? "bg-teal-500/10 border-teal-500 text-teal-400 shadow-[0_0_20px_-5px_rgba(20,184,166,0.3)]" 
                     : "bg-slate-900 border-slate-800 hover:border-teal-500/50 hover:text-teal-400"
                 }`}
               >
                 <span className="text-2xl transform transition-transform duration-300" aria-hidden="true">
                   {hasLiked ? '♥' : '♡'}
                 </span>
                 <span className="font-bold text-lg">
                   {hasLiked ? 'Liked' : 'Like'} <span className="opacity-60 ml-1">({likes})</span>
                 </span>
               </button>

               <button 
                   onClick={handleShare}
                   className="flex md:hidden items-center gap-2 px-6 py-4 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-bold"
                 >
                   {copied ? 'Link Copied!' : 'Share Article'}
               </button>
            </section>
          </div>

          <aside className="hidden lg:block">
            <TableOfContents content={post.content} />
          </aside>

        </article>
      </div>
    </div>
  );
}

export default BlogPost;