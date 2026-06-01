import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, IdCard, LogOut, CheckCircle, Smartphone } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('kkn_user') || '{}');
    setUser(localUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('kkn_user');
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Profil */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Profil Pengguna</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola detail sesi login dan otorisasi peran Anda di aplikasi Kas KKN.</p>
      </div>

      {/* Profil Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Banner Dekorasional */}
        <div className="h-24 bg-gradient-to-r from-emerald-600 to-teal-500 relative">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full translate-x-8 -translate-y-8 blur-md"></div>
        </div>

        {/* Info Pengguna */}
        <div className="p-6 md:p-8 pt-0 relative space-y-6">
          {/* Avatar bulat yang memotong Banner */}
          <div className="w-20 h-20 rounded-2xl bg-white text-emerald-600 font-extrabold flex items-center justify-center text-3xl shadow-lg border-4 border-white -mt-10 mx-auto md:mx-0 relative z-10">
            {(user.nama || 'U').charAt(0).toUpperCase()}
          </div>

          <div className="text-center md:text-left space-y-1">
            <h2 className="text-xl font-bold text-slate-800">{user.nama || 'Nama Pengguna'}</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                user.role === 'Admin' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
              }`}>
                {user.role || 'Member'}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-400 font-medium">NIM {user.nim || '-'}</span>
            </div>
          </div>

          {/* Rincian Akun Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="p-2 bg-white text-slate-500 rounded-xl shadow-sm">
                <IdCard size={18} />
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">User ID</span>
                <span className="text-sm font-semibold text-slate-700">{user.id_user || '-'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="p-2 bg-white text-slate-500 rounded-xl shadow-sm">
                <Shield size={18} />
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Tingkat Akses</span>
                <span className="text-sm font-semibold text-slate-700">
                  {user.role === 'Admin' ? 'Akses Penuh (Write/Read)' : 'Akses Terbatas (Read Only)'}
                </span>
              </div>
            </div>
          </div>

          {/* Deskripsi Otoritas Peran */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 space-y-2">
            <span className="font-semibold text-slate-700 block">Kemampuan Akun Anda:</span>
            <ul className="space-y-1.5 list-disc list-inside">
              <li className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                <span>Melihat status tagihan bulanan kas kelompok.</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                <span>Melakukan pembayaran kas digital terintegrasi Midtrans.</span>
              </li>
              {user.role === 'Admin' ? (
                <li className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                  <span className="text-emerald-700 font-semibold">Mencatat pengeluaran uang kas kelompok KKN.</span>
                </li>
              ) : (
                <li className="flex items-center gap-1.5 opacity-50">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mx-1.5"></span>
                  <span>Tidak dapat mengakses menu pencatatan pengeluaran.</span>
                </li>
              )}
            </ul>
          </div>

          {/* Tombol Logout */}
          <div className="pt-4 border-t border-slate-50">
            <button
              onClick={handleLogout}
              className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-sm font-semibold border border-rose-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={16} />
              Keluar dari Aplikasi
            </button>
          </div>
        </div>
      </div>

      {/* Info PWA App Version */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
        <Smartphone size={12} />
        <span>Kas KKN PWA v1.0.0</span>
      </div>
    </div>
  );
}
