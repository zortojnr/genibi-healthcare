import { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db, storage } from '../lib/firebase'
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { z } from 'zod'

// --- Types ---
interface UserProfileData {
  displayName?: string;
  email?: string;
  photoURL?: string;
  phone?: string;
  bio?: string;
  location?: string;
  createdAt?: string;
}

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
  phone: z.string().max(20, "Phone number too long").optional().or(z.literal('')),
  location: z.string().max(100, "Location too long").optional().or(z.literal('')),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional().or(z.literal(''))
})

interface Appointment {
  id: string;
  date: string;
  type: string;
  status: string;
  CFID_reference?: string;
  bookedAt?: string;
}

interface MoodEntry {
  id: string;
  date: string;
  score: number;
  mood_direction?: string;
}

// --- Icons ---
const Icons = {
  Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Camera: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
}

export default function Profile() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'settings'>('overview')
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState<UserProfileData>({})
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Edit Form State
  const [editForm, setEditForm] = useState<UserProfileData>({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{type:'success'|'error', text:string}|null>(null)

  // Fetch Data
  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        // Timeout Promise
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 10000))
        
        // Data Promises
        const profilePromise = getDoc(doc(db, 'users', user.uid))
        const aptPromise = getDocs(query(collection(db, 'appointments'), where('userId', '==', user.uid), orderBy('date', 'desc')))
        const moodPromise = getDocs(query(collection(db, 'moods'), where('userId', '==', user.uid), orderBy('date', 'asc')))

        // Race against timeout
        const [userSnap, aptSnap, moodSnap] = await Promise.race([
          Promise.all([profilePromise, aptPromise, moodPromise]),
          timeout
        ]) as [any, any, any]
        
        if (!isMounted) return

        const userData = userSnap.exists() ? userSnap.data() : {}
        
        const mergedProfile = {
          displayName: user.displayName || userData.displayName || '',
          email: user.email || userData.email || '',
          photoURL: user.photoURL || userData.photoURL || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          location: userData.location || '',
          createdAt: user.metadata.creationTime
        }
        setProfileData(mergedProfile)
        setEditForm(mergedProfile)

        setAppointments(aptSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as Appointment)))
        setMoods(moodSnap.docs.map((d: any) => ({ id: d.id, ...d.data() } as MoodEntry)))

      } catch (e: any) {
        if (!isMounted) return
        console.error("Error loading profile data:", e)
        setMsg({ type: 'error', text: e.message === 'Request timed out' ? 'Loading timed out. Please refresh.' : 'Failed to load profile data.' })
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    
    fetchData()
    return () => { isMounted = false }
  }, [user])

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      try {
        await signOut()
        // AuthContext handles redirect usually, but we can force it or let the state change handle it
      } catch (e) {
        console.error('Logout failed', e)
        setMsg({ type: 'error', text: 'Failed to logout. Try again.' })
      }
    }
  }

  // --- Actions ---

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validation
    if (file.size > 2 * 1024 * 1024) { // 2MB
      setMsg({ type: 'error', text: 'Image too large (max 2MB)' })
      return
    }
    if (!file.type.startsWith('image/')) {
      setMsg({ type: 'error', text: 'Invalid file type' })
      return
    }

    try {
      setSaving(true)
      const storageRef = ref(storage, `profiles/${user.uid}/${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      
      // Update Auth Profile
      await updateProfile(user, { photoURL: url })
      
      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), { photoURL: url })
      
      setProfileData(prev => ({ ...prev, photoURL: url }))
      setMsg({ type: 'success', text: 'Profile picture updated!' })
    } catch (e) {
      console.error(e)
      setMsg({ type: 'error', text: 'Failed to upload image' })
    } finally {
      setSaving(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    // Validate
    const result = profileSchema.safeParse(editForm)
    if (!result.success) {
      const errorMsg = result.error.issues[0].message
      setMsg({ type: 'error', text: errorMsg })
      return
    }

    setSaving(true)
    setMsg(null)
    try {
      // Update Auth (DisplayName)
      if (editForm.displayName !== user.displayName) {
        await updateProfile(user, { displayName: editForm.displayName })
      }
      
      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: editForm.displayName,
        phone: editForm.phone,
        bio: editForm.bio,
        location: editForm.location
      })
      
      setProfileData(editForm)
      setMsg({ type: 'success', text: 'Profile updated successfully' })
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to save changes' })
    } finally {
      setSaving(false)
    }
  }

  const cancelAppointment = async (aptId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return
    try {
      await deleteDoc(doc(db, 'appointments', aptId))
      setAppointments(prev => prev.filter(a => a.id !== aptId))
      setMsg({ type: 'success', text: 'Appointment cancelled' })
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to cancel appointment' })
    }
  }

  // --- Computed Stats ---
  const stats = useMemo(() => {
    const totalApts = appointments.length
    const upcomingApts = appointments.filter(a => new Date(a.date) >= new Date()).length
    const avgMood = moods.length > 0 
      ? (moods.reduce((acc, m) => acc + m.score, 0) / moods.length).toFixed(1) 
      : 'N/A'
    return { totalApts, upcomingApts, avgMood }
  }, [appointments, moods])

  if (loading) return <div className="flex h-96 items-center justify-center text-slate-500">Loading profile...</div>

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6 flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-600 -z-0" />
        
        <div className="relative z-10 mt-8 md:mt-4">
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md bg-slate-200 overflow-hidden">
              {profileData.photoURL ? (
                <img src={profileData.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Icons.User />
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border text-slate-600 hover:text-blue-600 transition opacity-0 group-hover:opacity-100"
              title="Change Photo"
            >
              <Icons.Camera />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left pt-0 md:pt-12 z-10">
          <h1 className="text-2xl font-bold text-slate-900">{profileData.displayName || 'User'}</h1>
          <p className="text-slate-500">{profileData.email}</p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2 text-sm text-slate-600">
             {profileData.location && <span>📍 {profileData.location}</span>}
             {profileData.createdAt && <span>📅 Joined {new Date(profileData.createdAt).toLocaleDateString()}</span>}
          </div>
        </div>

        <div className="pt-0 md:pt-12 z-10 flex gap-2">
          <button onClick={() => setActiveTab('settings')} className="px-4 py-2 bg-white border rounded-lg shadow-sm text-sm font-medium hover:bg-slate-50 transition flex items-center gap-2 text-slate-700">
            <Icons.Edit /> Edit Profile
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-50 border border-red-100 rounded-lg shadow-sm text-sm font-medium hover:bg-red-100 transition flex items-center gap-2 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: <Icons.Activity /> },
          { id: 'appointments', label: 'Appointments', icon: <Icons.Calendar /> },
          { id: 'settings', label: 'Settings', icon: <Icons.User /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-4 text-sm font-medium flex items-center gap-2 transition-colors relative ${
              activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.icon} {tab.label}
            {activeTab === tab.id && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {msg && (
            <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
              <span>{msg.type === 'error' ? '⚠️' : '✅'}</span>
              {msg.text}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="grid gap-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <div className="text-sm text-slate-500 mb-1">Total Sessions</div>
                  <div className="text-3xl font-bold text-slate-900">{stats.totalApts}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <div className="text-sm text-slate-500 mb-1">Upcoming</div>
                  <div className="text-3xl font-bold text-blue-600">{stats.upcomingApts}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <div className="text-sm text-slate-500 mb-1">Avg Mood Score</div>
                  <div className="text-3xl font-bold text-emerald-600">{stats.avgMood}<span className="text-sm text-slate-400 font-normal">/5</span></div>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-semibold mb-6">Mood Trend</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moods.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{fontSize: 12}} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month:'short', day:'numeric'})} />
                      <YAxis domain={[0, 5]} hide />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} dot={{r:4, fill: '#4F46E5'}} activeDot={{r:6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Appointment History</h3>
                <button className="text-sm text-blue-600 hover:underline">Export History</button>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed">
                  <p className="text-slate-500">No appointments found.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="p-4 font-medium text-slate-600">Date</th>
                        <th className="p-4 font-medium text-slate-600">Type</th>
                        <th className="p-4 font-medium text-slate-600">Status</th>
                        <th className="p-4 font-medium text-slate-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {appointments.map(apt => (
                        <tr key={apt.id} className="hover:bg-slate-50 transition">
                          <td className="p-4">{new Date(apt.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                          <td className="p-4">{apt.type}</td>
                          <td className="p-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              apt.status === 'responded' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button onClick={() => cancelAppointment(apt.id)} className="text-slate-400 hover:text-red-600 transition" title="Cancel">
                              <Icons.Trash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl">
              <form onSubmit={handleProfileUpdate} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <h3 className="text-lg font-semibold mb-4">Edit Profile Info</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Display Name</label>
                    <input 
                      value={editForm.displayName || ''} 
                      onChange={e => setEditForm(p => ({...p, displayName: e.target.value}))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Phone</label>
                    <input 
                      value={editForm.phone || ''} 
                      onChange={e => setEditForm(p => ({...p, phone: e.target.value}))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Location</label>
                  <input 
                    value={editForm.location || ''} 
                    onChange={e => setEditForm(p => ({...p, location: e.target.value}))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="e.g. Lagos, Nigeria"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Bio</label>
                  <textarea 
                    value={editForm.bio || ''} 
                    onChange={e => setEditForm(p => ({...p, bio: e.target.value}))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none" 
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => { setActiveTab('overview'); setEditForm(profileData) }} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
