import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border bg-white/70 backdrop-blur p-6">
        <h2 className="text-xl font-semibold text-slate-800">Profile</h2>
        <div className="mt-4 space-y-2 text-sm text-slate-700">
          <div><span className="text-slate-500">Name:</span> {user?.displayName || (user?.isAnonymous ? 'Guest' : '—')}</div>
          <div><span className="text-slate-500">Email:</span> {user?.email || '—'}</div>
          <div><span className="text-slate-500">UID:</span> {user?.uid || '—'}</div>
          <div><span className="text-slate-500">Mode:</span> {user?.isAnonymous ? 'Anonymous' : 'Authenticated'}</div>
        </div>
        <p className="text-xs text-slate-500 mt-4">Manage your account details in your Google profile. Anonymous mode offers limited access.</p>
      </div>
    </div>
  )
}