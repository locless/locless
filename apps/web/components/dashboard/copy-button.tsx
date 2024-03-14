'use client';

import { cn } from '@repo/ui/lib/utils';
import { Copy, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    value: string;
}

async function copyToClipboardWithMeta(value: string) {
    navigator.clipboard.writeText(value);
}

export function CopyButton({ value, className, ...props }: CopyButtonProps) {
    const [hasCopied, setHasCopied] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setHasCopied(false);
        }, 2000);
    }, [hasCopied]);

    return (
        <button
            type='button'
            className={cn('relative p-1 focus:outline-none h-6 w-6 ', className)}
            onClick={() => {
                copyToClipboardWithMeta(value);
                setHasCopied(true);
            }}
            {...props}>
            <span className='sr-only'>Copy</span>
            {hasCopied ? <Check className='w-full h-full' /> : <Copy className='w-full h-full' />}
        </button>
    );
}
