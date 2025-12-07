import { useState, useEffect } from 'react'

function Firms() {
  const [firms, setFirms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  // New state for search functionality
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/firms')
      .then(res => res.json())
      .then(data => {
        setFirms(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching firms:', err)
        setLoading(false)
      })
  }, [])

  const categories = ['all', ...new Set(firms.map(firm => firm.category).filter(Boolean))]

  // Update filteredFirms to include Search Logic AND Category Logic
  const filteredFirms = firms.filter(firm => {
    // 1. Check Category
    const categoryMatch = selectedCategory === 'all' || firm.category === selectedCategory

    // 2. Check Search Query (case insensitive)
    const query = searchQuery.toLowerCase()
    const searchMatch = query === '' || 
      firm.name?.toLowerCase().includes(query) ||
      firm.description?.toLowerCase().includes(query) ||
      firm.location?.toLowerCase().includes(query) ||
      firm.roles?.some(role => role.toLowerCase().includes(query))

    return categoryMatch && searchMatch
  })

  // Handler to reset all filters
  const clearFilters = () => {
    setSelectedCategory('all')
    setSearchQuery('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        <div className="text-emerald-500 font-mono animate-pulse text-sm uppercase tracking-widest">Loading market data...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Header Section */}
      <div className="relative bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Top Quantitative Firms
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed">
            Discover what leading institutions look for in candidates, explore roles, and analyze requirements.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Controls Section - Sticky for better UX */}
        <div className="sticky top-4 z-10 backdrop-blur-xl bg-slate-950/80 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 p-4 mb-10">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96 group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search firms, roles, or locations..."
                className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg leading-5 text-slate-300 placeholder-slate-600 focus:outline-none focus:bg-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:text-sm transition-all duration-200"
              />
            </div>

            {/* Category Filter Pills (Scrollbar styling added) */}
            <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0 
                          /* Custom Scrollbar Styles */
                          [&::-webkit-scrollbar]:h-1 
                          [&::-webkit-scrollbar-thumb]:bg-slate-800 
                          [&::-webkit-scrollbar-thumb]:rounded-full 
                          [&::-webkit-scrollbar-track]:bg-slate-900 
                          scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
              <div className="flex space-x-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap border ${
                      selectedCategory === category
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-end mb-6 px-1">
          <span className="text-slate-500 text-sm font-mono">
            Showing {filteredFirms.length} {filteredFirms.length === 1 ? 'result' : 'results'}
          </span>
          {(selectedCategory !== 'all' || searchQuery) && (
            <button 
              onClick={clearFilters}
              className="text-xs text-emerald-500 hover:text-emerald-400 font-medium hover:underline flex items-center gap-1 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Grid Layout */}
        <div className="space-y-6 pb-20">
          {filteredFirms.length > 0 ? (
            filteredFirms.map(firm => (
              <div key={firm.id} className="group bg-slate-900/50 backdrop-blur-sm p-8 rounded-xl border border-slate-800 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-900/20 hover:bg-slate-900 transition-all duration-300 relative overflow-hidden">
                {/* Decorational gradient glow on hover */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>

                <div className="relative z-0">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-3 flex flex-wrap items-center gap-3">
                        {firm.name}
                        {firm.category && (
                          <span className="text-xs font-mono bg-slate-800/80 text-emerald-400 px-2 py-1 rounded border border-slate-700/50">
                            {firm.category.toUpperCase()}
                          </span>
                        )}
                      </h2>
                    </div>
                    {/* Location Icon Removed */}
                    {firm.location && (
                      <span className="text-slate-500 text-sm font-mono flex items-center bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                        {firm.location}
                      </span>
                    )}
                  </div>

                  {firm.description && (
                    <p className="text-slate-400 mb-8 leading-relaxed max-w-4xl">{firm.description}</p>
                  )}

                  <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-800/50">
                    <div>
                      {/* Looking For - Icon kept */}
                      <h3 className="font-semibold text-lg mb-4 text-emerald-200 flex items-center gap-2">
                        Looking For
                      </h3>
                      <ul className="space-y-3">
                        {firm.requirements && firm.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start group/item">
                            <span className="text-emerald-500/50 group-hover/item:text-emerald-400 mr-3 mt-1.5 text-xs transition-colors">■</span>
                            <span className="text-slate-300 text-sm">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      {/* Key Qualities - Icon kept */}
                      <h3 className="font-semibold text-lg mb-4 text-teal-200 flex items-center gap-2">
                        Key Qualities
                      </h3>
                      <ul className="space-y-3">
                        {firm.qualities && firm.qualities.map((quality, idx) => (
                          <li key={idx} className="flex items-start group/item">
                            <span className="text-teal-500/50 group-hover/item:text-teal-400 mr-3 mt-1.5 text-xs transition-colors">■</span>
                            <span className="text-slate-300 text-sm">{quality}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Renamed Section to Job Board and made the roles a functional link */}
                  {firm.roles && firm.roles.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-800/50">
                      <h3 className="font-mono text-xs uppercase tracking-wider text-slate-500 mb-3">Job Board</h3>
                      <div className="flex flex-wrap gap-2">
                        {firm.roles.map((role, idx) => {
                          // Check if the role content is a link/URL (simple check: starts with http or www)
                          const isLink = role.startsWith('http') || role.startsWith('www');
                          
                          if (isLink) {
                            return (
                              <a 
                                key={idx} 
                                href={role.startsWith('http') ? role : `https://${role}`} // Ensure link is full URL
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-emerald-800/30 border border-emerald-700/50 text-emerald-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700/50 hover:border-emerald-500 transition-all flex items-center gap-2"
                              >
                                View Open Roles
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                              </a>
                            );
                          } else {
                            return (
                              <span 
                                key={idx} 
                                className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1.5 rounded text-sm cursor-default"
                              >
                                {role}
                              </span>
                            );
                          }
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="text-center py-20 bg-slate-900/30 border border-slate-800/50 rounded-2xl border-dashed">
              <svg className="mx-auto h-12 w-12 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-slate-300">No firms found</h3>
              <p className="mt-2 text-slate-500">
                Try adjusting your search for "{searchQuery}" or changing the category filter.
              </p>
              <button 
                onClick={clearFilters}
                className="mt-6 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors text-sm font-medium"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Firms