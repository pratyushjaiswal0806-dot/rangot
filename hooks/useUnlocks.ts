'use client';
// Which unlocks this browser has earned, kept current as progress changes.
import { useEffect, useState } from 'react';
import { UNLOCKS, isUnlocked, load, onProgress, type UnlockId } from '../lib/progress';

export function useUnlocks(): Record<UnlockId, boolean> {
  const none = Object.fromEntries(UNLOCKS.map((u) => [u.id, false])) as Record<UnlockId, boolean>;
  const [got, setGot] = useState(none);
  useEffect(() => {
    const read = () => { const s = load(); setGot(Object.fromEntries(UNLOCKS.map((u) => [u.id, isUnlocked(u.id, s)])) as Record<UnlockId, boolean>); };
    read();
    return onProgress(read);
  }, []);
  return got;
}

export const unlockHint = (id: UnlockId) => { const u = UNLOCKS.find((x) => x.id === id)!; return `${u.how} to unlock ${u.label}`; };
