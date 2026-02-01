import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

interface Resource {
  id?: string;
  title: string;
  type: 'article' | 'video' | 'audio';
  link: string;
  tags: string[];
  thumbnail?: string;
  content?: string;
  author?: string;
  date?: string;
}

const RECOMMENDED_ARTICLES: Resource[] = [
  {
    id: 'rec1',
    title: "Myths vs. Facts: Mental Health",
    type: 'article',
    link: "https://www.medicalnewstoday.com/articles/154543#myths-vs-facts",
    tags: ['education', 'stigma'],
    author: "Medical News Today",
    date: "2024-01-15",
    content: "Mental health myths can be harmful and increase stigma. It is crucial to distinguish between fact and fiction to support those affected. Common myths include the idea that mental health problems are rare or that people can just 'snap out of it'. The truth is that mental health issues are common and often require professional treatment...",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
  },
  { 
    id: 'rec2',
    title: 'Ways to Manage Stress', 
    type: 'article', 
    link: 'https://ibn.idsi.md/sites/default/files/imag_file/277-286_5.pdf', 
    tags: ['stress', 'health'],
    author: "Health Guide",
    date: "2023-11-20",
    content: "Stress management offers a range of strategies to help you better deal with stress and difficulty (adversity) in your life. Managing stress can help you lead a more balanced, healthier life...",
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800"
  },
  { 
    id: 'rec3',
    title: 'Generalized Anxiety Disorder', 
    type: 'article', 
    link: 'https://www.nejm.org/doi/full/10.1056/NEJMcp1502514', 
    tags: ['anxiety', 'disorder'],
    author: "NEJM",
    date: "2023-08-10",
    content: "Generalized anxiety disorder is characterized by excessive anxiety and worry about a variety of events or activities...",
    thumbnail: "/anxiety4.jpg"
  },
  { 
    id: 'rec4',
    title: 'Mental Health in Students', 
    type: 'article', 
    link: 'https://www.accreditedschoolsonline.org/resources/student-mental-health-resources/', 
    tags: ['students', 'awareness'],
    author: "Research Initiative",
    date: "2024-02-01",
    content: "Many students battle with intense tension, anxiety, and grief behind the doors of lecture halls...",
    thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800"
  }
]

export default function Library() {
  const [activeTab, setActiveTab] = useState<'all' | 'article' | 'video' | 'audio'>('all')
  const [search, setSearch] = useState('')
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false) // Mobile filter toggle

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, 'resources'))
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as Resource))
        setResources(items)
      } catch (e) {
        console.error("Failed to load library", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="text-center py-12 text-slate-500">Loading resources...</div>

  const allItems = [...RECOMMENDED_ARTICLES, ...resources]
  const filtered = allItems.filter(r => {
    const matchesType = activeTab === 'all' || r.type === activeTab
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          (r.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
    return matchesType && matchesSearch
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">E-Library</h1>
        <p className="mt-2 text-slate-600 dark:text-white max-w-2xl">
          Explore our curated collection of mental health resources, articles, and guides.
        </p>
      </div>

      {/* Search & Filter - Mobile Responsive */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Search Bar */}
        <div className="relative flex-grow">
          <input 
            type="text" 
            placeholder="Search resources..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all placeholder-slate-400"
          />
          <svg className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-medium transition-colors"
          >
            <span>Filter by Type: <span className="capitalize text-blue-600 dark:text-blue-400">{activeTab}</span></span>
            <svg className={`w-5 h-5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Accordion Content */}
          <div className={`mt-2 overflow-hidden transition-all duration-300 ease-in-out ${isFilterOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 shadow-sm space-y-1">
              {['all', 'article', 'video', 'audio'].map((type) => (
                <button
                  key={type}
                  onClick={() => { setActiveTab(type as any); setIsFilterOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === type ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {type === 'all' ? 'All Resources' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl self-start transition-colors">
          {['all', 'article', 'video', 'audio'].map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === type 
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Grid - Fluid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md dark:hover:shadow-slate-900 transition-all duration-300 flex flex-col overflow-hidden h-full">
            {/* Image Container with Aspect Ratio */}
            <div className="relative w-full aspect-[16/9] bg-slate-100 dark:bg-slate-900 overflow-hidden">
              {item.thumbnail ? (
                <img 
                  src={item.thumbnail} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300 dark:text-slate-600">
                  {item.type === 'video' ? '🎬' : item.type === 'audio' ? '🎧' : '📄'}
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-sm ${
                  item.type === 'video' ? 'bg-red-100/90 dark:bg-red-900/80 text-red-700 dark:text-red-200 border-red-200 dark:border-red-800' :
                  item.type === 'audio' ? 'bg-purple-100/90 dark:bg-purple-900/80 text-purple-700 dark:text-purple-200 border-purple-200 dark:border-purple-800' :
                  'bg-blue-100/90 dark:bg-blue-900/80 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-800'
                }`}>
                  {item.type.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {(item.tags || []).slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>

              {item.content && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 flex-grow">
                  {item.content}
                </p>
              )}

              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  {item.date ? new Date(item.date).toLocaleDateString() : 'Recently added'}
                </div>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 group/link"
                >
                  Read Now
                  <svg className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 transition-colors">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No resources found</h3>
          <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters</p>
          <button 
            onClick={() => { setSearch(''); setActiveTab('all'); }}
            className="mt-6 px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}