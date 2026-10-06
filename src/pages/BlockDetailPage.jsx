import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { blocksAPI, wateringAPI } from '../services/api'
import {
  ArrowLeft, Droplets, Thermometer, Activity, Sun, Wind,
  Loader2, RefreshCw, CheckCircle, AlertTriangle, Zap
} from 'lucide-react'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import VeggieIcon from '../components/VeggieIcon'

const VEGGIE_COLORS = {
  wortel: '#f97316',
  tomat:  '#ef4444',
  bayam:  '#22c55e',
}

function SensorCard({ icon, label, value, unit, color, sub }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    orange: 'bg-orange-50 border-orange-100 text-orange-600',
    green: 'bg-green-50 border-green-100 text-green-600',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
    red: 'bg-red-50 border-red-100 text-red-600',
  }
  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2 opacity-70">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{value ?? '--'}</span>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function BlockDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [block, setBlock] = useState(null)
  const [readings, setReadings] = useState([])
  const [loading, setLoading] = useState(true)
  const [watering, setWatering] = useState(false)
  const [waterSuccess, setWaterSuccess] = useState(false)
  const [hours, setHours] = useState(24)
  const [activeChart, setActiveChart] = useState('moisture')

  const fetchData = useCallback(async () => {
    try {
      const [blockRes, readingsRes] = await Promise.all([
        blocksAPI.getOne(id),
        blocksAPI.getReadings(id, { hours, limit: 200 }),
      ])
      setBlock(blockRes.data.data)
      setReadings(readingsRes.data.data.map(r => ({
        ...r,
        time: new Date(r.recorded_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      })))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [id, hours])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleWater = async () => {
    if (!confirm(`Konfirmasi siram manual untuk ${block?.name}?`)) return
    setWatering(true)
    try {
      await wateringAPI.trigger(id, 'Siram manual dari dashboard')
      setWaterSuccess(true)
      setTimeout(() => setWaterSuccess(false), 3000)
      await fetchData()
    } catch (e) {
      alert('Gagal melakukan penyiraman: ' + (e.response?.data?.message || e.message))
    } finally {
      setWatering(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Memuat data blok...</p>
        </div>
      </div>
    )
  }

  if (!block) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Blok tidak ditemukan.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary mt-4">Kembali</button>
      </div>
    )
  }

  const reading = block.latest_reading || {}
  const color = VEGGIE_COLORS[block.vegetable] || '#22c55e'

  const chartConfigs = {
    moisture: { dataKey: 'soil_moisture', label: 'Kelembaban Tanah', unit: '%', color, refLine: block.moisture_threshold },
    temperature: { dataKey: 'temperature', label: 'Suhu', unit: '°C', color: '#f97316' },
    humidity: { dataKey: 'humidity', label: 'Kelembaban Udara', unit: '%', color: '#3b82f6' },
    ph: { dataKey: 'ph_level', label: 'pH Tanah', unit: '', color: '#8b5cf6', refLine: block.ph_min },
  }
  const chart = chartConfigs[activeChart]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <VeggieIcon vegetable={block.vegetable} />
              <h1 className="text-2xl font-bold text-gray-900">{block.name}</h1>
            </div>
            <p className="text-gray-500 text-sm ml-10">{block.location} · {block.area_m2} m²</p>
          </div>
        </div>

        {/* Water button */}
        <button
          onClick={handleWater}
          disabled={watering}
          className={`btn-water ${waterSuccess ? '!bg-green-500' : ''}`}
        >
          {watering ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Menyiram...</>
          ) : waterSuccess ? (
            <><CheckCircle className="w-5 h-5" /> Berhasil!</>
          ) : (
            <><Droplets className="w-5 h-5" /> Siram Sekarang</>
          )}
        </button>
      </div>

      {/* Status banner */}
      {block.needs_water && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl animate-pulse-slow">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-amber-700 font-medium">
            Kelembaban tanah ({reading.soil_moisture}%) di bawah threshold ({block.moisture_threshold}%). Tanaman membutuhkan air!
          </p>
        </div>
      )}

      {/* Sensor cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <SensorCard icon={<Droplets className="w-4 h-4" />} label="Kelembaban Tanah"
          value={reading.soil_moisture} unit="%" color="blue"
          sub={`Min: ${block.moisture_threshold}%`} />
        <SensorCard icon={<Thermometer className="w-4 h-4" />} label="Suhu"
          value={reading.temperature} unit="°C" color="orange" />
        <SensorCard icon={<Wind className="w-4 h-4" />} label="Kelembaban Udara"
          value={reading.humidity} unit="%" color="purple" />
        <SensorCard icon={<Sun className="w-4 h-4" />} label="Intensitas Cahaya"
          value={reading.light_intensity} unit="lux" color="yellow" />
        <SensorCard icon={<Activity className="w-4 h-4" />} label="pH Tanah"
          value={reading.ph_level} unit="" color="green"
          sub={`Ideal: ${block.ph_min}-${block.ph_max}`} />
        <SensorCard icon={<Zap className="w-4 h-4" />} label="Auto-Siram"
          value={block.auto_water_enabled ? 'ON' : 'OFF'} unit=""
          color={block.auto_water_enabled ? 'green' : 'red'} />
      </div>

      {/* Chart */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Grafik Sensor</h2>
            <p className="text-sm text-gray-400">{hours} jam terakhir</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Chart type selector */}
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              {Object.entries(chartConfigs).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setActiveChart(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeChart === key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>

            {/* Time range */}
            <select
              value={hours}
              onChange={e => setHours(Number(e.target.value))}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={6}>6 Jam</option>
              <option value={24}>24 Jam</option>
              <option value={48}>48 Jam</option>
            </select>

            <button onClick={fetchData} className="btn-secondary !py-2 !px-3">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={readings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chart.color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} unit={chart.unit} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              formatter={v => [`${v}${chart.unit}`, chart.label]}
            />
            {chart.refLine && (
              <ReferenceLine y={chart.refLine} stroke="#f59e0b" strokeDasharray="5 5"
                label={{ value: 'Threshold', position: 'insideTopRight', fontSize: 10, fill: '#f59e0b' }}
              />
            )}
            <Area
              type="monotone" dataKey={chart.dataKey}
              stroke={chart.color} strokeWidth={2}
              fill="url(#colorGrad)" dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Description */}
      {block.description && (
        <div className="card bg-gray-50">
          <h3 className="font-semibold text-gray-700 mb-1">Informasi Blok</h3>
          <p className="text-gray-500 text-sm">{block.description}</p>
        </div>
      )}
    </div>
  )
}
