'use client';
import { CopyButton } from '@/components/dashboard/copy-button';
import { CardDescription } from '@repo/ui/components/ui/card';
import { Code } from '@repo/ui/components/ui/code';
import { GenerateKeyButton } from './generate-key';
import { useEffect, useState } from 'react';

type Props = {
  title: string;
  projectId: string;
  serverKey: string | null;
  keyType: 'public' | 'private';
};

export default function KeyCard({ title, projectId, serverKey, keyType }: Props) {
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
        <pre>{`loc_${key.split('loc_')[1].replace(/./g, '*')}`}</pre>
        <div className='flex items-start justify-between gap-4'>
          <CopyButton value={key} />
          <GenerateKeyButton projectId={projectId} callback={onGenerateKey} keyType={keyType} />
        </div>
      </Code>
    </>
  );
}
