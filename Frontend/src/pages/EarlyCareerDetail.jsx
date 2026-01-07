import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Giscus from '@giscus/react';

const API_URL = import.meta.env.VITE_API_URL;
const SITE_URL = "https://QuantFinanceWiki.com";

function EarlyCareerDetail() {
    const { slug } = useParams();
    const [opportunity, setOpportunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollProgressRef = useRef(0);

    useEffect(() => {
        const fetchOpportunity = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${API_URL}/api/early-career/slug/${slug}`);

                if (!response.ok) {
                    throw new Error(`Opportunity not found: ${response.status}`);
                }

                const data = await response.json();
                setOpportunity(data);
            } catch (err) {
                console.error('Error fetching opportunity:', err);
                setError(err.message || 'Failed to load opportunity');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchOpportunity();
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
                    <h2 className="text-xl font-bold text-white mb-2">Opportunity Not Found</h2>
                    <p className="text-slate-300 mb-6">{error}</p>
                    <Link
                        to="/firms"
                        className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                    >
                        Back to Career Directory
                    </Link>
                </div>
            </div>
        );
    }

    if (!opportunity) return null;

    const canonicalUrl = `${SITE_URL}/early-career/${slug}`;
    const hasRoles = opportunity.roles && opportunity.roles.length > 0;

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
            <Helmet>
                <title>{opportunity.name} | QuantFinanceWiki</title>
                <meta name="description" content={opportunity.description} />
                <link rel="canonical" href={canonicalUrl} />

                {/* Open Graph */}
                <meta property="og:title" content={`${opportunity.name} | QuantFinanceWiki`} />
                <meta property="og:description" content={opportunity.description} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content="website" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={`${opportunity.name} | QuantFinanceWiki`} />
                <meta name="twitter:description" content={opportunity.description} />

                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "EducationalOccupationalProgram",
                        "name": opportunity.name,
                        "description": opportunity.description,
                        "occupationalCategory": opportunity.category,
                        "programPrerequisites": opportunity.requirements?.join(' ') || '',
                        "offers": hasRoles ? opportunity.roles.map(role => ({
                            "@type": "Offer",
                            "url": role.startsWith('http') ? role : `https://${role}`
                        })) : undefined
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
                    to="/firms"
                    className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-teal-400 mb-8 transition-colors group focus:outline-none focus:text-teal-400"
                >
                    <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                    <span>Back to Career Directory</span>
                </Link>

                <article className="bg-[#0f1623] border border-slate-800 rounded-2xl overflow-hidden mb-12">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                                        {opportunity.name}
                                    </h1>
                                    {opportunity.category && (
                                        <span className="text-xs font-bold uppercase px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                            {opportunity.category}
                                        </span>
                                    )}
                                </div>

                                {opportunity.location && (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{opportunity.location}</span>
                                    </div>
                                )}
                            </div>

                            {hasRoles && (
                                <a
                                    href={opportunity.roles[0]}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow"
                                    className="flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 whitespace-nowrap"
                                >
                                    Learn More / Apply
                                    <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                        </div>

                        <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                            {opportunity.description}
                        </p>

                        {/* Requirements Section */}
                        {opportunity.requirements && opportunity.requirements.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-white mb-4">Requirements</h2>
                                <ul className="space-y-3">
                                    {opportunity.requirements.map((req, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="text-emerald-500 mr-3 mt-1" aria-hidden="true">•</span>
                                            <span className="text-slate-300 leading-relaxed">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Qualities Section */}
                        {opportunity.qualities && opportunity.qualities.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-white mb-4">Desired Qualities</h2>
                                <div className="flex flex-wrap gap-3">
                                    {opportunity.qualities.map((quality, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-full text-sm text-slate-300"
                                        >
                                            {quality}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Links Section */}
                        {hasRoles && (
                            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4">Application Links</h2>
                                <p className="text-slate-300 mb-6">Apply directly through the official links below:</p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {opportunity.roles.map((role, index) => (
                                        <a
                                            key={index}
                                            href={role.startsWith('http') ? role : `https://${role}`}
                                            target="_blank"
                                            rel="noopener noreferrer nofollow"
                                            className="flex-1 text-center px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                                        >
                                            {index === 0 ? 'Primary Application Page' : `Link ${index + 1}`}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </article>

                {/* Comments Section */}
                <div className="bg-[#0f1623] border border-slate-800 rounded-2xl p-6 md:p-8">
                    <h2 className="text-xl font-bold text-white mb-6">Community Discussion</h2>
                    <p className="text-slate-300 mb-8">
                        Share your experience with {opportunity.name}. Discuss application tips, program experiences, and outcomes.
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
                    <h2 className="text-lg font-semibold text-white mb-4">Early Career Opportunities in Quantitative Finance</h2>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {opportunity.name} is part of the QuantFinanceWiki early career directory, which tracks opportunities for students and recent graduates in quantitative finance.
                        The directory includes internships, insight programs, competitions, fellowships, and other entry-level opportunities at top quantitative finance firms.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default EarlyCareerDetail;