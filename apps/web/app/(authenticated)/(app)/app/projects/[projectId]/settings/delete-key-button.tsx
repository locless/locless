'use client';
import { Button } from '@repo/ui/components/ui/button';
import React, { useState } from 'react';
import { Trash } from 'lucide-react';
import { Input } from '@repo/ui/components/ui/input';

import { Loading } from '@/components/dashboard/loading';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui/components/ui/form';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { useToast } from '@repo/ui/components/ui/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '@/lib/trpc/client';

type Props = {
  id: string;
  name?: string;
  projectId: string;
};

export const DeleteKeyButton: React.FC<Props> = ({ id, name, projectId }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const formSchema = z.object({
    name: z.string().refine(v => v === name, 'Please confirm the key name'),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();

  const deleteKey = trpc.project.deleteKey.useMutation({
    async onSuccess() {
      toast({
        title: 'Key Deleted',
        description: 'Your key has been deleted.',
      });

      router.refresh();
    },
    onError(err) {
      console.error(err);
      toast({
        variant: 'destructive',
        description: err.message,
      });
    },
  });

  const isValid = form.watch('name') === name;

  async function onSubmit() {
    deleteKey.mutate({ keyId: id, projectId });
  }

  return (
    <>
      <Button
        type='button'
        variant='destructive'
        onClick={() => {
          setOpen(!open);
          form.reset();
        }}>
        <Trash size={18} className='w-4 h-4' />
      </Button>
      <Dialog open={open} onOpenChange={o => setOpen(o)}>
        <DialogContent className='border-[#b80f07]'>
          <DialogHeader>
            <DialogTitle>Delete Key</DialogTitle>
            <DialogDescription>This key will be deleted. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className='flex flex-col space-y-8' onSubmit={form.handleSubmit(onSubmit)}>
              <Alert variant='destructive'>
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>This action is not reversible. Please be certain.</AlertDescription>
              </Alert>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-normal text-content-subtle'>
                      {' '}
                      Enter the Key name <span className='font-medium text-content'>{name}</span> to continue:
                    </FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete='off' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className='justify-end gap-4'>
                <Button type='button' disabled={deleteKey.isPending} onClick={() => setOpen(!open)} variant='secondary'>
                  Cancel
                </Button>
                <Button type='submit' disabled={!isValid || deleteKey.isPending} variant='destructive'>
                  {deleteKey.isPending ? <Loading /> : 'Delete Key'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
