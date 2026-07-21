# Titik Lapor — Frontend

[![CI](https://github.com/fauzhanFARTF/TitikLapor_FE/actions/workflows/ci.yml/badge.svg)](https://github.com/fauzhanFARTF/TitikLapor_FE/actions/workflows/ci.yml)

Antarmuka web platform pelaporan masalah publik berbasis peta. Dibangun dengan
**Vue 3 (Composition API) + Vite + Pinia + Vue Router + Leaflet**, tanpa
kerangka CSS pihak ketiga — seluruh tampilan berdiri di atas design system
sendiri berbasis CSS custom properties.

> Backend-nya ada di repositori terpisah: **TitikLapor_BE** (Django + PostGIS).

---

## Daftar Isi

- [Struktur Project](#struktur-project)
- [Prasyarat](#prasyarat)
- [Menjalankan Secara Lokal](#menjalankan-secara-lokal)
- [Variabel Lingkungan](#variabel-lingkungan)
- [Design System](#design-system)
- [Halaman & Hak Akses](#halaman--hak-akses)
- [Peta & Fitur GIS](#peta--fitur-gis)
- [Header Keamanan](#header-keamanan)
- [Pengujian](#pengujian)
- [Integrasi Berkelanjutan](#integrasi-berkelanjutan)
- [Deployment](#deployment)
- [Alur Kerja Git](#alur-kerja-git)

---

## Struktur Project

```
TitikLapor_FE/
├── index.html                # tanpa aset CDN eksternal (lihat bagian keamanan)
├── security-headers.js       # SUMBER TUNGGAL definisi header keamanan
├── vercel.json               # dihasilkan otomatis dari berkas di atas
├── scripts/
│   ├── gen-headers.js        # generator vercel.json + snippet Nginx
│   └── cek-headers.sh        # verifikasi header pada situs yang sudah live
├── deploy/nginx/
│   ├── titiklapor.conf       # server block lengkap + proxy API
│   └── security-headers.conf # dihasilkan otomatis
├── public/
│   ├── theme-init.js         # menerapkan tema sebelum render (anti-FOUC)
│   ├── favicon.svg  manifest.webmanifest  robots.txt
└── src/
    ├── api/                  # client.js (axios + refresh token), auth, laporan, spatial
    ├── assets/main.css       # design system
    ├── components/
    │   ├── layout/           # AppShell, AppSidebar, AppTopbar
    │   ├── map/              # PetaLaporan, PemilihLokasi
    │   ├── report/           # KartuLaporan, LinimasaStatus
    │   └── ui/               # AppIcon, AppModal, StatusBadge, StatCard, …
    ├── composables/          # useTheme, useGeolocation
    ├── router/               # definisi rute + guard peran
    ├── stores/               # Pinia: auth, laporan, ui
    ├── utils/                # constants, format
    └── views/                # halaman, dikelompokkan per peran
```

---

## Prasyarat

| Kebutuhan | Versi |
|---|---|
| Node.js | 20+ |
| npm | 10+ |
| Backend Titik Lapor | berjalan di `http://localhost:8000` |

---

## Menjalankan Secara Lokal

```bash
git clone <url-repo> TitikLapor_FE && cd TitikLapor_FE
npm install
cp .env.example .env
npm run dev
```

Buka `http://localhost:5173`.

Vite mem-proxy `/api` dan `/media` ke `http://localhost:8000`, sehingga browser
melihat frontend dan API pada origin yang sama — tidak ada preflight CORS saat
pengembangan.

**Akun demo** (jalankan `python manage.py seed_demo` di backend), kata sandi
seragam `TitikLapor123!`: `admin@titiklapor.id`, `petugas@titiklapor.id`,
`warga@titiklapor.id`.

### Perintah yang tersedia

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan + HMR |
| `npm run build` | Regenerasi header lalu build produksi ke `dist/` |
| `npm run preview` | Menjalankan hasil build secara lokal |
| `npm test` | Pengujian Vitest |
| `npm run gen:headers` | Menulis ulang `vercel.json` & snippet Nginx |
| `npm run lint` · `lint:fix` | ESLint (seluruh repo) |
| `npm run format` | Prettier |

---

## Variabel Lingkungan

| Variabel | Default | Keterangan |
|---|---|---|
| `VITE_API_BASE_URL` | kosong | Kosongkan saat development agar proxy Vite dipakai. Di produksi isi dengan `https://api-anda/api/v1` |
| `VITE_APP_NAME` | `Titik Lapor` | Nama yang tampil di sidebar & judul tab |
| `VITE_MAP_CENTER_LAT` / `LNG` | Jakarta Pusat | Titik tengah peta saat pertama dibuka |
| `VITE_MAP_ZOOM` | `13` | Level zoom awal |

---

## Design System

Seluruh gaya berpusat di `src/assets/main.css`, disusun sebagai token CSS.

**Palet.** Brand indigo→violet (`#4338ca` → `#7c3aed`) dengan aksen amber.
Warna status laporan menjadi token tersendiri (`--st-baru`, `--st-selesai`, …)
sehingga badge, penanda peta, dan linimasa selalu sewarna — mengubah satu
variabel akan mengubah ketiganya sekaligus.

**Mode gelap.** Diaktifkan lewat atribut `data-theme` pada elemen `<html>`.
`public/theme-init.js` memasangnya sebelum Vue di-mount agar tidak ada
kedipan putih saat memuat halaman. Basemap Leaflet ikut gelap lewat filter CSS,
jadi tidak perlu berlangganan penyedia tile khusus.

**Tipografi & ikon.** Memakai system font stack dan ikon SVG inline
(`AppIcon.vue`) — tidak ada permintaan ke Google Fonts atau CDN Font Awesome.
Ini bukan sekadar soal kecepatan: tanpa host eksternal, CSP dapat dikunci ke
`'self'` tanpa pengecualian.

**Aksesibilitas.** Skip-link ke konten utama, `:focus-visible` yang jelas pada
seluruh elemen interaktif, label ARIA pada tombol ikon, dan penghormatan
terhadap `prefers-reduced-motion`.

**Responsif.** Sidebar berubah menjadi laci geser di bawah 980 px dan dapat
diciutkan menjadi rel ikon di desktop.

---

## Halaman & Hak Akses

### Publik

| Rute | Halaman |
|---|---|
| `/` | Beranda — penjelasan singkat & jalur masuk |
| `/peta-publik` | Peta laporan terverifikasi, tanpa akun |
| `/lacak/:nomorTiket?` | Pelacakan laporan lewat nomor tiket |
| `/masuk` · `/daftar` | Autentikasi |

### Terautentikasi (`/app`)

| Rute | Halaman | Peran |
|---|---|---|
| `/app` | Dasbor: ringkasan, distribusi kategori, tren 30 hari | semua |
| `/app/peta` | Peta interaktif dengan filter status & kategori | semua |
| `/app/laporan` | Daftar laporan + pencarian & filter | semua |
| `/app/laporan/:id` | Detail: peta, linimasa, tanggapan, aksi status | semua |
| `/app/lapor` | Formulir laporan baru | `WARGA` |
| `/app/antrean` | Antrean kerja instansi | `PETUGAS`, `ADMIN` |
| `/app/analitik` | Peta panas & peringkat wilayah | `PETUGAS`, `ADMIN` |
| `/app/pengguna` · `/app/instansi` · `/app/kategori` | Manajemen master | `ADMIN` |
| `/app/profil` | Profil & ganti kata sandi | semua |

Guard router menahan akses dan menyimpan tujuan asal, sehingga setelah masuk
pengguna langsung diantar ke halaman yang tadi dibuka. Penyaringan menu di
sidebar hanya kenyamanan tampilan — **otorisasi sebenarnya ditegakkan
backend**, dan frontend tidak pernah menjadi satu-satunya penjaga.

---

## Peta & Fitur GIS

`components/map/PetaLaporan.vue` membungkus Leaflet dengan tiga mode tampilan:

| Mode | Kegunaan |
|---|---|
| Kelompok (cluster) | Ribuan titik tetap terbaca pada zoom rendah |
| Penanda | Melihat sebaran apa adanya |
| Peta panas | Menemukan wilayah dengan konsentrasi masalah tertinggi |

Ditambah pengalih basemap (standar/topografi), tombol "ke lokasi saya", dan
legenda status.

`components/map/PemilihLokasi.vue` menyediakan tiga cara menandai lokasi:
deteksi GPS, klik pada peta, dan menggeser penanda — karena GPS sering meleset
di dalam gedung. Setelah lokasi dipilih, aplikasi memanggil endpoint
`spatial/wilayah/reverse/` untuk mengisi kelurahan & kecamatan otomatis, lalu
`laporan/cek-duplikat/` untuk memperingatkan bila sudah ada laporan sejenis di
sekitar titik itu.

Catatan teknis: instance Leaflet disimpan di variabel biasa, **bukan** `ref`.
Objek peta punya struktur melingkar yang mahal bila dibungkus proxy reaktif Vue
dan kerap memicu bug pada plugin Leaflet.

---

## Header Keamanan

Seluruh kebijakan didefinisikan satu kali di **`security-headers.js`**, lalu
`scripts/gen-headers.js` menuliskannya ke `vercel.json` dan
`deploy/nginx/security-headers.conf`. Generator ini terpasang pada `npm run
build`, jadi konfigurasi kedua platform tidak mungkin menyimpang.

| Header | Nilai |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `Content-Security-Policy` | `default-src 'self'`; `script-src 'self'` (tanpa `unsafe-inline`/`unsafe-eval`); host tile & API dibuka eksplisit; `frame-ancestors 'none'`; `upgrade-insecure-requests` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Seluruh sensor dimatikan kecuali `geolocation=(self)` dan `camera=(self)` |

Ditambah `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`, dan
`X-DNS-Prefetch-Control: off`.

**Keputusan desain yang membuat CSP ketat ini mungkin:**

- Tidak ada `<script>` inline di `index.html` — inisialisasi tema dipindah ke
  `/theme-init.js`.
- Tidak ada font atau ikon dari CDN — semuanya lokal.
- `style-src` memang memuat `'unsafe-inline'`, karena Leaflet mengatur posisi
  tile dan penanda lewat atribut `style` pada elemen. Ini keterbatasan
  pustakanya, bukan pilihan kami.

**Sebelum deploy**, sunting `HOST_API` di `security-headers.js` sesuai domain
API Anda, lalu jalankan `npm run gen:headers` dan commit hasilnya. Bila
frontend dan API berbagi domain lewat proxy Nginx, kosongkan array itu dan
`'self'` sudah mencukupi.

**Verifikasi setelah live:**

```bash
./scripts/cek-headers.sh https://titiklapor-anda.vercel.app
```

Skrip ini keluar dengan kode 1 bila ada header wajib yang hilang, sehingga bisa
dipasang sebagai langkah smoke test di pipeline deploy.

---

## Pengujian

```bash
npm test
```

**30 pengujian**, terbagi dua:

- `src/__tests__/security-headers.test.js` — membaca sumber definisi dan hasil
  generatornya, lalu menolak perubahan yang melonggarkan kebijakan (mis.
  menambahkan `'unsafe-eval'`, wildcard `*`, atau sumber `http:` polos).
  Pelanggaran gagal di CI, bukan baru ketahuan saat pemindaian keamanan.
- `src/__tests__/format.test.js` — pemformat jarak, durasi, waktu relatif,
  angka, dan inisial nama.

---

## Integrasi Berkelanjutan

`.github/workflows/ci.yml` berjalan pada setiap push ke `main`/`develop` dan
setiap pull request:

| Job | Isi |
|---|---|
| **Test & Build** | `npm ci` → `npm run lint` → `npm test` (Vitest) → `npm run build`, lalu memastikan konfigurasi header tetap sinkron. Hasil `dist/` diunggah sebagai artifact |
| **Audit dependensi** | `npm audit --audit-level=moderate` |

Langkah paling penting di sana adalah **pemeriksaan sinkronisasi header**.
`npm run build` menjalankan `gen-headers.js`; kalau hasilnya berbeda dari
`vercel.json` yang ada di repo, artinya `security-headers.js` diubah tanpa
meregenerasi konfigurasi — dan situs live akan tetap memakai kebijakan lama
tanpa ada yang menyadarinya. CI menggagalkan build dalam kondisi itu.

Ambang audit ditetapkan di `moderate`, bukan `low`. Kerentanan `low` pada
dependensi build jarang dapat dieksploitasi dari situs statis, dan
menggagalkan CI karenanya justru membuat orang terbiasa mengabaikan hasil
audit.

---

## Deployment

### Opsi A — Vercel (rekomendasi)

```bash
npm i -g vercel
vercel link
vercel --prod
```

`vercel.json` sudah memuat SPA rewrite, seluruh header keamanan, dan aturan
cache (aset ber-hash `immutable` selama setahun; `index.html` tidak di-cache).

Environment variable di dashboard Vercel:

```
VITE_API_BASE_URL = https://api-anda.example.id/api/v1
VITE_APP_NAME     = Titik Lapor
```

Jangan lupa menambahkan domain Vercel ke `CORS_ORIGINS` dan
`CSRF_TRUSTED_ORIGINS` di backend.

### Opsi B — VPS + Nginx

```bash
npm run build
rsync -av --delete dist/ user@server:/var/www/titiklapor/dist/

# di server, sekali saja:
sudo cp deploy/nginx/security-headers.conf /etc/nginx/snippets/titiklapor-security.conf
sudo cp deploy/nginx/titiklapor.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/titiklapor.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d titiklapor.example.id
```

Server block itu sekaligus mem-proxy `/api/` ke Gunicorn, sehingga frontend dan
API satu origin — CORS tidak diperlukan sama sekali.

Runbook lengkap end-to-end ada di **`docs/DEPLOYMENT.md`**.

---

## Alur Kerja Git

Mengikuti **Git Flow** yang disederhanakan:

```
main      ← rilis produksi
 └ develop    ← integrasi
    ├ feature/fe-<halaman|modul>
    ├ fix/<ringkas>
    └ hotfix/<ringkas>
```

```bash
# 1. Cabang fitur dari develop
git switch develop && git pull
git switch -c feature/fe-notifikasi
# … kerjakan, commit bertahap …

# 2. Gabungkan ke develop (masih boleh lokal — develop tidak diproteksi)
git switch develop && git merge --no-ff feature/fe-notifikasi
git push origin develop

# 3. Rilis ke main WAJIB lewat pull request
gh pr create --base main --head develop --fill
gh pr checks --watch          # tunggu CI hijau
gh pr merge --merge           # baru bisa di-merge setelah semua cek lulus

# 4. Samakan develop dengan main
git switch develop && git merge --ff-only main && git push origin develop
```

### Proteksi Branch `main`

`main` diproteksi, jadi `git push origin main` akan **ditolak**. Aturannya:

| Aturan | Nilai |
|---|---|
| Cek CI wajib lulus | `Test & Build`, `Audit dependensi` |
| Branch harus mutakhir sebelum merge | Ya |
| Force-push & hapus branch | Dilarang untuk semua |
| Berlaku untuk admin | **Tidak** — pemilik repo tetap bisa menembus bila mendesak |

Review wajib **tidak** diaktifkan dengan sengaja: GitHub melarang menyetujui
pull request sendiri, sehingga pada repositori satu orang aturan itu akan
mengunci merge selamanya.

Jalan darurat (pakai seperlunya, dan sebutkan alasannya di pesan commit):

```bash
gh api -X DELETE repos/<user>/<repo>/branches/main/protection   # matikan
# … perbaiki …
gh api -X PUT  repos/<user>/<repo>/branches/main/protection --input proteksi.json
```

### Konvensi Pesan Commit

`<tipe>(<cakupan>): <ringkasan bahasa Indonesia, huruf kecil>`

Tipe: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `build`, `style`.

Contoh dari riwayat repositori ini:

```
feat(ui): tambah design system Titik Lapor
feat(map): tambah komponen peta Leaflet & pemilih lokasi
feat(keamanan): pasang enam header keamanan HTTP di frontend
build: naikkan vite ke ^6.4.3 & vitest ke ^4 (npm audit bersih)
```

Satu commit = satu gagasan utuh, dan badan commit menjelaskan **alasan**
perubahan, bukan mengulang daftar berkas yang sudah terlihat di diff.

---

## Lisensi

MIT.
