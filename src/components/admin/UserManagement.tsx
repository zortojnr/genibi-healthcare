import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'

interface User {
  id: string
  email: string
  role: string
  displayName?: string
  lastLogin?: string
  permissions?: string[]
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Edit State
  const [editRole, setEditRole] = useState('')
  const [editPermissions, setEditPermissions] = useState<string[]>([])
  const [editReason, setEditReason] = useState('')

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      const data = await adminService.getUsers()
      setUsers(data as User[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function openEdit(user: User) {
    setSelectedUser(user)
    setEditRole(user.role || 'viewer')
    setEditPermissions(user.permissions || [])
    setEditReason('')
  }

  async function handleSave() {
    if (!selectedUser) return
    if (!editReason) return alert('Reason is required for audit logs')
    
    setLoading(true)
    try {
      await adminService.updateUserRole(selectedUser.id, editRole, editPermissions, editReason)
      alert('User updated successfully')
      setSelectedUser(null)
      loadUsers()
    } catch (e) {
      alert('Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const availablePermissions = ['manage_users', 'manage_content', 'view_audit', 'manage_medications']

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold dark:text-white">User & Access Management</h2>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Permissions</th>
              <th className="p-4">Last Active</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-700 dark:text-slate-300">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="p-4">
                  <div className="font-medium">{u.displayName || 'Unknown'}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{u.email}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {u.role || 'VIEWER'}
                  </span>
                </td>
                <td className="p-4 text-sm max-w-xs truncate">
                  {u.permissions?.join(', ') || '-'}
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td className="p-4">
                  <button onClick={() => openEdit(u)} className="text-blue-600 hover:underline text-sm font-medium">Edit Access</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Edit Access: {selectedUser.email}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Role</label>
                <select 
                  value={editRole} 
                  onChange={e => setEditRole(e.target.value)}
                  className="w-full p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-slate-300">Granular Permissions</label>
                <div className="space-y-2">
                  {availablePermissions.map(p => (
                    <label key={p} className="flex items-center gap-2 text-sm dark:text-slate-300">
                      <input 
                        type="checkbox" 
                        checked={editPermissions.includes(p)}
                        onChange={e => {
                          if (e.target.checked) setEditPermissions([...editPermissions, p])
                          else setEditPermissions(editPermissions.filter(ip => ip !== p))
                        }}
                        className="rounded border-slate-300"
                      />
                      {p.replace('_', ' ')}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Reason for Change (Required)</label>
                <textarea 
                  value={editReason}
                  onChange={e => setEditReason(e.target.value)}
                  className="w-full p-2 rounded border dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white text-sm"
                  placeholder="e.g. Promoted to content manager"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setSelectedUser(null)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
