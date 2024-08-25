import { EmptyPlaceholder } from '@/components/dashboard/empty-placeholder';
import { Button } from '@repo/ui/components/ui/button';
import { Table, TableCell, TableBody, TableHeader, TableHead, TableRow } from '@repo/ui/components/ui/table';
import { BookOpen, Code } from 'lucide-react';
import Link from 'next/link';
import { getTenantId } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ToggleComponentStatusButton } from './toggle-component-status-button';
import { DeleteComponentButton } from './delete-component-button';

interface Props {
  params: {
    projectId: string;
  };
}

export default async function ProjectPage(props: Props) {
  const tenantId = getTenantId();

  const project = await db.query.projects.findFirst({
    where: (table, { eq, and, isNull }) => and(eq(table.id, props.params.projectId), isNull(table.deletedAt)),
    with: {
      workspace: true,
      components: {
        limit: 20,
        where: (table, { isNull }) => isNull(table.deletedAt),
      },
    },
  });

  if (!project || project.workspace.tenantId !== tenantId) {
    return notFound();
  }

  return (
    <div>
      {project.components?.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[100px]'>Component</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>IsEnabled</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.components.map(component => (
              <TableRow key={component.id}>
                <TableCell className='font-medium'>{component.name}</TableCell>
                <TableCell>{component.size}</TableCell>
                <TableCell>
                  <ToggleComponentStatusButton
                    componentId={component.id}
                    enabled={component.enabled}
                    name={component.name}
                  />
                </TableCell>
                <TableCell>{JSON.stringify(component.stats ?? {})}</TableCell>
                <TableCell className='text-right'>
                  <DeleteComponentButton id={component.id} name={component.name} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyPlaceholder className='my-4 '>
          <EmptyPlaceholder.Icon>
            <Code />
          </EmptyPlaceholder.Icon>
          <EmptyPlaceholder.Title>No components found</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You haven&apos;t created any components yet. Create one to get started.
          </EmptyPlaceholder.Description>
          <div className='flex flex-col items-center justify-center gap-2 md:flex-row'>
            <Link href='/docs' target='_blank'>
              <Button variant='secondary' className='w-full items-center gap-2 '>
                <BookOpen className='h-4 w-4 md:h-5 md:w-5' />
                Read the docs
              </Button>
            </Link>
          </div>
        </EmptyPlaceholder>
      )}
    </div>
  );
}
