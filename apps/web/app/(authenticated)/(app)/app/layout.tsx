import { PropsWithChildren } from 'react';
import { DesktopSidebar } from './desktop-sidebar';
import { getTenantId } from '@/lib/auth';
import { Workspace, db, schema } from '@/lib/db';
import { newId } from '@repo/id';
import { redirect } from 'next/navigation';
import { defaultProSubscriptions } from '@repo/billing';
import { DesktopTopBar } from './desktop-topbar';

export default async function Layout({ children }: PropsWithChildren) {
  const tenantId = getTenantId();

  const workspace = await db.query.workspaces.findFirst({
    where: (table, { and, eq, isNull }) => and(eq(table.tenantId, tenantId), isNull(table.deletedAt)),
  });

  const subscriptions = defaultProSubscriptions();

  if (!workspace) {
    const workspace: Workspace = {
      id: newId('workspace'),
      tenantId,
      name: tenantId.includes('org') ? 'Organization' : 'Personal',
      plan: 'free',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptions,
      createdAt: new Date(),
      deletedAt: null,
      enabled: true,
      isPersonal: !tenantId.includes('org'),
      canReverseDeletion: true,
      isUsageExceeded: false,
      planChanged: null,
      planDowngradeRequest: null,
      size: 0,
    };

    try {
      await db.insert(schema.workspaces).values(workspace);

      return redirect('/app/projects');
    } catch (e) {
      return redirect('/');
    }
  }

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
