/**
 * Age-Based Calibration Questions - Aspirational Version
 * More options, higher aspirations, dynamic based on context
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
// Aspirational, not school-focused
// ============================================
export const SMP_QUESTIONS = {
    id: [
        {
            id: 'domain',
            question: 'Kalau kamu punya waktu seharian penuh, kamu bakal ngapain?',
            options: [
                { value: 'tech', label: '💻 Ngulik teknologi, coding, atau bikin aplikasi' },
                { value: 'creative', label: '🎨 Bikin konten, gambar, musik, atau video' },
                { value: 'business', label: '💰 Cari cara dapetin uang atau jualan sesuatu' },
                { value: 'gaming', label: '🎮 Main game atau bikin game sendiri' },
                { value: 'social', label: '👥 Ngumpul, diskusi, atau ngobrol sama orang' },
                { value: 'explore', label: '🌍 Jalan-jalan, explore, atau coba hal baru' }
            ]
        },
        {
            id: 'aspiration',
            question: '10 tahun lagi, kamu mau jadi siapa?',
            options: [
                { value: 'founder', label: '🚀 Founder perusahaan teknologi' },
                { value: 'creator', label: '🎬 Content creator dengan jutaan followers' },
                { value: 'innovator', label: '💡 Penemu atau inovator yang mengubah dunia' },
                { value: 'leader', label: '👑 Pemimpin organisasi atau komunitas besar' },
                { value: 'expert', label: '🧠 Ahli world-class di bidang tertentu' },
                { value: 'athlete', label: '🏆 Atlet profesional atau esports player' },
                { value: 'artist', label: '🎤 Musisi, artis, atau entertainer terkenal' }
            ]
        },
        {
            id: 'thinking_style',
            question: 'Kalau ada masalah, gimana cara kamu biasanya?',
            options: [
                { value: 'fast', label: '⚡ Langsung eksekusi, perbaiki sambil jalan' },
                { value: 'accurate', label: '🎯 Pikirin mateng-mateng dulu baru gerak' },
                { value: 'explorative', label: '🔍 Coba berbagai cara sampai ketemu yang pas' },
                { value: 'collaborative', label: '🤝 Diskusi sama orang lain dulu' },
                { value: 'creative', label: '💫 Cari solusi yang beda dari biasanya' }
            ]
        },
        {
            id: 'stuck_experience',
            question: 'Kapan kamu paling sering merasa stuck?',
            options: [
                { value: 'decision', label: '🔀 Waktu harus pilih di antara banyak opsi' },
                { value: 'execution', label: '📅 Punya rencana tapi susah konsisten' },
                { value: 'direction', label: '🧭 Ga tau mau kemana atau tujuannya apa' },
                { value: 'resource', label: '💰 Butuh modal, alat, atau akses' },
                { value: 'confidence', label: '😰 Ragu sama kemampuan sendiri' },
                { value: 'motivation', label: '🔋 Kehilangan semangat di tengah jalan' }
            ]
        },
        {
            id: 'avoided_risk',
            question: 'Apa yang paling bikin kamu takut gagal?',
            options: [
                { value: 'financial', label: '💸 Kehilangan uang atau ga punya modal' },
                { value: 'reputation', label: '👥 Dihujat atau dinilai jelek sama orang' },
                { value: 'time', label: '⏰ Buang waktu untuk sesuatu yang ga worth it' },
                { value: 'relationship', label: '💔 Kehilangan teman atau orang penting' },
                { value: 'opportunity', label: '🚪 Kehilangan kesempatan yang lebih baik' },
                { value: 'disappointment', label: '😢 Mengecewakan orang yang percaya sama kamu' }
            ]
        },
        {
            id: 'regret',
            question: 'Biasanya kamu lebih sering nyesel karena...',
            options: [
                { value: 'too_slow', label: '🐢 Terlalu banyak mikir sampai ga jadi' },
                { value: 'too_reckless', label: '🏃 Terlalu nekat tanpa persiapan' },
                { value: 'too_safe', label: '🛡️ Main terlalu aman, ga berani ambil risiko' }
            ]
        }
    ],
    en: [
        {
            id: 'domain',
            question: 'If you had a whole day free, what would you do?',
            options: [
                { value: 'tech', label: '💻 Tinker with tech, coding, or building apps' },
                { value: 'creative', label: '🎨 Create content, art, music, or videos' },
                { value: 'business', label: '💰 Find ways to make money or sell something' },
                { value: 'gaming', label: '🎮 Play games or make your own game' },
                { value: 'social', label: '👥 Hang out, discuss, or meet new people' },
                { value: 'explore', label: '🌍 Travel, explore, or try new things' }
            ]
        },
        {
            id: 'aspiration',
            question: 'In 10 years, who do you want to become?',
            options: [
                { value: 'founder', label: '🚀 Tech company founder' },
                { value: 'creator', label: '🎬 Content creator with millions of followers' },
                { value: 'innovator', label: '💡 Inventor or world-changing innovator' },
                { value: 'leader', label: '👑 Leader of a major organization or community' },
                { value: 'expert', label: '🧠 World-class expert in a specific field' },
                { value: 'athlete', label: '🏆 Professional athlete or esports player' },
                { value: 'artist', label: '🎤 Famous musician, artist, or entertainer' }
            ]
        },
        {
            id: 'thinking_style',
            question: 'When facing a problem, what\'s your usual approach?',
            options: [
                { value: 'fast', label: '⚡ Execute immediately, fix as you go' },
                { value: 'accurate', label: '🎯 Think it through carefully first' },
                { value: 'explorative', label: '🔍 Try different approaches until one works' },
                { value: 'collaborative', label: '🤝 Discuss with others first' },
                { value: 'creative', label: '💫 Find unconventional solutions' }
            ]
        },
        {
            id: 'stuck_experience',
            question: 'When do you feel stuck the most?',
            options: [
                { value: 'decision', label: '🔀 When choosing between many options' },
                { value: 'execution', label: '📅 Have plans but struggle to be consistent' },
                { value: 'direction', label: '🧭 Don\'t know where to go or what the goal is' },
                { value: 'resource', label: '💰 Need money, tools, or access' },
                { value: 'confidence', label: '😰 Doubt my own abilities' },
                { value: 'motivation', label: '🔋 Lose motivation midway' }
            ]
        },
        {
            id: 'avoided_risk',
            question: 'What failure scares you the most?',
            options: [
                { value: 'financial', label: '💸 Losing money or not having capital' },
                { value: 'reputation', label: '👥 Being judged or criticized by others' },
                { value: 'time', label: '⏰ Wasting time on something not worth it' },
                { value: 'relationship', label: '💔 Losing friends or important people' },
                { value: 'opportunity', label: '🚪 Missing out on better opportunities' },
                { value: 'disappointment', label: '😢 Disappointing people who believe in me' }
            ]
        },
        {
            id: 'regret',
            question: 'You usually regret because...',
            options: [
                { value: 'too_slow', label: '🐢 Overthinking until not doing it' },
                { value: 'too_reckless', label: '🏃 Being reckless without preparation' },
                { value: 'too_safe', label: '🛡️ Playing too safe, not taking risks' }
            ]
        }
    ]
};

// ============================================
// SMA QUESTIONS (16-18 tahun)
// Career-focused but still aspirational
// ============================================
export const SMA_QUESTIONS = {
    id: [
        {
            id: 'domain',
            question: 'Bidang apa yang paling bikin kamu excited?',
            options: [
                { value: 'tech', label: '💻 Teknologi, AI, atau software' },
                { value: 'business', label: '💼 Bisnis, startup, atau entrepreneurship' },
                { value: 'creative', label: '🎨 Design, konten, atau industri kreatif' },
                { value: 'finance', label: '📈 Finance, investasi, atau trading' },
                { value: 'science', label: '🔬 Sains, riset, atau engineering' },
                { value: 'social', label: '🌍 Social impact atau community building' }
            ]
        },
        {
            id: 'aspiration',
            question: '5 tahun lagi, kamu mau jadi siapa?',
            options: [
                { value: 'founder', label: '🚀 Founder startup dengan valuasi tinggi' },
                { value: 'creator', label: '🎬 Full-time creator dengan income 9 digit' },
                { value: 'expert', label: '🧠 Expert yang diakui di industri' },
                { value: 'leader', label: '👑 Leader tim di perusahaan top' },
                { value: 'investor', label: '💰 Investor atau business owner' },
                { value: 'innovator', label: '💡 Inovator yang bikin produk baru' },
                { value: 'freelancer', label: '🌐 Freelancer global dengan client luar negeri' }
            ]
        },
        {
            id: 'thinking_style',
            question: 'Gimana cara kamu biasanya approach masalah?',
            options: [
                { value: 'fast', label: '⚡ Eksekusi cepat, iterasi kemudian' },
                { value: 'accurate', label: '📊 Riset dan analisis dulu, baru action' },
                { value: 'explorative', label: '🧪 Eksperimen berbagai approach' },
                { value: 'systematic', label: '📋 Breakdown jadi steps yang jelas' },
                { value: 'intuitive', label: '🎯 Ikut intuisi dan gut feeling' }
            ]
        },
        {
            id: 'stuck_experience',
            question: 'Kapan kamu paling sering merasa stuck?',
            options: [
                { value: 'decision', label: '🔀 Milih antara banyak opsi yang bagus' },
                { value: 'execution', label: '📅 Punya rencana tapi ga konsisten eksekusi' },
                { value: 'direction', label: '🧭 Ga yakin path mana yang harus diambil' },
                { value: 'resource', label: '💰 Butuh modal, network, atau skill baru' },
                { value: 'perfectionism', label: '✨ Pengen perfect jadinya ga pernah launch' },
                { value: 'overwhelm', label: '🌊 Terlalu banyak yang harus dikerjain' }
            ]
        },
        {
            id: 'avoided_risk',
            question: 'Risiko apa yang paling kamu hindari?',
            options: [
                { value: 'financial', label: '💸 Kehilangan uang atau gagal secara finansial' },
                { value: 'reputation', label: '👥 Nama baik rusak atau dipermalukan' },
                { value: 'time', label: '⏳ Buang waktu untuk hal yang salah' },
                { value: 'relationship', label: '🤝 Kehilangan koneksi atau partner penting' },
                { value: 'opportunity', label: '🚪 Miss opportunity yang lebih besar' },
                { value: 'career', label: '📈 Salah pilih career path' }
            ]
        },
        {
            id: 'regret',
            question: 'Biasanya kamu lebih sering menyesal karena...',
            options: [
                { value: 'too_slow', label: '🐢 Terlalu lama mikir sampai kehilangan momen' },
                { value: 'too_reckless', label: '🏃 Terlalu cepat action tanpa strategi' },
                { value: 'too_safe', label: '🛡️ Main terlalu aman, ga berani ambil risiko besar' }
            ]
        }
    ],
    en: [
        {
            id: 'domain',
            question: 'What field excites you the most?',
            options: [
                { value: 'tech', label: '💻 Technology, AI, or software' },
                { value: 'business', label: '💼 Business, startups, or entrepreneurship' },
                { value: 'creative', label: '🎨 Design, content, or creative industry' },
                { value: 'finance', label: '📈 Finance, investing, or trading' },
                { value: 'science', label: '🔬 Science, research, or engineering' },
                { value: 'social', label: '🌍 Social impact or community building' }
            ]
        },
        {
            id: 'aspiration',
            question: 'In 5 years, who do you want to become?',
            options: [
                { value: 'founder', label: '🚀 Startup founder with high valuation' },
                { value: 'creator', label: '🎬 Full-time creator with 9-figure income' },
                { value: 'expert', label: '🧠 Recognized industry expert' },
                { value: 'leader', label: '👑 Team leader at a top company' },
                { value: 'investor', label: '💰 Investor or business owner' },
                { value: 'innovator', label: '💡 Innovator creating new products' },
                { value: 'freelancer', label: '🌐 Global freelancer with international clients' }
            ]
        },
        {
            id: 'thinking_style',
            question: 'How do you usually approach problems?',
            options: [
                { value: 'fast', label: '⚡ Execute fast, iterate later' },
                { value: 'accurate', label: '📊 Research and analyze first, then act' },
                { value: 'explorative', label: '🧪 Experiment with different approaches' },
                { value: 'systematic', label: '📋 Break down into clear steps' },
                { value: 'intuitive', label: '🎯 Follow intuition and gut feeling' }
            ]
        },
        {
            id: 'stuck_experience',
            question: 'When do you feel stuck the most?',
            options: [
                { value: 'decision', label: '🔀 Choosing between many good options' },
                { value: 'execution', label: '📅 Have plans but inconsistent execution' },
                { value: 'direction', label: '🧭 Not sure which path to take' },
                { value: 'resource', label: '💰 Need capital, network, or new skills' },
                { value: 'perfectionism', label: '✨ Want it perfect so never launch' },
                { value: 'overwhelm', label: '🌊 Too many things to do' }
            ]
        },
        {
            id: 'avoided_risk',
            question: 'What risk do you avoid the most?',
            options: [
                { value: 'financial', label: '💸 Losing money or financial failure' },
                { value: 'reputation', label: '👥 Damaged reputation or embarrassment' },
                { value: 'time', label: '⏳ Wasting time on the wrong thing' },
                { value: 'relationship', label: '🤝 Losing important connections or partners' },
                { value: 'opportunity', label: '🚪 Missing bigger opportunities' },
                { value: 'career', label: '📈 Choosing the wrong career path' }
            ]
        },
        {
            id: 'regret',
            question: 'You usually regret because...',
            options: [
                { value: 'too_slow', label: '🐢 Taking too long and missing the moment' },
                { value: 'too_reckless', label: '🏃 Acting too fast without strategy' },
                { value: 'too_safe', label: '🛡️ Playing too safe, not taking big risks' }
            ]
        }
    ]
};

// ============================================
// ADULT QUESTIONS (19+ tahun)
// Professional and high-stakes
// ============================================
export const ADULT_QUESTIONS = {
    id: [
        {
            id: 'domain',
            question: 'Bidang apa yang paling menarik minatmu untuk deep dive?',
            options: [
                { value: 'tech', label: '💻 Tech - Software, AI, atau Blockchain' },
                { value: 'business', label: '💼 Business - Startup atau Enterprise' },
                { value: 'finance', label: '📈 Finance - Investasi atau Trading' },
                { value: 'creative', label: '🎨 Creative - Design atau Media' },
                { value: 'leadership', label: '👔 Leadership - Management atau Consulting' },
                { value: 'product', label: '📱 Product - PM atau UX' }
            ]
        },
        {
            id: 'aspiration',
            question: 'Dalam 5-10 tahun, posisi apa yang kamu targetkan?',
            options: [
                { value: 'founder', label: '🚀 Founder - Bikin company sendiri' },
                { value: 'cxo', label: '👔 C-Level Executive - CEO, CTO, CFO' },
                { value: 'investor', label: '💰 Investor - VC atau Angel Investor' },
                { value: 'expert', label: '🧠 Domain Expert - Thought leader di bidangmu' },
                { value: 'creator', label: '🎬 Creator Economy - Build personal brand' },
                { value: 'freelancer', label: '🌐 High-value Freelancer - Premium rates globally' },
                { value: 'acquirer', label: '🏢 Acquirer - Beli dan scale bisnis' }
            ]
        },
        {
            id: 'thinking_style',
            question: 'Bagaimana gaya decision-making mu?',
            options: [
                { value: 'fast', label: '⚡ Bias to action - Eksekusi dulu, pivot kemudian' },
                { value: 'accurate', label: '📊 Data-driven - Analisis mendalam, baru decide' },
                { value: 'explorative', label: '🧪 Experimental - Test multiple hypotheses' },
                { value: 'intuitive', label: '🎯 Intuitive - Trust gut feeling + experience' },
                { value: 'collaborative', label: '🤝 Collaborative - Decide bersama tim' }
            ]
        },
        {
            id: 'stuck_experience',
            question: 'Kapan kamu paling sering merasa bottleneck?',
            options: [
                { value: 'decision', label: '🔀 Analysis paralysis - Terlalu banyak opsi bagus' },
                { value: 'execution', label: '📅 Execution gap - Strategy bagus, eksekusi lemah' },
                { value: 'direction', label: '🧭 Strategic clarity - Ga yakin prioritas yang benar' },
                { value: 'resource', label: '💰 Resource constraint - Modal, tim, atau waktu' },
                { value: 'scaling', label: '📈 Scaling challenge - Growth tapi ga sustainable' },
                { value: 'delegation', label: '👥 Delegation - Susah lepas control' }
            ]
        },
        {
            id: 'avoided_risk',
            question: 'Risiko apa yang paling kamu manage dengan hati-hati?',
            options: [
                { value: 'financial', label: '💸 Financial risk - Downside protection' },
                { value: 'reputation', label: '🏆 Reputation risk - Personal brand damage' },
                { value: 'time', label: '⏳ Opportunity cost - Wrong bet yang makan waktu' },
                { value: 'relationship', label: '🤝 Relationship risk - Burn bridge dengan key people' },
                { value: 'career', label: '📈 Career risk - Wrong move yang hard to reverse' },
                { value: 'health', label: '🏥 Burnout risk - Overwork sampai rusak kesehatan' }
            ]
        },
        {
            id: 'regret',
            question: 'Pattern penyesalan yang sering kamu alami?',
            options: [
                { value: 'too_slow', label: '🐢 Missed window - Kelamaan mikir, moment hilang' },
                { value: 'too_reckless', label: '🏃 Premature scaling - Terlalu cepat tanpa fondasi' },
                { value: 'too_safe', label: '🛡️ Under-leveraged - Ga maximize opportunity yang ada' }
            ]
        }
    ],
    en: [
        {
            id: 'domain',
            question: 'What field interests you most for deep dive?',
            options: [
                { value: 'tech', label: '💻 Tech - Software, AI, or Blockchain' },
                { value: 'business', label: '💼 Business - Startup or Enterprise' },
                { value: 'finance', label: '📈 Finance - Investing or Trading' },
                { value: 'creative', label: '🎨 Creative - Design or Media' },
                { value: 'leadership', label: '👔 Leadership - Management or Consulting' },
                { value: 'product', label: '📱 Product - PM or UX' }
            ]
        },
        {
            id: 'aspiration',
            question: 'In 5-10 years, what position are you targeting?',
            options: [
                { value: 'founder', label: '🚀 Founder - Build your own company' },
                { value: 'cxo', label: '👔 C-Level Executive - CEO, CTO, CFO' },
                { value: 'investor', label: '💰 Investor - VC or Angel Investor' },
                { value: 'expert', label: '🧠 Domain Expert - Thought leader in your field' },
                { value: 'creator', label: '🎬 Creator Economy - Build personal brand' },
                { value: 'freelancer', label: '🌐 High-value Freelancer - Premium rates globally' },
                { value: 'acquirer', label: '🏢 Acquirer - Buy and scale businesses' }
            ]
        },
        {
            id: 'thinking_style',
            question: 'What\'s your decision-making style?',
            options: [
                { value: 'fast', label: '⚡ Bias to action - Execute first, pivot later' },
                { value: 'accurate', label: '📊 Data-driven - Deep analysis, then decide' },
                { value: 'explorative', label: '🧪 Experimental - Test multiple hypotheses' },
                { value: 'intuitive', label: '🎯 Intuitive - Trust gut feeling + experience' },
                { value: 'collaborative', label: '🤝 Collaborative - Decide together with team' }
            ]
        },
        {
            id: 'stuck_experience',
            question: 'When do you feel bottlenecked the most?',
            options: [
                { value: 'decision', label: '🔀 Analysis paralysis - Too many good options' },
                { value: 'execution', label: '📅 Execution gap - Good strategy, weak execution' },
                { value: 'direction', label: '🧭 Strategic clarity - Unsure of right priorities' },
                { value: 'resource', label: '💰 Resource constraint - Capital, team, or time' },
                { value: 'scaling', label: '📈 Scaling challenge - Growth but not sustainable' },
                { value: 'delegation', label: '👥 Delegation - Hard to let go of control' }
            ]
        },
        {
            id: 'avoided_risk',
            question: 'Which risk do you manage most carefully?',
            options: [
                { value: 'financial', label: '💸 Financial risk - Downside protection' },
                { value: 'reputation', label: '🏆 Reputation risk - Personal brand damage' },
                { value: 'time', label: '⏳ Opportunity cost - Wrong bet that takes time' },
                { value: 'relationship', label: '🤝 Relationship risk - Burn bridges with key people' },
                { value: 'career', label: '📈 Career risk - Wrong move hard to reverse' },
                { value: 'health', label: '🏥 Burnout risk - Overwork damaging health' }
            ]
        },
        {
            id: 'regret',
            question: 'What regret pattern do you often experience?',
            options: [
                { value: 'too_slow', label: '🐢 Missed window - Thought too long, moment gone' },
                { value: 'too_reckless', label: '🏃 Premature scaling - Too fast without foundation' },
                { value: 'too_safe', label: '🛡️ Under-leveraged - Didn\'t maximize opportunities' }
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
