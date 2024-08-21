import { PropsWithChildren } from 'react';
import { DesktopSidebar } from './desktop-sidebar';
import { DesktopTopBar } from './desktop-topbar';

export default async function Layout({ children }: PropsWithChildren) {
  return (
    <div className='relative flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950'>
      <div className='relative flex flex-1 bg-gray-100 lg:flex-row dark:bg-gray-950'>
        <DesktopSidebar className='hidden lg:flex flex-col' />
        <div className='w-full flex flex-col'>
          <DesktopTopBar className='flex items-center' />
          {children}
        </div>
      </div>
    </div>
  );
}
