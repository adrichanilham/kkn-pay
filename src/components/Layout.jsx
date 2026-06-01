import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, User, LogOut, Wallet } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  
  // Ambil data user dari localStorage
  const user = JSON.parse(localStorage.getItem('kkn_user') || '{}');
  const isAdmin = user.role === 'Admin';

  const handleLogout = () => {
    localStorage.removeItem('kkn_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Judul */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-200">
              <Wallet size={20} />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-800">Kas KKN</span>
              <span className="block text-[10px] text-emerald-600 font-semibold -mt-1">PWA Management</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 font-medium text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/pengeluaran"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Receipt size={18} />
                Pengeluaran
              </NavLink>
            )}

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <User size={18} />
              Profile
            </NavLink>

            <div className="h-6 w-[1px] bg-slate-200 mx-2"></div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <LogOut size={18} />
              Keluar
            </button>
          </nav>

          {/* User Info (Desktop only) */}
          <div className="hidden md:flex items-center gap-2">
            <div className="text-right">
              <span className="block text-xs font-semibold text-slate-800">{user.nama || 'Pengguna'}</span>
              <span className="block text-[10px] text-slate-400 capitalize">{user.role || 'Member'}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm border border-emerald-200">
              {(user.nama || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 shadow-[0_-8px_30px_rgb(0,0,0,0.06)] px-6 py-2.5 z-40">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 transition-all duration-200 relative ${
                isActive ? 'text-emerald-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard size={20} className={isActive ? 'scale-110 transition-transform' : ''} />
                <span className="text-[10px]">Dashboard</span>
                {isActive && (
                  <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-emerald-600"></span>
                )}
              </>
            )}
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/pengeluaran"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1.5 transition-all duration-200 relative ${
                  isActive ? 'text-emerald-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Receipt size={20} className={isActive ? 'scale-110 transition-transform' : ''} />
                  <span className="text-[10px]">Pengeluaran</span>
                  {isActive && (
                    <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-emerald-600"></span>
                  )}
                </>
              )}
            </NavLink>
          )}

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1.5 transition-all duration-200 relative ${
                isActive ? 'text-emerald-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <User size={20} className={isActive ? 'scale-110 transition-transform' : ''} />
                <span className="text-[10px]">Profil</span>
                {isActive && (
                  <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-emerald-600"></span>
                )}
              </>
            )}
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
