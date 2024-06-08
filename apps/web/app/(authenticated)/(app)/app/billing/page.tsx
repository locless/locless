import { PageHeader } from '@/components/dashboard/page-header';

import { Separator } from '@repo/ui/components/ui/separator';
import Link from 'next/link';
import { DesktopTopBar } from '../desktop-topbar';
import { getTenantId } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function BillingPage() {
  const tenantId = getTenantId();

  const workspace = await db.query.workspaces.findFirst({
    where: (table, { and, eq, isNull }) => and(eq(table.tenantId, tenantId), isNull(table.deletedAt)),
  });

  if (!workspace) {
    return redirect('/');
  }

  const unpaid = workspace.plan === 'free';

  return (
    <>
      <DesktopTopBar className='flex items-center' />
      <div className='p-4 border-l bg-background border-border w-full flex-1 lg:p-8'>
        <PageHeader title='Billing' description='Manage your billing' />
        <Separator className='my-6' />
        {unpaid ? (
          <div>
            <div className='mt-10 flex min-h-[400px] flex-col items-center  justify-center space-y-6 rounded-lg border border-dashed px-4 md:mt-24'>
              <h3 className='text-center text-xl font-semibold leading-none tracking-tight md:text-2xl'>
                Please add billing to your account
              </h3>
              <p className='text-center text-sm text-gray-500 md:text-base'>
                This page will be active once you add billing to your account.
              </p>
              <Link
                href='/app/billing/stripe/hobby'
                target='_blank'
                className='mr-3 rounded-lg bg-gray-800 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-800'>
                Hobby Plan
              </Link>
              <Link
                href='/app/billing/stripe/pro'
                target='_blank'
                className='mr-3 rounded-lg bg-gray-800 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-800'>
                Pro Plan
              </Link>
            </div>
          </div>
        ) : (
          <Link
            href='/app/billing/stripe/manage'
            target='_blank'
            className='mr-3 rounded-lg bg-gray-800 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-800'>
            Manage billing
          </Link>
        )}
      </div>
    </>
  );
}
