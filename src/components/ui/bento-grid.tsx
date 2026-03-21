'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

interface BentoCardProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

interface BentoTitleProps {
  children?: React.ReactNode;
  className?: string;
}

interface BentoDescriptionProps {
  children?: React.ReactNode;
  className?: string;
}

interface BentoContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface BentoFeature {
  id: string;
  title?: string;
  description?: string;
  content: React.ReactNode;
  className?: string;
}

interface BentoGridWithFeaturesProps {
  features: BentoFeature[];
  className?: string;
}

export const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-4 rounded-3xl border border-zinc-800',
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({ id, children, className }: BentoCardProps) => {
  return (
    <div
      id={id}
      className={cn(
        'relative overflow-hidden p-6 sm:p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors',
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoTitle = ({ children, className }: BentoTitleProps) => {
  if (!children) return null;
  return (
    <h3
      className={cn(
        'text-left text-xl tracking-tight text-white md:text-2xl font-semibold',
        className
      )}
    >
      {children}
    </h3>
  );
};

export const BentoDescription = ({ children, className }: BentoDescriptionProps) => {
  if (!children) return null;
  return (
    <p
      className={cn(
        'text-left text-sm md:text-base font-normal text-zinc-400 mx-0 my-2 max-w-sm',
        className
      )}
    >
      {children}
    </p>
  );
};

export const BentoContent = ({ children, className }: BentoContentProps) => {
  return <div className={cn('h-full w-full mt-4', className)}>{children}</div>;
};

export const BentoGridWithFeatures = ({
  features,
  className,
}: BentoGridWithFeaturesProps) => {
  return (
    <div className="relative mb-6">
      <BentoGrid className={className}>
        {features.map((feature) => (
          <BentoCard key={feature.id} id={feature.id} className={feature.className}>
            <BentoTitle>{feature.title}</BentoTitle>
            <BentoDescription>{feature.description}</BentoDescription>
            <BentoContent>{feature.content}</BentoContent>
          </BentoCard>
        ))}
      </BentoGrid>
    </div>
  );
};
