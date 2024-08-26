'use client';
import { Loading } from '@/components/dashboard/loading';
import { Button } from '@repo/ui/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from '@repo/ui/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/ui/form';
import { Input } from '@repo/ui/components/ui/input';
import { useToast } from '@repo/ui/components/ui/use-toast';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '@/lib/trpc/client';
import { Switch } from '@repo/ui/components/ui/switch';
import { Code } from '@repo/ui/components/ui/code';
import { CopyButton } from '@/components/dashboard/copy-button';

const formSchema = z.object({
  name: z.string().min(2).max(50),
  permission: z.boolean().optional(),
});

interface CreateKeyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  projectId: string;
  numberOfKeys: number;
}

export const CreateKeyButton = ({ projectId, numberOfKeys, ...rest }: CreateKeyButtonProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { toast } = useToast();

  const [key, setKey] = useState('');

  const createKey = trpc.project.createKey.useMutation({
    async onSuccess(res) {
      if (res.key) {
        toast({
          description: 'Your key has been created!',
        });

        setKey(res.key);
        form.reset();
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    createKey.mutate({
      name: values.name,
      projectId,
      permission: values.permission ? 'api.private_key' : 'api.public_key',
    });
  };

  return (
    <>
      <Dialog
        onOpenChange={() => {
          form.reset();
          setKey('');
        }}>
        <DialogTrigger asChild>
          <Button className='flex-row items-center gap-1 font-semibold ' {...rest} disabled={numberOfKeys >= 3}>
            <Plus size={18} className='w-4 h-4 ' />
            {`(${numberOfKeys}/3)`}
          </Button>
        </DialogTrigger>
        <DialogContent className='w-11/12'>
          {key ? (
            <div className='flex flex-col gap-4 items-center justify-center'>
              <div className='flex flex-col items-center justify-center gap-4 '>
                <div className='flex flex-col gap-4'>
                  <h1 className='text-2xl font-semibold tracking-tight'>Your key is ready!</h1>
                  <p className='text-sm text-gray-500 md:text-base'>
                    Your key is ready to use. You can copy it and use it in your code.
                  </p>
                  <h3 className='text-red-600'>Warning! This key will be visible only once and cannot be retrieved.</h3>
                </div>
                <Code className='flex items-center justify-between w-full gap-4 '>
                  <pre>{key}</pre>
                  <div className='flex items-start justify-between gap-4'>
                    <CopyButton value={key} />
                  </div>
                </Code>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name:</FormLabel>
                      <FormControl>
                        <Input placeholder='app-read-only-key' {...field} className=' dark:focus:border-gray-700' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='permission'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4 mt-3'>
                      <div className='space-y-0.5 mr-2'>
                        <FormLabel className='text-base'>Key Permission</FormLabel>
                        <FormDescription>
                          By default keys are read-only (public). By switching you will create write-only key (private)
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} defaultChecked={false} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter className='flex-row justify-end gap-2 pt-4 '>
                  <Button disabled={createKey.isPending || !form.formState.isValid} className='mt-4 ' type='submit'>
                    {createKey.isPending ? <Loading /> : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
