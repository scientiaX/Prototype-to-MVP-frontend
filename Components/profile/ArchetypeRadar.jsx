import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const archetypeLabels = {
  risk_taker: 'Risk Taker',
  analyst: 'Analyst',
  builder: 'Builder',
  strategist: 'Strategist'
};

export default function ArchetypeRadar({ profile }) {
  const data = [
    { archetype: 'Risk Taker', xp: profile.xp_risk_taker || 0, fullMark: 100 },
    { archetype: 'Analyst', xp: profile.xp_analyst || 0, fullMark: 100 },
    { archetype: 'Builder', xp: profile.xp_builder || 0, fullMark: 100 },
    { archetype: 'Strategist', xp: profile.xp_strategist || 0, fullMark: 100 }
  ];

  // Normalize for display
  const maxXp = Math.max(...data.map(d => d.xp), 1);
  const normalizedData = data.map(d => ({
    ...d,
    xp: Math.round((d.xp / maxXp) * 100)
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={normalizedData}>
          <PolarGrid stroke="#27272a" />
          <PolarAngleAxis 
            dataKey="archetype" 
            tick={{ fill: '#71717a', fontSize: 12 }}
          />
          <Radar
            name="XP"
            dataKey="xp"
            stroke="#f97316"
            fill="#f97316"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
