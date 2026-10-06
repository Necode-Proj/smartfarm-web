import { useState, useEffect, useCallback } from 'react'
import { wateringAPI, blocksAPI } from '../services/api'
import { Droplets, Filter, RefreshCw, Loader2, UserCircle, Zap } from 'lucide-react'
import VeggieIcon from '../components/VeggieIcon'

function TriggerBadge({ type }) {
  return type === 'auto'
    ? <span className="badge badge-info"><Zap className="w-3 h-3" />Otomatis</span>
    : <span className="badge badge-success"><UserCircle className="w-3 h-3" />Manual</span>
}

function MoistureDiff({ before, after }) {
  if (!before || !after) return <span className="text-gray-400 text-sm">—</span>
  const diff = (after - before).toFixed(1)
  const positive = diff > 0
  return (
    <span className={`text-sm font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
      {before}% → {after}% ({positive ? '+' : ''}{diff}%)
    </span>
  )
}

export default function WateringLogsPage() {
  const [logs, setLogs] = useState([])
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ block_id: '', trigger_type: '', date_from: '', date_to: '' })
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await wateringAPI.getLogs({ ...filters, page, per_page: 15 })
      setLogs(res.data.data)
      setMeta(res.data.meta || res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    blocksAPI.getAll().then(r => setBlocks(r.data.data || []))
  }, [])

  useEffect(() => {
    setPage(1)
  }, [filters])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const setFilter = (key, val) => setFilters(p => ({ ...p, [key]: val }))

  const totalAuto = logs.filter(l => l.trigger_type === 'auto').length
  const totalManual = logs.filter(l => l.trigger_type === 'manual').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Log Penyiraman</h1>
          <p className="section-subtitle">Riwayat semua penyiraman (manual & otomatis)</p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
          <p className="text-sm text-gray-400">Total halaman ini</p>
        </div>
        <div className="card text-center">
          <Zap className="w-6 h-6 text-primary-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{totalAuto}</p>
          <p className="text-sm text-gray-400">Otomatis</p>
        </div>
        <div className="card text-center">
          <UserCircle className="w-6 h-6 text-orange-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{totalManual}</p>
          <p className="text-sm text-gray-400">Manual</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3 text-gray-600">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={filters.block_id}
            onChange={e => setFilter('block_id', e.target.value)}
            className="input-field"
          >
            <option value="">Semua Blok</option>
            {blocks.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            value={filters.trigger_type}
            onChange={e => setFilter('trigger_type', e.target.value)}
            className="input-field"
          >
            <option value="">Semua Tipe</option>
            <option value="auto">Otomatis</option>
            <option value="manual">Manual</option>
          </select>

          <input
            type="date"
            value={filters.date_from}
            onChange={e => setFilter('date_from', e.target.value)}
            className="input-field"
          />

          <input
            type="date"
            value={filters.date_to}
            onChange={e => setFilter('date_to', e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden !p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Droplets className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>Belum ada data penyiraman.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Blok', 'Tipe', 'Kelembaban', 'Durasi', 'Operator', 'Waktu', 'Catatan'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <VeggieIcon vegetable={log.block?.vegetable} className="w-3.5 h-3.5" size="xs" />
                        <span className="text-sm font-medium text-gray-900">{log.block?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><TriggerBadge type={log.trigger_type} /></td>
                    <td className="px-4 py-3">
                      <MoistureDiff before={log.moisture_before} after={log.moisture_after} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{log.duration_seconds}s</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {log.user?.name || <span className="text-gray-400 italic">System</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {log.started_at
                        ? new Date(log.started_at).toLocaleString('id-ID', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 max-w-[200px] truncate">
                      {log.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && (meta.last_page > 1 || meta.total > 15) && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-400">
              {meta.from}–{meta.to} dari {meta.total} entri
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary !py-1.5 !px-3 text-sm"
              >Sebelumnya</button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= (meta.last_page || 1)}
                className="btn-secondary !py-1.5 !px-3 text-sm"
              >Berikutnya</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
