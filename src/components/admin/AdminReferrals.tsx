import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebase'

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState<any[]>([])

  useEffect(() => {
    getDocs(collection(db, 'referrals')).then(snap => {
      setReferrals(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold dark:text-white">Referrals</h2>
      {referrals.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700">
          No referrals found.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 p-4">
          <ul>
            {referrals.map(r => (
              <li key={r.id} className="border-b last:border-0 p-3 dark:text-slate-300">
                {JSON.stringify(r)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
