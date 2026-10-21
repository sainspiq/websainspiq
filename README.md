# websainspiq — Website Sainspiq

Situs statis (HTML murni, tanpa framework/build system) untuk **Sainspiq**,
lembaga les privat dengan guru datang ke rumah & online.
Domain produksi: **https://sainspiq.com**

Dokumen ini adalah catatan perawatan situs: cara membangun CSS, peta folder,
dan konvensi yang harus diikuti agar struktur tidak kembali berantakan.
Latar belakang lengkap ada di laporan audit restruktur (Fase 1, Oktober 2026).

## Cara build CSS

- `styles.css` (di root) adalah **hasil compile Tailwind CSS v4.3.2** — jangan
  diedit manual, perubahan akan tertimpa saat compile berikutnya.
- File sumbernya adalah `input.css` (Tailwind v4: `@import "tailwindcss"`,
  blok `@theme` berisi warna brand — primary `#0F172A`, secondary `#2563EB`,
  accent `#F97316`, font Poppins).
- Untuk memperbarui CSS, compile `input.css` dengan Tailwind CSS CLI v4
  (output menimpa `styles.css`), lalu commit **kedua** file bersamaan.
  Saat ini belum ada `package.json` di repo, jadi perintah build dijalankan
  dari instalasi Tailwind CLI v4 di mesin masing-masing.
- Perhatian: hanya sebagian halaman yang memuat `styles.css`; banyak halaman
  masih membawa blok `<style>` inline sendiri. Menambah gaya global di
  `styles.css` **tidak** otomatis berlaku ke semua halaman.
- Hanya ada **satu** `styles.css` yang sah: yang di root. Salinan di
  `area-layanan/` sudah dihapus pada Fase 1 karena isinya mulai berbeda
  (drift) dan tidak dimuat oleh halaman mana pun.

## Peta folder

```text
.
├── *.html                  Halaman root (URL publik, mis. /biaya-les-privat)
├── blog.html  + blog/      Indeks blog + 9 artikel
├── program.html + program/ Indeks program + 6 halaman detail program
├── area-layanan.html
│   + area-layanan/         5 halaman kota (Jakarta Selatan/Timur, Purwokerto,
│                           Semarang, Surabaya)
├── aplikasi/poster/        PWA terpisah (Studio Poster) — lihat catatan di bawah
├── assets/                 Semua aset statis, dikelompokkan per topik:
│   ├── aktivitas/          Foto aktivitas belajar (aktivitas-1 s/d 15)
│   ├── biaya/              Gambar pricelist
│   ├── docs/  faq/  hero/  iklan/
│   ├── logos/              Logo universitas + default.webp (fallback onerror)
│   └── testimoni/          Foto testimoni
├── input.css               Sumber Tailwind v4 (lihat "Cara build CSS")
├── styles.css              Hasil compile Tailwind — satu-satunya CSS bersama
├── meta-tags-template.html Template acuan meta/OG untuk halaman baru
│                           (bukan halaman publik; sudah di-Disallow di robots.txt)
├── .htaccess               Gzip, cache, paksa HTTPS + hapus www (301),
│                           ErrorDocument 404 -> /404.html
├── robots.txt
└── sitemap.xml             33 URL konten — wajib diperbarui setiap ada
                            halaman baru/hilang
```

## Konvensi path aset

- **Gunakan path absolut dari root situs** untuk semua rujukan aset baru:
  `/assets/...`, `/logo.webp`, `/styles.css`.
  Contoh benar: `<img src="/assets/testimoni/testi-pak-dodi.webp">`.
- Jangan memakai path relatif (`assets/...`, `../assets/...`) dari halaman di
  subfolder — path relatif dari `area-layanan/` pernah membuat fallback logo
  teresolusi ke folder yang salah (`area-layanan/assets/...`).
- Gambar baru masuk ke subfolder topik yang sesuai di `assets/`
  (bukan ke root). Logo universitas baru masuk ke `assets/logos/`.
- `assets/logos/default.webp` adalah **file fallback wajib**: dirujuk oleh
  atribut `onerror` pada `<img>` logo universitas. Jangan dihapus/di-rename
  tanpa memperbarui seluruh rujukan `onerror`.
- Karena `.htaccess` meng-cache gambar selama 1 bulan, mengganti isi gambar
  harus disertai **ganti nama file** (versi baru), bukan menimpa nama lama.

## Tabrakan nama file & folder itu disengaja

Pasangan seperti `blog.html` + folder `blog/`, `program.html` + `program/`,
dan `area-layanan.html` + `area-layanan/` **bukan kesalahan dan bukan
duplikat**: file `.html` di root adalah halaman indeks
(`/blog`, `/program`, `/area-layanan`), sedangkan foldernya berisi halaman
isi (`/blog/<artikel>`, `/program/<detail>`, `/area-layanan/<kota>`).
Jangan menggabungkan atau memindahkan salah satunya tanpa rencana redirect
301 — URL-URL itu sudah terindeks dan tersebar.

## aplikasi/poster adalah PWA terpisah

`aplikasi/poster/` adalah **Studio Poster**, aplikasi web progresif (PWA)
mandiri — bukan bagian dari website pemasaran. Ia punya `manifest.webmanifest`
dan service worker `sw.js` sendiri (cache `studio-poster-v1`).
Jangan memindahkan/mengganti nama folder ini sembarangan: service worker
meng-cache path relatif di scope-nya, dan pemindahan tanpa menaikkan versi
cache dapat merusak instalasi pengguna yang sudah memasangnya.

## Aturan main saat mengubah situs

1. Tidak ada file HTML yang memakai include/template — header, footer, dan
   nav **disalin di setiap file**. Mengubah menu/kontak/footer berarti
   memperbarui semua halaman dan memverifikasinya satu per satu.
2. Setiap halaman baru wajib: 1 `<h1>`, `<title>`, meta description,
   canonical (URL bersih tanpa `.html`), blok Open Graph + Twitter Card
   mengikuti pola halaman sejenis, dan URL-nya ditambahkan ke `sitemap.xml`.
3. Memindahkan/mengganti nama file apa pun wajib disertai redirect 301 di
   `.htaccess` pada commit yang sama.
