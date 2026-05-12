'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import Onboarding from '@/components/Onboarding';
import Navigation, { Tab } from '@/components/Navigation';
import SkillTree from '@/components/SkillTree';
import WorkoutLogger from '@/components/WorkoutLogger';
import StatsDashboard from '@/components/StatsDashboard';
import TodaysProgram from '@/components/TodaysProgram';

export default function Home() {
  const { state } = useApp();
  const [tab, setTab] = useState<Tab>('program');

  if (!state.onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <main className="min-h-screen bg-[#0d0d0d] max-w-md mx-auto relative">
      <div
        key={tab}
        className="animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        {tab === 'tree' && <SkillTree />}
        {tab === 'log' && <WorkoutLogger />}
        {tab === 'stats' && <StatsDashboard />}
        {tab === 'program' && <TodaysProgram />}
      </div>
      <Navigation active={tab} onChange={setTab} />
    </main>
  );
}
