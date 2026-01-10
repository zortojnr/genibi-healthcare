import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

interface Resource { 
  id?: string;
  title: string; 
  type: 'article'|'video'|'audio'; 
  link: string; 
  tags?: string[];
  author?: string;
  publishedDate?: string;
  content?: string; // Full content or summary
  thumbnail?: string;
}

// --- Recommended Articles Data ---
const RECOMMENDED_ARTICLES: Resource[] = [
  {
    title: "Myths vs. Facts: Mental Health",
    type: 'article',
    link: "https://www.medicalnewstoday.com/articles/154543#myths-vs-facts",
    author: "Medical News Today",
    publishedDate: "2024",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=400",
    tags: ['myths', 'education'],
    content: "Mental health myths can be harmful and increase stigma. It is crucial to distinguish between fact and fiction to support those affected. Common myths include the idea that mental health problems are rare or that people can just 'snap out of it'. The truth is that mental health issues are common and often require professional treatment..."
  },
  {
    title: "Ways to Manage Stress",
    type: 'article',
    link: "https://ibn.idsi.md/sites/default/files/imag_file/277-286_5.pdf",
    author: "IDSI",
    publishedDate: "2023",
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400",
    tags: ['stress', 'wellness'],
    content: "Stress management offers a range of strategies to help you better deal with stress and difficulty (adversity) in your life. Managing stress can help you lead a more balanced, healthier life. Stress is an automatic physical, mental and emotional response to a challenging event..."
  },
  {
    title: "Generalized Anxiety Disorder",
    type: 'article',
    link: "https://www.nejm.org/doi/full/10.1056/NEJMcp1502514",
    author: "NEJM",
    publishedDate: "2015",
    thumbnail: "https://images.unsplash.com/photo-1620147512372-9e00421556bb?auto=format&fit=crop&q=80&w=400",
    tags: ['anxiety', 'medical'],
    content: "Generalized anxiety disorder is characterized by excessive anxiety and worry about a variety of events or activities (e.g., work or school performance) that occurs more days than not for at least 6 months. The anxiety and worry are associated with three (or more) of the following six symptoms..."
  },
  {
    title: "A Call to Mental Health Awareness Among Students",
    type: 'article',
    link: "#",
    author: "Genibi Health",
    publishedDate: "2024",
    thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400",
    tags: ['students', 'nigeria', 'awareness'],
    content: `Many students battle with intense tension, anxiety, and grief behind the doors of lecture halls, school events, and romantic relationships. These issues linger through campus, but they are not known for their true effects. They are frequently passed off as nothing more than mere stress or vulnerability in a nation like Nigeria where mental health is usually stigmatized and support networks are limited. Still, the outcomes of mental health issues are rather significant since they influence social contacts, academic performance, even student survival. Sadly, mental health issues often come at a high cost. \n\n The quest for academic excellence in Nigeria's elite colleges—overwhelmed classrooms, scarce resources, and recurring strikes—disrupt academic schedules, intensifying the unrelenting pressure students face to succeed. According to a 2021 Irabor and Okeke research, 68% of Nigerian university students reported having significant academic stress; many also suffered anxiety problems characterized by unrelenting worry, insomnia, and panic attacks. \n\n Many tertiary students have been discovered to be depressed. About 20% of Nigerian university students exhibited symptoms of clinical depression, according to Adewuya et al. (2006). Drug use, sleep deprivation, stigma, and lack of counseling services worsen the situation. Almost 22% of recorded suicide cases related to untreated mental illness belong to tertiary students, according to a 2019 study by the Nigerian Suicide Research and Prevention Initiative. \n\n Nigeria's tertiary institutions are at a crossroads. Without fast measures to destigmatize mental health, expand counseling services, and provide supportive campus environments, avoidable tragedies threaten to eclipse the promise of education.`
  }
]

