export const calculateProfile = (answers) => {
  let risk_appetite = 0.5;
  let decision_speed = 0.5;
  let ambiguity_tolerance = 0.5;
  let experience_depth = 0.5;

  if (answers.thinking_style === 'fast') {
    decision_speed = 0.8;
    risk_appetite += 0.1;
  } else if (answers.thinking_style === 'accurate') {
    decision_speed = 0.3;
    ambiguity_tolerance -= 0.1;
  } else if (answers.thinking_style === 'explorative') {
    ambiguity_tolerance = 0.7;
    decision_speed = 0.5;
  }

  if (answers.regret === 'too_slow') {
    risk_appetite -= 0.15;
  } else {
    risk_appetite += 0.15;
  }

  if (answers.avoided_risk === 'financial') {
    risk_appetite -= 0.1;
  } else if (answers.avoided_risk === 'reputation') {
    ambiguity_tolerance -= 0.1;
  } else if (answers.avoided_risk === 'time') {
    decision_speed += 0.1;
  }

  if (answers.aspiration === 'expert') {
    experience_depth = 0.7;
  } else if (answers.aspiration === 'founder') {
    risk_appetite += 0.1;
  }

  risk_appetite = Math.max(0.1, Math.min(0.9, risk_appetite));
  decision_speed = Math.max(0.1, Math.min(0.9, decision_speed));
  ambiguity_tolerance = Math.max(0.1, Math.min(0.9, ambiguity_tolerance));
  experience_depth = Math.max(0.1, Math.min(0.9, experience_depth));

  const avgScore = (risk_appetite + decision_speed + ambiguity_tolerance + experience_depth) / 4;
  let starting_difficulty = Math.ceil(avgScore * 5);
  starting_difficulty = Math.max(1, Math.min(5, starting_difficulty));

  const scores = {
    risk_taker: risk_appetite + (decision_speed * 0.5),
    analyst: (1 - risk_appetite) + experience_depth,
    builder: decision_speed + (1 - ambiguity_tolerance) * 0.5,
    strategist: ambiguity_tolerance + experience_depth
  };
  
  const primary_archetype = Object.entries(scores).reduce((a, b) => 
    scores[a[0]] > scores[b[0]] ? a : b
  )[0];

  return {
    risk_appetite,
    decision_speed,
    ambiguity_tolerance,
    experience_depth,
    current_difficulty: starting_difficulty,
    primary_archetype,
    xp_risk_taker: 0,
    xp_analyst: 0,
    xp_builder: 0,
    xp_strategist: 0,
    total_arenas_completed: 0,
    highest_difficulty_conquered: 0,
    calibration_completed: true,
    domain: answers.domain,
    aspiration: answers.aspiration,
    thinking_style: answers.thinking_style,
    last_stuck_experience: answers.stuck_experience,
    avoided_risk: answers.avoided_risk,
    common_regret: answers.regret
  };
};

export const calculateXPDistribution = (evaluation, selectedProblem, profile) => {
  let totalXp = 0;
  const xpBreakdown = {
    risk_taker: evaluation.xp_risk_taker || 0,
    analyst: evaluation.xp_analyst || 0,
    builder: evaluation.xp_builder || 0,
    strategist: evaluation.xp_strategist || 0
  };
  
  if (selectedProblem.difficulty > profile.current_difficulty && evaluation.level_up_achieved) {
    const difficultyDelta = selectedProblem.difficulty - profile.current_difficulty;
    const multiplier = evaluation.quality_score || 1;
    totalXp = Math.round(difficultyDelta * multiplier * 10);
    
    Object.keys(xpBreakdown).forEach(key => {
      xpBreakdown[key] = Math.round(xpBreakdown[key] * multiplier);
    });
  }

  return { totalXp, xpBreakdown };
};

export const updateArchetype = (profile) => {
  const xpValues = {
    risk_taker: profile.xp_risk_taker,
    analyst: profile.xp_analyst,
    builder: profile.xp_builder,
    strategist: profile.xp_strategist
  };
  
  return Object.entries(xpValues).reduce((a, b) => 
    xpValues[a[0]] > xpValues[b[0]] ? a : b
  )[0];
};
