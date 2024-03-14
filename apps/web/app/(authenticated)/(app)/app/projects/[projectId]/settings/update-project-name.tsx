'use client';
import { Loading } from '@/components/dashboard/loading';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
import { FormField } from '@repo/ui/components/ui/form';
import { Input } from '@repo/ui/components/ui/input';
import { useToast } from '@repo/ui/components/ui/use-toast';
import { api } from '@repo/backend/convex/_generated/api';
import { Doc } from '@repo/backend/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

type Props = {
    project: Doc<'projects'>;
};

interface FormData {
    name: string;
}

export const UpdateProjectName: React.FC<Props> = ({ project }) => {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormData>({
        defaultValues: {
            name: project.name,
        },
    });

    const { toast } = useToast();
    const renameProject = useMutation(api.project.rename);

    const onSubmit = async ({ name }: FormData) => {
        setIsLoading(true);
        try {
            if (name === project.name || !name) {
                toast({
                    variant: 'destructive',
                    description: 'Please provide a valid name before saving.',
                });
            }

            await renameProject({ name, projectId: project._id });
            toast({
                description: 'Your project name has been renamed!',
            });
        } catch (err: any) {
            console.error(err);
            toast({
                variant: 'destructive',
                description: err.message,
            });
        } finally {
            setIsLoading(false);
        }
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
                    <Button disabled={!form.formState.isValid || isLoading} type='submit'>
                        {isLoading ? <Loading /> : 'Save'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
};