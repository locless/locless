import { PageHeader } from '@/components/dashboard/page-header';
import { CreateProjectButton } from './create-project-button';

import { Separator } from '@repo/ui/components/ui/separator';
import Link from 'next/link';
import { ProjectList } from './client';
import { getTenantId } from '@/lib/auth';
import { and, db, eq, isNull, schema, sql, Workspace } from '@/lib/db';
import { redirect } from 'next/navigation';
import { defaultProSubscriptions } from '@repo/billing';
import { newId } from '@repo/id';

export default async function ProjectsOverviewPage() {
  const tenantId = getTenantId();

  let workspace = await db.query.workspaces.findFirst({
    where: (table, { and, eq, isNull }) => and(eq(table.tenantId, tenantId), isNull(table.deletedAt)),
    with: {
      projects: {
        where: (table, { isNull }) => isNull(table.deletedAt),
      },
    },
  });

  if (!workspace) {
    const subscriptions = defaultProSubscriptions();

    const newWorkspace: Workspace = {
      id: newId('workspace'),
      tenantId,
      name: tenantId.includes('org') ? 'Organization' : 'Personal',
      plan: 'free',
      stripeCustomerId: null,
      subscriptions,
      createdAt: new Date(),
      deletedAt: null,
      enabled: true,
      isPersonal: !tenantId.includes('org'),
      isUsageExceeded: false,
      planChanged: null,
      planDowngradeRequest: null,
      size: 0,
    };

    try {
      await db.insert(schema.workspaces).values(newWorkspace);
      workspace = { ...newWorkspace, projects: [] };
    } catch (e) {
      return redirect('/');
    }
  }

  const projects = await Promise.all(
    workspace.projects.map(async project => ({
      id: project.id,
      name: project.name,
      components: await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.components)
        .where(and(eq(schema.components.projectId, project.id!), isNull(schema.components.deletedAt))),
    }))
  );

  const unpaid = workspace.tenantId.startsWith('org_') && workspace.plan === 'free';

  return (
    <div className='p-4 border-l bg-background border-border w-full flex-1 lg:p-8'>
      <PageHeader
        title='Dashboard'
        description='Manage your projects'
        actions={[<CreateProjectButton disabled={unpaid} />]}
      />
      <Separator className='my-6' />
      {unpaid ? (
        <div>
          <div className='mt-10 flex min-h-[400px] flex-col items-center  justify-center space-y-6 rounded-lg border border-dashed px-4 md:mt-24'>
            <h3 className='text-center text-xl font-semibold leading-none tracking-tight md:text-2xl'>
              Please add billing to your account
            </h3>
            <p className='text-center text-sm text-gray-500 md:text-base'>
              Team workspaces is a paid feature. Please add billing to your account to continue using it.
            </p>
            <Link
              href='/app/billing'
              className='mr-3 rounded-lg bg-gray-800 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-800'>
              Add billing
            </Link>
          </div>
        </div>
      ) : (
        <ProjectList projects={projects} />
      )}
    </div>
  );
}
