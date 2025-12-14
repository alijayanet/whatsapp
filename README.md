============== info 081947215703 ==================



# WhatsApp-Only

Versi ringan dari Botlokal yang hanya menggunakan fitur WhatsApp tanpa web interface.

## Persyaratan

- Node.js v14+ (direkomendasikan v20+)
- npm atau yarn
- Akses ke GenieACS API
- Akses ke Mikrotik API (opsional)

## Cara Instalasi
```
apt install git curl -y
```
```
git clone https://github.com/alijayanet/whatsapp
```
```
cd whatsapp
```
### 1. Install Dependensi

```bash
npm install
```
```
sudo npm install -g pm2
```
### 2. Konfigurasi Environment Variables

Salin file `.env.example` menjadi `.env` dan sesuaikan:

```bash
mv env-example.txt .env
```

Edit file `.env` dengan pengaturan yang sesuai:
jangan lupa edit juga file settings.json untuk pengaturan lainya

```
# Konfigurasi Server
PORT=4500 (jika sudah dipake ganti)
HOST=localhost

# Konfigurasi Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password

# Konfigurasi GenieACS
GENIEACS_URL=http://192.168.8.xx:7557
GENIEACS_USERNAME=username
GENIEACS_PASSWORD=password

# Konfigurasi Mikrotik
MIKROTIK_HOST=192.168.1.1
MIKROTIK_PORT=8728
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=password

# Konfigurasi WhatsApp
ADMIN_NUMBER=6281234567890
TECHNICIAN_NUMBERS=6281234567890,62876xxxxxxxxxxxx
WHATSAPP_SESSION_PATH=./whatsapp-session
WHATSAPP_KEEP_ALIVE=true
WHATSAPP_RESTART_ON_ERROR=true
```

### 3. Menjalankan Aplikasi

```bash
node app-whatsapp-only.js
```

Scan QR code yang muncul di terminal untuk login WhatsApp. menggunakan wa yang akan jadi BOT
setelah berhasil close dulu dengan control+c
lalu 
```
pm2 start app-whatsapp-only.js
```

### 4. Mengakses Fitur Web Data Pelanggan

Aplikasi ini sekarang dilengkapi dengan antarmuka web untuk manajemen data pelanggan. Untuk mengakses fitur ini:

1. Buka browser dan akses alamat: `http://localhost:3500` (atau port yang telah dikonfigurasi di file `.env`)
2. Gunakan kredensial berikut untuk login:
   - Username: `admin` (atau sesuai konfigurasi di `.env`)
   - Password: `admin` (atau sesuai konfigurasi di `.env`)

Fitur web ini memungkinkan Anda untuk:
- Melihat daftar semua pelanggan
- Menambahkan data pelanggan baru
- Mengedit informasi pelanggan
- Menghapus data pelanggan
- Melihat status registrasi WhatsApp pelanggan (berdasarkan LID)

Data pelanggan disimpan dalam file `data/customers.json` dan mencakup:
- Nama pelanggan
- Nomor WhatsApp
- Username PPPoE
- Status registrasi WhatsApp (LID)

Fitur tambahan:
- Pelanggan dapat melakukan registrasi mandiri melalui WhatsApp dengan perintah `REG [username_pppoe/nomor_hp]` untuk menghubungkan nomor WhatsApp mereka dengan data pelanggan yang sudah ada di sistem.
- Setelah registrasi berhasil, pelanggan dapat menggunakan fitur bot tanpa perlu memasukkan nomor pelanggan lagi.

## Perintah WhatsApp
menggunakan nomer yang di daftarkan sebagai admin di ENV

untuk mendaftarkan nomer admin silahkan kirim pesan setadmin 081321xxxxxx kirim ke 087820851413 untuk di daftarkan ke server

### Perintah untuk Pelanggan
- `menu` - Menampilkan menu bantuan
- `status` - Cek status perangkat
- `refresh` - Refresh data perangkat
- `gantiwifi [nama]` - Ganti nama WiFi
- `gantipass [password]` - Ganti password WiFi
- `reg [username_pppoe/nomor_hp]` - Registrasi nomor WhatsApp dengan akun pelanggan (menghubungkan akun pelanggan dengan nomor WhatsApp yang digunakan)

### Perintah untuk Admin
- Semua perintah pelanggan
- `admin` - Menampilkan menu admin
- `cek [nomor]` - Cek status ONU pelanggan
- `list` - Daftar semua ONU
- `cekall` - Cek status semua ONU
- `editssid [nomor] [ssid]` - Edit SSID pelanggan
- `editpass [nomor] [password]` - Edit password WiFi pelanggan
- `addhotspot [user] [pass] [profile]` - Tambah user hotspot
- `delhotspot [user]` - Hapus user hotspot
- `hotspot` - Lihat user hotspot aktif
- `addpppoe [user] [pass] [profile] [ip]` - Tambah secret PPPoE
- `delpppoe [user]` - Hapus secret PPPoE
- `setprofile [user] [profile]` - Ubah profile PPPoE
- `pppoe` - Lihat koneksi PPPoE aktif
- `offline` - Lihat user PPPoE offline
- `resource` - Info resource router
- `addwan [nomor] [tipe] [mode]` - Tambah konfigurasi WAN
- `addtag [device_id] [nomor]` - Tambahkan nomor pelanggan ke perangkat
- `addpppoe_tag [pppoe_username] [nomor]` - Tambahkan nomor pelanggan berdasarkan PPPoE
### Jangan lupa untuk mengkonfigurasi file .env terlebih dahulu!
### Untuk tetap berjalan saat console di close gunakan pm2

https://t.me/alijayaNetAcs

### SILAHKAN YANG INGIN BERBAGI

![Image](https://github.com/user-attachments/assets/724e5ac2-626e-4f2d-bd1f-1265b70b544f)
