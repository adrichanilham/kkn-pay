// URL Web App Anda dari Tahap 2
const BASE_URL = 'https://script.google.com/macros/s/AKfycbyCNWNqCpFD8rgeRyLwp4np_l1Wbn3TkEpow4I3iRG-fUoe_Fz1A0FK2_uKsmhQWX5Wtg/exec';

// HTTP GET ke Base URL API untuk mengambil data tagihan kas user
export const fetchTagihan = async (idUser) => {
  try {
    const response = await fetch(`${BASE_URL}?action=getKas&id_user=${idUser}`, {
      method: 'GET',
      redirect: 'follow' // KRUSIAL UNTUK APPS SCRIPT
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