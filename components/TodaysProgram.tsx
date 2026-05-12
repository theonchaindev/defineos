'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getDailyProgram } from '@/lib/programData';

function ProgramBlock({
  title,
  duration,
  exercises,
  coachingNotes,
  accent,
}: {
  title: string;
  duration: string;
  exercises: { name: string; sets?: number; reps?: string; rest?: string; note?: string }[];
  coachingNotes: string;
  accent: string;
}) {
  const [open, setOpen] = useState(title === 'Strength Work');

  return (
    <div className="bg-white/5 rounded-2xl border border-white/8 overflow-hidden mb-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full" style={{ background: accent }} />
          <div className="text-left">
            <div className="text-white font-bold text-sm">{title}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock size={11} className="text-gray-500" />
              <span className="text-xs text-gray-500">{duration}</span>
            </div>
          </div>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-gray-500" />
        ) : (
          <ChevronDown size={16} className="text-gray-500" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4">
          <div className="space-y-2 mb-4">
            {exercises.map((ex, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                <span className="text-xs font-mono text-gray-600 pt-0.5 w-5">{i + 1}</span>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{ex.name}</div>
                  {(ex.sets || ex.reps) && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {ex.sets && `${ex.sets} sets × `}{ex.reps}
                      {ex.rest && <span className="text-gray-600"> · {ex.rest} rest</span>}
                    </div>
                  )}
                  {ex.note && <div className="text-xs text-gray-600 mt-0.5 italic">{ex.note}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Coach notes */}
          <div className="bg-black/30 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap size={12} style={{ color: accent }} />
              <span className="text-xs font-semibold" style={{ color: accent }}>COACH</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{coachingNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const BLOCK_ACCENTS = ['#00ff88', '#00ccff', '#ff8800', '#ff00aa'];

export default function TodaysProgram() {
  const { state } = useApp();
  const program = getDailyProgram(state.skillLevel, state.goals);

  const levelLabel = state.skillLevel.charAt(0).toUpperCase() + state.skillLevel.slice(1);

  return (
    <div className="px-4 pb-32">
      {/* Header */}
      <div className="pt-12 pb-5">
        <h1 className="text-2xl font-black text-white tracking-tight">
          Today's <span className="text-[#00ff88]">Program</span>
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded-full border border-[#00ff88]/30 text-[#00ff88] font-semibold">
            {levelLabel}
          </span>
          <span className="text-gray-500 text-sm">·</span>
          <span className="text-gray-400 text-sm">
            {program.reduce((a, b) => a + parseInt(b.duration), 0)} min
          </span>
        </div>
      </div>

      {program.map((block, i) => (
        <ProgramBlock
          key={block.title}
          {...block}
          accent={BLOCK_ACCENTS[i % BLOCK_ACCENTS.length]}
        />
      ))}

      <p className="text-center text-gray-600 text-xs mt-4">
        Program adapts as you master skills.<br />
        Tap each block to expand coaching notes.
      </p>
    </div>
  );
}
