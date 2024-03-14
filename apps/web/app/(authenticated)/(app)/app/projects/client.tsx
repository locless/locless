'use client';
import { EmptyPlaceholder } from '@/components/dashboard/empty-placeholder';
import { PageHeader } from '@/components/dashboard/page-header';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Separator } from '@repo/ui/components/ui/separator';
import { BookOpen, Code, Search } from 'lucide-react';
import Link from 'next/link';
import { CreateProjectButton } from './create-project-button';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { usePaginatedQuery } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';
import { Loading } from '@/components/dashboard/loading';

interface Props {
    workspaceId: Id<'workspaces'>;
}

export function ProjectList({ workspaceId }: Props) {
    const { results, status, loadMore } = usePaginatedQuery(api.project.get, { workspaceId }, { initialNumItems: 20 });

    if (status === 'LoadingFirstPage' || status === 'LoadingMore') {
        return (
            <div className='flex h-screen items-center justify-center '>
                <Loading />
            </div>
        );
    }

    return (
        <div>
            <PageHeader title='Dashboard' description='Manage your projects' />
            <Separator className='my-6' />
            <section className='my-4 flex flex-col gap-4 md:flex-row md:items-center'>
                <div className='border-border focus-within:border-primary/40 flex h-8 flex-grow items-center gap-2 rounded-md border bg-transparent px-3 py-2 text-sm'>
                    <Search className='h-4 w-4' />
                    <input
                        className='placeholder:text-content-subtle flex-grow bg-transparent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 '
                        placeholder='Search..'
                        onChange={e => {
                            // TODO: make a search logic
                        }}
                    />
                </div>
                <CreateProjectButton key='createProject' workspaceId={workspaceId} />
            </section>
            {results.length ? (
                <ul className='grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-2 xl:grid-cols-3'>
                    {results.map(project => (
                        <Link key={project._id} href={`/app/projects/${project._id}`}>
                            <Card className='hover:border-primary/50 group relative overflow-hidden duration-500 '>
                                <CardHeader>
                                    <div className='flex items-center justify-between'>
                                        <CardTitle className='truncate'>{project.name}</CardTitle>
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
                    <EmptyPlaceholder.Title>No projects found</EmptyPlaceholder.Title>
                    <EmptyPlaceholder.Description>
                        You haven&apos;t created any projects yet. Create one to get started.
                    </EmptyPlaceholder.Description>
                    <div className='flex flex-col items-center justify-center gap-2 md:flex-row'>
                        <CreateProjectButton key='createProject' workspaceId={workspaceId} />
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
