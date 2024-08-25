'use client';

import { Loading } from '@/components/dashboard/loading';
import { Button } from '@repo/ui/components/ui/button';
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
import { trpc } from '@/lib/trpc/client';
import { useOrganizationList } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(3, 'Name is required and should be at least 3 characters').max(50),
});

const CreateOrganizationComponent: React.FC = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { setActive } = useOrganizationList();
  const { toast } = useToast();

  const router = useRouter();
  const createWorkspace = trpc.workspace.create.useMutation({
    onSuccess: async ({ organizationId }) => {
      toast({
        description: 'Your workspace has been created!',
      });

      if (setActive) {
        await setActive({ organization: organizationId });
      }

      router.push(`/app/projects`);
    },
    onError(err) {
      toast({
        variant: 'destructive',
        description: err.message,
      });
    },
  });

  return (
    <div className='flex items-start justify-between gap-16'>
      <main className='w-3/4'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(values => createWorkspace.mutate({ ...values }))}
            className='flex flex-col space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormMessage className='text-xs' />
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>What should your workspace be called?</FormDescription>
                </FormItem>
              )}
            />
            <div className='mt-8'>
              <Button disabled={createWorkspace.isPending || !form.formState.isValid} type='submit' className='w-full'>
                {createWorkspace.isPending ? <Loading /> : 'Create Workspace'}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default CreateOrganizationComponent;
