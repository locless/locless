import { CopyButton } from '@/components/dashboard/copy-button';
import { Navbar } from '@/components/dashboard/navbar';
import { PageHeader } from '@/components/dashboard/page-header';
import { Badge } from '@repo/ui/components/ui/badge';
import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { DesktopTopBar } from '../../desktop-topbar';
import { getTenantId } from '@/lib/auth';
import { db } from '@/lib/db';

type Props = PropsWithChildren<{
  params: {
    projectId: string;
  };
}>;

export default async function ProjectPageLayout(props: Props) {
  const tenantId = getTenantId();

  const project = await db.query.projects.findFirst({
    where: (table, { eq, and, isNull }) => and(eq(table.id, props.params.projectId), isNull(table.deletedAt)),
    with: {
      workspace: true,
    },
  });

  if (!project || project.workspace.tenantId !== tenantId) {
    return notFound();
  }

  const navigation = [
    {
      label: 'Overview',
      href: `/app/projects/${project.id}`,
      segment: null,
    },
    {
      label: 'Settings',
      href: `/app/projects/${project.id}/settings`,
      segment: 'settings',
    },
  ];

  return (
    <div className='border-l bg-background border-border flex-1 p-8'>
      <PageHeader
        title={project.name}
        description='Manage your project'
        actions={[
          <Badge
            key='projectId'
            variant='secondary'
            className='flex justify-between w-full gap-2 font-mono font-medium ph-no-capture'>
            {project.id}
            <CopyButton value={project.id} />
          </Badge>,
        ]}
      />
      <Navbar navigation={navigation} className='z-20' />
      <main className='relative mt-8 mb-20 '>{props.children}</main>
    </div>
  );
}
