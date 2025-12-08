import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Helmet } from 'react-helmet';
const API_URL = import.meta.env.VITE_API_URL;

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SectionTab = ({ active, label, onClick, id, controls }) => (
  <button
    onClick={onClick}
    role="tab"
    aria-selected={active}
    aria-controls={controls}
    id={id}
    tabIndex={active ? 0 : -1}
    className={cn(
      "px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm font-bold transition-all duration-300 border whitespace-nowrap snap-center",
      active
        ? "bg-teal-500/10 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]"
        : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
    )}
  >
    {label}
  </button>
);

const RoleCard = ({ role }) => {
  const [expanded, setExpanded] = useState(false);

  // Extract first sentence
  const firstSentence = role.focus.split('. ')[0] + (role.focus.includes('.') ? '.' : '');
  const isExpandable = role.focus.split('. ').length > 1;

  return (
    <article className="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl p-6 md:p-8 hover:border-teal-500/30 transition-all group active:scale-[0.99] duration-200">
      <header className="flex items-center gap-3 mb-4 md:mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-teal-400 transition-colors">
          {role.team}
        </h3>
      </header>
      <div className="space-y-4 md:space-y-6">
        <div>
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-bold">Focus</span>
          <p className="text-slate-300 mt-1 leading-relaxed text-sm md:text-base">
            {expanded ? role.focus : firstSentence}
            {isExpandable && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-2 text-teal-400 font-bold underline text-sm"
              >
                {expanded ? 'Show Less' : 'Read More'}
              </button>
            )}
          </p>
        </div>
        <div>
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-bold">Main Goal</span>
          <p className="text-slate-400 mt-1 text-sm md:text-base">{role.primary_objective}</p>
        </div>
        <div>
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-bold">Tech Stack</span>
          <p className="text-teal-400 font-mono mt-1 border-l-2 border-teal-500 pl-3 text-sm md:text-base">
            {role.programming_focus}
          </p>
        </div>
      </div>
    </article>
  );
};

const TimelineStep = ({ step, index, isLast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = `step-content-${index}`;
  const headerId = `step-header-${index}`;

  return (
    <li className="relative pl-10 md:pl-12 pb-8 md:pb-12 last:pb-0 list-none">
      {!isLast && (
        <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gradient-to-b from-teal-500/50 to-slate-800" aria-hidden="true" />
      )}

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={contentId}
        id={headerId}
        className={cn(
          "absolute left-0 top-0 w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-colors bg-slate-950",
          isOpen ? "border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)]" : "border-slate-700 text-slate-500 hover:border-slate-500"
        )}
        whileTap={{ scale: 0.9 }}
      >
        <span className="font-bold text-sm">{index + 1}</span>
        <span className="sr-only">Toggle details for {step.title}</span>
      </motion.button>

      <motion.div
        layout
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "bg-slate-900/50 border rounded-xl p-5 md:p-6 cursor-pointer transition-all duration-300 active:scale-[0.98]",
          isOpen ? "border-teal-500/50 bg-slate-900/80" : "border-slate-800 hover:border-slate-700"
        )}
      >
        <div className="flex justify-between items-center">
          <h3 className={cn("text-base md:text-lg font-bold transition-colors pr-4", isOpen ? "text-teal-100" : "text-slate-300")}>
            {step.title}
          </h3>
          <span className={cn("text-slate-500 text-xl transition-transform duration-300", isOpen && "rotate-90 text-teal-500")} aria-hidden="true">
            ›
          </span>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id={contentId}
              role="region"
              aria-labelledby={headerId}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-slate-400 leading-relaxed overflow-hidden text-sm md:text-base"
            >
              <div className="pt-4 border-t border-slate-800/50 mt-4">
                {step.description}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </li>
  );
};

