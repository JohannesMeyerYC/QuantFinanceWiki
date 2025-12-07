import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Roadmaps from './pages/Roadmaps'
import RoadmapDetail from './pages/RoadmapDetail'
import Firms from './pages/Firms'
import FAQ from './pages/FAQ'

function Navigation() {
  const location = useLocation()
  
  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-blue-400">Quant.com</Link>
          <div className="flex space-x-8">
            <Link 
              to="/" 
              className={`hover:text-blue-400 transition ${isActive('/') ? 'text-blue-400' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/roadmaps" 
              className={`hover:text-blue-400 transition ${isActive('/roadmaps') ? 'text-blue-400' : ''}`}
            >
              Roadmaps
            </Link>
            <Link 
              to="/firms" 
              className={`hover:text-blue-400 transition ${isActive('/firms') ? 'text-blue-400' : ''}`}
            >
              Top Firms
            </Link>
            <Link 
              to="/faq" 
              className={`hover:text-blue-400 transition ${isActive('/faq') ? 'text-blue-400' : ''}`}
            >
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/roadmaps" element={<Roadmaps />} />
          <Route path="/roadmaps/:id" element={<RoadmapDetail />} />
          <Route path="/firms" element={<Firms />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App