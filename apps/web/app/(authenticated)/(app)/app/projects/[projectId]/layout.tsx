'use client';
import { CopyButton } from '@/components/dashboard/copy-button';
import { CreateComponentButton } from './create-component-button';
import { Navbar } from '@/components/dashboard/navbar';
import { PageHeader } from '@/components/dashboard/page-header';
import { Badge } from '@repo/ui/components/ui/badge';
import { api } from '@repo/backend/convex/_generated/api';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { Loading } from '@/components/dashboard/loading';

type Props = PropsWithChildren<{
    params: {
        projectId: Id<'projects'>;
    };
}>;

export default function ProjectPageLayout(props: Props) {
    const project = useQuery(api.project.getSingle, { projectId: props.params.projectId });

    if (project === null) {
        return notFound();
    }

    if (project === undefined) {
        return (
            <div className='flex h-screen items-center justify-center '>
                <Loading />
            </div>
        );
    }

    const navigation = [
        {
            label: 'Overview',
            href: `/app/projects/${props.params.projectId}`,
            segment: null,
        },
        {
            label: 'Settings',
            href: `/app/projects/${props.params.projectId}/settings`,
            segment: 'settings',
        },
    ];

    return (
        <div>
            <PageHeader
                title={project.name}
                description='Manage your project'
                actions={[
                    <Badge
                        key='projectId'
                        variant='secondary'
                        className='flex justify-between w-full gap-2 font-mono font-medium ph-no-capture'>
                        {project._id}
                        <CopyButton value={project._id} />
                    </Badge>,
                    <CreateComponentButton key='createComponent' projectId={props.params.projectId} />,
                ]}
            />
            <Navbar navigation={navigation} className='z-20' />
            <main className='relative mt-8 mb-20 '>{props.children}</main>
        </div>
    );
}
