import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Roadmaps() {
  const [roadmaps, setRoadmaps] = useState([])
  const [loading, setLoading] = useState(true)
  
  // New State for functionality
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/roadmaps')
      .then(res => res.json())
      .then(data => {
        setRoadmaps(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching roadmaps:', err)
        setLoading(false)
      })
  }, [])

  // Search Logic
  const filteredRoadmaps = roadmaps.filter(roadmap => 
    roadmap.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    roadmap.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        <div className="text-emerald-500 font-mono text-sm uppercase tracking-widest animate-pulse">Loading roadmap index...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Hero Header */}
      <div className="relative bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            Quant Career Paths
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl border-l-4 border-emerald-500 pl-6 py-1">
            Curated strategic guides for navigating the quantitative finance landscape. Choose your trajectory.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
        
        {/* Search Control - Sticky */}
        <div className="sticky top-4 z-10 backdrop-blur-xl bg-slate-950/80 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 p-4 mb-10">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter roadmaps by title or keywords..."
              className="block w-full pl-10 pr-3 py-3 bg-slate-900 border border-slate-700 rounded-xl leading-5 text-slate-300 placeholder-slate-600 focus:outline-none focus:bg-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-end px-1">
          <span className="text-slate-500 text-sm font-mono uppercase tracking-wider">
            Available Paths: <span className="text-white">{filteredRoadmaps.length}</span>
          </span>
          {searchQuery && (
             <button 
             onClick={() => setSearchQuery('')}
             className="text-xs text-emerald-500 hover:text-emerald-400 font-medium hover:underline flex items-center gap-1 transition-colors"
           >
             Clear Search
           </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRoadmaps.length > 0 ? (
            filteredRoadmaps.map(roadmap => (
              <Link 
                key={roadmap.id} 
                to={`/roadmaps/${roadmap.id}`}
                className="group flex flex-col bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.15)] transition-all duration-300 relative overflow-hidden"
              >
                {/* Hover Glow Effect */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>

                <div className="relative z-0 flex flex-col h-full">
                  <h3 className="text-2xl font-bold mb-4 text-slate-100 group-hover:text-emerald-300 transition-colors">
                    {roadmap.title}
                  </h3>
                  <p className="text-slate-400 mb-8 flex-grow leading-relaxed">
                    {roadmap.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-800/50 mt-auto">
                    <span className="text-xs font-mono text-slate-500 group-hover:text-slate-400 transition-colors">VIEW DETAILS</span>
                    <div className="flex items-center text-emerald-400 font-medium group-hover:text-emerald-300">
                      <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">Explore</span>
                      <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
              <p className="text-slate-400">No roadmaps match your search.</p>
              <button onClick={() => setSearchQuery('')} className="mt-2 text-emerald-500 hover:underline">Reset Search</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Roadmaps