const SkillBadge = ({ skill }) => {
  const getColors = (level) => {
    switch (level) {
      case 'Expert': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Proficient': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    }
  };

  return (
    <article className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between hover:border-slate-700 transition-all group active:scale-[0.98]">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-bold text-slate-200">{skill.name}</h4>
          <span className={cn("text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider", getColors(skill.level))}>
            {skill.level}
          </span>
        </div>
        <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors leading-snug">{skill.importance}</p>
      </div>
      <div className="w-full bg-slate-800 h-1.5 mt-5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={skill.level === 'Expert' ? 100 : 75} aria-valuemin="0" aria-valuemax="100">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: skill.level === 'Expert' ? '100%' : '75%' }}
          transition={{ duration: 1, delay: 0.2 }}
          className={cn("h-full rounded-full", skill.level === 'Expert' ? 'bg-rose-500' : 'bg-amber-500')}
        />
      </div>
    </article>
  );
};

function RoadmapDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/roadmaps/${id}`);
        const json = await res.json();
        const roadmapData = json.developer_guide || json;
        setData(roadmapData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center" role="status" aria-busy="true">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <p className="text-teal-500 font-mono text-xs">Loading...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      Roadmap not found.
    </div>
  );

  const filteredResources = data.resources?.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredSchools = data.schools?.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        "name": data.title,
        "description": data.description,
        "provider": {
          "@type": "Organization",
          "name": "QuantFinanceWiki.com",
          "sameAs": "https://QuantFinanceWiki.com"
        },
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": "Online"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Roadmaps", "item": "https://QuantFinanceWiki.com/roadmaps" },
          { "@type": "ListItem", "position": 2, "name": data.title, "item": `https://QuantFinanceWiki.com/roadmaps/${id}` }
        ]
      },
      {
        "@type": "HowTo",
        "name": `How to become a ${data.title}`,
        "step": data.roadmap_steps?.map((step, index) => ({
          "@type": "HowToStep",
          "position": index + 1,
          "name": step.title,
          "text": step.description
        }))
      }
    ]
  };

