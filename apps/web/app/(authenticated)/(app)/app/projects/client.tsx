'use client';
import { EmptyPlaceholder } from '@/components/dashboard/empty-placeholder';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { BookOpen, Code } from 'lucide-react';
import Link from 'next/link';
import { CreateProjectButton } from './create-project-button';
import { Loading } from '@/components/dashboard/loading';
import { useAuth } from '@clerk/nextjs';

interface Projects {
  id: string;
  name: string;
  components: {
    count: number;
  }[];
}

interface Props {
  projects: Projects[];
}

export function ProjectList({ projects }: Props) {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className='flex h-screen items-center justify-center '>
        <Loading />
      </div>
    );
  }

  return (
    <div>
      {projects.length ? (
        <ul className='grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-2 xl:grid-cols-3'>
          {projects.map(project => (
            <Link key={project.id} href={`/app/projects/${project.id}`}>
              <Card className='hover:border-primary/50 group relative overflow-hidden duration-500 '>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='truncate'>{project.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <dl className='divide-y divide-gray-100 text-sm leading-6 '>
                    <div className='flex justify-between gap-x-4 py-3'>
                      <dt className='text-gray-500 dark:text-gray-400'>Components</dt>
                      <dd className='flex items-start gap-x-2'>
                        <div className='font-medium text-gray-900 dark:text-gray-200'>
                          {project.components.at(0)?.count ?? 0}
                        </div>
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </Link>
          ))}
        </ul>
      ) : (
        <EmptyPlaceholder className='my-4 '>
          <EmptyPlaceholder.Icon>
            <Code />
          </EmptyPlaceholder.Icon>
          <EmptyPlaceholder.Title>No projects found</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You haven&apos;t created any projects yet. Create one to get started.
          </EmptyPlaceholder.Description>
          <div className='flex flex-col items-center justify-center gap-2 md:flex-row'>
            <CreateProjectButton key='createProject' />
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
