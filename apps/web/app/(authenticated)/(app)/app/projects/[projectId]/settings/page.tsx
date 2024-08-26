import { CopyButton } from '@/components/dashboard/copy-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Code } from '@repo/ui/components/ui/code';
import { notFound } from 'next/navigation';
import { DeleteProject } from './delete-project';
import { UpdateProjectName } from './update-project-name';
import { getTenantId } from '@/lib/auth';
import { db, eq, schema } from '@/lib/db';
import { unkey, unkey_api_id } from '@/lib/unkey';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/components/ui/table';
import { DeleteKeyButton } from './delete-key-button';
import { UpdateKeyButton } from './update-key-button';
import { CreateKeyButton } from './create-key-button';

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
    return notFound();
  }

  const project = workspace.projects.find(project => project.id === props.params.projectId);

  if (!project) {
    return notFound();
  }

  const listKeys = await unkey.apis.listKeys({
    apiId: unkey_api_id,
    limit: 100,
    ownerId: project.id,
  });

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
        <CardHeader className='flex items-center justify-between flex-row'>
          <div className='mr-auto flex flex-col gap-2'>
            <CardTitle>Project Keys</CardTitle>
            <CardDescription>This are your project keys.</CardDescription>
          </div>
          <CreateKeyButton projectId={project.id} numberOfKeys={listKeys.result?.keys.length ?? 0} />
        </CardHeader>
        <CardContent className='gap-4'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listKeys.result &&
                listKeys.result.keys.map(key => (
                  <TableRow key={key.id}>
                    <TableCell className='font-medium'>{key.name}</TableCell>
                    <TableCell>{new Date(key.createdAt).toLocaleDateString('en-US')}</TableCell>
                    <TableCell>
                      {(key.permissions ?? []).map(p => (p === 'api.private_key' ? 'Private Key' : 'Public Key'))}
                    </TableCell>
                    <TableCell className='flex gap-2 items-center justify-end'>
                      <UpdateKeyButton keyId={key.id} name={key.name} projectId={project.id} enabled={key.enabled} />
                      <DeleteKeyButton id={key.id} name={key.name} projectId={project.id} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <DeleteProject name={project.name} id={project.id} />
    </div>
  );
}
