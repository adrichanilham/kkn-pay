// URL Web App Anda dari Tahap 2
const BASE_URL = 'https://script.google.com/macros/s/AKfycbyCNWNqCpFD8rgeRyLwp4np_l1Wbn3TkEpow4I3iRG-fUoe_Fz1A0FK2_uKsmhQWX5Wtg/exec';

export const fetchTagihan = async (idUser) => {
  try {
    const timestamp = Date.now();
    const response = await fetch(`${BASE_URL}?action=getKas&id_user=${idUser}&_t=${timestamp}`, {
      method: 'GET',
      redirect: 'follow', // KRUSIAL UNTUK APPS SCRIPT
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Gagal mengambil data tagihan:", error);
    return { status: 'error', data: [] };
  }
};

// HTTP POST ke Base URL API untuk mencatat pengeluaran baru
export const addPengeluaran = async (keterangan, nominal) => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      redirect: 'follow', // KRUSIAL UNTUK APPS SCRIPT
      body: JSON.stringify({
        action: 'addPengeluaran',
        keterangan,
        nominal: Number(nominal)
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Gagal menambahkan pengeluaran:", error);
    return { status: 'error', message: 'Gagal terhubung ke server.' };
  }
};

// HTTP POST ke Base URL API untuk mengambil Snap Token Midtrans dari backend
export const fetchMidtransToken = async (idTrx, nominal, idUser) => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      redirect: 'follow', // KRUSIAL UNTUK APPS SCRIPT
      body: JSON.stringify({
        action: 'getSnapToken',
        id_trx: idTrx,
        nominal: Number(nominal),
        id_user: idUser
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Gagal mengambil Snap Token Midtrans:", error);
    return { status: 'error', message: 'Gagal terhubung ke server pembayaran.' };
  }
};

// Mengambil data user langsung dari Google Sheet CSV untuk sinkronisasi nama/role real-time
export const fetchUsersFromSheet = async () => {
  try {
    const timestamp = Date.now();
    const response = await fetch(`https://docs.google.com/spreadsheets/d/1pRFCiWAQD_4qG9xpUrCen0hESVG8rQAhVi1PF8pixyg/export?format=csv&gid=0&_t=${timestamp}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    const csvText = await response.text();
    
    // Parse CSV sederhana
    const lines = csvText.split('\n');
    if (lines.length < 2) return null;
    
    const users = [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/\r/g, ''));
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim().replace(/\r/g, ''));
      const user = {};
      headers.forEach((header, index) => {
        user[header] = values[index] || '';
      });
      users.push(user);
    }
    return users;
  } catch (error) {
    console.error("Gagal memuat data user dari spreadsheet:", error);
    return null;
  }
};