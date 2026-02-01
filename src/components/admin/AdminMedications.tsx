import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'

export default function AdminMedications() {
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [form, setForm] = useState({ name: '', dosage: '', frequency: '', instructions: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    adminService.getUsers().then(u => setUsers(u))
  }, [])

  async function assign() {
    if (!selectedUser || !form.name) return alert('Select user and enter medication name')
    setLoading(true)
    try {
      await adminService.assignMedication({
        userId: selectedUser,
        ...form
      })
      alert('Medication assigned')
      setForm({ name: '', dosage: '', frequency: '', instructions: '' })
    } catch (e) {
      alert('Failed to assign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold dark:text-white">Prescribe Medication</h2>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-slate-300">Select Patient</label>
          <select 
            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
          >
            <option value="">-- Select User --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.email} ({u.displayName || 'No Name'})</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Medication Name</label>
            <input 
              className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="e.g. Sertraline"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Dosage</label>
            <input 
              className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              value={form.dosage}
              onChange={e => setForm({...form, dosage: e.target.value})}
              placeholder="e.g. 50mg"
            />
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium mb-1 dark:text-slate-300">Frequency</label>
           <input 
             className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
             value={form.frequency}
             onChange={e => setForm({...form, frequency: e.target.value})}
             placeholder="e.g. Daily at morning"
           />
        </div>

        <div>
           <label className="block text-sm font-medium mb-1 dark:text-slate-300">Instructions</label>
           <textarea 
             className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
             value={form.instructions}
             onChange={e => setForm({...form, instructions: e.target.value})}
             rows={2}
           />
        </div>

        <button 
          onClick={assign} 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Assigning...' : 'Assign Prescription'}
        </button>
      </div>
    </div>
  )
}
