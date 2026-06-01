import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, KeyRound, AlertCircle } from 'lucide-react';

export default function Login() {
  const [idUser, setIdUser] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const trimmedId = idUser.trim().toUpperCase();

    if (!trimmedId) {
      setError('ID User wajib diisi!');
      return;
    }

    setIsLoading(true);

    // Simulasi loading 800ms agar terasa premium
    setTimeout(() => {
      let userData = {
        id_user: trimmedId,
        nama: '',
        nim: '',
        role: ''
      };

      const userDatabase = {
        'U001': { nama: 'Adri Chan', nim: '26053001', role: 'Admin' },
        'U002': { nama: 'Budi Santoso', nim: '26053002', role: 'Member' },
        'U003': { nama: 'Citra Lestari', nim: '26053003', role: 'Member' },
        'U004': { nama: 'Dedi Kurniawan', nim: '26053004', role: 'Member' },
        'U005': { nama: 'Elvira Sukma', nim: '26053005', role: 'Member' },
        'U006': { nama: 'Farhan Malik', nim: '26053006', role: 'Member' }
      };

      const matchedUser = userDatabase[trimmedId];

      if (matchedUser) {
        userData.nama = matchedUser.nama;
        userData.nim = matchedUser.nim;
        userData.role = matchedUser.role;
      } else {
        // Fallback default untuk id_user lain
        userData.nama = `Anggota (${trimmedId})`;
        userData.nim = '260530999';
        userData.role = 'Member';
      }

      localStorage.setItem('kkn_user', JSON.stringify(userData));
      setIsLoading(false);
      navigate('/');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-emerald-50 via-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-6 text-center bg-emerald-600 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 -translate-y-8 blur-md"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-6 translate-y-6 blur-md"></div>

          <div className="mx-auto w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/20 shadow-inner">
            <Wallet size={28} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Kas KKN</h2>
          <p className="text-emerald-100 text-xs mt-1">Sistem Informasi Manajemen Kas Kelompok KKN</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-100">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="id_user" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              ID User KKN
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <KeyRound size={18} />
              </span>
              <input
                id="id_user"
                type="text"
                value={idUser}
                onChange={(e) => setIdUser(e.target.value)}
                placeholder="Masukkan U001, U002, dll"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Memproses...
              </span>
            ) : (
              'Masuk Aplikasi'
            )}
          </button>

          {/* Panduan Login */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl text-xs text-slate-600">
            <span className="font-semibold text-emerald-800 block mb-1">Panduan Pengujian:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li>Masukkan <strong className="text-emerald-700 font-bold">U001</strong> untuk <strong className="text-slate-700">Adri Chan (Admin)</strong></li>
              <li>Masukkan <strong className="text-emerald-700 font-bold">U002</strong> s.d. <strong className="text-emerald-700 font-bold">U006</strong> untuk <strong className="text-slate-700">Member (Budi, Citra, dll)</strong></li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
}
