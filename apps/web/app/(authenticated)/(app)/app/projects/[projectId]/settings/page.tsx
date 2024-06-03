import { CopyButton } from '@/components/dashboard/copy-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Code } from '@repo/ui/components/ui/code';
import { notFound, redirect } from 'next/navigation';
import { DeleteProject } from './delete-project';
import { UpdateProjectName } from './update-project-name';
import { getTenantId } from '@/lib/auth';
import KeyCard from './key-card';
import { db, eq, schema } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Props = {
  params: {
    projectId: string;
  };
};

export default async function SettingsPage(props: Props) {
  const tenantId = getTenantId();

  const workspace = await db.query.workspaces.findFirst({
    where: (table, { and, eq, isNull }) => and(eq(table.tenantId, tenantId), isNull(table.deletedAt)),
    with: {
      projects: {
        where: eq(schema.projects.id, props.params.projectId),
      },
    },
  });

  if (!workspace || workspace.tenantId !== tenantId) {
    return redirect('/');
  }

  const project = workspace.projects.find(project => project.id === props.params.projectId);

  if (!project) {
    return notFound();
  }

  return (
    <div className='flex flex-col gap-8 mb-20 '>
      <UpdateProjectName project={project} />
      <Card>
        <CardHeader>
          <CardTitle>Project ID</CardTitle>
          <CardDescription>This is your project id.</CardDescription>
        </CardHeader>
        <CardContent>
          <Code className='flex items-center justify-between w-full h-8 max-w-sm gap-4'>
            <pre>{project.id}</pre>
            <div className='flex items-start justify-between gap-4'>
              <CopyButton value={project.id} />
            </div>
          </Code>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Project Keys</CardTitle>
          <CardDescription>This are your project keys.</CardDescription>
        </CardHeader>
        <CardContent className='gap-4'>
          <KeyCard
            key='public-key'
            title='Public key:'
            projectId={project.id}
            serverKey={project.keyPublic}
            keyType='public'
          />
          <KeyCard
            key='private-key'
            title='Private key:'
            projectId={project.id}
            serverKey={project.keyAuth}
            keyType='private'
          />
        </CardContent>
      </Card>
      <DeleteProject name={project.name} id={project.id} />
    </div>
  );
}
