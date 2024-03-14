'use client';
import { Loading } from '@/components/dashboard/loading';
import { Button } from '@repo/ui/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from '@repo/ui/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui/components/ui/form';
import { Input } from '@repo/ui/components/ui/input';
import { useToast } from '@repo/ui/components/ui/use-toast';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';
import { Id } from '@repo/backend/convex/_generated/dataModel';

interface FormData {
    name: string;
}

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    workspaceId: Id<'workspaces'>;
}

export const CreateProjectButton = ({ workspaceId, ...rest }: Props) => {
    const form = useForm<FormData>();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);

    const createProject = useMutation(api.project.create);

    const onSubmit = async ({ name }: FormData) => {
        setLoading(true);
        try {
            const projectId = await createProject({
                name,
                workspaceId,
            });
            toast({
                description: 'Your project has been created!',
            });
            router.push(`/app/projects/${projectId}`);
        } catch (err: any) {
            console.error(err);
            toast({
                variant: 'destructive',
                description: err.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const router = useRouter();

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
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder='my-project'
                                                {...field}
                                                className=' dark:focus:border-gray-700'
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className='flex-row justify-end gap-2 pt-4 '>
                                <Button disabled={loading || !form.formState.isValid} className='mt-4 ' type='submit'>
                                    {loading ? <Loading /> : 'Create'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
};
