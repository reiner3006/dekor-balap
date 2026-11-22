/**
 * DEKOR BALAP — Formulir Pemesanan Jasa Dekorasi
 * Logika harga otomatis, ringkasan real-time, validasi kolom wajib,
 * dan pembuatan tautan WhatsApp Click to Chat.
 */

// Nomor WhatsApp Admin sementara (format internasional tanpa +, spasi, atau 0 di depan).
// Ganti dengan nomor WhatsApp Admin DEKOR BALAP yang aktif.
export const ADMIN_WHATSAPP_NUMBER = '6282145362068';

export const DECORATION_TYPES = [
  'Dekorasi Pernikahan',
  'Dekorasi Wisuda',
  'Dekorasi Ulang Tahun',
  'Dekorasi Tunangan',
  'Dekorasi Acara Lainnya',
];

export const PACKAGES = {
  basic: {
    id: 'basic',
    name: 'Paket Basic',
    price: 1500000,
    formattedPrice: 'Rp1.500.000',
    label: 'Paket Basic – Rp1.500.000',
  },
  standard: {
    id: 'standard',
    name: 'Paket Standard',
    price: 2500000,
    formattedPrice: 'Rp2.500.000',
    label: 'Paket Standard – Rp2.500.000',
  },
  premium: {
    id: 'premium',
    name: 'Paket Premium',
    price: 4000000,
    formattedPrice: 'Rp4.000.000',
    label: 'Paket Premium – Rp4.000.000',
  },
};

export const REQUIRED_FIELDS = [
  { key: 'nama', label: 'Nama Lengkap Pelanggan' },
  { key: 'whatsapp', label: 'Nomor WhatsApp' },
  { key: 'provinsi', label: 'Provinsi' },
  { key: 'kabupaten', label: 'Kabupaten/Kota' },
  { key: 'kecamatan', label: 'Kecamatan' },
  { key: 'desa', label: 'Desa/Kelurahan' },
  { key: 'alamat', label: 'Alamat Lengkap Lokasi Acara' },
  { key: 'jenisDekorasi', label: 'Jenis Dekorasi' },
  { key: 'paketDekorasi', label: 'Paket Dekorasi' },
  { key: 'tanggalAcara', label: 'Tanggal Acara' },
  { key: 'waktuAcara', label: 'Waktu Acara' },
];

/**
 * Mengambil detail paket berdasarkan key ('basic' | 'standard' | 'premium').
 */
export function getPackageDetails(packageKey) {
  if (!packageKey || !Object.prototype.hasOwnProperty.call(PACKAGES, packageKey)) {
    return null;
  }
  return PACKAGES[packageKey];
}

/**
 * Memformat angka menjadi format Rupiah Indonesia tanpa desimal (contoh: Rp1.500.000).
 */
export function formatRupiah(amount) {
  if (!amount || Number.isNaN(Number(amount))) {
    return 'Rp0';
  }
  return `Rp${Number(amount).toLocaleString('id-ID')}`;
}

/**
 * Memformat tanggal YYYY-MM-DD ke format tanggal Indonesia yang mudah dibaca.
 */
export function formatIndonesianDate(isoDate) {
  if (!isoDate || typeof isoDate !== 'string') {
    return '-';
  }
  const parts = isoDate.split('-');
  if (parts.length !== 3) {
    return isoDate;
  }
  const year = Number(parts[0]);
  const monthIndex = Number(parts[1]) - 1;
  const day = Number(parts[2]);

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  if (
    Number.isNaN(year) ||
    Number.isNaN(day) ||
    monthIndex < 0 ||
    monthIndex >= months.length
  ) {
    return isoDate;
  }

  return `${day} ${months[monthIndex]} ${year}`;
}

/**
 * Memvalidasi seluruh kolom wajib formulir pemesanan.
 * Mengembalikan { isValid, errors, missingLabels }.
 */
