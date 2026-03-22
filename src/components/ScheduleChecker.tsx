'use client';
import { useEffect } from 'react';
import { useVoltStore } from '@/lib/store';

export default function ScheduleChecker() {
  const checkSchedules = useVoltStore(state => state.checkSchedules);

  useEffect(() => {
    // Run immediately on mount to catch boundaries
    checkSchedules();
    
    // Check every 30 seconds against current real time for reliability
    const interval = setInterval(() => {
      checkSchedules();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [checkSchedules]);

  return null;
}
