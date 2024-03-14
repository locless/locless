'use client';
import { EmptyPlaceholder } from '@/components/dashboard/empty-placeholder';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { BookOpen, Code } from 'lucide-react';
import Link from 'next/link';
import { CreateComponentButton } from './create-component-button';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { usePaginatedQuery } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';
import { Loading } from '@/components/dashboard/loading';

interface Props {
    params: {
        projectId: Id<'projects'>;
    };
}

export default function ProjectPage(props: Props) {
    const { results, status, loadMore } = usePaginatedQuery(
        api.component.get,
        { projectId: props.params.projectId },
        { initialNumItems: 20 }
    );

    if (status === 'LoadingFirstPage' || status === 'LoadingMore') {
        return (
            <div className='flex h-screen items-center justify-center '>
                <Loading />
            </div>
        );
    }

    return (
        <div>
            {results.length ? (
                <ul className='grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-2 xl:grid-cols-3'>
                    {results.map(component => (
                        <Link key={component._id} href={`/app/editor/${props.params.projectId}/${component._id}`}>
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
                        <CreateComponentButton key='createComponent' projectId={props.params.projectId} />
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
