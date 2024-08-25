import { cn } from '@repo/ui/lib/utils';
import React from 'react';
import { UserButton } from '@clerk/nextjs';

type Props = {
  className?: string;
};

export const DesktopTopBar: React.FC<Props> = ({ className }) => {
  return (
    <aside className={cn('w-full pr-6 z-10 py-4', className)}>
      <div className='ml-auto'>
        <UserButton afterSignOutUrl='/' />
      </div>
    </aside>
  );
};
