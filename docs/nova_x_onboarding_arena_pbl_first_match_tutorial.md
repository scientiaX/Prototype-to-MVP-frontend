# NovaX – Onboarding Arena PBL (First Match Tutorial)

Dokumen ini adalah **spesifikasi eksekusi** untuk onboarding NovaX berbasis **arena PBL singkat (3–5 menit)**. Tujuannya: memberi *taste* NovaX di menit pertama, **sangat ringan**, **nagih**, dan **memberi insight kecil yang terasa relevan**, tanpa terasa seperti tes atau latihan.

Dokumen ini siap dilempar ke tim eksekusi (product/AI/UX). Bahasa non-teknis dijaga, **detail teknis ditambahkan seperlunya**.

---

## Tujuan Utama

1. User **langsung merasakan** cara belajar NovaX (experience > explanation)
2. User merasa:
   - “klik”
   - “wah, ini beda”
   - “ini ringan tapi kepake”
3. Sistem mendapatkan **kalibrasi awal** (entry point, level, archetype) **tanpa kuesioner berat**

> Onboarding ini adalah **first match tutorial**, bukan assessment.

---

## Prinsip Desain (Non-Negotiable)

- **Tidak ada tes eksplisit**
- **Tidak ada skor besar / label kemampuan**
- **Tidak ada latihan formal**
- **Tidak ada ceramah AI**
- **Insight kecil boleh muncul, tapi terbatas & implisit**

---

## Alur Tingkat Tinggi

1. Input minimum (umur + bidang)
2. Masuk **Arena Onboarding** (bukan Arena Harian)
3. PBL mikro berbasis bidang (AI-assisted, non-statis)
4. Insight mikro + dopamine loop ringan
5. Kalibrasi diam-diam → Level & Archetype awal
6. Bridge ke Arena 5 Menit (Quick)

---

## Step 0 — Input Minimum (≤20 detik)

### Input yang dikumpulkan:
- **Umur (range)**
- **Bidang / domain kasar** (Tech / Business / Finance / dll)

### Catatan teknis:
- Umur → difficulty ceiling awal
- Bidang → memilih **problem pool**

### Framing UX:
> “Supaya tantangan pertamamu nyambung.”

---

## Step 1 — Masuk Arena Onboarding

### Karakteristik arena onboarding:
- Mirip Arena 5 Menit (Quick)
- **Lebih ringan** (1–2 keputusan)
- Tidak masuk streak
- Tidak masuk leaderboard

### Teknis:
- Arena type = `onboarding_arena`
- Problem source = `curated_problem_pool[domain]`

---

## Step 2 — Problem Mikro (Domain-Based)

### Ciri masalah:
- Tidak perlu pengetahuan spesifik
- Bisa dipahami ≤20 detik
- Relevan secara universal
- Bukan problem statis (AI menyesuaikan wording & konteks)

### Contoh (Business):
> “Sebuah ide sederhana terlihat menarik, tapi waktumu terbatas. Minggu ini, langkah mana yang paling masuk akal?”

Pilihan (3 opsi):
- Validasi cepat ke target user
- Bangun versi kecil
- Cari partner dulu

### Teknis:
- Pilihan disimpan sebagai vector keputusan (risk, speed, info_gain)

---

## Step 3 — Decision & Consequence Mikro

### Alur:
1. User memilih
2. Sistem merespons singkat (1–2 kalimat)

### Contoh respon:
> “Langkah ini cepat, tapi berisiko memberi sinyal yang belum cukup kuat.”

### Teknis:
- Tidak ada penilaian benar/salah
- Consequence diambil dari `consequence_templates`

---

## Step 4 — Decision Loop Kedua (Opsional)

- Hanya jika waktu masih tersedia
- Masalah lanjutan **lebih kecil**

Tujuan:
- Mendapat sinyal tambahan (consistency / adaptivity)

---

## Step 5 — Insight Mikro (Kombinasi Knowledge + Experience)

Ini bagian krusial untuk efek “ohh…”

### Prinsip insight:
- Pendek (1–2 kalimat)
- Tidak generik
- Terkait langsung dengan aksi user

### Contoh insight:
- “Banyak orang mengira X efektif, tapi sering lupa bahwa tanpa Y, hasilnya misleading.”
- “Pilihanmu barusan sering dipakai saat orang ingin bergerak cepat tanpa komitmen besar.”

### Teknis:
- Insight di-generate dari `decision_pattern → insight_map`

---

## Step 6 — Dopamine Loop Ringan

### Elemen:
- XP kecil (+)
- Progress bar tipis bergerak
- Teks netral:
  > “Arena singkat selesai.”

Tidak ada:
- level up besar
- badge
- celebratory animation

---

## Step 7 — Kalibrasi Diam-Diam (Backend)

### Yang dikalibrasi:
- Entry level masalah
- Decision archetype awal
- Risk tolerance
- Speed vs depth bias

### Teknis:
- Archetype disimpan sebagai **prior**, bukan label final
- Bisa berubah seiring sesi

---

## Step 8 — Bridge ke Arena Harian

### Copy transisi:
> “Arena 5 menit siap. Masuk kapan saja.”

### UX:
- Satu tombol
- Tidak ada dorongan emosional

---

## Hal yang Sengaja TIDAK Ada

- Penjelasan teori
- Label kepribadian
- Summary panjang
- Motivational quotes
- Paksaan lanjut

---

## Efek yang Diharapkan

User berpikir:
- “Tadi yang gue lakuin itu ternyata X ya…”
- “Pantes aja sebelumnya gue salah…”
- “Oh, ternyata kalau ada Y, X jadi misleading…”

Ini **tercerahkan sedikit**, bukan terceramahi.

---

## Perbedaan dengan Arena 10 Menit

| Arena Onboarding | Arena Harian (Quick) |
|-----------------|--------------|
| 3–5 menit | 4–5 menit |
| 1–2 keputusan | 1–4 keputusan |
| Demo rasa | Ritual harian |
| Kalibrasi awal | Progress nyata |

---

## Kalimat Pengunci

> **Onboarding NovaX bukan menjelaskan sistem.
Ia membuat user berkata: “oh, ini caranya.”**