const OverviewDescription = ({ description }) => {
  const [expanded, setExpanded] = useState(false);

  const [firstSentence, ...rest] = description.split('. ');
  const restText = rest.length > 0 ? rest.join('. ') + (description.endsWith('.') ? '.' : '') : '';

  const isExpandable = restText.length > 0;

  return (
    <div className="text-lg md:text-xl text-slate-400 max-w-3xl leading-relaxed">
      <p className="m-0">{firstSentence}.</p>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.p
            key="expanded-text"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden m-0"
          >
            {restText}
          </motion.p>
        )}
      </AnimatePresence>

      {isExpandable && (
        <motion.button
          onClick={() => setExpanded(!expanded)}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "mt-3 px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm font-bold transition-all duration-300 border",
            expanded
              ? "bg-teal-500/10 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)] hover:bg-teal-500/20 hover:shadow-[0_0_25px_rgba(20,184,166,0.25)]"
              : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
          )}
        >
          {expanded ? 'Show Less' : 'Read More'}
        </motion.button>
      )}
    </div>
  );
};


  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      <Helmet>
        <title>{data.title} | QuantFinanceWiki.com Career Roadmap</title>
        <meta name="description" content={`A complete step-by-step roadmap to becoming a ${data.title}.`} />
        <meta property="og:title" content={`${data.title} Roadmap`} />
        <meta property="og:description" content={data.description} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center gap-3 md:gap-4">
          <Link to="/roadmaps" className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 p-1 -ml-1" aria-label="Back to Roadmaps">
            <span className="text-lg leading-none" aria-hidden="true">←</span>
            <span className="hidden xs:inline">Back</span>
          </Link>
          <div className="h-5 w-px bg-slate-800 mx-1 md:mx-2" aria-hidden="true"></div>
          <div className="overflow-hidden">
            <h1 className="text-xs md:text-sm font-bold text-slate-100 uppercase tracking-wide truncate">{data.title}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 relative">
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-teal-500/5 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" aria-hidden="true"></div>

        <section className="mb-8 md:mb-12 relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 md:mb-6 tracking-tight leading-tight">{data.title}</h2>

          <OverviewDescription description={data.description} />
        </section>

        <nav
          className={cn(
            "flex gap-2 md:gap-3 mb-8 md:mb-12 pb-2 md:pb-5 border-b border-slate-800 overflow-x-auto relative z-10 snap-x",
            "scrollbar-none mask-image-linear-to-r"
          )}
          role="tablist"
          aria-label="Roadmap sections"
        >
          <SectionTab
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            label="Overview"
            id="tab-overview"
            controls="panel-overview"
          />
          <SectionTab
            active={activeTab === 'roadmap'}
            onClick={() => setActiveTab('roadmap')}
            label="Timeline"
            id="tab-roadmap"
            controls="panel-roadmap"
          />
          <SectionTab
            active={activeTab === 'skills'}
            onClick={() => setActiveTab('skills')}
            label="Skills"
            id="tab-skills"
            controls="panel-skills"
          />
          <SectionTab
            active={activeTab === 'knowledge'}
            onClick={() => setActiveTab('knowledge')}
            label="Resources"
            id="tab-knowledge"
            controls="panel-knowledge"
          />
        </nav>

        <AnimatePresence mode='wait'>

          {activeTab === 'overview' && (
            <motion.section
              key="overview"
              role="tabpanel"
              id="panel-overview"
              aria-labelledby="tab-overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Career Paths</h3>
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-12 md:mb-16">
                {data.roles_comparison?.map((role, idx) => (
                  <RoleCard key={idx} role={role} />
                ))}
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Checklist</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {data.roadmap?.map((item, idx) => (
                  <article key={idx} className="bg-slate-900/30 p-5 md:p-6 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-3 mb-2 md:mb-3 text-teal-400">
                      <span className="font-bold text-lg" aria-hidden="true">✓</span>
                      <h4 className="font-bold text-slate-200 text-sm md:text-base">{item.title}</h4>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                  </article>
                ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'roadmap' && (
            <motion.section
              key="roadmap"
              role="tabpanel"
              id="panel-roadmap"
              aria-labelledby="tab-roadmap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Step by Step</h3>
              <p className="text-slate-500 mb-8 md:mb-10 text-base md:text-lg">Follow this order to learn effectively.</p>

              <ul className="ml-0 md:ml-4">
                {data.roadmap_steps?.map((step, idx) => (
                  <TimelineStep
                    key={idx}
                    step={step}
                    index={idx}
                    isLast={idx === data.roadmap_steps.length - 1}
                  />
                ))}
              </ul>
            </motion.section>
          )}

          {activeTab === 'skills' && (
            <motion.section
              key="skills"
              role="tabpanel"
              id="panel-skills"
              aria-labelledby="tab-skills"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">What You Need to Know</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {data.skills?.map((skill, idx) => (
                  <SkillBadge key={idx} skill={skill} />
                ))}
              </div>
            </motion.section>
          )}

          {activeTab === 'knowledge' && (
            <motion.section
              key="knowledge"
              role="tabpanel"
              id="panel-knowledge"
              aria-labelledby="tab-knowledge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">Resources</h3>
                  <p className="text-slate-500 mt-2 text-sm md:text-base">Books, courses, and schools.</p>
                </div>
                <div className="relative w-full md:w-72" role="search">
                  <label htmlFor="resource-search" className="sr-only">Search resources</label>
                  <input
                    id="resource-search"
                    type="text"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-base md:text-sm focus:border-teal-500 focus:outline-none placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-lg md:text-xl font-bold text-teal-400 mb-6 flex items-center gap-2 pb-2 border-b border-slate-800">
                  Recommended Reading
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {filteredResources.map((res, idx) => (
                    <article key={idx} className="bg-slate-900/50 p-5 md:p-6 rounded-xl border border-slate-800 flex flex-col hover:border-slate-700 transition-all active:scale-[0.99]">
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-bold text-slate-200 text-base md:text-lg">{res.title}</h5>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 uppercase font-bold tracking-wider whitespace-nowrap ml-2">{res.type}</span>
                      </div>
                      <p className="text-sm text-slate-400 flex-grow mb-4 leading-relaxed">{res.description}</p>

                      <div className="mt-auto pt-4 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-3">
                        {res.difficulty && (
                          <div className="text-xs text-teal-500 font-mono bg-teal-900/10 px-2 py-1 rounded inline-block">
                            Target: {res.difficulty}
                          </div>
                        )}

                        {res.link && (
                          <a
                            href={res.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-bold text-teal-400 hover:text-teal-300 transition-colors group/link ml-auto p-1"
                            aria-label={`View resource: ${res.title}`}
                          >
                            View Resource
                            <span className="transition-transform group-hover/link:translate-x-1" aria-hidden="true">→</span>
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg md:text-xl font-bold text-indigo-400 mb-6 flex items-center gap-2 pb-2 border-b border-slate-800">
                  Schools
                </h4>
                <div className="space-y-4">
                  {filteredSchools.map((school, idx) => (
                    <article key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border border-slate-800/50 hover:bg-slate-900 transition-colors bg-slate-900/20 active:scale-[0.99]">
                      <div className="mb-3 md:mb-0">
                        <h5 className="font-bold text-slate-200">{school.name}</h5>
                        <p className="text-sm text-indigo-400 mt-1">{school.program}</p>
                      </div>
                      {school.notes && (
                        <p className="text-sm text-slate-500 md:text-right md:max-w-md">
                          {school.notes}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </div>

            </motion.section>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

export default RoadmapDetail;