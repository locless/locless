'use client';
import { trpc } from '@/lib/trpc/client';
import { useAuth } from '@clerk/nextjs';
import { useToast } from '@repo/ui/components/ui/use-toast';
import { cn } from '@repo/ui/lib/utils';
import { RefreshCw, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GenerateKeyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  projectId: string;
  // eslint-disable-next-line no-unused-vars
  callback?: (value: string) => void;
  keyType: 'public' | 'private';
}

export function GenerateKeyButton({ projectId, callback, keyType, className, ...props }: GenerateKeyButtonProps) {
  const [hasRefreshed, setHasRefreshed] = useState(false);

  const { isLoaded } = useAuth();
  const { toast } = useToast();

  const updateKey = trpc.project.updateKey.useMutation({
    onSuccess(res) {
      setHasRefreshed(true);
      toast({
        description: 'Key has been refreshed!',
      });
      callback?.(res.key);
    },
    onError(err) {
      console.error(err);
      toast({
        variant: 'destructive',
        description: err.message,
      });
    },
  });

  const onPress = async () => {
    if (!isLoaded) {
      return;
    }

    updateKey.mutate({ projectId, keyType });
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
      disabled={updateKey.isPending || hasRefreshed}
      {...props}>
      <span className='sr-only'>Refresh</span>
      {hasRefreshed ? <Check className='w-full h-full' /> : <RefreshCw className='w-full h-full' />}
    </button>
  );
}
