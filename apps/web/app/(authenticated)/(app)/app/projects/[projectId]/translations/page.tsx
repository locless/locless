import { EmptyPlaceholder } from '@/components/dashboard/empty-placeholder';
import { Button } from '@repo/ui/components/ui/button';
import { Table, TableCell, TableBody, TableHeader, TableHead, TableRow } from '@repo/ui/components/ui/table';
import { BookOpen, Code, Pencil } from 'lucide-react';
import Link from 'next/link';
import { getTenantId } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ToggleTranslationStatusButton } from './toggle-translation-status-button';

interface Props {
  params: {
    projectId: string;
  };
}

export default async function ProjectTranslationsPage(props: Props) {
  const tenantId = getTenantId();

  const project = await db.query.projects.findFirst({
    where: (table, { eq, and, isNull }) => and(eq(table.id, props.params.projectId), isNull(table.deletedAt)),
    with: {
      workspace: true,
      translations: {
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
      {project.translations?.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[100px]'>Translation</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>IsEnabled</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead className='text-right'>Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.translations.map(translation => (
              <TableRow key={translation.id}>
                <TableCell className='font-medium'>{translation.name}</TableCell>
                <TableCell>{translation.size}</TableCell>
                <TableCell>
                  <ToggleTranslationStatusButton
                    translationId={translation.id}
                    enabled={translation.enabled}
                    name={translation.name}
                  />
                </TableCell>
                <TableCell>{JSON.stringify(translation.stats ?? {})}</TableCell>
                <TableCell className='text-right'>
                  <Link href={`/app/projects/${project.id}/translations/${translation.id}`}>
                    <Button variant='secondary' className='w-full items-center gap-2 '>
                      <Pencil className='h-4 w-4 md:h-5 md:w-5' />
                    </Button>
                  </Link>
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
          <EmptyPlaceholder.Title>No translations found</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You haven&apos;t created any translations yet. Create one to get started.
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
