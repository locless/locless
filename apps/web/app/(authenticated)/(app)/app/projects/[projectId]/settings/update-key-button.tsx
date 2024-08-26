'use client';
import { useToast } from '@repo/ui/components/ui/use-toast';
import React, { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Switch } from '@repo/ui/components/ui/switch';

interface UpdateKeyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  keyId: string;
  projectId: string;
  enabled?: boolean;
  name?: string;
}

export const UpdateKeyButton = ({ keyId, enabled = false, name, projectId }: UpdateKeyButtonProps) => {
  const { toast } = useToast();

  const [isEnabled, setIsEnabled] = useState(true);

  const updateKey = trpc.project.updateKey.useMutation({
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
      <Switch
        checked={isEnabled}
        onCheckedChange={() => updateKey.mutate({ keyId, projectId, enabled: !isEnabled })}
        disabled={updateKey.isPending}
      />
    </div>
  );
};
