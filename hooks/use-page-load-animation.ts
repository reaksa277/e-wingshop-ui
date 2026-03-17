'use client';

import { useState, useEffect, useCallback } from 'react';

interface PageLoadOptions {
  staggerDelay?: number;
  initialDelay?: number;
}

export function usePageLoadAnimation(sectionCount: number, options: PageLoadOptions = {}) {
  const { staggerDelay = 100, initialDelay = 0 } = options;
  const [loadedSections, setLoadedSections] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    for (let i = 0; i < sectionCount; i++) {
      const timeout = setTimeout(
        () => {
          setLoadedSections((prev) => new Set(prev).add(i));
        },
        initialDelay + i * staggerDelay
      );

      timeouts.push(timeout);
    }

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [sectionCount, staggerDelay, initialDelay]);

  const isSectionLoaded = useCallback(
    (index: number) => loadedSections.has(index),
    [loadedSections]
  );

  return { loadedSections, isSectionLoaded };
}
