'use client';
import { Loading } from '@/components/dashboard/loading';
import { Button } from '@repo/ui/components/ui/button';
import { useToast } from '@repo/ui/components/ui/use-toast';
import { Save } from 'lucide-react';
import React from 'react';
import { trpc } from '@/lib/trpc/client';

interface SaveTranslationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  translationId: string;
  enabled: boolean;
  name: string;
  content: string;
  updatedAt: Date;
  // eslint-disable-next-line no-unused-vars
  onSuccess: (date: Date) => void;
}

export const SaveTranslationButton = ({
  translationId,
  content,
  enabled,
  name,
  updatedAt,
  onSuccess,
  ...rest
}: SaveTranslationButtonProps) => {
  const { toast } = useToast();

  const toggleStatus = trpc.translation.change.useMutation({
    onSuccess(res) {
      if (res.success) {
        toast({
          description: `${name} has been saved!`,
        });

        onSuccess(res.updatedAt);
      }
    },
    onError(err) {
      console.error(err);
      toast({
        variant: 'destructive',
        description: err.message,
      });
    },
  });

  return (
    <Button
      className='flex-row items-center font-semibold px-2'
      disabled={!enabled}
      {...rest}
      onClick={() => {
        if (enabled) {
          toggleStatus.mutate({ translationId, content, updatedAt });
        }
      }}>
      {toggleStatus.isPending ? <Loading /> : <Save size={18} className='w-4 h-4' />}
    </Button>
  );
};
