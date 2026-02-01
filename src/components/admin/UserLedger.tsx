import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'

interface LedgerEntry {
  id: string
  uid: string
  email: string
  timestamp: string
  action: string
  role?: string
}

export default function UserLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLedger()
  }, [])

  async function loadLedger() {
    try {
      // Query user_ledger collection
      // If index is missing, this might fail on orderBy, so we catch it
      const q = query(
        collection(db, 'user_ledger'),
        orderBy('timestamp', 'desc'),
        limit(50)
      )
      const snap = await getDocs(q)
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as LedgerEntry))
      setEntries(data)
    } catch (e) {
      console.warn("Ledger load failed (likely missing index), falling back to client sort", e)
      try {
        const snap = await getDocs(collection(db, 'user_ledger'))
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as LedgerEntry))
        data.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setEntries(data.slice(0, 50))
      } catch (err) {
        console.error(err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Global User Ledger</h2>
        <button onClick={() => { setLoading(true); loadLedger() }} className="text-sm text-blue-600 hover:underline">Refresh</button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">User Email</th>
                <th className="p-3">Action</th>
                <th className="p-3">UID</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700 dark:text-slate-300">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading ledger...</td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">No login activity recorded yet.</td></tr>
              ) : (
                entries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="p-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-medium">{entry.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs">
                        {entry.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-400">{entry.uid}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
