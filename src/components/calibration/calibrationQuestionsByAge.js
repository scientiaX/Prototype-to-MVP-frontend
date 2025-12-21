/**
 * Age-Based Calibration Questions
 * Different question sets for different age groups
 */

// Age group definitions
export const AGE_GROUPS = {
    SMP: 'smp',      // 12-15 years
    SMA: 'sma',      // 16-18 years
    ADULT: 'adult'   // 19+ years
};

export const getAgeGroupFromAge = (age) => {
    if (age <= 15) return AGE_GROUPS.SMP;
    if (age <= 18) return AGE_GROUPS.SMA;
    return AGE_GROUPS.ADULT;
};

// ============================================
// SMP QUESTIONS (12-15 tahun)
// Konteks: Sekolah, game, teman, organisasi
// ============================================
export const SMP_QUESTIONS = {
    id: [
        {
            id: 'domain',
            question: 'Kamu paling suka ngapain di waktu luang?',
            options: [
                { value: 'academic', label: '📚 Belajar atau ngerjain PR' },
                { value: 'gaming', label: '🎮 Main game atau nonton YouTube' },
                { value: 'creative', label: '🎨 Gambar, musik, atau bikin konten' },
                { value: 'social', label: '👥 Ngobrol atau main sama temen' }
            ]
        },
        {
            id: 'aspiration',
            question: 'Kalau bisa jadi apapun, kamu mau jadi?',
            options: [
                { value: 'top_student', label: '🏆 Juara kelas atau olimpiade' },
                { value: 'creator', label: '📱 Youtuber atau content creator' },
                { value: 'leader', label: '🎖️ Ketua OSIS atau ketua kelas' },
                { value: 'expert', label: '🧠 Ahli di bidang yang kamu suka' }
            ]
        },
        {
            id: 'thinking_style',
            question: 'Waktu ulangan, kamu biasanya gimana?',
            options: [
                { value: 'fast', label: '⚡ Kerjain cepet, yang penting selesai' },
                { value: 'accurate', label: '🎯 Pelan-pelan, yang penting bener' },
                { value: 'explorative', label: '🤔 Coba-coba berbagai cara' }
            ]
        },
        {
            id: 'stuck_experience',
            question: 'Kapan kamu paling bingung?',
            options: [
                { value: 'decision', label: '😵 Waktu harus pilih antara dua hal' },
                { value: 'execution', label: '😓 Waktu tau caranya tapi males ngerjain' },
                { value: 'direction', label: '🤷 Waktu ga tau harus mulai dari mana' },
                { value: 'resource', label: '😔 Waktu butuh bantuan tapi ga tau minta siapa' }
            ]
        },
        {
            id: 'avoided_risk',
            question: 'Apa yang paling bikin kamu takut?',
            options: [
                { value: 'grades', label: '📉 Nilai jelek atau ga naik kelas' },
                { value: 'social', label: '😰 Dibully atau dijauhin temen' },
                { value: 'time', label: '⏰ Ketinggalan pelajaran atau ga sempet main' },
                { value: 'disappoint', label: '😢 Bikin ortu kecewa' }
            ]
        },
        {
            id: 'regret',
            question: 'Biasanya kamu lebih sering nyesel karena...',
            options: [
                { value: 'too_slow', label: '🐢 Terlalu mikir lama, jadi ga jadi' },
                { value: 'too_reckless', label: '🏃 Terlalu buru-buru, jadi salah' }
            ]
        }
    ],
    en: [
        {
            id: 'domain',
            question: 'What do you enjoy doing in your free time?',
            options: [
                { value: 'academic', label: '📚 Studying or doing homework' },
                { value: 'gaming', label: '🎮 Playing games or watching YouTube' },
                { value: 'creative', label: '🎨 Drawing, music, or creating content' },
                { value: 'social', label: '👥 Chatting or hanging out with friends' }
            ]
        },
        {
            id: 'aspiration',
            question: 'If you could be anything, what would you be?',
            options: [
                { value: 'top_student', label: '🏆 Top student or olympiad winner' },
                { value: 'creator', label: '📱 YouTuber or content creator' },
                { value: 'leader', label: '🎖️ Student council president' },
                { value: 'expert', label: '🧠 Expert in something you love' }
            ]
        },
        {
            id: 'thinking_style',
            question: 'During exams, how do you usually work?',
            options: [
                { value: 'fast', label: '⚡ Work fast, just finish it' },
                { value: 'accurate', label: '🎯 Take time, make sure it\'s right' },
                { value: 'explorative', label: '🤔 Try different approaches' }
            ]
        },
        {
            id: 'stuck_experience',
            question: 'When do you feel most confused?',
            options: [
                { value: 'decision', label: '😵 When choosing between two things' },
                { value: 'execution', label: '😓 When you know how but don\'t want to' },
                { value: 'direction', label: '🤷 When you don\'t know where to start' },
                { value: 'resource', label: '😔 When you need help but don\'t know who to ask' }
            ]
        },
        {
            id: 'avoided_risk',
            question: 'What scares you the most?',
            options: [
                { value: 'grades', label: '📉 Bad grades or failing' },
                { value: 'social', label: '😰 Being bullied or left out' },
                { value: 'time', label: '⏰ Falling behind or missing out' },
                { value: 'disappoint', label: '😢 Disappointing parents' }
            ]
        },
        {
            id: 'regret',
            question: 'You usually regret because...',
            options: [
                { value: 'too_slow', label: '🐢 Thought too long, didn\'t do it' },
                { value: 'too_reckless', label: '🏃 Too rushed, made mistakes' }
            ]
        }
    ]
};

