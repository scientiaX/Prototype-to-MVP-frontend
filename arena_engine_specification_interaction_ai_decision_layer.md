# Arena Engine Specification – Interaction & AI Decision Layer

Dokumen ini melengkapi **Arena Engine Specification (Execution‑Ready)** dengan detail **fitur interaksi Arena**, **jenis input user**, **aturan countdown**, **task system**, dan **metrik yang digunakan AI untuk mengambil aksi**.

Fokus: **apa saja yang muncul di Arena, kapan muncul, dan kenapa AI memicunya**.

---

## 1. Jenis Interaksi User (Interaction Types)

Arena **tidak memperbolehkan interaksi bebas**. Semua aksi user harus masuk salah satu tipe berikut:

### 1.1 Text Commit (Decision Input)

- Digunakan di state: `COMMIT_DECISION`
- Panjang dibatasi (mis. 300–500 karakter)
- Tujuan: menyatakan **keputusan inti**, bukan penjelasan lengkap

Validasi:
- Tidak kosong
- Mengandung kata kerja keputusan (pilih, fokus, hentikan, lanjutkan, dll)

---

### 1.2 Partial Edit (Patch)

- Digunakan di state: `PATCH_DECISION`
- User hanya dapat:
  - menambah kalimat
  - menghapus potongan
  - mengganti frasa

Backend menyimpan:
- before/after diff
- ukuran perubahan

---

### 1.3 Option Selection (Trade‑off / Choice)

- Digunakan di state: `CHOOSE_TRADEOFF`, `CONFIRM_OR_ABORT`
- User **wajib memilih 1 opsi**

Opsional:
- alasan singkat (≤150 karakter)

---

### 1.4 Focused Justification (Short Text)

- Digunakan di state: `JUSTIFY_FOCUSED`
- AI menentukan **scope** yang boleh dijelaskan
- Panjang **dibatasi** (short text)

Tujuan:
- Argumentasi terarah
- Bukan refleksi panjang

---

### 1.4b Extended Reflection (Conditional Long Text)

- **Tidak selalu aktif**
- Diaktifkan secara kondisional oleh sistem + AI
- Digunakan untuk **mengukur clarity, inisiatif penjelasan, dan struktur logika**

Trigger umum:
- Setelah beberapa decision cycle stabil
- Ketika AI perlu mengukur reasoning depth eksplisit
- Saat ambiguity tinggi tapi solusi sudah dipilih

Karakter:
- Lebih panjang dari focused justification
- Tetap time-boxed

Catatan:
- State ini **tidak menggantikan** interaksi lain
- Hanya muncul sebagai **alat ukur khusus**, bukan default

---

### 1.5 Task Execution (Act)

- Digunakan di state: `EXECUTE_TASK`
- User **tidak menjawab**, tapi **melakukan aksi**

Contoh task:
- Diskusi singkat dengan tim (multiplayer)
- Menyusun 1 kalimat ringkasan tim
- Menguji 1 asumsi ekstrem
- Menuliskan skenario gagal total

Task bersifat:
- ringan
- kontekstual
- time‑boxed

---

## 2. Countdown & Pressure Rules

### 2.1 Kapan Countdown Aktif

Countdown **tidak selalu aktif**.

Aktif ketika:
- Response latency melebihi baseline user
- AI mendeteksi over‑analysis
- Pertanyaan membutuhkan keputusan cepat

Tidak aktif ketika:
- Problem complexity tinggi
- User baru masuk arena

---

### 2.2 Jenis Countdown

1. **Soft Reminder Timer**
   - Visual cue
   - Tidak memaksa

2. **Hard Decision Timer**
   - Memaksa memilih / mengunci

3. **Escalation Timer**
   - Jika habis → state diganti

---

## 3. Notification & Reminder System

### 3.1 Reminder Types

- Time reminder (respon terlalu lama)
- Focus reminder (keluar konteks)
- Action reminder (belum commit / pilih)

Reminder bersifat:
- singkat
- tidak memblokir input

---

### 3.2 Micro‑Event Notification

- Muncul saat metric delta signifikan
- Tidak bisa di‑dismiss manual
- Auto‑fade

---

## 4. Task System Detail

### 4.1 Task Trigger Conditions

AI Simple dapat memicu task jika:
- Jawaban stagnan ≥2 iterasi
- User terlalu abstrak
- Masalah membutuhkan perspektif eksternal
- Mode multiplayer aktif

---

### 4.2 Task Schema (Example)

```json
{
  "task_id": "T_DISCUSS_TEAM",
  "type": "multiplayer",
  "instruction": "Minta 1 anggota tim mengkritisi keputusan ini",
  "time_limit": 180,
  "completion_rule": "1 summary sentence submitted"
}
```

---

## 5. AI Decision Metrics (Action Selection)

AI **tidak bertanya atau memberi task secara acak**.

### 5.1 Core Metrics

- Response latency trend
- Edit delta trend
- Consistency score
- Over‑analysis indicator
- Decision confidence proxy

---

### 5.2 Derived Signals

- Stagnation score
- Cognitive load estimate
- Risk avoidance / over‑confidence

---

### 5.3 Action Mapping

| Kondisi | Aksi AI |
|------|-------|
| Respon lama + edit kecil | Trigger countdown |
| Jawaban berulang | Trigger task |
| Inkonistensi turun | Trigger patch |
| Jawaban cepat & tepat | Escalate problem |

---

## 6. End of Arena Output

Arena menghasilkan:

- Decision history log
- Task execution log
- Metric summary
- EXP delta
- Difficulty seed berikutnya

---

Dokumen ini **harus dibaca bersama Arena Engine Specification utama** dan menjadi referensi implementasi **interaction layer & AI action logic**.

