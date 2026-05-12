'use client';

import { useState } from 'react';
import { X, CheckCircle, Lock, Circle, ChevronUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { SKILL_NODES, TRACK_CONFIG } from '@/lib/skillData';
import { canUnlockNode } from '@/lib/utils';
import type { SkillNode, Track } from '@/lib/types';

const TRACKS: Track[] = ['push', 'pull', 'core', 'legs'];

function NodeIcon({ state }: { state: string }) {
  if (state === 'mastered') return <CheckCircle size={14} className="text-[#00ff88]" />;
  if (state === 'unlocked') return <Circle size={14} className="text-white" />;
  return <Lock size={14} className="text-gray-600" />;
}

function SkillNodeDetail({ node, onClose }: { node: SkillNode; onClose: () => void }) {
  const { state, markNodeMastered } = useApp();
  const nodeState = state.nodeStates[node.id] ?? 'locked';
  const canMark = nodeState === 'unlocked';
  const cfg = TRACK_CONFIG[node.track];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end p-4" onClick={onClose}>
      <div
        className="w-full max-w-md mx-auto bg-[#1a1a1a] rounded-2xl p-6 pb-8 border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs font-semibold tracking-widest mb-1" style={{ color: cfg.color }}>
              {cfg.label.toUpperCase()} · LEVEL {node.level + 1}
            </div>
            <h2 className="text-xl font-bold text-white">{node.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-4">{node.description}</p>

        {/* Video placeholder */}
        <div className="bg-white/5 border border-white/10 rounded-xl h-36 flex items-center justify-center mb-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-white ml-1" />
            </div>
            <p className="text-gray-500 text-xs">Tutorial video</p>
          </div>
        </div>

        {/* Standard */}
        <div className="bg-white/5 rounded-xl p-3 mb-4">
          <div className="text-xs text-gray-500 mb-1">STRENGTH STANDARD</div>
          <div className="text-white font-semibold">{node.strengthStandard}</div>
        </div>

        {/* Form cues */}
        <div className="mb-5">
          <div className="text-xs text-gray-500 mb-2">FORM CUES</div>
          <ul className="space-y-1.5">
            {node.formCues.map((cue, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-[#00ff88] mt-0.5">→</span>
                {cue}
              </li>
            ))}
          </ul>
        </div>

        {/* State badge + action */}
        <div className="flex items-center gap-3">
          <div className={`flex-1 text-center py-2 rounded-xl text-sm font-semibold border ${
            nodeState === 'mastered'
              ? 'border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88]'
              : nodeState === 'unlocked'
              ? 'border-white/20 bg-white/5 text-white'
              : 'border-white/10 bg-white/5 text-gray-600'
          }`}>
            {nodeState === 'mastered' ? '✓ Mastered' : nodeState === 'unlocked' ? 'In Progress' : 'Locked'}
          </div>
          {canMark && (
            <button
              onClick={() => { markNodeMastered(node.id); onClose(); }}
              className="flex-1 py-2 rounded-xl bg-[#00ff88] text-black font-bold text-sm hover:bg-[#00dd77] transition-colors active:scale-95"
            >
              Mark Mastered
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TrackColumn({ track }: { track: Track }) {
  const { state } = useApp();
  const [selected, setSelected] = useState<SkillNode | null>(null);
  const nodes = SKILL_NODES.filter((n) => n.track === track).sort((a, b) => a.level - b.level);
  const cfg = TRACK_CONFIG[track];

  return (
    <div className="flex-1 min-w-0">
      {/* Track header */}
      <div className="text-center mb-3">
        <div className="text-lg mb-0.5">{cfg.emoji}</div>
        <div className="text-xs font-bold tracking-widest text-gray-400">{cfg.label.toUpperCase()}</div>
      </div>

      {/* Nodes */}
      <div className="flex flex-col items-center gap-0">
        {[...nodes].reverse().map((node, idx) => {
          const nodeState = state.nodeStates[node.id] ?? 'locked';
          const isLast = idx === nodes.length - 1;

          return (
            <div key={node.id} className="flex flex-col items-center">
              {/* Connector line above (except first rendered = top node) */}
              {idx > 0 && (
                <div
                  className="w-0.5 h-5"
                  style={{
                    background:
                      nodeState === 'mastered'
                        ? cfg.color
                        : nodeState === 'unlocked'
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(255,255,255,0.06)',
                  }}
                />
              )}

              {/* Node button */}
              <button
                onClick={() => setSelected(node)}
                className={`relative w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95 ${
                  nodeState === 'mastered'
                    ? 'border-[#00ff88] bg-[#00ff88]/15'
                    : nodeState === 'unlocked'
                    ? 'border-white/40 bg-white/8 hover:border-white/60'
                    : 'border-white/8 bg-white/3'
                }`}
                style={nodeState === 'mastered' ? { borderColor: cfg.color, backgroundColor: `${cfg.color}20` } : {}}
              >
                <NodeIcon state={nodeState} />
                <span
                  className="text-[8px] font-bold leading-tight text-center px-1 line-clamp-2 max-w-full"
                  style={{
                    color:
                      nodeState === 'mastered' ? cfg.color : nodeState === 'unlocked' ? '#ffffff' : '#4b5563',
                  }}
                >
                  {node.name.split(' ').slice(0, 2).join(' ')}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {selected && selected.track === track && (
        <SkillNodeDetail node={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default function SkillTree() {
  const { state } = useApp();

  const totalNodes = SKILL_NODES.length;
  const masteredNodes = Object.values(state.nodeStates).filter((s) => s === 'mastered').length;
  const progressPct = Math.round((masteredNodes / totalNodes) * 100);

  return (
    <div className="px-3 pb-24">
      {/* Header */}
      <div className="pt-12 pb-4">
        <h1 className="text-2xl font-black text-white tracking-tight">
          Skill <span className="text-[#00ff88]">Tree</span>
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00ff88] rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 font-mono">{masteredNodes}/{totalNodes}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-5 text-xs text-gray-500">
        <span className="flex items-center gap-1"><CheckCircle size={11} className="text-[#00ff88]" /> Mastered</span>
        <span className="flex items-center gap-1"><Circle size={11} className="text-white/60" /> Unlocked</span>
        <span className="flex items-center gap-1"><Lock size={11} className="text-gray-700" /> Locked</span>
      </div>

      {/* Skill columns */}
      <div className="flex gap-2">
        {TRACKS.map((track) => (
          <TrackColumn key={track} track={track} />
        ))}
      </div>

      <p className="text-center text-gray-600 text-xs mt-6">Tap any node to view details</p>
    </div>
  );
}
