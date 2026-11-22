import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADMIN_WHATSAPP_NUMBER,
  DECORATION_TYPES,
  PACKAGES,
  getPackageDetails,
  formatRupiah,
  formatIndonesianDate,
  validateBookingForm,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
} from '../script.js';

const validSampleData = {
  nama: 'Budi Santoso',
  whatsapp: '081234567890',
  provinsi: 'Nusa Tenggara Timur',
  kabupaten: 'Kabupaten Sikka',
  kecamatan: 'Alok',
  desa: 'Kota Uneng',
  alamat: 'Jl. Soekarno Hatta No. 12, dekat Aula Paroki',
  jenisDekorasi: 'Dekorasi Pernikahan',
  paketDekorasi: 'standard',
  tanggalAcara: '2026-12-20',
  waktuAcara: '09:00 WIB / Pagi',
  catatan: 'Banner nama Budi & Sinta, dominan merah putih',
};

test('decoration types and package pricing match specification', () => {
  assert.equal(DECORATION_TYPES.length, 5);
  assert.equal(DECORATION_TYPES.includes('Dekorasi Komuni Suci'), false);
  assert.equal(getPackageDetails('basic')?.formattedPrice, 'Rp1.500.000');
  assert.equal(getPackageDetails('standard')?.formattedPrice, 'Rp2.500.000');
  assert.equal(getPackageDetails('premium')?.formattedPrice, 'Rp4.000.000');
  assert.equal(getPackageDetails('unknown'), null);
  assert.equal(PACKAGES.basic.price, 1500000);
  assert.equal(PACKAGES.standard.price, 2500000);
  assert.equal(PACKAGES.premium.price, 4000000);
});

test('formatRupiah and formatIndonesianDate format accurately', () => {
  assert.equal(formatRupiah(0), 'Rp0');
  assert.equal(formatRupiah(1500000), 'Rp1.500.000');
  assert.equal(formatIndonesianDate('2026-12-20'), '20 Desember 2026');
  assert.equal(formatIndonesianDate(''), '-');
});

test('validateBookingForm catches missing required fields and short phone numbers', () => {
  const emptyResult = validateBookingForm({});
  assert.equal(emptyResult.isValid, false);
  assert.equal(emptyResult.missingLabels.length, 11);

  const shortPhoneResult = validateBookingForm({
    ...validSampleData,
    whatsapp: '0812',
  });
  assert.equal(shortPhoneResult.isValid, false);
  assert.ok(shortPhoneResult.errors.whatsapp);

  const validWithoutNote = validateBookingForm({
    ...validSampleData,
    catatan: '',
  });
  assert.equal(validWithoutNote.isValid, true);
});

test('buildWhatsAppMessage and buildWhatsAppUrl format complete WhatsApp message and encodeURIComponent URL', () => {
  const msg = buildWhatsAppMessage(validSampleData);
  assert.match(msg, /Halo DEKOR BALAP, saya ingin melakukan pemesanan jasa dekorasi\./);
  assert.match(msg, /\*DATA PELANGGAN\*\nNama: Budi Santoso\nNomor WhatsApp: 081234567890/);
  assert.match(msg, /\*DETAIL DEKORASI\*\nJenis Dekorasi: Dekorasi Pernikahan\nPaket: Paket Standard\nHarga: Rp2\.500\.000/);
  assert.match(msg, /\*JADWAL ACARA\*\nTanggal: 20 Desember 2026\nWaktu: 09:00 WIB \/ Pagi/);
  assert.match(msg, /\*LOKASI PEMASANGAN\*\nProvinsi: Nusa Tenggara Timur\nKabupaten\/Kota: Kabupaten Sikka\nKecamatan: Alok\nDesa\/Kelurahan: Kota Uneng\nAlamat Lengkap: Jl\. Soekarno Hatta No\. 12, dekat Aula Paroki/);
  assert.match(msg, /\*CATATAN TAMBAHAN\*\nBanner nama Budi & Sinta, dominan merah putih/);

  const url = buildWhatsAppUrl(validSampleData);
  assert.ok(url.startsWith(`https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=`));
  assert.equal(decodeURIComponent(url.split('?text=')[1]), msg);
});
