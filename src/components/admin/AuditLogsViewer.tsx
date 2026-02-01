import { useEffect, useState } from 'react'
import { adminService, type AuditLog } from '../../services/adminService'

export default function AuditLogsViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  async function loadLogs() {
    try {
      const data = await adminService.getAuditLogs()
      setLogs(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Moved outside effect or define here
  function formatAction(action: string) {
    switch(action) {
      case 'LOGIN': return 'User Login'
      case 'UPDATE_ROLE': return 'Role Updated'
      case 'PROMOTE_ADMIN': return 'Admin Promoted'
      case 'DEMOTE_ADMIN': return 'Admin Demoted'
      case 'ASSIGN_MED': return 'Medication Assigned'
      default: return action.replace(/_/g, ' ')
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading security logs...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold dark:text-white">Security & Audit Logs</h2>
        <button onClick={loadLogs} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Refresh</button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action</th>
                <th className="p-3">Details</th>
                <th className="p-3">Performed By</th>
                <th className="p-3">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700 dark:text-slate-300">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 font-medium">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded text-xs border dark:border-slate-600">
                      {formatAction(log.action)}
                    </span>
                  </td>
                  <td className="p-3 max-w-md truncate" title={log.details}>{log.details}</td>
                  <td className="p-3 font-mono text-xs">{log.performedBy}</td>
                  <td className="p-3 italic text-slate-500">{log.reason || 'No reason provided'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
