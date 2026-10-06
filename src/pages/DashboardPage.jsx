import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { dashboardAPI } from '../services/api'
import {
  Droplets, Thermometer, Activity, RefreshCw, AlertTriangle,
  TrendingUp, TrendingDown, CheckCircle, Clock, ChevronRight, Zap
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import VeggieIcon from '../components/VeggieIcon'

const VEGGIE_COLORS = {
  wortel: '#f97316',
  tomat:  '#ef4444',
  bayam:  '#22c55e',
}

const BLOCK_BG = {
  wortel: 'from-orange-50 to-amber-50 border-orange-100',
  tomat:  'from-red-50 to-rose-50 border-red-100',
  bayam:  'from-green-50 to-emerald-50 border-green-100',
}

function StatusBadge({ status }) {
  const map = {
    normal:   { label: 'Normal', cls: 'badge-success', icon: <CheckCircle className="w-3 h-3" /> },
    warning:  { label: 'Perlu Perhatian', cls: 'badge-warning', icon: <AlertTriangle className="w-3 h-3" /> },
    critical: { label: 'Kritis!', cls: 'badge-danger', icon: <AlertTriangle className="w-3 h-3" /> },
    watering: { label: 'Sedang Disiram', cls: 'badge-info', icon: <Droplets className="w-3 h-3" /> },
  }
  const s = map[status] || map.normal
  return <span className={s.cls}>{s.icon}{s.label}</span>
}

function MoistureRing({ value, threshold }) {
  const radius = 28
  const stroke = 5
  const normalizedRadius = radius - stroke / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (value / 100) * circumference
  const color = value < 25 ? '#ef4444' : value < threshold ? '#f59e0b' : '#22c55e'

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="#e5e7eb" strokeWidth={stroke} fill="transparent"
          r={normalizedRadius} cx={radius} cy={radius}
        />
        <circle
          stroke={color} strokeWidth={stroke} fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius} cx={radius} cy={radius}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-700">{Math.round(value)}%</span>
      </div>
    </div>
  )
}

function BlockCard({ block }) {
  const reading = block.latest_reading || {}
  const bg = BLOCK_BG[block.vegetable] || 'from-gray-50 to-gray-50 border-gray-100'

  return (
    <Link
      to={`/blocks/${block.id}`}
      className={`card-hover bg-gradient-to-br ${bg} border animate-fade-in group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <VeggieIcon vegetable={block.vegetable} />
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{block.name}</h3>
            <p className="text-sm text-gray-500">{block.vegetable_display || block.vegetable}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={block.status} />
          {block.needs_water && (
            <span className="badge badge-warning animate-pulse-slow">💧 Butuh Siram</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <MoistureRing value={reading.soil_moisture ?? 0} threshold={block.moisture_threshold} />

        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 text-sm">
            <Thermometer className="w-4 h-4 text-orange-400" />
            <span className="text-gray-600">{reading.temperature ?? '--'}°C</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-gray-600">pH {reading.ph_level ?? '--'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm col-span-2 text-gray-500">
            <Clock className="w-3 h-3" />
            <span className="text-xs">
              {reading.recorded_at
                ? new Date(reading.recorded_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                : '--:--'}
            </span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}

function StatCard({ icon, label, value, sub, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await dashboardAPI.getSummary()
      setData(res.data)
      setLastUpdate(new Date())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(), 30000) // auto-refresh every 30s
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Memuat data...</p>
        </div>
      </div>
    )
  }

  const s = data?.summary || {}

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="section-subtitle">
            Update terakhir: {lastUpdate ? lastUpdate.toLocaleTimeString('id-ID') : '—'}
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="btn-secondary"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Activity className="w-5 h-5" />}
          label="Total Blok" value={s.total_blocks ?? 0} sub="lahan aktif" color="primary"
        />
        <StatCard
          icon={<Droplets className="w-5 h-5" />}
          label="Penyiraman Hari Ini" value={s.watering_today ?? 0}
          sub={`${s.watering_auto_today ?? 0} otomatis`} color="blue"
        />
        <StatCard
          icon={<Thermometer className="w-5 h-5" />}
          label="Rata-rata Suhu" value={`${s.avg_temperature ?? 0}°C`}
          sub="semua blok" color="orange"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="Butuh Siram" value={s.blocks_need_water ?? 0}
          sub={`${s.blocks_normal ?? 0} normal`}
          color={s.blocks_need_water > 0 ? 'red' : 'primary'}
        />
      </div>

      {/* Block cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Status Blok Lahan</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data?.blocks || []).map(block => (
            <BlockCard key={block.id} block={block} />
          ))}
        </div>
      </div>

      {/* Moisture trend chart */}
      {data?.moisture_trend && data.moisture_trend.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tren Kelembaban Tanah</h2>
              <p className="text-sm text-gray-400">12 jam terakhir</p>
            </div>
            <TrendingUp className="w-5 h-5 text-gray-300" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.moisture_trend} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} unit="%" />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                formatter={(v, n) => [`${v}%`, n.replace('_', ' ')]}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {(data.blocks || []).map(b => (
                <Line
                  key={b.vegetable}
                  type="monotone"
                  dataKey={b.vegetable}
                  stroke={VEGGIE_COLORS[b.vegetable] || '#6b7280'}
                  strokeWidth={2}
                  dot={false}
                  name={`${b.emoji} ${b.vegetable}`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
