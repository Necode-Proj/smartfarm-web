import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Leaf, Eye, EyeOff, Loader2, Sprout } from 'lucide-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCarrot, faPepperHot, faLeaf, faUserShield, faUserGear } from '@fortawesome/free-solid-svg-icons'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau password salah.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@smartfarm.id', password: 'password' })
    else setForm({ email: 'budi@smartfarm.id', password: 'password' })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-farm-gradient flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 right-12 w-32 h-32 bg-white/5 rounded-full" />

        {/* Content */}
        <div className="relative z-10 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Sprout className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">SmartFarm</h1>
          <p className="text-primary-200 text-lg mb-10">Sistem Monitoring Pertanian Cerdas</p>

          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: faCarrot, label: 'Wortel', sub: 'Blok A', color: 'text-orange-300' },
              { icon: faPepperHot, label: 'Tomat', sub: 'Blok B', color: 'text-red-300' },
              { icon: faLeaf, label: 'Bayam', sub: 'Blok C', color: 'text-green-300' },
            ].map(item => (
              <div key={item.label} className="glass-card text-center p-4">
                <div className="text-3xl mb-2">
                  <FontAwesomeIcon icon={item.icon} className={item.color} />
                </div>
                <div className="text-sm font-semibold text-white">{item.label}</div>
                <div className="text-xs text-primary-200">{item.sub}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-3 text-left">
            {[
              '📡 Monitoring sensor real-time',
              '💧 Auto-watering cerdas',
              '👥 Multi-user & multi-role',
              '📊 Analitik data pertanian',
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-primary-100 text-sm">
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-xl leading-none">SmartFarm</p>
              <p className="text-xs text-primary-600">IoT Agriculture</p>
            </div>
          </div>

          <div className="card shadow-xl border-0">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Selamat Datang 👋</h2>
              <p className="text-gray-500 mt-1">Masuk ke dashboard monitoring Anda</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input-field"
                  placeholder="nama@smartfarm.id"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-3 font-medium uppercase tracking-wide">Demo Akun</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => fillDemo('admin')}
                  className="text-xs py-2 px-3 bg-primary-50 text-primary-700 rounded-xl font-medium hover:bg-primary-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <FontAwesomeIcon icon={faUserShield} /> Admin
                </button>
                <button
                  onClick={() => fillDemo('operator')}
                  className="text-xs py-2 px-3 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <FontAwesomeIcon icon={faUserGear} /> Operator
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">Password: <code className="bg-gray-100 px-1 rounded">password</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
