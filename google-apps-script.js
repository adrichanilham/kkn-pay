// Konfigurasi Global
const sheetApp = SpreadsheetApp.getActiveSpreadsheet();

// ==========================================
// 1. FUNGSI GET (Mengambil Data)
// ==========================================
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getKas') {
      const idUser = e.parameter.id_user;
      return responseJSON(getKasData(idUser));
    }
    
    return responseJSON({ status: 'error', message: 'Action tidak sah.' });
  } catch (error) {
    return responseJSON({ status: 'error', message: error.message });
  }
}

// ==========================================
// 2. FUNGSI POST (Mengirim Data / Webhook)
// ==========================================
function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter;
    }

    // Routing untuk menambah pengeluaran
    if (payload.action === 'addPengeluaran') {
      return responseJSON(addPengeluaranData(payload));
    }
    
    // Routing untuk meminta Token Midtrans
    if (payload.action === 'getSnapToken') {
      return responseJSON(generateSnapToken(payload.id_trx, payload.nominal, payload.id_user));
    }
    
    // Deteksi otomatis Webhook dari Midtrans
    if (payload.transaction_status && payload.order_id) {
      return responseJSON(handleWebhookMidtrans(payload));
    }

    // Jika action tidak cocok dengan apapun di atas
    return responseJSON({ status: 'error', message: 'Payload tidak dikenali.' });
  } catch (error) {
    return responseJSON({ status: 'error', message: error.message });
  }
}

// ==========================================
// 3. FUNGSI HELPER JSON
// ==========================================
function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 4. LOGIK CRUD GOOGLE SHEETS 
// ==========================================

// Membaca Data Kas berdasarkan id_user
function getKasData(idUser) {
  const sheet = sheetApp.getSheetByName('Kas');
  const data = sheet.getDataRange().getValues();
  const result = [];

  // Data sebenar bermula pada Baris 2 (indeks tatasusunan i = 1)
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === idUser) { 
      result.push({
        id_trx: data[i][0],        // Lajur A
        bulan_tagihan: data[i][2], // Lajur C
        nominal: data[i][3],       // Lajur D
        status: data[i][4],        // Lajur E
        tanggal_bayar: data[i][5]  // Lajur F
      });
    }
  }
  return { status: 'success', data: result };
}

// Menambah Data Pengeluaran
function addPengeluaranData(payload) {
  const sheet = sheetApp.getSheetByName('Pengeluaran');
  const idOut = "OUT" + new Date().getTime().toString().slice(-4);
  const tanggal = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy");
  
  sheet.appendRow([idOut, tanggal, payload.keterangan, payload.nominal]);
  
  return { status: 'success', message: 'Pengeluaran berjaya dicatat.' };
}

// Mengendalikan Webhook Midtrans (Kemas Kini Status)
function handleWebhookMidtrans(payload) {
  const sheet = sheetApp.getSheetByName('Kas');
  const data = sheet.getDataRange().getValues();
  
  // PERBAIKAN: order_id dipotong di tanda hubung '-' untuk mengambil id_trx asli (misal: "TRX004-1717200000" -> "TRX004")
  const idTrxMidtrans = payload.order_id.split("-")[0]; 
  
  if (payload.transaction_status === 'settlement' || payload.transaction_status === 'capture') {
    // Cari baris dari data (Bermula dari i = 1 / Baris 2)
    for (let i = 1; i < data.length; i++) {
      // data[i][0] adalah Lajur A (id_trx)
      if (data[i][0] === idTrxMidtrans) {
        
        // Kemas kini status menjadi Success pada Lajur E (Indeks lajur = 5 dalam Apps Script getRange)
        sheet.getRange(i + 1, 5).setValue('Success');
        
        // Kemas kini tanggal_bayar pada Lajur F (Indeks lajur = 6)
        const dateNow = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy");
        sheet.getRange(i + 1, 6).setValue(dateNow);
        
        return { status: 'success', message: 'Status kas dikemas kini menjadi Success.' };
      }
    }
  }
  return { status: 'ignored', message: 'Status transaksi bukan settlement/capture.' };
}

// ==========================================
// 5. INTEGRASI MIDTRANS SNAP (GENERATE TOKEN)
// ==========================================
function generateSnapToken(idTrx, nominal, idUser) {
  // GANTI DENGAN SERVER KEY MIDTRANS SANDBOX ANDA
  const serverKey = "Mid-server-YOUR_SERVER_KEY_HERE"; 
  const midtransUrl = "https://app.sandbox.midtrans.com/snap/v1/transactions";
  
  // Encode Server Key ke Base64 (Syarat wajib API Midtrans)
  const encodedAuth = Utilities.base64Encode(serverKey + ":");

  // PERBAIKAN: order_id dibuat unik dengan melampirkan timestamp untuk mencegah error "order_id has already been taken"
  const uniqueOrderId = idTrx + "-" + new Date().getTime();

  const payload = {
    "transaction_details": {
      "order_id": uniqueOrderId,
      "gross_amount": nominal
    },
    "customer_details": {
      "first_name": idUser,
      "email": "anggota_kkn@example.com"
    }
  };

  const options = {
    "method": "post",
    "headers": {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": "Basic " + encodedAuth
    },
    "payload": JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(midtransUrl, options);
    const json = JSON.parse(response.getContentText());
    return { status: 'success', token: json.token };
  } catch (error) {
    return { status: 'error', message: error.toString() };
  }
}
