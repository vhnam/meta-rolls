import { useEffect, useState } from 'react';

import { getApi } from '#/hooks/use-ipc';
import { type Roll, type RollScanStatus } from '#/shared/rolls';

/**
 * Asks the main process which linked files still exist. Re-checks whenever the roll's links change.
 * Returns null until the first answer, and for rolls with no linked folder.
 */
export function useRollScanStatus(roll: Roll): RollScanStatus | null {
  const [status, setStatus] = useState<RollScanStatus | null>(null);
  const signature = roll.frames.map((frame) => frame.scanPath ?? '').join('\n');

  useEffect(() => {
    if (!roll.scanFolder) {
      return;
    }
    let cancelled = false;
    getApi()
      .rolls.checkScans(roll.id)
      .then((next) => {
        if (!cancelled) {
          setStatus(next);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [roll.id, roll.scanFolder, signature]);

  return roll.scanFolder ? status : null;
}
