'use client';
import { CopyButton } from '@/components/dashboard/copy-button';
import { PageHeader } from '@/components/dashboard/page-header';
import { Badge } from '@repo/ui/components/ui/badge';
import { api } from '@repo/backend/convex/_generated/api';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { notFound } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { Loading } from '@/components/dashboard/loading';
import { CreateNodeButton } from './create-node-button';
import { Separator } from '@repo/ui/components/ui/separator';
import { SaveNodeButton } from './save-node-button';
import { PreviewNodeButton } from './preview-node-button';
import { CreateComponentProp } from './create-component-prop';

type Props = PropsWithChildren<{
    params: {
        projectId: Id<'projects'>;
        componentId: Id<'components'>;
    };
}>;

export default function ProjectPageLayout(props: Props) {
    const component = useQuery(api.component.getSingle, {
        projectId: props.params.projectId,
        componentId: props.params.componentId,
    });

    if (component === null) {
        return notFound();
    }

    if (component === undefined) {
        return (
            <div className='flex h-screen items-center justify-center '>
                <Loading />
            </div>
        );
    }

    return (
        <div className='flex flex-col h-full'>
            <PageHeader
                title={component.name}
                description='Manage your component'
                actions={[
                    <Badge
                        key='componentId'
                        variant='secondary'
                        className='flex justify-between w-full gap-2 font-mono font-medium ph-no-capture'>
                        {component._id}
                        <CopyButton value={component._id} />
                    </Badge>,
                    <CreateComponentProp key='createProp' />,
                    <CreateNodeButton key='createNode' />,
                    <PreviewNodeButton
                        key='previewNode'
                        projectId={props.params.projectId}
                        componentId={props.params.componentId}
                    />,
                    <SaveNodeButton key='saveNode' componentId={props.params.componentId} />,
                ]}
            />
            <Separator />
            <main className='relative mt-8 flex flex-1'>{props.children}</main>
        </div>
    );
}
