import { useState, useEffect } from 'react';
import { fetchTagihan, fetchMidtransToken } from '../api';
import { 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  User as UserIcon, 
  TrendingUp,
  Zap
} from 'lucide-react';

export default function Dashboard() {
  const [tagihanList, setTagihanList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({});
  const [showSimulator, setShowSimulator] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [payingTrxId, setPayingTrxId] = useState(null);

  useEffect(() => {
    // Ambil data user dari localStorage
    const localUser = JSON.parse(localStorage.getItem('kkn_user') || '{}');
    setUser(localUser);

    const loadTagihan = async () => {
      setIsLoading(true);
      const userId = localUser.id_user || 'U001';
      const response = await fetchTagihan(userId);
      
      if (response && response.status === 'success') {
        // State Reactive: Update tagihanList dari data murni API
        setTagihanList(response.data || []);
        
        // State Reactive: Sinkronisasikan info pengguna jika ada data terbaru dari Sheets API
        if (response.user) {
          setUser(response.user);
          localStorage.setItem('kkn_user', JSON.stringify(response.user));
        }
      } else {
        // Clear Cache: Hapus fallback data statis/dummy untuk memastikan murni data Sheets
        setTagihanList([]);
        console.warn("Gagal mengambil data tagihan ter-sinkronisasi dari Google Sheets API.");
      }
      setIsLoading(false);
    };

    loadTagihan();
  }, []);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Fungsi Pembayaran Baru Terintegrasi API
  const handlePay = async (idTrx, nominal) => {
    if (payingTrxId) return; // Cegah klik ganda
    
    setPayingTrxId(idTrx);
    
    try {
      const userId = user.id_user || 'U001';
      const response = await fetchMidtransToken(idTrx, nominal, userId);
      
      if (response && response.status === 'success' && response.token) {
        const token = response.token;
        setSelectedTrx({ ...tagihanList.find(t => t.id_trx === idTrx), token });

        if (window.snap) {
          window.snap.pay(token, {
            onSuccess: function (result) {
              alert(`Pembayaran Sukses untuk tagihan ${idTrx}!`);
              updateLocalStatus(idTrx);
            },
            onPending: function (result) {
              alert(`Pembayaran pending/menunggu untuk tagihan ${idTrx}.`);
            },
            onError: function (result) {
              alert(`Pembayaran gagal untuk tagihan ${idTrx}.`);
            },
            onClose: function () {
              console.log('Customer menutup popup pembayaran Midtrans Snap.');
            }
          });
        } else {
          // Simulator fallback jika script Midtrans diblokir
          setShowSimulator(true);
        }
      } else {
        alert(response?.message || "Gagal mendapatkan Snap Token dari backend.");
      }
    } catch (error) {
      console.error("Error saat memulai pembayaran:", error);
      alert("Terjadi kesalahan sistem saat menghubungi server pembayaran.");
    } finally {
      setPayingTrxId(null);
    }
  };

  // Update status lokal untuk simulasi berhasil
  const updateLocalStatus = (idTrx) => {
    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    
    setTagihanList(prevList => 
      prevList.map(trx => 
        trx.id_trx === idTrx 
          ? { ...trx, status: 'Success', tanggal_bayar: formattedDate } 
          : trx
      )
    );
  };

  // Hitung total ringkasan
  const totalBayar = tagihanList
    .filter(t => t.status === 'Success')
    .reduce((sum, t) => sum + Number(t.nominal), 0);

  const totalTunggakan = tagihanList
    .filter(t => t.status === 'Pending')
    .reduce((sum, t) => sum + Number(t.nominal), 0);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Dashboard */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl p-6 md:p-8 shadow-lg shadow-emerald-600/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-12 -translate-y-12 blur-2xl"></div>
        <div className="absolute -bottom-6 left-12 w-32 h-32 bg-teal-500/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
              {user.role} Dashboard
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-3">
              Halo, {user.nama}!
            </h1>
            <p className="text-emerald-100 text-sm mt-1">
              NIM: {user.nim} | ID: {user.id_user}
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <TrendingUp size={22} />
            </div>
            <div>
              <span className="block text-[11px] text-emerald-100 font-medium">Total Pembayaran Anda</span>
              <span className="text-xl font-bold tracking-tight">{formatRupiah(totalBayar)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ringkasan Finansial Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Sudah Dibayar</span>
            <span className="text-2xl font-bold text-slate-800 mt-0.5 block">{formatRupiah(totalBayar)}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">Belum Dibayar (Tunggakan)</span>
            <span className="text-2xl font-bold text-slate-800 mt-0.5 block">{formatRupiah(totalTunggakan)}</span>
          </div>
        </div>
      </div>

      {/* Daftar Tagihan Section */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
          <DollarSign size={20} className="text-emerald-600" />
          Rincian Tagihan Kas KKN
        </h2>

        {isLoading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-200 rounded-full w-16"></div>
                </div>
                <div className="h-7 bg-slate-200 rounded w-2/3"></div>
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-full"></div>
                  <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : tagihanList.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center">
            <Calendar className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-slate-500 font-medium">Tidak ada data tagihan untuk pengguna ini.</p>
          </div>
        ) : (
          // Card List Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tagihanList.map((tagihan) => {
              const isSuccess = tagihan.status === 'Success';
              return (
                <div 
                  key={tagihan.id_trx} 
                  className={`bg-white border transition-all duration-200 rounded-3xl p-5 shadow-sm hover:shadow-md flex flex-col justify-between ${
                    isSuccess ? 'border-emerald-100 hover:border-emerald-200' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Card */}
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Calendar size={13} />
                        {tagihan.bulan_tagihan}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${
                        isSuccess 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-600' : 'bg-amber-500'}`}></span>
                        {tagihan.status}
                      </span>
                    </div>

                    {/* Nominal */}
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">Nominal Tagihan</span>
                      <span className="text-xl font-bold text-slate-800">{formatRupiah(tagihan.nominal)}</span>
                    </div>

                    {/* Info Tanggal Bayar */}
                    <div className="pt-3 border-t border-slate-50 text-xs text-slate-500">
                      {isSuccess ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50/50 p-2 rounded-xl">
                          <CheckCircle size={14} className="shrink-0" />
                          <span>Dibayar: <strong>{tagihan.tanggal_bayar}</strong></span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 p-2">
                          <AlertTriangle size={14} className="shrink-0" />
                          <span>Menunggu Pembayaran</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tombol Bayar Sekarang */}
                  {!isSuccess && (
                    <button
                      onClick={() => handlePay(tagihan.id_trx, tagihan.nominal)}
                      disabled={payingTrxId !== null}
                      className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                    >
                      {payingTrxId === tagihan.id_trx ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Memproses...
                        </>
                      ) : (
                        <>
                          <CreditCard size={14} />
                          Bayar Sekarang
                        </>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Simulator Modal UI (Fallback & Sandbox Dummy Token Test) */}
      {showSimulator && selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform scale-100 transition-all">
            {/* Header Simulator */}
            <div className="p-6 bg-emerald-600 text-white text-center relative">
              <div className="mx-auto w-12 h-12 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-bold">Simulator Pembayaran Midtrans</h3>
              <p className="text-xs text-emerald-100 mt-1">Simulasi Pembayaran Tagihan: {selectedTrx.bulan_tagihan}</p>
            </div>

            {/* Konten Simulator */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">ID Transaksi:</span>
                  <span className="font-semibold text-slate-700">{selectedTrx.id_trx}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nominal:</span>
                  <span className="font-bold text-slate-900">{formatRupiah(selectedTrx.nominal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Snap Token:</span>
                  <span className="text-xs text-emerald-600 font-mono truncate max-w-[180px]" title={selectedTrx.token}>{selectedTrx.token || 'Tidak Ada'}</span>
                </div>
              </div>

              <div className="text-center text-xs text-slate-500 py-1">
                Karena script Midtrans Snap SDK gagal dimuat (atau diblokir), silakan gunakan simulator ini untuk menguji callback pembayaran menggunakan token asli dari backend:
              </div>

              {/* Tombol Aksi Simulasi */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <button
                  onClick={() => {
                    updateLocalStatus(selectedTrx.id_trx);
                    setShowSimulator(false);
                    alert("Simulasi SUKSES berhasil! Status diperbarui.");
                  }}
                  className="py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1.5"
                >
                  <CheckCircle size={16} />
                  Sukses
                </button>
                
                <button
                  onClick={() => {
                    setShowSimulator(false);
                    alert("Simulasi PENDING berhasil! Menunggu konfirmasi.");
                  }}
                  className="py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1.5"
                >
                  <AlertTriangle size={16} />
                  Pending
                </button>

                <button
                  onClick={() => {
                    setShowSimulator(false);
                    alert("Simulasi GAGAL/ERROR dipicu.");
                  }}
                  className="py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1.5"
                >
                  <AlertTriangle size={16} className="text-rose-600" />
                  Gagal
                </button>
              </div>

              <button
                onClick={() => setShowSimulator(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-medium transition-all"
              >
                Tutup Simulator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
