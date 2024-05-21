'use client';

import { refreshKey } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { useToast } from '@repo/ui/components/ui/use-toast';
import { cn } from '@repo/ui/lib/utils';
import { RefreshCw, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GenerateKeyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    value: string;
    projectId: string;
    callback?: (value: string) => void;
}

export function GenerateKeyButton({ value, projectId, callback, className, ...props }: GenerateKeyButtonProps) {
    const [hasRefreshed, setHasRefreshed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { userId, isLoaded } = useAuth();
    const { toast } = useToast();

    const onPress = async () => {
        if (!isLoaded) {
            return;
        }

        setIsLoading(true);
        try {
            const newKey = await refreshKey({
                projectId,
                prevKey: value,
                headers: {
                    authorization: `${userId}`,
                },
            });

            setHasRefreshed(true);

            if (newKey) {
                toast({
                    description: 'Your key has been refreshed!',
                });

                callback?.(newKey);
            }
        } catch (err: any) {
            console.error(err);
            toast({
                variant: 'destructive',
                description: err.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            setHasRefreshed(false);
        }, 2000);
    }, [hasRefreshed]);

    return (
        <button
            type='button'
            className={cn('relative p-1 focus:outline-none h-6 w-6 ', className)}
            onClick={() => onPress()}
            disabled={isLoading || hasRefreshed}
            {...props}>
            <span className='sr-only'>Refresh</span>
            {hasRefreshed ? <Check className='w-full h-full' /> : <RefreshCw className='w-full h-full' />}
        </button>
    );
}
