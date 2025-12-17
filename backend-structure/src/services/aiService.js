import { invokeLLM } from '../config/openai.js';

export const generateProblem = async (profile, customization = null) => {
  let prompt;
  
  if (customization) {
    const domainText = customization.domains.join(', ');
    const problemTypeText = customization.problemType 
      ? `Focus on ${customization.problemType} scenario.` 
      : '';
    const contextText = customization.customContext 
      ? `\n\nUser context: ${customization.customContext}` 
      : '';
    const constraintsText = customization.specificConstraints
      ? `\n\nSpecific constraints to include: ${customization.specificConstraints}`
      : '';
    
    prompt = `Generate a challenging real-world problem for someone with:
- Profile archetype: ${profile.primary_archetype}
- Current level: ${profile.current_difficulty}
- Risk appetite: ${profile.risk_appetite}
- Thinking style: ${profile.thinking_style}

USER CUSTOMIZATION:
- Domains: ${domainText}
- Target difficulty: ${customization.minDifficulty}-${customization.maxDifficulty}
- Time limit: ${customization.timeLimit} minutes
${problemTypeText}${contextText}${constraintsText}

Create a REAL-WORLD problem that:
1. Has incomplete data
2. Requires a decisive action (not just analysis)
3. Has clear trade-offs that hurt
4. Cannot be solved with a "safe" answer
5. Reflects the user's specified domains and constraints
6. Is challenging but solvable within the time limit

The difficulty should be between ${customization.minDifficulty} and ${customization.maxDifficulty}.
If multiple domains are specified, create a problem that intersects them (e.g., tech + business = technical product decision with business impact).

CRITICAL: This is for a platform that confronts users with hard choices. Don't soften the problem. Make it realistic and uncomfortable.

Respond in Indonesian.`;
  } else {
    prompt = `Generate a business/strategy problem for someone with:
- Domain: ${profile.domain}
- Archetype: ${profile.primary_archetype}
- Current difficulty level: ${profile.current_difficulty}
- Risk appetite: ${profile.risk_appetite}
- Thinking style: ${profile.thinking_style}

Create a REAL-WORLD problem that:
1. Has incomplete data
2. Requires a decisive action
3. Has clear trade-offs
4. Cannot be solved with a "safe" answer

The problem should be solvable in 20-30 minutes.

Respond in Indonesian.`;
  }

  const response = await invokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        problem_id: { type: "string" },
        title: { type: "string" },
        context: { type: "string" },
        objective: { type: "string" },
        constraints: { type: "array", items: { type: "string" } },
        difficulty: { type: "integer" },
        level_up_criteria: { type: "array", items: { type: "string" } },
        domain: { type: "string" },
        archetype_focus: { type: "string" },
        estimated_time_minutes: { type: "integer" }
      },
      required: ["problem_id", "title", "context", "objective", "difficulty"]
    }
  });

  return response;
};

export const evaluateSolution = async (problem, solution, timeElapsed) => {
  const evaluationPrompt = `Kamu adalah mentor yang menguji keputusan. Evaluasi solusi berikut:

MASALAH:
${problem.title}
${problem.context}

OBJECTIVE:
${problem.objective}

CONSTRAINTS:
${problem.constraints?.join(', ')}

KRITERIA NAIK LEVEL:
${problem.level_up_criteria?.join(', ')}

SOLUSI USER:
${solution}

WAKTU: ${Math.floor(timeElapsed / 60)} menit

Evaluasi dengan tajam dan singkat. Tentukan:
1. Apakah user menghadapi risiko inti atau bermain aman?
2. Apakah trade-off dijelaskan eksplisit?
3. Apakah ada keputusan nyata atau hanya deskripsi?

Berikan evaluasi yang konfrontatif, bukan memuji.`;

  const evaluation = await invokeLLM({
    prompt: evaluationPrompt,
    response_json_schema: {
      type: "object",
      properties: {
        evaluation: { type: "string" },
        insight: { type: "string" },
        criteria_met: { type: "array", items: { type: "string" } },
        level_up_achieved: { type: "boolean" },
        quality_score: { type: "number" },
        xp_risk_taker: { type: "integer" },
        xp_analyst: { type: "integer" },
        xp_builder: { type: "integer" },
        xp_strategist: { type: "integer" }
      },
      required: ["evaluation", "level_up_achieved", "quality_score"]
    }
  });

  return evaluation;
};

export const generateSocraticQuestion = async (problem, profile, context = 'initial') => {
  let prompt;
  
  if (context === 'initial') {
    prompt = `Kamu adalah mentor Socratic. User baru mulai problem:

PROBLEM: ${problem.title}
CONTEXT: ${problem.context}
OBJECTIVE: ${problem.objective}

User archetype: ${profile.primary_archetype}
Thinking style: ${profile.thinking_style}

Generate 1 pertanyaan pembuka yang:
1. Memaksa user breakdown masalah inti
2. Tidak terlalu luas, tidak terlalu sempit
3. Socratic - buat user berpikir sendiri
4. 1 kalimat saja

Contoh: "Apa satu hal yang paling kamu takutkan kalau keputusan ini salah?"

Output hanya pertanyaan dalam Bahasa Indonesia.`;
  } else if (context === 'pause') {
    prompt = `User stuck di problem:

PROBLEM: ${problem.title}
User archetype: ${profile.primary_archetype}

Generate 1 pertanyaan singkat yang:
1. Nudge tanpa spoiler
2. Socratic style
3. 1 kalimat

Output hanya pertanyaan dalam Bahasa Indonesia.`;
  }

  const response = await invokeLLM({ prompt });
  return response;
};
