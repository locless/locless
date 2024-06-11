import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CreateOrganizationComponent from './create-organization';

export default async function CreateOrganizationPage() {
  const { userId } = auth();

  if (!userId) {
    return notFound();
  }

  const workspace = await db.query.workspaces.findFirst({
    where: (table, { and, eq, isNull }) => and(eq(table.tenantId, userId), isNull(table.deletedAt)),
  });

  if (!workspace) {
    return notFound();
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-2'>
      {workspace.plan === 'free' ? (
        <>
          <p className='text-center'>
            You are on a free plan.
            <br />
            Only paid users can create organizations.
          </p>
          <Link
            href='/app/billing'
            className='mt-4 rounded-lg bg-gray-800 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-800'>
            Go to billing
          </Link>
        </>
      ) : (
        <CreateOrganizationComponent />
      )}
    </div>
  );
}