// ============================================
// SMA QUESTIONS (16-18 tahun)
// Konteks: PTN, karir, bisnis kecil, sosial media
// ============================================
export const SMA_QUESTIONS = {
    id: [
        {
            id: 'domain',
            question: 'Kalau disuruh bikin project, kamu pilih yang mana?',
            options: [
                { value: 'academic', label: '📊 Riset atau karya ilmiah' },
                { value: 'business', label: '💼 Bisnis kecil-kecilan' },
                { value: 'tech', label: '💻 Coding atau teknologi' },
                { value: 'creative', label: '🎬 Konten kreatif atau seni' }
            ]
        },
        {
            id: 'aspiration',
            question: '5 tahun lagi, kamu mau jadi apa?',
            options: [
                { value: 'college', label: '🎓 Kuliah di PTN favorit' },
                { value: 'founder', label: '🚀 Punya startup atau bisnis' },
                { value: 'creator', label: '📱 Full-time content creator' },
                { value: 'expert', label: '💡 Ahli di bidang tertentu' }
            ]
        },
        {
            id: 'thinking_style',
            question: 'Cara kamu ngerjain tugas besar?',
            options: [
                { value: 'fast', label: '⚡ Kerjain H-1, yang penting selesai' },
                { value: 'accurate', label: '📝 Direncanain mateng dari awal' },
                { value: 'explorative', label: '🧪 Eksperimen dulu, revisi kemudian' }
            ]
        },
        {
            id: 'stuck_experience',
            question: 'Kapan kamu paling stuck?',
            options: [
                { value: 'decision', label: '🔀 Milih jurusan atau karir' },
                { value: 'execution', label: '📅 Punya rencana tapi ga konsisten' },
                { value: 'direction', label: '🧭 Ga tau passion kamu apa' },
                { value: 'resource', label: '💰 Butuh modal atau koneksi' }
            ]
        },
        {
            id: 'avoided_risk',
            question: 'Risiko apa yang paling kamu hindari?',
            options: [
                { value: 'academic', label: '📉 Gagal SNBP/UTBK' },
                { value: 'social', label: '👥 Dipermalukan di depan orang' },
                { value: 'financial', label: '💸 Buang-buang uang' },
                { value: 'relationship', label: '💔 Kehilangan teman atau pacar' }
            ]
        },
        {
            id: 'regret',
            question: 'Biasanya kamu lebih sering nyesel karena...',
            options: [
                { value: 'too_slow', label: '🐢 Terlalu banyak mikir sampai ga gerak' },
                { value: 'too_reckless', label: '🏃 Terlalu nekat tanpa persiapan' }
            ]
        }
    ],
    en: [
        {
            id: 'domain',
            question: 'If asked to create a project, which would you choose?',
            options: [
                { value: 'academic', label: '📊 Research or academic paper' },
                { value: 'business', label: '💼 Small business venture' },
                { value: 'tech', label: '💻 Coding or technology' },
                { value: 'creative', label: '🎬 Creative content or art' }
            ]
        },
        {
            id: 'aspiration',
            question: 'In 5 years, what do you want to be?',
            options: [
                { value: 'college', label: '🎓 Student at top university' },
                { value: 'founder', label: '🚀 Startup or business owner' },
                { value: 'creator', label: '📱 Full-time content creator' },
                { value: 'expert', label: '💡 Expert in a specific field' }
            ]
        },
        {
            id: 'thinking_style',
            question: 'How do you handle big assignments?',
            options: [
                { value: 'fast', label: '⚡ Last minute, just get it done' },
                { value: 'accurate', label: '📝 Plan carefully from the start' },
                { value: 'explorative', label: '🧪 Experiment first, revise later' }
            ]
        },
        {
            id: 'stuck_experience',
            question: 'When do you feel most stuck?',
            options: [
                { value: 'decision', label: '🔀 Choosing major or career' },
                { value: 'execution', label: '📅 Have plans but not consistent' },
                { value: 'direction', label: '🧭 Don\'t know your passion' },
                { value: 'resource', label: '💰 Need money or connections' }
            ]
        },
        {
            id: 'avoided_risk',
            question: 'What risk do you avoid the most?',
            options: [
                { value: 'academic', label: '📉 Failing entrance exams' },
                { value: 'social', label: '👥 Being embarrassed in public' },
                { value: 'financial', label: '💸 Wasting money' },
                { value: 'relationship', label: '💔 Losing friends or partner' }
            ]
        },
        {
            id: 'regret',
            question: 'You usually regret because...',
            options: [
                { value: 'too_slow', label: '🐢 Overthinking until you don\'t act' },
                { value: 'too_reckless', label: '🏃 Too reckless without preparation' }
            ]
        }
    ]
};

