import { EmptyPlaceholder } from '@/components/dashboard/empty-placeholder';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { BookOpen, Code } from 'lucide-react';
import Link from 'next/link';
import { getTenantId } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

interface Props {
  params: {
    projectId: string;
  };
}

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

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
    return redirect('/new');
  }

  return (
    <div>
      {project.components?.length ? (
        <ul className='grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-2 xl:grid-cols-3'>
          {project.components.map(component => (
            <Link key={component.id} href={`/app/editor/${props.params.projectId}/${component.id}`}>
              <Card className='hover:border-primary/50 group relative overflow-hidden duration-500 '>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='truncate'>{component.name}</CardTitle>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </ul>
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
