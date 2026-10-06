import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard, Droplets, BarChart3, LogOut,
  Menu, X, Leaf, ChevronDown, Settings
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/logs', icon: Droplets, label: 'Log Penyiraman' },
  { to: '/analytics', icon: BarChart3, label: 'Analitik' },
]

function IPhone17Avatar({ name }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  return (
    <div className="relative">
      {/* iPhone 17 Pro Max style frame */}
      <div className="relative w-10 h-10">
        {/* Outer titanium ring */}
        <div className="absolute inset-0 rounded-[28%] bg-gradient-to-br from-gray-300 via-gray-100 to-gray-400 shadow-md" />
        {/* Inner screen */}
        <div className="absolute inset-[2px] rounded-[26%] bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center">
          <span className="text-white text-xs font-bold tracking-wide">{initials}</span>
        </div>
        {/* Dynamic Island */}
        <div className="absolute top-[4px] left-1/2 -translate-x-1/2 w-3 h-1 bg-black rounded-full" />
        {/* Camera bump */}
        <div className="absolute top-[4px] right-[3px] w-2 h-2 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-gray-700" />
        </div>
      </div>
    </div>
  )
}

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900 text-lg leading-none">SmartFarm</span>
                <p className="text-[10px] text-primary-600 font-medium leading-none">IoT Agriculture</p>
              </div>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Settings className="w-4 h-4" />
                  Pengaturan
                </NavLink>
              )}
            </div>

            {/* User menu */}
            <div className="hidden md:flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <IPhone17Avatar name={user?.name} />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</p>
                    <p className="text-xs text-gray-400 capitalize leading-none mt-0.5">{user?.role}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-xs text-gray-400">Masuk sebagai</p>
                      <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-50"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 animate-fade-in">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-gray-50">
              <div className="flex items-center gap-3 px-4 py-2">
                <IPhone17Avatar name={user?.name} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </div>
        )}
      </nav>
      {/* Spacer */}
      <div className="h-16" />
    </>
  )
}
