'use client';
import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/ui/tooltip';
import { cn } from '@repo/ui/lib/utils';
import { BookOpen, Code, Loader2, LucideIcon, Settings, HandCoins } from 'lucide-react';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { useTransition } from 'react';
import { OrganizationSwitcher } from '@clerk/nextjs';

type Props = {
  className?: string;
};

type NavItem = {
  disabled?: boolean;
  tooltip?: string;
  icon: LucideIcon;
  href: string;
  external?: boolean;
  label: string;
  active?: boolean;
  tag?: React.ReactNode;
};

export const DesktopSidebar: React.FC<Props> = ({ className }) => {
  const segments = useSelectedLayoutSegments();
  const generalNavigation: NavItem[] = [
    {
      icon: Settings,
      href: '/app/settings/general',
      label: 'Settings',
      active: segments.at(0) === 'settings',
    },
    {
      icon: BookOpen,
      href: '/docs',
      external: true,
      label: 'Docs',
    },
    {
      icon: HandCoins,
      href: '/app/billing',
      active: segments.at(0) === 'billing',
      label: 'Billing',
    },
  ];

  const editorNavigation: NavItem[] = [
    {
      icon: Code,
      href: '/app/projects',
      label: 'Projects',
      active: segments.length === 1 && segments.at(0) === 'projects',
    },
  ];

  const firstOfNextMonth = new Date();
  firstOfNextMonth.setUTCMonth(firstOfNextMonth.getUTCMonth() + 1);
  firstOfNextMonth.setDate(1);

  return (
    <aside className={cn('w-64 px-6 z-10', className)}>
      <div className='py-4'>
        <OrganizationSwitcher createOrganizationUrl='/new' />
      </div>
      <nav className='flex flex-col flex-1 flex-grow mt-4'>
        <ul className='flex flex-col flex-1 gap-y-7'>
          <li>
            <h2 className='text-xs font-semibold leading-6 text-content'>General</h2>
            <ul className='mt-2 -mx-2 space-y-1'>
              {generalNavigation.map(item => (
                <li key={item.label}>
                  <NavLink item={item} />
                </li>
              ))}
            </ul>
          </li>
          <li>
            <h2 className='text-xs font-semibold leading-6 text-content'>Editor</h2>
            <ul className='mt-2 -mx-2 space-y-1'>
              {editorNavigation.map(item => (
                <li key={item.label}>
                  <NavLink item={item} />
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

const NavLink: React.FC<{ item: NavItem }> = ({ item }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const link = (
    <Link
      prefetch
      href={item.href}
      onClick={() => {
        if (!item.external) {
          startTransition(() => {
            router.push(item.href);
          });
        }
      }}
      target={item.external ? '_blank' : undefined}
      className={cn(
        'group flex gap-x-2 rounded-md px-2 py-1 text-sm  font-medium leading-6 items-center hover:bg-gray-200 dark:hover:bg-gray-800 justify-between',
        {
          'bg-gray-200 dark:bg-gray-800': item.active,
          'text-content-subtle pointer-events-none': item.disabled,
        }
      )}>
      <div className='flex group gap-x-2'>
        <span className='text-content-subtle border-border group-hover:shadow  flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
          {isPending ? (
            <Loader2 className='w-4 h-4 shrink-0 animate-spin' />
          ) : (
            <item.icon className='w-4 h-4 shrink-0' aria-hidden='true' />
          )}
        </span>
        <p className='truncate whitespace-nowrap'>{item.label}</p>
      </div>
      {item.tag}
    </Link>
  );

  if (item.tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger className='w-full'>
          {link}
          <TooltipContent>{item.tooltip}</TooltipContent>
        </TooltipTrigger>
      </Tooltip>
    );
  }
  return link;
};
