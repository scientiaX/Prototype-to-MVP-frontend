# NovaX — Missing Execution Specs (Thread Audit)

Dokumen ini berisi **SEMUA hal yang sebelumnya BELUM ADA / BELUM TERFORMALISASI** dalam konteks thread ini, dan **HARUS dieksekusi di level coding**. Tidak ada visi, tidak ada opini. Ini daftar eksekusi murni.

---

## 1. Selection Consistency at Scale

**Masalah:**
Saat user bertambah, sistem cenderung melonggarkan seleksi agar growth tidak terganggu.

**Aturan Wajib (HARUS DIKODEKAN):**
- XP distribution **tidak boleh dipaksa normal**
- Rasio XP naik **boleh makin kecil seiring skala**, tidak boleh makin besar
- Tidak ada kompensasi XP karena traffic, retensi, atau churn

**Implikasi Teknis:**
- XP awarding logic **tidak bergantung statistik global**
- Threshold evaluasi **per level masalah**, bukan per populasi

---

## 2. Pressure Invariance (Anti-Drift)

**Masalah:**
Kesulitan masalah dan standar evaluasi bisa turun tanpa disadari seiring waktu.

**Aturan Wajib:**
- Level masalah punya **baseline difficulty invariant**
- Evaluasi keputusan dibandingkan **historical baseline**, bukan user kontemporer

**Implikasi Teknis:**
- Simpan benchmark internal per level
- Audit periodik untuk mendeteksi drift

---

## 3. Exploit Surface Lockdown

**Masalah:**
User mengoptimalkan sistem, bukan kapabilitas.

**Aturan Wajib:**
- Deteksi pattern replay lintas skenario
- Deteksi role switching abuse
- Deteksi cooperative farming

**Implikasi Teknis:**
- Similarity detection pada reasoning & decision path
- Cooldown atau XP freeze saat pola eksploit terdeteksi

---

## 4. Irreversibility Formal

**Masalah:**
User bisa mencoba menghapus atau "memutihkan" histori.

**Aturan Wajib:**
- Artifact **immutable by default**
- Tidak ada hard delete
- Perubahan hanya berupa append / versioning

**Implikasi Teknis:**
- Event-sourced architecture
- Append-only logs

---

## 5. Exit Cost Enforcement

**Masalah:**
User bisa pindah tanpa kehilangan makna progres.

**Aturan Wajib:**
- Tidak ada full export artifact bermakna
- Progress tidak bisa direplay cepat di sistem lain

**Implikasi Teknis:**
- Export dibatasi summary non-operasional
- Tidak ada raw decision log export

---

## 6. XP Freeze & Stagnation State

**Masalah:**
User aktif tapi tidak berkembang.

**Aturan Wajib:**
- XP bisa dibekukan tanpa penalti
- Stagnation state eksplisit

**Implikasi Teknis:**
- State machine: progressing / stagnating
- UX feedback tanpa XP reward

---

## 7. Anti-Reset Identity

**Masalah:**
User membuat akun baru untuk menghindari histori buruk.

**Aturan Wajib:**
- Soft identity binding (device, behavior fingerprint)
- Reset tidak menghapus histori lama

**Implikasi Teknis:**
- Account linkage heuristics

---

## 8. Rule Enforcement Priority

**Masalah:**
Tekanan bisnis mendorong kompromi aturan.

**Aturan Wajib:**
- XP rule dieksekusi di backend, tidak bisa di-override UI
- Tidak ada admin manual XP injection

**Implikasi Teknis:**
- Read-only XP write path
- Audit trail semua keputusan sistem

---

## Final Statement

Jika seluruh poin di atas **diimplementasi persis**, NovaX:
- tidak bisa ditiru cepat
- tidak runtuh saat scale
- tidak kehilangan kualitas data

Tidak ada item lain yang belum dibahas di thread ini.

