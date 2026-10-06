import { useState, useEffect } from 'react'
import { blocksAPI } from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { TrendingUp, BarChart3 } from 'lucide-react'
import VeggieIcon from '../components/VeggieIcon'

const COLORS = {
  wortel: '#f97316',
  tomat: '#ef4444',
  bayam: '#22c55e',
}

export default function AnalyticsPage() {
  const [blocks, setBlocks] = useState([])
  const [readings, setReadings] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const blocksRes = await blocksAPI.getAll()
        const blockList = blocksRes.data.data || []
        setBlocks(blockList)

        const allReadings = {}
        await Promise.all(
          blockList.map(async block => {
            const res = await blocksAPI.getReadings(block.id, { hours: 48, limit: 200 })
            allReadings[block.id] = res.data.data || []
          })
        )
        setReadings(allReadings)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    )
  }

  // Comparison chart data (latest reading per block)
  const comparisonData = [
    { metric: 'Kelembaban Tanah', ...Object.fromEntries(blocks.map(b => [b.vegetable, b.latest_reading?.soil_moisture ?? 0])) },
    { metric: 'Suhu (°C)', ...Object.fromEntries(blocks.map(b => [b.vegetable, b.latest_reading?.temperature ?? 0])) },
    { metric: 'Kelembaban Udara', ...Object.fromEntries(blocks.map(b => [b.vegetable, b.latest_reading?.humidity ?? 0])) },
    { metric: 'pH Tanah (×10)', ...Object.fromEntries(blocks.map(b => [b.vegetable, (b.latest_reading?.ph_level ?? 0) * 10])) },
  ]

  // Radar chart data per block
  const radarData = blocks.map(block => {
    const r = block.latest_reading || {}
    return {
      vegetable: block.vegetable,
      emoji: block.emoji,
      data: [
        { subject: 'Moisture', value: r.soil_moisture ?? 0, fullMark: 100 },
        { subject: 'Suhu', value: ((r.temperature ?? 0) / 40) * 100, fullMark: 100 },
        { subject: 'Kelembaban', value: r.humidity ?? 0, fullMark: 100 },
        { subject: 'pH', value: ((r.ph_level ?? 0) / 14) * 100, fullMark: 100 },
        { subject: 'Cahaya', value: Math.min(100, (r.light_intensity ?? 0) / 100), fullMark: 100 },
      ],
    }
  })

  // Average moisture per block (hourly, last 24h)
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date()
    hour.setHours(hour.getHours() - (23 - i), 0, 0, 0)
    const row = { time: hour.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }
    blocks.forEach(block => {
      const blockReadings = readings[block.id] || []
      const matching = blockReadings.filter(r => {
        const t = new Date(r.recorded_at)
        return t.getHours() === hour.getHours() && t.getDate() === hour.getDate()
      })
      row[block.vegetable] = matching.length > 0
        ? Math.round(matching.reduce((a, r) => a + r.soil_moisture, 0) / matching.length)
        : null
    })
    return row
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">Analitik</h1>
        <p className="section-subtitle">Perbandingan dan tren data sensor antar blok</p>
      </div>

      {/* Comparison bar chart */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Perbandingan Sensor Saat Ini</h2>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={comparisonData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {blocks.map(b => (
              <Bar key={b.vegetable} dataKey={b.vegetable} name={b.vegetable.charAt(0).toUpperCase() + b.vegetable.slice(1)}
                fill={COLORS[b.vegetable]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly moisture trend */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Tren Kelembaban Tanah (24 jam)</h2>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={hourlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} interval={3} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} unit="%" />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              formatter={(v, n) => [`${v}%`, n]} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {blocks.map(b => (
              <Bar key={b.vegetable} dataKey={b.vegetable} name={b.vegetable.charAt(0).toUpperCase() + b.vegetable.slice(1)}
                fill={COLORS[b.vegetable]} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar charts per block */}
      <div className="grid sm:grid-cols-3 gap-4">
        {radarData.map(({ vegetable, data }) => (
          <div key={vegetable} className="card flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <VeggieIcon vegetable={vegetable} className="w-4 h-4" size="sm" />
              <h3 className="font-semibold text-gray-700 capitalize">{vegetable}</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={data}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name={vegetable} dataKey="value" stroke={COLORS[vegetable]}
                  fill={COLORS[vegetable]} fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  )
}
