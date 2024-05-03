'use client';
import { EmptyPlaceholder } from '@/components/dashboard/empty-placeholder';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { BookOpen, Code } from 'lucide-react';
import Link from 'next/link';
import { CreateProjectButton } from './create-project-button';
import { Loading } from '@/components/dashboard/loading';
import { useEffect, useState } from 'react';
import { getProjects } from '@/lib/api';

interface Props {
    workspaceId: string;
}

interface Projects {
    name: string;
    id: string;
}

export function ProjectList({ workspaceId }: Props) {
    const [projects, setProjects] = useState<Projects[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);

            const newProjects = await getProjects({
                workspaceId,
                offset,
            });

            setProjects(newProjects);
            setOffset(20);
            setLoading(false);
        };

        fetchProjects();
    }, [workspaceId]);

    if (isLoading) {
        return (
            <div className='flex h-screen items-center justify-center '>
                <Loading />
            </div>
        );
    }

    return (
        <div>
            {projects?.length ? (
                <ul className='grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-2 xl:grid-cols-3'>
                    {projects.map(project => (
                        <Link key={project.id} href={`/app/projects/${project.id}`}>
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
