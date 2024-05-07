'use client';
import { EmptyPlaceholder } from '@/components/dashboard/empty-placeholder';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { BookOpen, Code } from 'lucide-react';
import Link from 'next/link';
import { Loading } from '@/components/dashboard/loading';
import { useEffect, useState } from 'react';
import { getComponents } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';

interface Props {
    params: {
        projectId: string;
    };
}

interface Components {
    id: string;
    name: string;
}

export default function ProjectPage(props: Props) {
    const [components, setComponents] = useState<Components[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);

    const { userId, isLoaded } = useAuth();

    useEffect(() => {
        const fetchProject = async () => {
            setLoading(true);

            const newComponents = await getComponents({
                projectId: props.params.projectId,
                offset,
                headers: {
                    authorization: `${userId}`,
                },
            });

            setComponents(newComponents);
            setOffset(20);
            setLoading(false);
        };

        if (isLoaded) {
            fetchProject();
        }
    }, [props.params.projectId, isLoaded]);

    if (isLoading || !isLoaded) {
        return (
            <div className='flex h-screen items-center justify-center '>
                <Loading />
            </div>
        );
    }

    return (
        <div>
            {components?.length ? (
                <ul className='grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-2 xl:grid-cols-3'>
                    {components.map(component => (
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
