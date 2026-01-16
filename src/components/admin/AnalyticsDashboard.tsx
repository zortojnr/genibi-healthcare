import { useEffect, useState } from 'react'
import { adminService, type AnalyticsMetrics } from '../../services/adminService'

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [])

  async function loadMetrics() {
    try {
      const data = await adminService.getAnalytics()
      setMetrics(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>

  if (!metrics) return null

  const cards = [
    { title: 'Total Users', value: metrics.totalUsers, color: 'bg-blue-500' },
    { title: 'Active (24h)', value: metrics.activeUsers24h, color: 'bg-green-500' },
    { title: 'Total Appointments', value: metrics.totalAppointments, color: 'bg-purple-500' },
    { title: 'Pending Actions', value: metrics.pendingAppointments, color: 'bg-amber-500' },
    { title: 'System Health', value: `${metrics.systemHealth}%`, color: 'bg-emerald-500' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold dark:text-white">Real-Time Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.title} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border dark:border-slate-700 transition-all hover:shadow-md">
            <div className={`w-2 h-2 rounded-full mb-3 ${card.color}`} />
            <div className="text-slate-500 dark:text-slate-400 text-sm">{card.title}</div>
            <div className="text-2xl font-bold dark:text-white mt-1">{card.value}</div>
          </div>
        ))}
      </div>
      
      {/* Placeholder for charts */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 h-64 flex items-center justify-center text-slate-400">
          User Growth Chart (Placeholder)
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700 h-64 flex items-center justify-center text-slate-400">
          Activity Heatmap (Placeholder)
        </div>
      </div>
    </div>
  )
}
