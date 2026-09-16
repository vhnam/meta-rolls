import { useEffect, useState } from 'react';

import { preloadMediaImage } from '#/utils/preview/photo-rotate';

export const useHeldMediaSrc = (src: string | null) => {
  const [heldSrc, setHeldSrc] = useState(src);

  if (src === null && heldSrc !== null) {
    setHeldSrc(null);
  } else if (src !== null && heldSrc === null) {
    setHeldSrc(src);
  }

  useEffect(() => {
    if (!src || src === heldSrc) {
      return;
    }

    let cancelled = false;
    void preloadMediaImage(src)
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) {
          setHeldSrc(src);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [heldSrc, src]);

  return heldSrc;
};
