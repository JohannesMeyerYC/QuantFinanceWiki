import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Interaction States
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  
  // Form States
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 1. Fetch Post Data
    fetch(`/api/blog/${id}`)
      .then(res => res.json())
      .then(data => {
        setPost(data);
        setLikes(data.likes || 0);
        setComments(data.comments || []);
        setLoading(false);
      })
      .catch(err => setLoading(false));

    // 2. Check Local Storage
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
      try { await fetch(`/api/blog/${id}/unlike`, { method: 'POST' }); } catch (err) {}
    } else {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      if (!likedPosts.includes(id)) {
        likedPosts.push(id);
        localStorage.setItem('quant_liked_posts', JSON.stringify(likedPosts));
      }
      try { await fetch(`/api/blog/${id}/like`, { method: 'POST' }); } catch (err) {}
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    const res = await fetch(`/api/blog/${id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: commentName || 'Anonymous', text: commentText })
    });
    
    const newComment = await res.json();
    setComments([...comments, newComment]);
    setCommentText('');
    setCommentName('');
    setIsSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-teal-500 font-mono text-xs">Loading Article...</div>
    </div>
  );

  if (!post || post.error) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
      <p>Article not found.</p>
      <Link to="/blog" className="text-teal-500 mt-4 hover:underline">Back to Blog</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30">
      
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-teal-500 origin-left z-50"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      <div className="max-w-3xl mx-auto px-4 py-20">
        
        {/* Back Link */}
        <Link to="/blog" className="text-slate-500 hover:text-white text-sm font-bold mb-8 inline-block">
          ← Back to Articles
        </Link>

        {/* Article Container */}
        <article>
          
          {/* Header */}
          <header className="mb-12 border-b border-slate-800 pb-12">
             <div className="flex gap-4 text-xs font-mono uppercase text-teal-500 mb-6 tracking-wider">
               <span>{post.category}</span>
               <span className="text-slate-600">|</span>
               <time dateTime={post.date} className="text-slate-400">{post.date}</time>
             </div>
             
             <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-8 leading-tight tracking-tight">
               {post.title}
             </h1>
             
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 font-bold">
                  {post.author.charAt(0)}
               </div>
               <div className="flex flex-col">
                 <span className="text-white text-sm font-bold">{post.author}</span>
                 <span className="text-slate-500 text-xs">Author</span>
               </div>
             </div>
          </header>

          {/* Content Body */}
          <div className="max-w-none mb-20">
             {post.content.map((block, index) => {
               if (block.type === 'heading') {
                 return (
                   <h2 key={index} className="text-2xl md:text-3xl font-bold text-white mt-16 mb-6 tracking-tight">
                     {block.text}
                   </h2>
                 );
               }
               // 'whitespace-pre-line' handles the \n in your JSON correctly
               return (
                 <p key={index} className="text-lg text-slate-300 leading-8 mb-8 whitespace-pre-line">
                   {block.text}
                 </p>
               );
             })}
          </div>

        </article>

        {/* Interaction Section */}
        <section className="border-t border-slate-800 pt-12">
           
           {/* Like Button */}
           <div className="mb-12">
             <button 
               onClick={handleLikeToggle}
               className={`flex items-center gap-3 px-8 py-4 rounded-full border transition-all active:scale-95 ${
                 hasLiked 
                   ? "bg-teal-500/10 border-teal-500 text-teal-400 shadow-[0_0_20px_-5px_rgba(20,184,166,0.3)]" 
                   : "bg-slate-900 border-slate-800 hover:border-teal-500/50 hover:text-teal-400"
               }`}
             >
               <span className="text-2xl transform transition-transform duration-300">
                 {hasLiked ? '♥' : '♡'}
               </span>
               <span className="font-bold text-lg">
                 {hasLiked ? 'Liked' : 'Like'} <span className="opacity-60 ml-1">({likes})</span>
               </span>
             </button>
           </div>

           {/* Comments */}
           <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 md:p-10">
             <h3 className="text-2xl font-bold text-white mb-8">Discussion ({comments.length})</h3>
             
             {/* List */}
             <div className="space-y-8 mb-12">
               {comments.length === 0 ? (
                 <p className="text-slate-500 italic">No comments yet. Be the first.</p>
               ) : (
                 comments.map((comment, idx) => (
                   <div key={idx} className="flex gap-4">
                     <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-sm font-bold text-slate-400 border border-slate-700">
                       {comment.name.charAt(0)}
                     </div>
                     <div>
                       <div className="flex items-center gap-3 mb-1">
                         <span className="font-bold text-slate-200 text-sm">{comment.name}</span>
                         <span className="text-xs text-slate-600">{comment.date}</span>
                       </div>
                       <p className="text-slate-400 text-base leading-relaxed">{comment.text}</p>
                     </div>
                   </div>
                 ))
               )}
             </div>

             {/* Form */}
             <form onSubmit={handleComment} className="space-y-6">
                <h4 className="font-bold text-slate-300 text-sm uppercase tracking-wide">Leave a comment</h4>
                <div className="grid gap-4">
                  <input
                    type="text"
                    placeholder="Your Name (Optional)"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-5 text-slate-200 focus:border-teal-500 focus:outline-none transition-colors"
                  />
                  <textarea
                    rows="4"
                    placeholder="Write your thoughts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-5 text-slate-200 focus:border-teal-500 focus:outline-none resize-none transition-colors"
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !commentText.trim()}
                    className="px-8 py-3 bg-teal-500 text-slate-950 font-bold rounded-xl hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-teal-900/20"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
             </form>
           </div>
        </section>

      </div>
    </div>
  );
}

export default BlogPost;