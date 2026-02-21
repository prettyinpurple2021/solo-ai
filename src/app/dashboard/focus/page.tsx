'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FocusMode } from '@/components/FocusMode';

export const dynamic = 'force-dynamic';

export default function FocusPage() {
  const router = useRouter();

  const handleExit = () => {
    router.push('/dashboard');
  };

  const handleComplete = (taskId: string) => {
    // In standalone mode, we just exit after completion
    // The gamification logic is handled inside FocusMode
    router.push('/dashboard');
  };

  return (
    <FocusMode 
      activeTask={null} 
      onExit={handleExit} 
      onComplete={handleComplete} 
    />
  );
}
