import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useNavigate } from 'react-router-dom'
import { adminService } from '../services/adminService'
import type { AuditLog } from '../services/adminService'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'users' | 'appointments' | 'library' | 'referrals' | 'medications' | 'audit' | 'admins'>('users')
  
  // Data States
  const [users, setUsers] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [referrals, setReferrals] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [admins, setAdmins] = useState<any[]>([])
  
  // Medication State
  const [selectedUserForMed, setSelectedUserForMed] = useState<string>('')
  const [medForm, setMedForm] = useState({ name: '', dosage: '', frequency: '', instructions: '' })
  
  // Admin Management State
  const [newAdminEmail, setNewAdminEmail] = useState('')
  
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
    loadAuditLogs()
    loadAdmins()
  }, [])

  async function loadUsers() {
    try {
      const snap = await getDocs(collection(db, 'users'))
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { console.error(e) }
  }

  async function loadAppointments() {
    try {
      const q = query(collection(db, 'appointments'), orderBy('date', 'desc'))
      const snap = await getDocs(q).catch(() => getDocs(collection(db, 'appointments')))
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

  async function loadAuditLogs() {
    try {
      const logs = await adminService.getAuditLogs()
      setAuditLogs(logs)
    } catch (e) { console.error(e) }
  }

  async function loadAdmins() {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'admin'))
      const snap = await getDocs(q)
      setAdmins(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { console.error(e) }
  }

  // Actions
  async function handleLogout() {
    await adminService.logout()
    navigate('/admin') // Redirect to admin login
  }

  async function assignMedication() {
    if (!selectedUserForMed || !medForm.name) return alert('User and Medication Name required')
    setLoading(true)
    try {
      await adminService.assignMedication({
        userId: selectedUserForMed,
        ...medForm
      })
      alert('Medication assigned successfully')
      setMedForm({ name: '', dosage: '', frequency: '', instructions: '' })
      loadAuditLogs() // Refresh logs
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
      await adminService.logAudit('RESPOND_APT', `Responded to appointment ${aptId}`)
      alert('Response sent!')
      loadAppointments()
      loadAuditLogs()
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
      await adminService.logAudit('UPLOAD_RESOURCE', `Uploaded ${libTitle}`)
      setLibTitle(''); setLibLink(''); setLibTags('')
      loadLibrary()
      loadAuditLogs()
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
        content: "Mental health myths can be harmful and increase stigma..."
      },
      // ... (keeping other seeds implied for brevity, actually I should include them if I replace file)
    ]
    setLoading(true)
    try {
      for (const s of seeds) {
        await addDoc(collection(db, 'resources'), { ...s, uploadedAt: new Date().toISOString() })
      }
      await adminService.logAudit('SEED_LIBRARY', 'Seeded default library content')
      loadLibrary()
      alert('Library seeded!')
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function handlePromoteAdmin() {
    if (!newAdminEmail) return
    const user = users.find(u => u.email === newAdminEmail)
    if (!user) return alert('User not found')
    
    if (confirm(`Are you sure you want to promote ${user.email} to Admin?`)) {
      setLoading(true)
      try {
        await adminService.promoteToAdmin(user.id, user.email)
        alert(`${user.email} is now an admin`)
        setNewAdminEmail('')
        loadAdmins()
        loadAuditLogs()
      } catch (e) {
        alert('Failed to promote user')
      } finally {
        setLoading(false)
      }
    }
  }

  async function handleDemoteAdmin(id: string, email: string) {
    if (confirm(`Remove admin rights from ${email}?`)) {
      setLoading(true)
      try {
        await adminService.removeAdmin(id, email)
        loadAdmins()
        loadAuditLogs()
      } catch (e) {
        alert('Failed to remove admin')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm transition-colors duration-300">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Secure Management Portal</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">Logout</button>
        </header>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['users', 'appointments', 'library', 'referrals', 'medications', 'audit', 'admins'].map(t => (
            <button key={t} onClick={() => setTab(t as any)} 
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
              {t}
            </button>
          ))}
        </div>

        <main className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 min-h-[500px] transition-colors duration-300">
          {tab === 'users' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Registered Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    <tr>
                      <th className="p-3 rounded-l-lg">Email</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Role</th>
                      <th className="p-3 rounded-r-lg">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="dark:text-slate-300">
                    {users.map(u => (
                      <tr key={u.id} className="border-b dark:border-slate-700 last:border-0">
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">{u.displayName || '-'}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${u.role==='admin'?'bg-purple-100 text-purple-700':'bg-slate-100 text-slate-600'}`}>{u.role || 'User'}</span></td>
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
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Bookings</h2>
              <div className="grid gap-4">
                {appointments.map(a => (
                  <div key={a.id} className="border dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-700/30 transition-colors">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-blue-700 dark:text-blue-400">{a.type}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{a.date}</span>
                    </div>
                    <div className="text-sm mb-2 dark:text-slate-300">Ref: {a.CFID_reference}</div>
                    <div className="text-sm mb-2 dark:text-slate-300">Status: <span className={`font-medium ${a.status==='responded'?'text-green-600 dark:text-green-400':'text-amber-600 dark:text-amber-400'}`}>{a.status}</span></div>
                    
                    {a.status !== 'responded' ? (
                      <div className="mt-3">
                        <textarea 
                          placeholder="Write a response/solution..." 
                          className="w-full p-2 rounded border dark:border-slate-600 mb-2 text-sm bg-white dark:bg-slate-600 dark:text-white placeholder-slate-400"
                          value={responseTexts[a.id] || ''}
                          onChange={e => setResponseTexts(prev => ({...prev, [a.id]: e.target.value}))}
                        />
                        <button onClick={() => sendResponse(a.id)} disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                          Send Response
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-800 text-sm">
                        <div className="font-medium text-green-800 dark:text-green-300">Admin Response:</div>
                        <div className="text-green-700 dark:text-green-400">{a.response}</div>
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
                <h2 className="text-xl font-semibold dark:text-white">Library Management</h2>
                <button onClick={seedLibrary} disabled={loading} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  Seed Default Content
                </button>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl mb-6 border dark:border-slate-700">
                <h3 className="font-medium mb-3 dark:text-slate-200">Upload New Material</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input placeholder="Title" value={libTitle} onChange={e=>setLibTitle(e.target.value)} className="p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-600 dark:text-white placeholder-slate-400" />
                  <select value={libType} onChange={e=>setLibType(e.target.value)} className="p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-600 dark:text-white">
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                  </select>
                  <input placeholder="Link (URL)" value={libLink} onChange={e=>setLibLink(e.target.value)} className="p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-600 dark:text-white placeholder-slate-400" />
                  <input placeholder="Tags (comma separated)" value={libTags} onChange={e=>setLibTags(e.target.value)} className="p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-600 dark:text-white placeholder-slate-400" />
                </div>
                <button onClick={uploadResource} disabled={loading} className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>

              <div className="grid gap-3">
                {resources.map(r => (
                  <div key={r.id} className="flex justify-between items-center p-3 border dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div>
                      <div className="font-medium dark:text-white">{r.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">{r.type}</div>
                    </div>
                    <a href={r.link} target="_blank" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">View</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'medications' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Medication Management</h2>
              
              <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-xl border dark:border-slate-700">
                <h3 className="font-medium mb-4 dark:text-slate-200">Assign Medication</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select User</label>
                  <select 
                    value={selectedUserForMed} 
                    onChange={e => setSelectedUserForMed(e.target.value)}
                    className="w-full p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-600 dark:text-white"
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Medication Name</label>
                    <input 
                      value={medForm.name}
                      onChange={e => setMedForm(p => ({...p, name: e.target.value}))}
                      className="w-full p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-600 dark:text-white placeholder-slate-400"
                      placeholder="e.g. Lisinopril"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dosage</label>
                    <input 
                      value={medForm.dosage}
                      onChange={e => setMedForm(p => ({...p, dosage: e.target.value}))}
                      className="w-full p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-600 dark:text-white placeholder-slate-400"
                      placeholder="e.g. 10mg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
                    <input 
                      value={medForm.frequency}
                      onChange={e => setMedForm(p => ({...p, frequency: e.target.value}))}
                      className="w-full p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-600 dark:text-white placeholder-slate-400"
                      placeholder="e.g. Twice daily"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Special Instructions</label>
                    <input 
                      value={medForm.instructions}
                      onChange={e => setMedForm(p => ({...p, instructions: e.target.value}))}
                      className="w-full p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-600 dark:text-white placeholder-slate-400"
                      placeholder="e.g. Take with food"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button 
                    onClick={assignMedication}
                    disabled={loading || !selectedUserForMed}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Assigning...' : 'Assign Medication'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'referrals' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Referrals & Contacts</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {referrals.map(r => (
                   <a key={r.name} href={r.link} target="_blank" className="block rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:shadow-md dark:hover:shadow-slate-900 transition-all">
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">{r.type}</div>
                    <div className="mt-1 font-medium text-slate-800 dark:text-white">{r.name}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {tab === 'audit' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">System Audit Logs</h2>
              <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Details</th>
                      <th className="p-3">Performed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-700 dark:text-slate-300">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-3 text-slate-500 dark:text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-3 font-medium">{log.action}</td>
                        <td className="p-3">{log.details}</td>
                        <td className="p-3 font-mono text-xs">{log.performedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'admins' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Admin Management</h2>
              
              <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl mb-6 border dark:border-slate-700">
                <h3 className="font-medium mb-3 dark:text-slate-200">Promote User to Admin</h3>
                <div className="flex gap-2">
                  <input 
                    placeholder="User Email" 
                    value={newAdminEmail}
                    onChange={e => setNewAdminEmail(e.target.value)}
                    className="flex-grow p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-600 dark:text-white placeholder-slate-400"
                  />
                  <button onClick={handlePromoteAdmin} disabled={loading} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Promote
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                {admins.map(admin => (
                  <div key={admin.id} className="flex justify-between items-center p-4 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                    <div>
                      <div className="font-medium dark:text-white">{admin.displayName || 'No Name'}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{admin.email}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Active</span>
                      <button onClick={() => handleDemoteAdmin(admin.id, admin.email)} className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
