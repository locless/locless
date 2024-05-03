import { CopyButton } from '@/components/dashboard/copy-button';
import { Navbar } from '@/components/dashboard/navbar';
import { PageHeader } from '@/components/dashboard/page-header';
import { Badge } from '@repo/ui/components/ui/badge';
import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { Loading } from '@/components/dashboard/loading';
import { DesktopTopBar } from '../../desktop-topbar';
import { getProject } from '@/lib/api';

type Props = PropsWithChildren<{
    params: {
        projectId: string;
    };
}>;

export default async function ProjectPageLayout(props: Props) {
    const project = await getProject({ projectId: props.params.projectId });

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
        <>
            <DesktopTopBar className='flex items-center' />
            <div className='border-l bg-background border-border flex-1 p-8'>
                <PageHeader
                    title={project.name}
                    description='Manage your project'
                    actions={[
                        <Badge
                            key='projectId'
                            variant='secondary'
                            className='flex justify-between w-full gap-2 font-mono font-medium ph-no-capture'>
                            {project.id}
                            <CopyButton value={project.id} />
                        </Badge>,
                    ]}
                />
                <Navbar navigation={navigation} className='z-20' />
                <main className='relative mt-8 mb-20 '>{props.children}</main>
            </div>
        </>
    );
}
