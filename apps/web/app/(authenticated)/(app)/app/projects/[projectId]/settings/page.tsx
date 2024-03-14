'use client';

import { CopyButton } from '@/components/dashboard/copy-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Code } from '@repo/ui/components/ui/code';
import { notFound } from 'next/navigation';
import { DeleteProject } from './delete-project';
import { UpdateProjectName } from './update-project-name';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';

type Props = {
    params: {
        projectId: Id<'projects'>;
    };
};

export default function SettingsPage(props: Props) {
    const project = useQuery(api.project.getSingle, { projectId: props.params.projectId });

    if (!project) {
        return notFound();
    }

    return (
        <div className='flex flex-col gap-8 mb-20 '>
            <UpdateProjectName project={project} />
            <Card>
                <CardHeader>
                    <CardTitle>Project ID</CardTitle>
                    <CardDescription>This is your project id.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Code className='flex items-center justify-between w-full h-8 max-w-sm gap-4'>
                        <pre>{project._id}</pre>
                        <div className='flex items-start justify-between gap-4'>
                            <CopyButton value={project._id} />
                        </div>
                    </Code>
                </CardContent>
            </Card>
            <DeleteProject project={project} />
        </div>
    );
}
