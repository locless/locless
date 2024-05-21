'use client';
import { useEffect, useState } from 'react';
import { CopyButton } from '@/components/dashboard/copy-button';
import { CardDescription } from '@repo/ui/components/ui/card';
import { Code } from '@repo/ui/components/ui/code';
import { GenerateKeyButton } from './generate-key';

type Props = {
    title: string;
    projectId: string;
    serverKey?: string;
};

export default function KeyCard({ title, projectId, serverKey }: Props) {
    const [key, setKey] = useState('');

    const onGenerateKey = (newKey: string) => {
        setKey(newKey);
    };

    useEffect(() => {
        if (serverKey) {
            setKey(serverKey);
        }
    }, [serverKey]);

    if (!key) {
        return null;
    }

    return (
        <>
            <CardDescription className='mt-4 mb-2'>{title}</CardDescription>
            <Code className='flex items-center justify-between gap-4'>
                <pre>{key}</pre>
                <div className='flex items-start justify-between gap-4'>
                    <CopyButton value={key} />
                    <GenerateKeyButton value={key} projectId={projectId} callback={onGenerateKey} />
                </div>
            </Code>
        </>
    );
}
