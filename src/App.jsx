import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pengeluaran from './pages/Pengeluaran';
import Profile from './pages/Profile';

// Komponen Proteksi Rute: Blokir jika belum login dan arahkan ke /login
const ProtectedRoute = () => {
  const isAuthenticated = !!localStorage.getItem('kkn_user');
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // Bungkus rute-rute terproteksi di dalam komponen Layout
  return <Layout />;
};

// Komponen Proteksi Admin: Blokir rute pengeluaran jika role di localStorage bukan 'Admin'
const AdminRoute = () => {
  const user = JSON.parse(localStorage.getItem('kkn_user') || '{}');
  const isAdmin = user.role === 'Admin';
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

// Komponen Tamu: Cegah user yang sudah login mengakses halaman Login kembali
const GuestRoute = () => {
  const isAuthenticated = !!localStorage.getItem('kkn_user');
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Tamu (Login) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Rute Terproteksi (Dashboard, Profile, dll) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Rute Ekstra Terproteksi (Hanya Admin) */}
          <Route element={<AdminRoute />}>
            <Route path="/pengeluaran" element={<Pengeluaran />} />
          </Route>
        </Route>

        {/* Catch-all: Redirect ke Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