// ============================================
// ADULT QUESTIONS (19+ tahun)
// Konteks: Bisnis, karir, finansial, leadership
// (Original questions with slight updates)
// ============================================
export const ADULT_QUESTIONS = {
    id: [
        {
            id: 'domain',
            question: 'Bidang apa yang paling menarik minatmu?',
            options: [
                { value: 'business', label: '💼 Bisnis & Entrepreneurship' },
                { value: 'tech', label: '💻 Teknologi & Inovasi' },
                { value: 'creative', label: '🎨 Kreativitas & Design' },
                { value: 'leadership', label: '👔 Leadership & Management' }
            ]
        },
        {
            id: 'aspiration',
            question: 'Dalam 5-10 tahun, kamu mau jadi siapa?',
            options: [
                { value: 'founder', label: '🚀 Founder startup atau bisnis' },
                { value: 'expert', label: '🧠 Expert di bidang tertentu' },
                { value: 'leader', label: '👑 Leader tim atau organisasi' },
                { value: 'innovator', label: '💡 Inovator yang mengubah industri' }
            ]
        },
        {
            id: 'thinking_style',
            question: 'Bagaimana gaya pengambilan keputusanmu?',
            options: [
                { value: 'fast', label: '⚡ Cepat bertindak, iterasi kemudian' },
                { value: 'accurate', label: '🎯 Analisis mendalam dulu, baru eksekusi' },
                { value: 'explorative', label: '🔍 Eksploratif, banyak opsi dulu' }
            ]
        },
        {
            id: 'stuck_experience',
            question: 'Kapan kamu paling sering merasa stuck?',
            options: [
                { value: 'decision', label: '🔀 Saat harus memilih di antara banyak opsi' },
                { value: 'execution', label: '📅 Saat tahu rencana tapi sulit konsisten' },
                { value: 'direction', label: '🧭 Saat tidak yakin arah yang benar' },
                { value: 'resource', label: '💰 Saat butuh modal, tim, atau koneksi' }
            ]
        },
        {
            id: 'avoided_risk',
            question: 'Risiko apa yang paling kamu hindari?',
            options: [
                { value: 'financial', label: '💸 Risiko finansial (uang, investasi)' },
                { value: 'reputation', label: '🏆 Risiko reputasi (nama baik)' },
                { value: 'time', label: '⏳ Risiko waktu (opportunity cost)' },
                { value: 'relationship', label: '🤝 Risiko relasi (network, partnership)' }
            ]
        },
        {
            id: 'regret',
            question: 'Biasanya kamu lebih sering menyesal karena...',
            options: [
                { value: 'too_slow', label: '🐢 Terlalu lama berpikir sampai kehilangan momen' },
                { value: 'too_reckless', label: '🏃 Terlalu nekat tanpa pertimbangan matang' }
            ]
        }
    ],
    en: [
        {
            id: 'domain',
            question: 'Which field interests you the most?',
            options: [
                { value: 'business', label: '💼 Business & Entrepreneurship' },
                { value: 'tech', label: '💻 Technology & Innovation' },
                { value: 'creative', label: '🎨 Creativity & Design' },
                { value: 'leadership', label: '👔 Leadership & Management' }
            ]
        },
        {
            id: 'aspiration',
            question: 'In 5-10 years, who do you want to become?',
            options: [
                { value: 'founder', label: '🚀 Startup or business founder' },
                { value: 'expert', label: '🧠 Expert in a specific field' },
                { value: 'leader', label: '👑 Team or organization leader' },
                { value: 'innovator', label: '💡 Industry-changing innovator' }
            ]
        },
        {
            id: 'thinking_style',
            question: 'How do you make decisions?',
            options: [
                { value: 'fast', label: '⚡ Act fast, iterate later' },
                { value: 'accurate', label: '🎯 Deep analysis first, then execute' },
                { value: 'explorative', label: '🔍 Explore many options first' }
            ]
        },
        {
            id: 'stuck_experience',
            question: 'When do you feel stuck the most?',
            options: [
                { value: 'decision', label: '🔀 When choosing between many options' },
                { value: 'execution', label: '📅 When I have plans but struggle with consistency' },
                { value: 'direction', label: '🧭 When unsure about the right direction' },
                { value: 'resource', label: '💰 When needing capital, team, or connections' }
            ]
        },
        {
            id: 'avoided_risk',
            question: 'Which risk do you avoid the most?',
            options: [
                { value: 'financial', label: '💸 Financial risk (money, investments)' },
                { value: 'reputation', label: '🏆 Reputation risk (public image)' },
                { value: 'time', label: '⏳ Time risk (opportunity cost)' },
                { value: 'relationship', label: '🤝 Relationship risk (network, partnerships)' }
            ]
        },
        {
            id: 'regret',
            question: 'You usually regret because...',
            options: [
                { value: 'too_slow', label: '🐢 Overthinking until missing the moment' },
                { value: 'too_reckless', label: '🏃 Too reckless without proper consideration' }
            ]
        }
    ]
};

/**
 * Get questions based on age group and language
 */
export function getQuestionsByAgeGroup(ageGroup, language = 'id') {
    const lang = language === 'en' ? 'en' : 'id';

    switch (ageGroup) {
        case AGE_GROUPS.SMP:
            return SMP_QUESTIONS[lang];
        case AGE_GROUPS.SMA:
            return SMA_QUESTIONS[lang];
        case AGE_GROUPS.ADULT:
        default:
            return ADULT_QUESTIONS[lang];
    }
}
