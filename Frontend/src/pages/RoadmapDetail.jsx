import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility for cleaner tailwind classes ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Sub-Components ---

const SectionTab = ({ active, label, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 border",
      active 
        ? "bg-teal-500/10 border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]" 
        : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
    )}
  >
    {label}
  </button>
);

const RoleCard = ({ role }) => (
  <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl p-8 hover:border-teal-500/30 transition-colors group">
    <div className="flex items-center gap-3 mb-6">
      <h3 className="text-2xl font-bold text-white group-hover:text-teal-400 transition-colors">
        {role.team}
      </h3>
    </div>
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Focus</span>
        <p className="text-slate-300 mt-1 leading-relaxed">{role.focus}</p>
      </div>
      <div>
        <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Main Goal</span>
        <p className="text-sm text-slate-400 mt-1">{role.primary_objective}</p>
      </div>
      <div>
        <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Tech Stack</span>
        <p className="text-sm text-teal-400 font-mono mt-1 border-l-2 border-teal-500 pl-3">
            {role.programming_focus}
        </p>
      </div>
    </div>
  </div>
);

const TimelineStep = ({ step, index, isLast }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative pl-12 pb-12 last:pb-0">
      {/* Vertical Line */}
      {!isLast && (
        <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gradient-to-b from-teal-500/50 to-slate-800" />
      )}
      
      {/* Node */}
      <motion.button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "absolute left-0 top-0 w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-colors bg-slate-950",
          isOpen ? "border-teal-500 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)]" : "border-slate-700 text-slate-500 hover:border-slate-500"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="font-bold text-sm">{index + 1}</span>
      </motion.button>

      {/* Content */}
      <motion.div 
        layout
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "bg-slate-900/50 border rounded-xl p-6 cursor-pointer transition-all duration-300",
          isOpen ? "border-teal-500/50 bg-slate-900/80" : "border-slate-800 hover:border-slate-700"
        )}
      >
        <div className="flex justify-between items-center">
          <h3 className={cn("text-lg font-bold transition-colors", isOpen ? "text-teal-100" : "text-slate-300")}>
            {step.title}
          </h3>
          <span className={cn("text-slate-500 text-xl transition-transform duration-300", isOpen && "rotate-90 text-teal-500")}>
             ›
          </span>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-slate-400 leading-relaxed overflow-hidden"
            >
              <div className="pt-4 border-t border-slate-800/50 mt-4">
                {step.description}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const SkillBadge = ({ skill }) => {
  const getColors = (level) => {
    switch(level) {
      case 'Expert': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Proficient': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between hover:border-slate-700 transition-all group">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-bold text-slate-200">{skill.name}</h4>
          <span className={cn("text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider", getColors(skill.level))}>
            {skill.level}
          </span>
        </div>
        <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors leading-snug">{skill.importance}</p>
      </div>
      <div className="w-full bg-slate-800 h-1.5 mt-5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: skill.level === 'Expert' ? '100%' : '75%' }}
          transition={{ duration: 1, delay: 0.2 }}
          className={cn("h-full rounded-full", skill.level === 'Expert' ? 'bg-rose-500' : 'bg-amber-500')}
        />
      </div>
    </div>
  );
};

// --- Main Component ---

function RoadmapDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/roadmaps/${id}`);
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-teal-500 font-mono text-sm">Loading...</p>
      </div>
    </div>
  );

  if (!data) return <div className="text-white">Roadmap not found.</div>;

  const filteredResources = data.resources?.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredSchools = data.schools?.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30">
      
      {/* 1. Header / Breadcrumbs */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/roadmaps" className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            <span className="text-lg">←</span> Back
          </Link>
          <div className="h-6 w-px bg-slate-800 mx-2"></div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 uppercase tracking-wide">{data.title}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12 relative">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* 2. Intro Hero */}
        <section className="mb-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">{data.title}</h2>
          <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">{data.description}</p>
        </section>

        {/* 3. Navigation Tabs */}
        <nav className={cn(
            "flex flex-wrap gap-3 mb-12 pb-5 border-b border-slate-800 overflow-x-auto relative z-10",
            "[&::-webkit-scrollbar]:h-2",
            "[&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:bg-slate-800",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "[&::-webkit-scrollbar-thumb]:border-2",
            "[&::-webkit-scrollbar-thumb]:border-slate-900",
            "[&::-webkit-scrollbar-thumb]:hover:bg-teal-500/80"
        )}>
          <SectionTab 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
            label="Overview & Roles" 
          />
          <SectionTab 
            active={activeTab === 'roadmap'} 
            onClick={() => setActiveTab('roadmap')} 
            label="Timeline" 
          />
          <SectionTab 
            active={activeTab === 'skills'} 
            onClick={() => setActiveTab('skills')} 
            label="Skills" 
          />
          <SectionTab 
            active={activeTab === 'knowledge'} 
            onClick={() => setActiveTab('knowledge')} 
            label="Resources" 
          />
        </nav>

        {/* 4. Content Area */}
        <AnimatePresence mode='wait'>
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.section 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Career Paths</h3>
              <div className="flex flex-col md:flex-row gap-6 mb-16">
                {data.roles_comparison?.map((role, idx) => (
                  <RoleCard key={idx} role={role} />
                ))}
              </div>

              <h3 className="text-2xl font-bold text-white mb-6">Checklist</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {data.roadmap?.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/30 p-6 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-3 mb-3 text-teal-400">
                      <span className="font-bold text-lg">✓</span>
                      <h4 className="font-bold text-slate-200">{item.title}</h4>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* TAB: THE ROADMAP (TIMELINE) */}
          {activeTab === 'roadmap' && (
            <motion.section
              key="roadmap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl"
            >
              <h3 className="text-3xl font-bold text-white mb-2">Step by Step</h3>
              <p className="text-slate-500 mb-10 text-lg">Follow this order to learn effectively.</p>
              
              <div className="ml-4">
                {data.roadmap_steps?.map((step, idx) => (
                  <TimelineStep 
                    key={idx} 
                    step={step} 
                    index={idx} 
                    isLast={idx === data.roadmap_steps.length - 1} 
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* TAB: SKILLS */}
          {activeTab === 'skills' && (
            <motion.section
              key="skills"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h3 className="text-3xl font-bold text-white mb-8">What You Need to Know</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.skills?.map((skill, idx) => (
                  <SkillBadge key={idx} skill={skill} />
                ))}
              </div>
            </motion.section>
          )}

          {/* TAB: KNOWLEDGE BASE */}
          {activeTab === 'knowledge' && (
            <motion.section
              key="knowledge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div>
                  <h3 className="text-3xl font-bold text-white">Resources</h3>
                  <p className="text-slate-500 mt-2">Books, courses, and schools.</p>
                </div>
                <div className="relative w-full md:w-72">
                  <input 
                    type="text" 
                    placeholder="Search resources..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm focus:border-teal-500 focus:outline-none placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="mb-8">
                  <h4 className="text-xl font-bold text-teal-400 mb-6 flex items-center gap-2 pb-2 border-b border-slate-800">
                    Recommended Reading
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredResources.map((res, idx) => (
                      <div key={idx} className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex flex-col hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-bold text-slate-200 text-lg">{res.title}</h5>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 uppercase font-bold tracking-wider">{res.type}</span>
                        </div>
                        <p className="text-sm text-slate-400 flex-grow mb-4 leading-relaxed">{res.description}</p>
                        {res.difficulty && (
                          <div className="text-xs text-teal-500 font-mono bg-teal-900/10 px-2 py-1 rounded inline-block">
                            Target: {res.difficulty}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
              </div>

              <div>
                  <h4 className="text-xl font-bold text-indigo-400 mb-6 flex items-center gap-2 pb-2 border-b border-slate-800">
                    Schools
                  </h4>
                  <div className="space-y-4">
                    {filteredSchools.map((school, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border border-slate-800/50 hover:bg-slate-900 transition-colors bg-slate-900/20">
                        <div>
                          <h5 className="font-bold text-slate-200">{school.name}</h5>
                          <p className="text-sm text-indigo-400 mt-1">{school.program}</p>
                        </div>
                        {school.notes && (
                          <p className="text-sm text-slate-500 md:text-right md:max-w-md mt-3 md:mt-0">
                            {school.notes}
                          </p>
                        )}
                      </div>
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