import { CopyButton } from '@/components/dashboard/copy-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { Code } from '@repo/ui/components/ui/code';
import { notFound } from 'next/navigation';
import { DeleteProject } from './delete-project';
import { UpdateProjectName } from './update-project-name';
import { getTenantId } from '@/lib/auth';
import { getKeys, getProject } from '@/lib/api';
import { GenerateProjectKeys } from './generate-keys-button';

type Props = {
    params: {
        projectId: string;
    };
};

export default async function SettingsPage(props: Props) {
    const tenantId = getTenantId();
    const project = await getProject({
        projectId: props.params.projectId,
        headers: {
            authorization: `${tenantId}`,
        },
    });

    const keys = await getKeys({
        projectId: props.params.projectId,
        headers: {
            authorization: `${tenantId}`,
        },
    });

    if (!project) {
        return notFound();
    }

    return (
        <div className='flex flex-col gap-8 mb-20 '>
            <UpdateProjectName projectName={project.name} projectId={project.id} />
            <Card>
                <CardHeader>
                    <CardTitle>Project ID</CardTitle>
                    <CardDescription>This is your project id.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Code className='flex items-center justify-between w-full h-8 max-w-sm gap-4'>
                        <pre>{project.id}</pre>
                        <div className='flex items-start justify-between gap-4'>
                            <CopyButton value={project.id} />
                        </div>
                    </Code>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Project Keys</CardTitle>
                    <CardDescription>This are your project keys.</CardDescription>
                </CardHeader>
                <CardContent>
                    {keys ? (
                        <>
                            <CardDescription className='mb-2'>Public key:</CardDescription>
                            <Code className='flex items-center justify-between h-8 gap-4'>
                                <pre className='block'>{keys.publicKey}</pre>
                                <div className='flex items-start justify-between gap-4'>
                                    <CopyButton value={keys.publicKey} />
                                </div>
                            </Code>
                            <CardDescription className='mt-4 mb-2'>Private key:</CardDescription>
                            <Code className='flex items-center justify-between gap-4'>
                                <pre>{keys.privateKey}</pre>
                                <div className='flex items-start justify-between gap-4'>
                                    <CopyButton value={keys.privateKey} />
                                </div>
                            </Code>
                        </>
                    ) : (
                        <GenerateProjectKeys projectId={project.id} tenantId={tenantId} />
                    )}
                </CardContent>
            </Card>
            <DeleteProject name={project.name} id={project.id} />
        </div>
    );
}
