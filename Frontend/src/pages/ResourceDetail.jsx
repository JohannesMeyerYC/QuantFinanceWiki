import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Giscus from '@giscus/react';
import { RenderBlock } from './RenderBlock.jsx';

const API_URL = import.meta.env.VITE_API_URL;

function ResourceDetail() {
  const { slug } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/api/resources/slug/${slug}`);
        
        if (!response.ok) {
          throw new Error(`Resource not found: ${response.status}`);
        }
        
        const data = await response.json();
        setResource(data);
      } catch (err) {
        console.error('Error fetching resource:', err);
        setError(err.message || 'Failed to load resource');
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchResource();
    }
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      scrollProgressRef.current = totalHeight > 0 ? scrollPosition / totalHeight : 0;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Function to extract text content from Content blocks for SEO
  const getContentForSEO = (content) => {
    if (!content || !Array.isArray(content)) return '';
    
    let text = '';
    for (const block of content) {
      if (block.type === 'paragraph' && block.text) {
        text += block.text + ' ';
      } else if (block.type === 'heading' && block.text) {
        text += block.text + ' ';
      } else if (block.type === 'list' && block.items) {
        for (const item of block.items) {
          if (item.text) text += item.text + ' ';
        }
      }
    }
    
    // Limit to ~500 characters for SEO description
    return text.trim().substring(0, 500) + (text.length > 500 ? '...' : '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-900/50 border border-slate-800 rounded-2xl max-w-md">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Resource Not Found</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <Link 
            to="/resources" 
            className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
          >
            Back to Resources
          </Link>
        </div>
      </div>
    );
  }

  if (!resource) return null;

  const canonicalUrl = `https://quantfinancewiki.com/resources/${slug}`;
  const seoContent = getContentForSEO(resource.Content) || resource.description || '';
  const isPdf = resource.type?.toLowerCase() === 'pdf' || 
                resource.filename?.toLowerCase().endsWith('.pdf') ||
                resource.link?.toLowerCase().includes('.pdf');
  
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      <Helmet>
        <title>{resource.title} | QuantFinanceWiki</title>
        {/* Use extracted content for SEO description (500 chars) */}
        <meta name="description" content={seoContent} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${resource.title} | QuantFinanceWiki`} />
        <meta property="og:description" content={seoContent} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        {resource.image && <meta property="og:image" content={resource.image} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${resource.title} | QuantFinanceWiki`} />
        <meta name="twitter:description" content={seoContent} />
        {resource.image && <meta name="twitter:image" content={resource.image} />}
        
        {/* Structured Data for Better SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": isPdf ? "DigitalDocument" : "Article",
            "name": resource.title,
            "description": seoContent,
            "url": canonicalUrl,
            "datePublished": resource.date || new Date().toISOString().split('T')[0],
            "author": {
              "@type": "Organization",
              "name": "QuantFinanceWiki"
            },
            "publisher": {
              "@type": "Organization",
              "name": "QuantFinanceWiki",
              "logo": {
                "@type": "ImageObject",
                "url": "https://quantfinancewiki.com/logo.png"
              }
            },
            ...(isPdf && {
              "fileFormat": "application/pdf",
              "encodingFormat": "application/pdf"
            })
          })}
        </script>
      </Helmet>

      {/* Progress Bar */}
      <div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-600 to-emerald-400 origin-left z-50 transition-transform duration-100 ease-out"
        style={{ transform: `scaleX(${scrollProgressRef.current})` }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-16">
        <Link 
          to="/resources" 
          className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-teal-400 mb-8 transition-colors group focus:outline-none focus:text-teal-400"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> 
          <span>Back to Resources</span>
        </Link>

        <article className="bg-[#0f1623] border border-slate-800 rounded-2xl overflow-hidden mb-12">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-2 items-center text-xs font-mono uppercase text-teal-500 mb-4">
              <span className="px-2 py-1 rounded bg-teal-500/10 border border-teal-500/20">
                {resource.type}
              </span>
              {isPdf && (
                <span className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-300">
                  PDF
                </span>
              )}
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300">
                {resource.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              {resource.title}
            </h1>
            
            {/* Enhanced Content Rendering with fallback */}
            <div className="mb-8 prose prose-lg prose-invert max-w-none">
              {resource.Content && Array.isArray(resource.Content) ? (
                resource.Content.map((block, index) => (
                  <RenderBlock key={index} block={block} />
                ))
              ) : resource.content ? (
                // Fallback to content field if Content array doesn't exist
                <div className="text-lg text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {resource.content}
                </div>
              ) : (
                <p className="text-lg text-slate-300 leading-relaxed">
                  {resource.description}
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {resource.link && (
                <a 
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                >
                  <span>{isPdf ? 'View PDF' : 'Visit Resource'}</span>
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              
              {/* Download button for PDFs */}
              {isPdf && resource.filename && !resource.link && (
                <a 
                  href={`${API_URL}/api/resources/download/${resource.filename}`}
                  className="inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                >
                  <span>Download PDF</span>
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </article>

        {/* Resource Details Section */}
        <div className="bg-[#0f1623] border border-slate-800 rounded-2xl p-6 md:p-8 mb-12">
          <h2 className="text-xl font-bold text-white mb-6">About This Resource</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Type</h3>
                <p className="text-white">{resource.type}</p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Category</h3>
                <p className="text-white">{resource.category}</p>
              </div>
            </div>
            
            {resource.keywords && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {resource.keywords.split(',').map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-slate-900/50 border border-slate-700 rounded-full text-sm text-slate-300"
                    >
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Additional metadata */}
            {resource.author && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Author</h3>
                <p className="text-white">{resource.author}</p>
              </div>
            )}
            
            {resource.date && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Published</h3>
                <p className="text-white">{new Date(resource.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-[#0f1623] border border-slate-800 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-6">Community Discussion</h2>
          <p className="text-slate-300 mb-8">
            Share your experience with this resource. Discuss its quality, effectiveness, and how it helped you.
          </p>
          
          <Giscus
            id="comments"
            repo="JohannesMeyerYC/comments"
            repoId="R_kgDOQtFBRg"
            category="Announcements"
            categoryId="DIC_kwDOQtFBRs4C0Hee"
            mapping="pathname"
            strict="0"
            reactionsEnabled="1"
            emitMetadata="0"
            inputPosition="top"
            theme="dark"
            lang="en"
            loading="lazy"
          />
        </div>

        {/* SEO Content */}
        <div className="mt-12 p-6 bg-slate-900/30 border border-slate-800 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Quantitative Finance Resources</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            This resource is part of the QuantFinanceWiki curated collection of quantitative finance materials. 
            The collection includes {resource.type.toLowerCase()}s, books, courses, and tools for quantitative analysis, 
            algorithmic trading, risk management, and financial engineering. All resources are evaluated for their 
            practical utility in quantitative finance careers and applications.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResourceDetail;