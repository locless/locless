'use client';
import { Loading } from '@/components/dashboard/loading';
import { Button } from '@repo/ui/components/ui/button';
import { useToast } from '@repo/ui/components/ui/use-toast';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { generateKeys } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

type Props = {
    tenantId: string;
    projectId: string;
};

export const GenerateProjectKeys: React.FC<Props> = ({ projectId, tenantId }) => {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({});

    const { toast } = useToast();

    const { isLoaded } = useAuth();

    const router = useRouter();

    const onSubmit = async () => {
        if (!isLoaded) {
            return;
        }

        setIsLoading(true);
        try {
            await generateKeys({
                projectId,
                tenantId,
                headers: {
                    authorization: `${tenantId}`,
                },
            });
            toast({
                description: 'Your keys were generated',
            });

            router.refresh();
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

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Button disabled={isLoading} type='submit'>
                {isLoading ? <Loading /> : 'Generate'}
            </Button>
        </form>
    );
};
