'use client';
import { CopyButton } from '@/components/dashboard/copy-button';
import { PageHeader } from '@/components/dashboard/page-header';
import { Badge } from '@repo/ui/components/ui/badge';
import { api } from '@repo/backend/convex/_generated/api';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { useConvex } from 'convex/react';
import { notFound } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';
import { Loading } from '@/components/dashboard/loading';
import { CreateNodeButton } from './create-node-button';
import { Separator } from '@repo/ui/components/ui/separator';
import { SaveNodeButton } from './save-node-button';
import { PreviewNodeButton } from './preview-node-button';
import { CreateComponentProp } from './create-component-prop';
import { DesktopTopBar } from '../../../desktop-topbar';
import useEditor from './useEditor';
import { CreateEnvButton } from './create-env-button';
import { DropdownEnv } from './dropdown-env';

type Props = PropsWithChildren<{
    params: {
        projectId: Id<'projects'>;
        componentId: Id<'components'>;
    };
}>;

export default function ProjectPageLayout(props: Props) {
    const convex = useConvex();
    const [data, setData] = useState<any>(undefined);

    const { updateComponent } = useEditor();

    const init = async () => {
        const res = await convex.query(api.component.getWithProject, {
            projectId: props.params.projectId,
            componentId: props.params.componentId,
        });

        if (res) {
            setData(res);
            updateComponent(res.component);
        }
    };

    useEffect(() => {
        init();
    }, []);

    if (data === null) {
        return notFound();
    }

    if (data === undefined) {
        return (
            <div className='flex h-screen items-center justify-center '>
                <Loading />
            </div>
        );
    }

    return (
        <>
            <DesktopTopBar
                className='flex items-center'
                projectName={data.projectName}
                projectId={props.params.projectId}
                componentName={data.component.name}
            />
            <div className='flex flex-col h-full border-l bg-background border-border flex-1 p-8'>
                <PageHeader
                    title={data.component.name}
                    description='Manage your component'
                    actions={[
                        <div key='envId' className='flex items-center w-full gap-2 font-mono font-medium ph-no-capture'>
                            <label>Branch: </label>
                            <DropdownEnv componentId={props.params.componentId} />
                            <CreateEnvButton />
                        </div>,
                        <Badge
                            key='componentId'
                            variant='secondary'
                            className='flex justify-between w-full gap-2 font-mono font-medium ph-no-capture'>
                            {data.component._id}
                            <CopyButton value={data.component._id} />
                        </Badge>,
                        <CreateComponentProp key='createProp' />,
                        <CreateNodeButton
                            key='createNode'
                            projectId={props.params.projectId}
                            componentId={props.params.componentId}
                        />,
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
        </>
    );
}
