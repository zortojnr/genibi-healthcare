import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore'
import { db, signOutUser } from '../lib/firebase'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'users' | 'appointments' | 'library' | 'referrals' | 'medications'>('users')
  
  // Data States
  const [users, setUsers] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [referrals, setReferrals] = useState<any[]>([])
  
  // Medication State
  const [selectedUserForMed, setSelectedUserForMed] = useState<string>('')
  const [medForm, setMedForm] = useState({ name: '', dosage: '', frequency: '', instructions: '' })
  
  // Form States
  const [loading, setLoading] = useState(false)
  const [libTitle, setLibTitle] = useState('')
  const [libType, setLibType] = useState('article')
  const [libLink, setLibLink] = useState('')
  const [libTags, setLibTags] = useState('')
  
  // Appointment Response State
  const [responseTexts, setResponseTexts] = useState<Record<string, string>>({})

  // Fetch Data
  useEffect(() => {
    loadUsers()
    loadAppointments()
    loadLibrary()
    loadReferrals()
  }, [])

  async function loadUsers() {
    try {
      const snap = await getDocs(collection(db, 'users'))
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { console.error(e) }
  }

  async function loadAppointments() {
    try {
      const q = query(collection(db, 'appointments'), orderBy('date', 'desc')) // Ensure index exists or remove orderBy if needed
      const snap = await getDocs(q).catch(() => getDocs(collection(db, 'appointments'))) // Fallback
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { console.error(e) }
  }

  async function loadLibrary() {
    try {
      const snap = await getDocs(collection(db, 'resources'))
      setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { console.error(e) }
  }

  async function loadReferrals() {
    try {
      const snap = await getDocs(collection(db, 'referrals'))
      setReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { console.error(e) }
  }

  // Actions
  async function handleLogout() {
    await signOutUser()
    navigate('/login')
  }

  async function assignMedication() {
    if (!selectedUserForMed || !medForm.name) return alert('User and Medication Name required')
    setLoading(true)
    try {
      await addDoc(collection(db, 'medications'), {
        userId: selectedUserForMed,
        name: medForm.name,
        dosage: medForm.dosage,
        frequency: medForm.frequency,
        instructions: medForm.instructions,
        assignedBy: 'admin',
        assignedAt: new Date().toISOString()
      })
      alert('Medication assigned successfully')
      setMedForm({ name: '', dosage: '', frequency: '', instructions: '' })
    } catch (e) {
      console.error(e)
      alert('Failed to assign medication')
    } finally {
      setLoading(false)
    }
  }

  async function sendResponse(aptId: string) {
    const text = responseTexts[aptId]
    if (!text) return
    setLoading(true)
    try {
      await updateDoc(doc(db, 'appointments', aptId), {
        response: text,
        status: 'responded',
        respondedAt: new Date().toISOString()
      })
      alert('Response sent!')
      loadAppointments()
    } catch (e) {
      alert('Error sending response')
    } finally {
      setLoading(false)
    }
  }

  async function uploadResource() {
    if (!libTitle || !libLink) return alert('Title and Link required')
    setLoading(true)
    try {
      await addDoc(collection(db, 'resources'), {
        title: libTitle,
        type: libType,
        link: libLink,
        tags: libTags.split(',').map(t => t.trim()).filter(Boolean),
        uploadedAt: new Date().toISOString()
      })
      setLibTitle(''); setLibLink(''); setLibTags('')
      loadLibrary()
      alert('Resource uploaded!')
    } catch (e) {
      alert('Error uploading')
    } finally {
      setLoading(false)
    }
  }

  async function seedLibrary() {
    const seeds = [
      {
        title: "Myths vs. Facts: Mental Health",
        type: 'article',
        link: "https://www.medicalnewstoday.com/articles/154543#myths-vs-facts",
        tags: ['myths', 'education'],
        content: "Mental health myths can be harmful and increase stigma. It is crucial to distinguish between fact and fiction to support those affected. Common myths include the idea that mental health problems are rare or that people can just 'snap out of it'. The truth is that mental health issues are common and often require professional treatment..."
      },
      { 
        title: 'Ways to Manage Stress', 
        type: 'article', 
        link: 'https://ibn.idsi.md/sites/default/files/imag_file/277-286_5.pdf', 
        tags: ['stress', 'health'],
        content: "Stress management offers a range of strategies to help you better deal with stress and difficulty (adversity) in your life. Managing stress can help you lead a more balanced, healthier life. Stress is an automatic physical, mental and emotional response to a challenging event..."
      },
      { 
        title: 'Generalized Anxiety Disorder', 
        type: 'article', 
        link: 'https://www.nejm.org/doi/full/10.1056/NEJMcp1502514', 
        tags: ['anxiety'],
        content: "Generalized anxiety disorder is characterized by excessive anxiety and worry about a variety of events or activities (e.g., work or school performance) that occurs more days than not for at least 6 months. The anxiety and worry are associated with three (or more) of the following six symptoms..."
      },
      { 
        title: 'A Call to Mental Health Awareness Among Students of Tertiary Institutions', 
        type: 'article', 
        link: '#', 
        tags: ['students', 'awareness'],
        content: `Many students battle with intense tension, anxiety, and grief behind the doors of lecture halls, school events, and romantic relationships. These issues linger through campus, but they are not known for their true effects. They are frequently passed off as nothing more than mere stress or vulnerability in a nation like Nigeria where mental health is usually stigmatized and support networks are limited. Still, the outcomes of mental health issues are rather significant since they influence social contacts, academic performance, even student survival. Sadly, mental health issues often come at a high cost. \n\n The quest for academic excellence in Nigeria's elite colleges—overwhelmed classrooms, scarce resources, and recurring strikes—disrupt academic schedules, intensifying the unrelenting pressure students face to succeed. According to a 2021 Irabor and Okeke research, 68% of Nigerian university students reported having significant academic stress; many also suffered anxiety problems characterized by unrelenting worry, insomnia, and panic attacks. \n\n Many tertiary students have been discovered to be depressed. About 20% of Nigerian university students exhibited symptoms of clinical depression, according to Adewuya et al. (2006). Drug use, sleep deprivation, stigma, and lack of counseling services worsen the situation. Almost 22% of recorded suicide cases related to untreated mental illness belong to tertiary students, according to a 2019 study by the Nigerian Suicide Research and Prevention Initiative. \n\n Nigeria's tertiary institutions are at a crossroads. Without fast measures to destigmatize mental health, expand counseling services, and provide supportive campus environments, avoidable tragedies threaten to eclipse the promise of education.`
      }
    ]
    setLoading(true)
    try {
      for (const s of seeds) {
        await addDoc(collection(db, 'resources'), { ...s, uploadedAt: new Date().toISOString() })
      }
      loadLibrary()
      alert('Library seeded!')
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">Logout</button>
        </header>

        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {['users', 'appointments', 'library', 'referrals'].map(t => (
            <button key={t} onClick={() => setTab(t as any)} 
              className={`px-4 py-2 rounded-lg capitalize ${tab === t ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>
              {t}
            </button>
          ))}
        </div>

        <main className="bg-white rounded-2xl shadow-sm p-6 min-h-[500px]">
          {tab === 'users' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Registered Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-3 rounded-l-lg">Email</th>
                      <th className="p-3">Name</th>
                      <th className="p-3 rounded-r-lg">Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b last:border-0">
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">{u.displayName || '-'}</td>
                        <td className="p-3">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'appointments' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Bookings</h2>
              <div className="grid gap-4">
                {appointments.map(a => (
                  <div key={a.id} className="border rounded-xl p-4 bg-slate-50">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-blue-700">{a.type}</span>
                      <span className="text-sm text-slate-500">{a.date}</span>
                    </div>
                    <div className="text-sm mb-2">Ref: {a.CFID_reference}</div>
                    <div className="text-sm mb-2">Status: <span className={`font-medium ${a.status==='responded'?'text-green-600':'text-amber-600'}`}>{a.status}</span></div>
                    
                    {a.status !== 'responded' ? (
                      <div className="mt-3">
                        <textarea 
                          placeholder="Write a response/solution..." 
                          className="w-full p-2 rounded border mb-2 text-sm"
                          value={responseTexts[a.id] || ''}
                          onChange={e => setResponseTexts(prev => ({...prev, [a.id]: e.target.value}))}
                        />
                        <button onClick={() => sendResponse(a.id)} disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                          Send Response
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-green-50 rounded border border-green-100 text-sm">
                        <div className="font-medium text-green-800">Admin Response:</div>
                        <div className="text-green-700">{a.response}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'library' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Library Management</h2>
                <button onClick={seedLibrary} disabled={loading} className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">
                  Seed Default Content
                </button>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl mb-6">
                <h3 className="font-medium mb-3">Upload New Material</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input placeholder="Title" value={libTitle} onChange={e=>setLibTitle(e.target.value)} className="p-2 rounded border" />
                  <select value={libType} onChange={e=>setLibType(e.target.value)} className="p-2 rounded border">
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                  </select>
                  <input placeholder="Link (URL)" value={libLink} onChange={e=>setLibLink(e.target.value)} className="p-2 rounded border" />
                  <input placeholder="Tags (comma separated)" value={libTags} onChange={e=>setLibTags(e.target.value)} className="p-2 rounded border" />
                </div>
                <button onClick={uploadResource} disabled={loading} className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg">
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>

              <div className="grid gap-3">
                {resources.map(r => (
                  <div key={r.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-slate-50">
                    <div>
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-slate-500 uppercase">{r.type}</div>
                    </div>
                    <a href={r.link} target="_blank" className="text-blue-600 text-sm hover:underline">View</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'medications' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Medication Management</h2>
              
              <div className="bg-slate-50 p-6 rounded-xl border">
                <h3 className="font-medium mb-4">Assign Medication</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select User</label>
                  <select 
                    value={selectedUserForMed} 
                    onChange={e => setSelectedUserForMed(e.target.value)}
                    className="w-full p-2 rounded border bg-white"
                  >
                    <option value="">-- Choose a user --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.displayName || 'No Name'} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Medication Name</label>
                    <input 
                      value={medForm.name}
                      onChange={e => setMedForm(p => ({...p, name: e.target.value}))}
                      className="w-full p-2 rounded border"
                      placeholder="e.g. Lisinopril"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dosage</label>
                    <input 
                      value={medForm.dosage}
                      onChange={e => setMedForm(p => ({...p, dosage: e.target.value}))}
                      className="w-full p-2 rounded border"
                      placeholder="e.g. 10mg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                    <input 
                      value={medForm.frequency}
                      onChange={e => setMedForm(p => ({...p, frequency: e.target.value}))}
                      className="w-full p-2 rounded border"
                      placeholder="e.g. Twice daily"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Special Instructions</label>
                    <input 
                      value={medForm.instructions}
                      onChange={e => setMedForm(p => ({...p, instructions: e.target.value}))}
                      className="w-full p-2 rounded border"
                      placeholder="e.g. Take with food"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button 
                    onClick={assignMedication}
                    disabled={loading || !selectedUserForMed}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Assigning...' : 'Assign Medication'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'referrals' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Referrals & Contacts</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {referrals.map(r => (
                   <a key={r.name} href={r.link} target="_blank" className="block rounded-xl border bg-white p-4 hover:shadow-md transition">
                    <div className="text-xs text-slate-500 uppercase">{r.type}</div>
                    <div className="mt-1 font-medium text-slate-800">{r.name}</div>
                  </a>
                ))}
              </div>
              {referrals.length === 0 && <p className="text-slate-500">No referrals found in database.</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
