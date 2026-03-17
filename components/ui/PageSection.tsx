'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { usePageLoadAnimation } from '@/hooks/use-page-load-animation';

interface PageSectionProps {
  index: number;
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function PageSection({ index, children, className, staggerDelay = 100 }: PageSectionProps) {
  const { isSectionLoaded } = usePageLoadAnimation(10, {
    staggerDelay,
    initialDelay: 0,
  });
  const loaded = isSectionLoaded(index);

  return (
    <section
      className={cn(
        'page-section opacity-0 transition-all duration-500',
        loaded && 'opacity-100',
        className
      )}
      style={{
        animationDelay: loaded ? `${index * staggerDelay}ms` : '0ms',
      }}
    >
      {children}
    </section>
  );
}

interface StaggeredContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  itemClassName?: string;
}

export function StaggeredContainer({
  children,
  className,
  staggerDelay = 100,
  itemClassName,
}: StaggeredContainerProps) {
  const items = Array.isArray(children) ? children : [children];
  const { isSectionLoaded } = usePageLoadAnimation(items.length, {
    staggerDelay,
  });

  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            'page-section opacity-0 transition-all duration-500',
            isSectionLoaded(index) && 'opacity-100',
            itemClassName
          )}
          style={{
            animationDelay: isSectionLoaded(index) ? `${index * staggerDelay}ms` : '0ms',
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
