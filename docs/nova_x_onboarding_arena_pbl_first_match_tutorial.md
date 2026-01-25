# NovaX – Onboarding Arena (Tutorial Instan, Anti‑Friksi)

Dokumen ini adalah **spesifikasi eksekusi** untuk Onboarding Arena NovaX yang:
- **Lebih low-friksi, lebih ringan, lebih instan** dibanding mode Quick 4–5 menit
- Mendorong user **bertindak sebelum berpikir** (gaya Duolingo): tap dulu → lihat akibat → dapat “klik”
- Mengambil sinyal **kalibrasi di belakang layar**
- Memberi user **taste pertama** tentang Arena NovaX lewat “tutorial pembukaan” seperti di game

Onboarding ini **dihitung sebagai arena pertama yang user selesaikan** (Arena Pembukaan).

---

## Tujuan Utama

1. User langsung paham “cara mainnya” tanpa dijelaskan panjang
2. User melakukan aksi pertama dalam ≤30 detik
3. Sistem mendapatkan kalibrasi awal (prior), tanpa kuesioner dan tanpa terasa seperti tes
4. Setelah selesai, user merasa “gue udah menyelesaikan 1 arena”

---

## Prinsip Desain (Non‑Negotiable)

- **Act-first UX**: aksi dulu, refleksi belakangan
- **Tap-based**: 90% input adalah tap/click, bukan mengetik
- **1 layar = 1 aksi**: sekuensial, tidak ramai
- **Auto-advance**: user tidak perlu menekan “Next” berulang
- **Micro-win cepat**: ada momen “selesai” kecil di ≤30 detik
- **No judgement**: tidak ada benar/salah, tidak ada label kemampuan
- **Copy pendek**: kalimat pendek, konkret, dan langsung

---

## Durasi Target

- Target total: **±90–120 detik**
- Batas keras: **≤150 detik**
- Tidak ada pemilihan durasi oleh user

Jika Quick terasa “4–5 menit”, onboarding ini harus terasa seperti:
> “Gue baru klik-klik dikit, tapi udah dapet gambaran.”

---

## Definisi Produk

Onboarding Arena adalah:
- Arena tutorial instan untuk membuka pengalaman Arena NovaX
- Arena pertama yang “completed” di progres user
- Mekanisme kalibrasi prior yang dipakai untuk menyetel pengalaman Arena selanjutnya

Onboarding Arena bukan:
- Tutorial teks panjang
- Tes kemampuan
- Kuesioner profil
- Arena kompetitif (leaderboard)

---

## Alur Tingkat Tinggi