export function validateBookingForm(data) {
  const errors = {};
  const missingLabels = [];

  for (const field of REQUIRED_FIELDS) {
    const rawValue = data[field.key];
    const trimmed = typeof rawValue === 'string' ? rawValue.trim() : '';
    if (!trimmed) {
      errors[field.key] = `${field.label} wajib diisi.`;
      missingLabels.push(field.label);
    }
  }

  // Validasi tambahan format nomor WhatsApp (minimal 9 digit angka)
  if (!errors.whatsapp && typeof data.whatsapp === 'string') {
    const digitsOnly = data.whatsapp.replace(/\D/g, '');
    if (digitsOnly.length < 9) {
      errors.whatsapp = 'Masukkan nomor WhatsApp yang valid (minimal 9 digit).';
      missingLabels.push('Nomor WhatsApp');
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    missingLabels,
  };
}

/**
 * Menyusun teks pesan WhatsApp terstruktur sesuai format resmi DEKOR BALAP.
 */
export function buildWhatsAppMessage(data) {
  const pkg = getPackageDetails(data.paketDekorasi);
  const paketName = pkg ? pkg.name : data.paketDekorasi || '-';
  const hargaPaket = pkg ? pkg.formattedPrice : 'Rp0';
  const tanggalFormatted = formatIndonesianDate(data.tanggalAcara);
  const catatanText =
    typeof data.catatan === 'string' && data.catatan.trim() !== ''
      ? data.catatan.trim()
      : '-';

  return [
    'Halo DEKOR BALAP, saya ingin melakukan pemesanan jasa dekorasi.',
    '',
    'Berikut detail pemesanan saya:',
    '',
    '*DATA PELANGGAN*',
    `Nama: ${data.nama.trim()}`,
    `Nomor WhatsApp: ${data.whatsapp.trim()}`,
    '',
    '*DETAIL DEKORASI*',
    `Jenis Dekorasi: ${data.jenisDekorasi.trim()}`,
    `Paket: ${paketName}`,
    `Harga: ${hargaPaket}`,
    '',
    '*JADWAL ACARA*',
    `Tanggal: ${tanggalFormatted}`,
    `Waktu: ${data.waktuAcara.trim()}`,
    '',
    '*LOKASI PEMASANGAN*',
    `Provinsi: ${data.provinsi.trim()}`,
    `Kabupaten/Kota: ${data.kabupaten.trim()}`,
    `Kecamatan: ${data.kecamatan.trim()}`,
    `Desa/Kelurahan: ${data.desa.trim()}`,
    `Alamat Lengkap: ${data.alamat.trim()}`,
    '',
    '*CATATAN TAMBAHAN*',
    catatanText,
    '',
    'Mohon informasi lebih lanjut mengenai ketersediaan jadwal dan proses pemesanan.',
    '',
    'Terima kasih.',
  ].join('\n');
}

/**
 * Menghasilkan URL WhatsApp Click to Chat dengan encodeURIComponent().
 */
export function buildWhatsAppUrl(data, adminNumber = ADMIN_WHATSAPP_NUMBER) {
  const cleanNumber = String(adminNumber).replace(/\D/g, '');
  const message = buildWhatsAppMessage(data);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/* =========================================================
   INISIALISASI DOM (BROWSER)
   ========================================================= */
function initBookingApp() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  // Elemen menu hamburger (tampilan HP)
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
      hamburgerBtn.setAttribute('aria-expanded', String(!isExpanded));
      mobileMenu.hidden = isExpanded;
    });

    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.hidden = true;
      });
    });
  }

  // Elemen kontrol formulir
  const fieldIds = {
    nama: 'namaPelanggan',
    whatsapp: 'nomorWhatsapp',
    provinsi: 'provinsi',
    kabupaten: 'kabupatenKota',
    kecamatan: 'kecamatan',
    desa: 'desaKelurahan',
    alamat: 'alamatLengkap',
    jenisDekorasi: 'jenisDekorasi',
    paketDekorasi: 'paketDekorasi',
    tanggalAcara: 'tanggalAcara',
    waktuAcara: 'waktuAcara',
    catatan: 'catatanTambahan',
  };

  const elements = {};
  for (const [key, id] of Object.entries(fieldIds)) {
    elements[key] = document.getElementById(id);
  }

  const hargaInput = document.getElementById('hargaPaket');
  const summaryDekorasi = document.getElementById('summaryDekorasi');
  const summaryPaket = document.getElementById('summaryPaket');
  const summaryHarga = document.getElementById('summaryHarga');
  const formAlert = document.getElementById('formAlert');
  const formAlertText = document.getElementById('formAlertText');
  const waReadyBox = document.getElementById('waReadyBox');
  const waFallbackLink = document.getElementById('waFallbackLink');

  function getFormData() {
    return {
      nama: elements.nama ? elements.nama.value : '',
      whatsapp: elements.whatsapp ? elements.whatsapp.value : '',
      provinsi: elements.provinsi ? elements.provinsi.value : '',
      kabupaten: elements.kabupaten ? elements.kabupaten.value : '',
      kecamatan: elements.kecamatan ? elements.kecamatan.value : '',
      desa: elements.desa ? elements.desa.value : '',
      alamat: elements.alamat ? elements.alamat.value : '',
      jenisDekorasi: elements.jenisDekorasi ? elements.jenisDekorasi.value : '',
      paketDekorasi: elements.paketDekorasi ? elements.paketDekorasi.value : '',
      tanggalAcara: elements.tanggalAcara ? elements.tanggalAcara.value : '',
      waktuAcara: elements.waktuAcara ? elements.waktuAcara.value : '',
      catatan: elements.catatan ? elements.catatan.value : '',
    };
  }

  function updateSummaryAndPrice() {
    const jenis = elements.jenisDekorasi ? elements.jenisDekorasi.value : '';
    const paketKey = elements.paketDekorasi ? elements.paketDekorasi.value : '';
    const pkg = getPackageDetails(paketKey);

    if (elements.jenisDekorasi) {
      elements.jenisDekorasi.classList.toggle('is-placeholder', !jenis);
    }
    if (elements.paketDekorasi) {
      elements.paketDekorasi.classList.toggle('is-placeholder', !paketKey);
    }

    // Update kolom Harga Paket (Otomatis)
    const priceText = pkg ? pkg.formattedPrice : 'Rp0';
    if (hargaInput) {
      hargaInput.value = priceText;
    }

    // Update Card Ringkasan Pilihan
    if (summaryDekorasi) {
      summaryDekorasi.textContent = jenis || 'Belum dipilih';
      summaryDekorasi.classList.toggle('is-empty', !jenis);
    }

    if (summaryPaket) {
      summaryPaket.textContent = pkg ? pkg.name : 'Belum dipilih';
      summaryPaket.classList.toggle('is-empty', !pkg);
    }

    if (summaryHarga) {
      summaryHarga.textContent = priceText;
    }
  }

  function clearFieldError(key) {
    const el = elements[key];
    if (!el) return;
    const group = el.closest('.field-group');
    if (group) {
      group.classList.remove('has-error');
      const errorEl = group.querySelector('.field-error-text');
      if (errorEl) {
        errorEl.textContent = '';
      }
    }
    el.removeAttribute('aria-invalid');
  }

  function setFieldError(key, message) {
    const el = elements[key];
    if (!el) return;
    const group = el.closest('.field-group');
    if (group) {
      group.classList.add('has-error');
      const errorEl = group.querySelector('.field-error-text');
      if (errorEl) {
        errorEl.textContent = message;
      }
    }
    el.setAttribute('aria-invalid', 'true');
  }

  // Pasang listener untuk pembaruan real-time & pembersihan error
  for (const [key, el] of Object.entries(elements)) {
    if (!el) continue;
    const eventName = el.tagName === 'SELECT' || el.type === 'date' ? 'change' : 'input';
    el.addEventListener(eventName, () => {
      clearFieldError(key);
      if (formAlert) {
        formAlert.hidden = true;
      }
      if (waReadyBox) {
        waReadyBox.hidden = true;
      }
      if (key === 'jenisDekorasi' || key === 'paketDekorasi') {
        updateSummaryAndPrice();
      }
    });
  }

  // Inisialisasi tampilan awal
  updateSummaryAndPrice();

  // Handler submit formulir -> validasi -> kirim WhatsApp
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Bersihkan error sebelumnya
    for (const key of Object.keys(elements)) {
      clearFieldError(key);
    }

    const data = getFormData();
    const validation = validateBookingForm(data);

    if (!validation.isValid) {
      if (waReadyBox) {
        waReadyBox.hidden = true;
      }

      let firstErrorElement = null;
      for (const [key, message] of Object.entries(validation.errors)) {
        setFieldError(key, message);
        if (!firstErrorElement && elements[key]) {
          firstErrorElement = elements[key];
        }
      }

      if (formAlert && formAlertText) {
        formAlertText.textContent = `Mohon lengkapi ${validation.missingLabels.length} kolom wajib yang masih kosong atau belum valid: ${validation.missingLabels.slice(0, 3).join(', ')}${validation.missingLabels.length > 3 ? ', dan lainnya' : ''}.`;
        formAlert.hidden = false;
      }

      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorElement.focus({ preventScroll: true });
      }
      return;
    }

    // Semua data lengkap -> sembunyikan alert, buat URL WhatsApp
    if (formAlert) {
      formAlert.hidden = true;
    }

    const whatsappUrl = buildWhatsAppUrl(data);

    if (waFallbackLink) {
      waFallbackLink.setAttribute('href', whatsappUrl);
    }
    if (waReadyBox) {
      waReadyBox.hidden = false;
    }

    // Buka WhatsApp Click to Chat melalui anchor element
    if (waFallbackLink) {
      waFallbackLink.click();
    }
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBookingApp);
  } else {
    initBookingApp();
  }
}
