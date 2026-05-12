'use client';

import { BookOpen, BarChart2, Calendar, Navigation2 } from 'lucide-react';

export type Tab = 'log' | 'run' | 'stats' | 'program';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'log', label: 'Log', icon: <BookOpen size={20} /> },
  { id: 'run', label: 'Run', icon: <Navigation2 size={20} /> },
  { id: 'stats', label: 'Stats', icon: <BarChart2 size={20} /> },
  { id: 'program', label: 'Today', icon: <Calendar size={20} /> },
];

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function Navigation({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#111]/95 backdrop-blur-sm border-t border-white/10 px-2 pb-safe">
      <div className="flex max-w-md mx-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all duration-200 ${
              active === tab.id ? 'text-[#00ff88]' : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            <span className={`transition-transform duration-200 ${active === tab.id ? 'scale-110' : 'scale-100'}`}>
              {tab.icon}
            </span>
            <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
