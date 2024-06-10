'use client';
import { Loading } from '@/components/dashboard/loading';
import { Button } from '@repo/ui/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from '@repo/ui/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui/components/ui/form';
import { Input } from '@repo/ui/components/ui/input';
import { useToast } from '@repo/ui/components/ui/use-toast';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '@/lib/trpc/client';

const formSchema = z.object({
  name: z.string().min(2).max(50),
});

export const CreateProjectButton = ({ ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();
  const { toast } = useToast();

  const create = trpc.project.create.useMutation({
    onSuccess(res) {
      toast({
        description: 'Your project has been created!',
      });
      router.refresh();
      router.push(`/app/projects/${res.id}`);
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
    create.mutate(values);
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className='flex-row items-center gap-1 font-semibold ' {...rest}>
            <Plus size={18} className='w-4 h-4 ' />
            Create New Project
          </Button>
        </DialogTrigger>
        <DialogContent className='w-11/12 max-sm: '>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name:</FormLabel>
                    <FormControl>
                      <Input placeholder='my-project' {...field} className=' dark:focus:border-gray-700' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className='flex-row justify-end gap-2 pt-4 '>
                <Button disabled={create.isPending || !form.formState.isValid} className='mt-4 ' type='submit'>
                  {create.isPending ? <Loading /> : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
