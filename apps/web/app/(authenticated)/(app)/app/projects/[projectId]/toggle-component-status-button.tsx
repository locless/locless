'use client';
import { Loading } from '@/components/dashboard/loading';
import { Button } from '@repo/ui/components/ui/button';
import { useToast } from '@repo/ui/components/ui/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc/client';

interface ToggleComponentStatusButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  componentId: string;
  enabled: boolean;
  name: string;
}

export const ToggleComponentStatusButton = ({
  componentId,
  enabled,
  name,
  ...rest
}: ToggleComponentStatusButtonProps) => {
  const { toast } = useToast();

  const [isEnabled, setIsEnabled] = useState(true);

  const toggleStatus = trpc.component.toggleStatus.useMutation({
    onSuccess(res) {
      toast({
        description: `${name} has been ${res.enabled ? 'enabled' : 'disabled'}!`,
      });
      setIsEnabled(res.enabled);
    },
    onError(err) {
      console.error(err);
      toast({
        variant: 'destructive',
        description: err.message,
      });
    },
  });

  useEffect(() => {
    if (enabled) {
      setIsEnabled(enabled);
    }
  }, [enabled]);

  return (
    <div className='flex items-center gap-2'>
      {isEnabled ? 'Yes' : 'No'}
      <Button
        className='flex-row items-center font-semibold px-2'
        {...rest}
        onClick={() => toggleStatus.mutate({ componentId })}>
        {toggleStatus.isPending ? (
          <Loading />
        ) : isEnabled ? (
          <Eye size={18} className='w-4 h-4' />
        ) : (
          <EyeOff size={18} className='w-4 h-4' />
        )}
      </Button>
    </div>
  );
};
