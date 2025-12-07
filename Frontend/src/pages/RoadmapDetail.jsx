import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

function RoadmapDetail() {
  const { id } = useParams()
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterQuery, setFilterQuery] = useState('')

  // NEW: State to manage the expanded/collapsed status of each section
  const [expandedSections, setExpandedSections] = useState({
    steps: true, // Start steps open by default
    schools: true, // Start schools open by default
    skills: true,
    resources: true,
  })

  // NEW: Function to toggle the expansion state
  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }))
  }

  useEffect(() => {
    fetch(`/api/roadmaps/${id}`)
      .then(res => res.json())
      .then(data => {
        setRoadmap(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching roadmap:', err)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
        <div className="text-teal-500 font-mono text-lg animate-pulse">Initializing data stream...</div>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500 font-medium bg-slate-900 px-6 py-4 rounded-lg border border-slate-800">
          Roadmap data unavailable
        </div>
      </div>
    )
  }

  // Filter Logic for Sections
  const query = filterQuery.toLowerCase()
  
  const filteredSchools = roadmap.schools 
    ? roadmap.schools.filter(s => s.name.toLowerCase().includes(query) || s.program.toLowerCase().includes(query))
    : []
    
  const filteredSkills = roadmap.skills
    ? roadmap.skills.filter(s => s.name.toLowerCase().includes(query) || s.importance?.toLowerCase().includes(query))
    : []

  const filteredResources = roadmap.resources
    ? roadmap.resources.filter(r => r.title.toLowerCase().includes(query) || r.description.toLowerCase().includes(query))
    : []

  const filteredRoadmapSteps = roadmap.roadmap_steps
    ? roadmap.roadmap_steps.filter(step => step.title.toLowerCase().includes(query) || step.description.toLowerCase().includes(query))
    : []
  
  const hasResults = filteredSchools.length > 0 || filteredSkills.length > 0 || filteredResources.length > 0 || filteredRoadmapSteps.length > 0

  // Helper component for the collapsible header structure
  const CollapsibleHeader = ({ title, sectionName, count }) => (
    <button
      className="flex justify-between items-center w-full text-left pb-4 border-b border-slate-800 hover:text-white transition-colors"
      onClick={() => toggleSection(sectionName)}
    >
      <h2 className="text-2xl font-semibold text-white flex items-center">
        {title}
        {count !== undefined && <span className="ml-3 text-sm font-normal text-slate-500">({count})</span>}
      </h2>
      <svg 
        className={`w-5 h-5 text-teal-400 transform transition-transform duration-300 ${expandedSections[sectionName] ? 'rotate-180' : 'rotate-0'}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Top Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link 
            to="/roadmaps" 
            className="group inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
          >
            <span className="mr-2 group-hover:-translate-x-1 transition-transform bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center text-xs">←</span> 
            Back to Index
          </Link>
          
          {/* Internal Search Bar */}
          <div className="relative w-full max-w-xs hidden sm:block">
            <input 
              type="text" 
              placeholder={`Search inside ${roadmap.title}...`}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-full py-1.5 pl-4 pr-4 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all placeholder-slate-600"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Mobile Search (visible only on small screens) */}
        <div className="sm:hidden mb-8">
           <input 
             type="text" 
             placeholder="Search content..."
             value={filterQuery}
             onChange={(e) => setFilterQuery(e.target.value)}
             className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-sm focus:border-teal-500 focus:outline-none"
           />
        </div>

        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">{roadmap.title}</h1>
          <p className="text-slate-400 text-xl max-w-3xl leading-relaxed">{roadmap.description}</p>
        </div>

        {!hasResults && filterQuery ? (
           <div className="py-12 text-center bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
             <p className="text-slate-400">No content matches "{filterQuery}" in this roadmap.</p>
             <button onClick={() => setFilterQuery('')} className="mt-2 text-teal-400 hover:underline">Clear filter</button>
           </div>
        ) : (
          <>
            {/* Roadmap Steps Section */}
            {filteredRoadmapSteps.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-12 transition-colors shadow-lg shadow-black/20">
                <CollapsibleHeader title="Career Path Steps" sectionName="steps" count={filteredRoadmapSteps.length} />
                {expandedSections.steps && (
                  <ol className="relative border-l border-slate-700 space-y-8 pt-8">                  
                    {filteredRoadmapSteps.map((step, idx) => (
                      <li key={idx} className="ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-900/70 rounded-full -left-3 ring-8 ring-slate-950 border border-indigo-500 text-xs font-bold text-white">
                            {step.step || (idx + 1)}
                        </span>
                        <h3 className="flex items-center mb-1 text-xl font-semibold text-slate-100">{step.title}</h3>
                        <p className="text-base font-normal text-slate-400">{step.description}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
            
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              
              {/* Schools Section */}
              {filteredSchools.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 transition-colors shadow-lg shadow-black/20">
                  <CollapsibleHeader title="Top Institutions" sectionName="schools" count={filteredSchools.length} />
                  {expandedSections.schools && (
                    <div className="space-y-6 pt-8">
                      {filteredSchools.map((school, idx) => (
                        <div key={idx} className="group pl-4 border-l-2 border-slate-700 hover:border-teal-400 transition-colors duration-300">
                          <h3 className="font-bold text-lg text-slate-100 group-hover:text-teal-300 transition-colors">{school.name}</h3>
                          <p className="text-slate-400 font-mono text-sm mt-1">{school.program}</p>
                          {school.notes && <p className="text-sm text-slate-500 mt-2 italic bg-slate-950/50 p-2 rounded border border-slate-800/50">{school.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Skills Section */}
              {filteredSkills.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 transition-colors shadow-lg shadow-black/20">
                  <CollapsibleHeader title="Required Skills" sectionName="skills" count={filteredSkills.length} />
                  {expandedSections.skills && (
                    <div className="space-y-4 pt-8">
                      {filteredSkills.map((skill, idx) => (
                        <div key={idx} className="flex flex-col p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-emerald-500/30 transition-all">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-base text-slate-100">{skill.name}</h3>
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border ${
                              skill.level === 'Expert' ? 'text-red-400 bg-red-950/30 border-red-900/50' : 
                              skill.level === 'Proficient' ? 'text-yellow-400 bg-yellow-950/30 border-yellow-900/50' : 
                              'text-emerald-400 bg-emerald-950/30 border-emerald-900/50'
                            }`}>
                              {skill.level}
                            </span>
                          </div>
                          {skill.importance && <p className="text-sm text-slate-500 leading-snug">{skill.importance}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Resources Section */}
            {filteredResources.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/40">
                <CollapsibleHeader title="Recommended Resources" sectionName="resources" count={filteredResources.length} />
                {expandedSections.resources && (
                  <div className="grid md:grid-cols-2 gap-6 pt-8">
                    {filteredResources.map((resource, idx) => (
                      <div key={idx} className="bg-slate-950/80 p-6 rounded-xl border border-slate-800 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-900/10 transition-all duration-300 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-lg text-slate-200">{resource.title}</h3>
                        </div>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-grow">{resource.description}</p>
                        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-900">
                          <span className="text-xs font-medium bg-slate-800 text-slate-300 px-3 py-1 rounded-md border border-slate-700">
                            {resource.type}
                          </span>
                          {resource.difficulty && (
                            <span className="text-xs font-medium bg-indigo-950/30 text-indigo-300 px-3 py-1 rounded-md border border-indigo-900/50">
                              {resource.difficulty}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default RoadmapDetail