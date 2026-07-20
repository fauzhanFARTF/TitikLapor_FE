# Panduan Deploy Titik Lapor (End-to-End)

Runbook lengkap dari nol sampai aplikasi live, mencakup **kedua repositori**:

- `TitikLapor_BE` — Django + DRF + PostGIS
- `TitikLapor_FE` — Vue 3 + Vite

Tersedia dua jalur. Pilih salah satu:

| | Jalur A — PaaS (gratis/murah) | Jalur B — VPS sendiri |
|---|---|---|
| Database | Supabase (Postgres + PostGIS) | PostgreSQL + PostGIS lokal |
| Backend | Hugging Face Spaces (Docker) | Gunicorn + systemd |
| Frontend | Vercel | Nginx (static) |
| Media | Supabase Storage | Filesystem `/var/www/.../media` |
| TLS | Otomatis | Certbot / Let's Encrypt |
| Cocok untuk | Demo, portofolio, MVP | Instansi, data internal |

---

# Jalur A — Supabase + Hugging Face Spaces + Vercel

## Fase 1 — Database (Supabase)

1. Buat project baru di [supabase.com](https://supabase.com) — pilih region
   terdekat, mis. Singapore.
2. **Database → Extensions** → aktifkan **`postgis`**.
3. **Settings → Database → Connection string → Session pooler.**
   Gunakan **port 5432 (Session pooler)**, *bukan* 6543 (Transaction pooler) —
   Django memakai koneksi persisten dan prepared statement yang tidak didukung
   mode transaksi.

Catat: host, port, database, user, password.

## Fase 2 — Penyimpanan Media (Supabase Storage)

Filesystem Hugging Face Spaces bersifat ephemeral; foto laporan akan hilang
setiap container restart. Karena itu media disimpan di object storage.

1. **Storage → New bucket** → nama `titiklapor-media`, centang **Public**.
2. **Storage → S3 Connection** → **New access key**. Catat access key, secret
   key, endpoint, dan region.

## Fase 3 — Deploy Backend

1. Buat Space baru di [huggingface.co/new-space](https://huggingface.co/new-space):
   - SDK: **Docker** (Blank)
   - Visibility: Public atau Private
2. Push kode:

   ```bash
   cd TitikLapor_BE
   git remote add hf https://huggingface.co/spaces/<user>/<nama-space>
   git push hf main
   ```

3. **Settings → Variables and secrets**, isi:

   ```bash
   DJANGO_ENV=production
   SECRET_KEY=<acak-minimal-50-karakter>
   HOSTS=<user>-<nama-space>.hf.space
   CSRF_TRUSTED_ORIGINS=https://<user>-<nama-space>.hf.space,https://<app>.vercel.app
   CORS_ORIGINS=https://<app>.vercel.app

   DB_NAME=postgres
   DB_USER=postgres.<ref-project>
   DB_PASSWORD=<password-supabase>
   DB_HOST=aws-0-<region>.pooler.supabase.com
   DB_PORT=5432
   DB_SSLMODE=require

   USE_SUPABASE_STORAGE=True
   SUPABASE_STORAGE_BUCKET=titiklapor-media
   SUPABASE_S3_ENDPOINT=https://<ref>.supabase.co/storage/v1/s3
   SUPABASE_S3_PUBLIC_HOST=<ref>.supabase.co
   SUPABASE_S3_REGION=ap-southeast-1
   SUPABASE_S3_ACCESS_KEY=<access-key>
   SUPABASE_S3_SECRET_KEY=<secret-key>

   SECURE_SSL_REDIRECT=True
   CSP_EXTRA_IMG_SRC=https://<ref>.supabase.co
   ```

   > `SECRET_KEY` acak: `python -c "import secrets;print(secrets.token_urlsafe(64))"`

4. Tunggu build selesai, lalu uji:

   ```bash
   curl https://<user>-<nama-space>.hf.space/api/v1/health/
   ```

   Migrasi dan `collectstatic` berjalan otomatis saat container start.

5. Buat akun administrator. Dari mesin lokal, arahkan `.env` ke Supabase lalu:

   ```bash
   DJANGO_ENV=production python manage.py createsuperuser
   DJANGO_ENV=production python manage.py seed_demo   # opsional: data contoh
   ```

## Fase 4 — Deploy Frontend

1. Sesuaikan domain API pada kebijakan keamanan:

   ```bash
   cd TitikLapor_FE
   # sunting security-headers.js → HOST_API
   #   'https://<user>-<nama-space>.hf.space',
   #   'https://<ref>.supabase.co',
   npm run gen:headers
   git add security-headers.js vercel.json deploy/nginx/security-headers.conf
   git commit -m "chore: arahkan CSP ke domain API produksi"
   ```

   **Langkah ini tidak boleh dilewati.** CSP menutup `connect-src` ke selain
   `'self'`; tanpa penyesuaian ini seluruh panggilan API akan diblokir browser.

2. Deploy:

   ```bash
   npm i -g vercel
   vercel link
   vercel --prod
   ```

3. **Vercel → Settings → Environment Variables:**

   ```
   VITE_API_BASE_URL = https://<user>-<nama-space>.hf.space/api/v1
   VITE_APP_NAME     = Titik Lapor
   ```

   Lalu redeploy agar variabel terbaca (Vite menanamkannya saat build).

4. Kembali ke HF Spaces, pastikan domain Vercel sudah tercantum di
   `CORS_ORIGINS` dan `CSRF_TRUSTED_ORIGINS`.

## Fase 5 — Verifikasi

```bash
./scripts/cek-headers.sh https://<app>.vercel.app
curl -sI https://<user>-<nama-space>.hf.space/api/v1/health/ | grep -i 'content-security\|strict-transport'
```

Uji manual: daftar akun warga → kirim laporan bersama foto → masuk sebagai
petugas → verifikasi → proses → selesaikan → lacak nomor tiket dari jendela
penyamaran (incognito).

---

# Jalur B — VPS (Ubuntu 24.04)

Asumsi: domain `titiklapor.example.id` sudah mengarah ke IP server.

## Fase 1 — Paket dasar

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx git rsync python3-venv python3-dev build-essential \
                    postgresql postgresql-17-postgis-3 \
                    gdal-bin libgdal-dev libgeos-dev libproj-dev redis-server

curl -4 -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

> Jangan `apt install npm` — paket itu kerap bentrok dengan Node dari
> NodeSource.

## Fase 2 — Database

```bash
sudo -u postgres psql <<'SQL'
CREATE USER titiklapor WITH PASSWORD 'ganti-password-kuat';
CREATE DATABASE titiklapor OWNER titiklapor;
\c titiklapor
CREATE EXTENSION IF NOT EXISTS postgis;
SQL
```

## Fase 3 — Backend

```bash
sudo mkdir -p /var/www/titiklapor && sudo chown $USER /var/www/titiklapor
cd /var/www/titiklapor
git clone <url-repo-be> backend && cd backend

python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements/production.txt

cp .env.example .env    # isi DB_*, SECRET_KEY, HOSTS, CSRF_TRUSTED_ORIGINS

export DJANGO_ENV=production
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

Layanan systemd — `/etc/systemd/system/titiklapor.service`:

```ini
[Unit]
Description=Titik Lapor API (Gunicorn)
After=network.target postgresql.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/titiklapor/backend
Environment="DJANGO_ENV=production"
ExecStart=/var/www/titiklapor/backend/.venv/bin/gunicorn \
    config.wsgi:application \
    --bind 127.0.0.1:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - --error-logfile -
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo chown -R www-data:www-data /var/www/titiklapor
sudo systemctl daemon-reload
sudo systemctl enable --now titiklapor
sudo systemctl status titiklapor
```

## Fase 4 — Frontend

Frontend dan API akan berbagi domain lewat proxy Nginx, jadi CORS tidak
diperlukan. Kosongkan `HOST_API` di `security-headers.js` sebelum build.

Dari mesin pengembangan:

```bash
cd TitikLapor_FE
echo 'VITE_API_BASE_URL=/api/v1' > .env.production
npm run build
rsync -av --delete dist/ user@server:/var/www/titiklapor/dist/
```

## Fase 5 — Nginx & TLS

```bash
sudo cp deploy/nginx/security-headers.conf /etc/nginx/snippets/titiklapor-security.conf
sudo cp deploy/nginx/titiklapor.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/titiklapor.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t && sudo systemctl reload nginx

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d titiklapor.example.id
```

Certbot menambahkan blok 443 dan redirect dari 80 secara otomatis.

## Fase 6 — Firewall & verifikasi

```bash
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable

curl -sI https://titiklapor.example.id | grep -i 'strict-transport\|content-security'
curl -s https://titiklapor.example.id/api/v1/health/
```

---

# Pembaruan Rutin

**Backend:**

```bash
cd /var/www/titiklapor/backend
git pull origin main
source .venv/bin/activate
pip install -r requirements/production.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart titiklapor
```

**Frontend:**

```bash
cd TitikLapor_FE && git pull origin main
npm ci && npm run build
rsync -av --delete dist/ user@server:/var/www/titiklapor/dist/
```

Pada Jalur A cukup `git push` — HF Spaces dan Vercel membangun ulang sendiri.

---

# Pemecahan Masalah

| Gejala | Penyebab umum | Tindakan |
|---|---|---|
| Permintaan API diblokir, konsol menyebut CSP | `HOST_API` di `security-headers.js` belum diarahkan ke domain API | Sunting berkas itu → `npm run gen:headers` → deploy ulang |
| `CORS policy: No 'Access-Control-Allow-Origin'` | Domain frontend belum terdaftar di backend | Tambahkan ke `CORS_ORIGINS`, restart backend |
| `403 CSRF verification failed` di halaman admin | Skema/host belum cocok | Isi `CSRF_TRUSTED_ORIGINS` dengan `https://domain` lengkap |
| Header HSTS tidak muncul | Django mengira koneksi HTTP | Pastikan Nginx mengirim `X-Forwarded-Proto $scheme` dan `SECURE_SSL_REDIRECT=True` |
| `django.contrib.gis.gdal.error.GDALException` | Library geospasial tak ditemukan | Set `GDAL_LIBRARY_PATH` & `GEOS_LIBRARY_PATH` di `.env` |
| `relation "spatial_ref_sys" does not exist` | Ekstensi PostGIS belum aktif | `CREATE EXTENSION postgis;` pada database aplikasi |
| Foto laporan hilang setelah restart | Media tersimpan di filesystem ephemeral | Aktifkan `USE_SUPABASE_STORAGE=True` |
| Peta kosong padahal data ada | Tile diblokir CSP | Pastikan `HOST_TILE` memuat penyedia tile yang dipakai |
| Refresh halaman `/app/...` menghasilkan 404 | SPA rewrite belum aktif | Vercel: cek `vercel.json`; Nginx: cek `try_files ... /index.html` |

---

# Daftar Periksa Sebelum Rilis

- [ ] `SECRET_KEY` produksi acak dan tidak pernah masuk ke Git
- [ ] `DEBUG=False` (otomatis pada `DJANGO_ENV=production`)
- [ ] `HOSTS` berisi domain sebenarnya, bukan `*`
- [ ] `DB_SSLMODE=require` untuk database terkelola
- [ ] `HOST_API` di `security-headers.js` sudah diarahkan & di-commit
- [ ] `./scripts/cek-headers.sh <url>` lulus seluruhnya
- [ ] `pytest` (backend) dan `npm test` (frontend) hijau
- [ ] `npm audit` bersih
- [ ] Akun demo dinonaktifkan atau kata sandinya diganti
- [ ] Backup database terjadwal