1. Input minimum (umur + domain) — boleh “skip” dengan default
2. Tutorial instan: 1–2 keputusan berbasis tap
3. Konsekuensi mikro → insight mikro
4. Reward netral → unlock Arena harian (Quick/Standard)
5. Selesai: tercatat sebagai **Arena Pembukaan (Arena #1 Completed)**

---

## Step 0 — Input Minimum (≤10–15 detik)

### Input yang dikumpulkan
- Umur (range)
- Domain kasar (Tech / Business / Finance / dll)

### Anti-friksi
- Sediakan default terpilih (user bisa langsung lanjut tanpa memilih)
- Hindari wording “isi data”; framing sebagai “biar tantangan nyambung”

### Framing copy
> “Supaya tantangan pertamamu nyambung.”

---

## Step 1 — Enter Tutorial (0–5 detik)

### UX
- 1 tombol utama: **Mulai Arena Pembukaan**
- Tanpa pilihan mode, tanpa pilihan durasi

### Teknis
- `arena_type = onboarding_arena_tutorial`
- `problem_source = curated_problem_pool[domain]`

---

## Step 2 — Situation Drop (5–20 detik)

### Tujuan
- User paham konteks tanpa diminta mikir panjang

### Format
- 3–5 baris situasi konkret
- 1 objective jelas
- Tidak ada input

### Guardrail
- Tidak boleh ada paragraf panjang
- Tidak boleh ada istilah teori

---

## Step 3 — Forced Choice (20–35 detik)

### Format
- 2–3 kartu pilihan (tap sekali)
- Semua opsi terasa masuk akal
- Tidak ada opsi “aman sempurna”

### Copy gaya Duolingo (contoh)
- Header: “Pilih cepat.”
- Sub: “Tidak ada yang sempurna. Yang penting: commit.”

### Teknis (sinyal)
- Simpan `choice_id`
- Simpan `time_to_first_tap`

---

## Step 4 — Lock (35–45 detik)

### Tujuan
- Micro-win: user merasa “udah melakukan sesuatu”

### UX
- Tombol besar: **KUNCI PILIHAN**
- Setelah lock, auto-advance

### Anti-friksi
- Boleh ganti pilihan sebelum lock (maks 1 kali) tanpa modal/alert

### Teknis (sinyal)
- Simpan `time_to_lock`
- Simpan `change_of_mind_count`

---

## Step 5 — Consequence Reveal (45–65 detik)

### Format
- 1–2 kalimat konsekuensi
- Tidak menghakimi, tapi terasa “kena”

### Contoh
> “Langkah ini cepat, tapi kamu mengorbankan sinyal yang lebih kuat.”

### Teknis
- Consequence dari `consequence_templates`

---

## Step 6 — Optional Second Tap (65–85 detik)

Hanya muncul jika sistem perlu 1 sinyal tambahan **dan** user masih dalam tempo cepat.

### Format
- 1 pertanyaan sangat pendek
- 2 opsi (tap)
- Auto-lock (tanpa step lock kedua)

### Tujuan sinyal
- Consistency
- Ambiguity tolerance
- Externalization vs internalization

---

## Step 7 — Insight Mikro (85–100 detik)

### Prinsip insight
- 1–2 kalimat
- Spesifik ke pilihan user
- Tidak generik, tidak teoritis
- Tidak membeberkan “penilaian kemampuan”

### Teknis
- Insight dari `decision_pattern → insight_map`

---

## Step 8 — Reward & Unlock (100–120 detik)

### Elemen
- XP kecil (+)
- Progress bar tipis
- Copy netral:
  > “Arena pembukaan selesai.”

### Unlock
- Tombol tunggal: **Masuk Arena**
- Copy transisi:
  > “Arena 5 menit siap. Masuk kapan saja.”

---

## Step 9 — Kalibrasi Diam‑Diam (Backend)

### Yang dikalibrasi (prior, bukan label final)
- Entry difficulty seed
- Risk tolerance (proxy)
- Speed vs depth bias (proxy)
- Ambiguity tolerance (proxy)
- Externalization vs internalization (proxy)
- Consistency (jika ada second tap)

### Minimal data yang disimpan
- `domain`, `age_group`, `language`
- `arena_type = onboarding_arena_tutorial`
- `choice_id_1`, `choice_id_2?`
- `time_to_first_tap`, `time_to_lock`, `change_of_mind_count`
- `decision_signal_vector`
- `completed_at`

---

## Perhitungan “Arena Pertama” (Arena Pembukaan)

Onboarding Arena ini harus:
- Muncul di histori sebagai **1 arena completed**
- Mengisi metrik “Arena Completed Count” sebagai arena pembukaan

Flag yang disarankan untuk konsistensi data:
- `is_tutorial = true`
- `counts_as_completion = true`
- `counts_as_first_completion = true`
- `exclude_from_leaderboard = true`
- `exclude_from_streak = true` (opsi aman)

Agar tidak merusak metrik kompetitif:
- Tidak masuk leaderboard
- Streak harian: opsi aman adalah **tidak dihitung** (atau dihitung hanya sebagai “hari pertama” satu kali, tergantung kebijakan produk)

---

## Hal yang Sengaja TIDAK Ada

- Penjelasan teori
- Label kepribadian / label kemampuan
- Summary panjang
- Motivational quotes
- Paksaan lanjut
- Form panjang atau input teks panjang

---

## Efek yang Diharapkan

User berpikir:
- “Oh, ini cara mainnya.”
- “Ternyata setiap pilihan ada trade-off.”
- “Kok cepet, tapi kena.”

---

## Perbandingan dengan Arena Harian (Quick)

| Arena Onboarding (Tutorial Instan) | Arena Harian (Quick) |
|---|---|
| 90–120 detik | 4–5 menit |
| 1–2 keputusan tap | 1–4 keputusan |
| Arena pembukaan (tutorial) | Ritual harian |
| Kalibrasi prior | Progress nyata |

---

## Kalimat Pengunci

> **Onboarding NovaX bukan menjelaskan sistem.
Ia membuat user berkata: “oh, ini caranya.”**