export default function Library() {
  const [resources, setResources] = useState<Resource[]>([])
  const [q, setQ] = useState('')
  const [type, setType] = useState<'all'|'article'|'video'|'audio'>('all')

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'resources'))
        const items: Resource[] = []
        snap.forEach(d => items.push(d.data() as Resource))
        setResources(items)
      } catch (e) {
        console.error('Failed to load resources from Firestore', e)
      }
    })()
  }, [])

  const getPreview = (text?: string) => {
    if (!text) return "Click 'Read Me' to view the full content of this resource."
    const words = text.split(' ')
    // Showing around 40 words to keep cards uniform, but enough for a preview
    if (words.length <= 40) return text
    return words.slice(0, 40).join(' ') + '...'
  }

  // Filter Recommended
  const recommendedFiltered = useMemo(() => {
    return RECOMMENDED_ARTICLES.filter(r => {
      const matchesText = q ? (r.title.toLowerCase().includes(q.toLowerCase()) || (r.tags||[]).join(' ').toLowerCase().includes(q.toLowerCase())) : true
      const matchesType = type==='all' ? true : r.type===type
      return matchesText && matchesType
    })
  }, [q, type])

  // Filter Uploaded
  const uploadedFiltered = useMemo(() => {
    // Deduplicate if needed
    return resources.filter(r => {
      const matchesText = q ? (r.title.toLowerCase().includes(q.toLowerCase()) || (r.tags||[]).join(' ').toLowerCase().includes(q.toLowerCase())) : true
      const matchesType = type==='all' ? true : r.type===type
      return matchesText && matchesType
    })
  }, [resources, q, type])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-2xl border bg-white/70 backdrop-blur p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">E-Library</h2>
            <p className="text-slate-600 mt-1">Explore curated resources for your mental well-being.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." className="flex-1 md:w-64 px-4 py-2 rounded-xl border bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
            <select value={type} onChange={e=>setType(e.target.value as any)} className="px-4 py-2 rounded-xl border bg-white focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="all">All Types</option>
              <option value="article">Articles</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommended Section */}
      {recommendedFiltered.length > 0 && (
        <div className="mb-12">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">🌟</span> Recommended Reading
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedFiltered.map((r) => (
              <div 
                key={r.title} 
                className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group"
              >
                <div className="h-40 bg-slate-100 relative overflow-hidden">
                  {r.thumbnail ? (
                    <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-blue-50 to-indigo-50">📚</div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider text-slate-700">
                    {r.type}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                    <span>{r.author}</span>
                    <span>•</span>
                    <span>{r.publishedDate}</span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2 line-clamp-2">{r.title}</h3>
                  
                  <p className="text-sm text-slate-600 mb-4 line-clamp-4 flex-1">
                    {getPreview(r.content)}
                  </p>

                  <a 
                    href={r.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-auto w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl transition-colors font-medium shadow-sm"
                  >
                    <span>Read Me</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community/Uploaded Section */}
      <div>
         <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">📚</span> Library Collection
          </h3>
         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
           {uploadedFiltered.length === 0 ? (
             <div className="col-span-full text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed">
               No additional resources found.
             </div>
           ) : (
             uploadedFiltered.map((r, i) => (
               <div 
                 key={r.id || i} 
                 className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group"
               >
                 {/* Thumbnail */}
                 <div className="h-40 bg-slate-100 relative overflow-hidden">
                   {r.thumbnail ? (
                     <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-emerald-50 to-teal-50">📑</div>
                   )}
                   <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider text-slate-700">
                     {r.type}
                   </div>
                 </div>

                 {/* Content */}
                 <div className="p-5 flex flex-col flex-1">
                   <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2 line-clamp-2">{r.title}</h3>
                   
                   {r.tags && (
                     <div className="flex flex-wrap gap-2 mb-4">
                       {r.tags.slice(0, 3).map((t: string) => (
                         <span key={t} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">#{t}</span>
                       ))}
                     </div>
                   )}

                   <a 
                     href={r.link} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="mt-auto w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl transition-colors font-medium"
                   >
                     <span>Read Me</span>
                   </a>
                 </div>
               </div>
             ))
           )}
         </div>
      </div>
    </div>
  )
}