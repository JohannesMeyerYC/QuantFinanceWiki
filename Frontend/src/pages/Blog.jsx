import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-teal-500 font-mono text-xs animate-pulse">Loading Articles...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30">
      
      {/* Hero */}
      <header className="relative border-b border-slate-800 bg-slate-900/50 pt-20 pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Insights
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Read guides and thoughts on quantitative finance.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Search */}
        <div className="mb-12">
           <input 
             type="text" 
             placeholder="Search articles..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full md:w-96 bg-slate-900 border border-slate-800 rounded-lg py-3 px-4 text-slate-200 focus:border-teal-500 focus:outline-none transition-colors"
           />
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <Link 
              to={`/blog/${post.id}`} 
              key={post.id}
              className="group flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-teal-500/30 transition-all hover:shadow-lg hover:shadow-black/20"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-4 font-mono uppercase tracking-wide">
                  <span>{post.category}</span>
                  <span>{post.date}</span>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-teal-400 transition-colors">
                  {post.title}
                </h2>
                
                <p className="text-slate-400 mb-8 leading-relaxed flex-grow">
                  {post.excerpt}
                </p>

                <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-sm">
                   <span className="font-bold text-teal-500 group-hover:underline">Read Article</span>
                   <div className="flex gap-4 text-slate-600">
                     <span>{post.likes} Likes</span>
                     <span>{post.comment_count} Comments</span>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Blog;