'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Flame, TrendingUp, Award } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getTrackProgress, getReadinessScore, formatDate } from '@/lib/utils';
import { TRACK_CONFIG } from '@/lib/skillData';

function CircleRing({
  pct,
  color,
  label,
  size = 80,
}: {
  pct: number;
  color: string;
  label: string;
  size?: number;
}) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text
          x={size / 2}
          y={size / 2 + 5}
          textAnchor="middle"
          fill="white"
          fontSize={14}
          fontWeight={700}
        >
          {pct}%
        </text>
      </svg>
      <span className="text-[10px] text-gray-400 font-semibold tracking-wide">{label}</span>
    </div>
  );
}

function ReadinessGauge({ score }: { score: number }) {
  const color = score >= 85 ? '#00ff88' : score >= 70 ? '#ffcc00' : '#ff8800';
  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-300">Readiness</span>
        <TrendingUp size={16} className="text-gray-500" />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-black" style={{ color }}>{score}</span>
        <span className="text-gray-500 mb-1 text-sm">/100</span>
      </div>
      <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {score >= 85 ? 'Fully recovered. Train hard.' : score >= 70 ? 'Good to train. Moderate intensity.' : 'Consider light movement or rest.'}
      </p>
    </div>
  );
}

export default function StatsDashboard() {
  const { state } = useApp();
  const readiness = getReadinessScore(state.lastWorkoutDate, state.streak);

  // Weekly volume chart data (last 7 days)
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const daySessions = state.sessions.filter((s) => s.date === dateStr);
    const totalSets = daySessions.reduce((a, s) => a + s.sets.length, 0);
    return {
      day: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      sets: totalSets,
      date: dateStr,
    };
  });

  const totalSessionsThisWeek = weekData.reduce((a, d) => a + d.sets, 0);

  return (
    <div className="px-4 pb-32">
      {/* Header */}
      <div className="pt-12 pb-5">
        <h1 className="text-2xl font-black text-white tracking-tight">
          My <span className="text-[#00ff88]">Stats</span>
        </h1>
      </div>

      {/* Top row: streak + readiness */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/8">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} className="text-orange-400" />
            <span className="text-sm font-semibold text-gray-300">Streak</span>
          </div>
          <div className="text-4xl font-black text-white">{state.streak}</div>
          <div className="text-xs text-gray-500 mt-0.5">days</div>
        </div>
        <ReadinessGauge score={readiness} />
      </div>

      {/* Skill rings */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/8 mb-4">
        <div className="text-sm font-semibold text-gray-300 mb-4">Track Progress</div>
        <div className="flex justify-around">
          {(['push', 'pull', 'core', 'legs'] as const).map((track) => (
            <CircleRing
              key={track}
              pct={getTrackProgress(track, state.nodeStates)}
              color={TRACK_CONFIG[track].color}
              label={TRACK_CONFIG[track].label}
            />
          ))}
        </div>
      </div>

      {/* Weekly volume chart */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/8 mb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-300">Weekly Volume</span>
          <span className="text-xs text-gray-500">{totalSessionsThisWeek} sets this week</span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weekData} barSize={28}>
            <XAxis
              dataKey="day"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{
                background: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: 'white',
                fontSize: 12,
              }}
              formatter={(v) => [`${v ?? 0} sets`, 'Volume']}
            />
            <Bar dataKey="sets" radius={[6, 6, 0, 0]}>
              {weekData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.sets > 0 ? '#00ff88' : 'rgba(255,255,255,0.08)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Personal Bests */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/8">
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} className="text-[#00ff88]" />
          <span className="text-sm font-semibold text-gray-300">Personal Bests</span>
        </div>
        {state.personalBests.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-4">Log sessions to track your PBs.</p>
        ) : (
          <div className="space-y-2">
            {state.personalBests.map((pb) => (
              <div key={pb.exerciseId} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-white">{pb.exerciseName}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#00ff88]">
                    {pb.reps ? `${pb.reps} reps` : `${pb.holdTime}s`}
                  </span>
                  <div className="text-xs text-gray-600">{formatDate(pb.date)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
