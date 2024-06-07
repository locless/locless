'use client';
import { Loading } from '@/components/dashboard/loading';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { FormField } from '@repo/ui/components/ui/form';
import { Input } from '@repo/ui/components/ui/input';
import { useToast } from '@repo/ui/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '@/lib/trpc/client';

type Props = {
  project: {
    id: string;
    workspaceId: string;
    name: string;
  };
};

const formSchema = z.object({
  name: z.string(),
  projectId: z.string(),
  workspaceId: z.string(),
});

export const UpdateProjectName: React.FC<Props> = ({ project }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project.name,
      projectId: project.id,
      workspaceId: project.workspaceId,
    },
  });

  const { toast } = useToast();

  const router = useRouter();

  const updateName = trpc.project.updateName.useMutation({
    onSuccess() {
      toast({
        description: 'Your project name has been renamed!',
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.name === project.name || !values.name) {
      toast({
        variant: 'destructive',
        description: 'Please provide a valid name before saving.',
      });
    }

    updateName.mutateAsync(values);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Project Name</CardTitle>
          <CardDescription>
            Project names are not customer facing. Choose a name that makes it easy to recognize for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col space-y-2'>
            <label className='hidden sr-only'>Name</label>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => <Input className='max-w-sm' {...field} autoComplete='off' />}
            />
          </div>
        </CardContent>
        <CardFooter className='justify-end'>
          <Button disabled={!form.formState.isValid || updateName.isPending} type='submit'>
            {updateName.isPending ? <Loading /> : 'Save'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};
