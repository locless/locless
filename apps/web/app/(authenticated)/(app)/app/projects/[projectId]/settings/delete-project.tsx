'use client';
import { Button } from '@repo/ui/components/ui/button';
import React, { useState } from 'react';

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@repo/ui/components/ui/card';
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

import { revalidate } from './actions';
import { useToast } from '@repo/ui/components/ui/use-toast';
import { removeProject } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';

type Props = {
    id: string;
    name: string;
};

interface FormData {
    name: string;
    intent: string;
}

const intent = 'delete my project';

export const DeleteProject: React.FC<Props> = ({ id, name }) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { toast } = useToast();

    const form = useForm<FormData>();
    const router = useRouter();

    const { userId } = useAuth();

    const isValid = form.watch('intent') === intent && form.watch('name') === name;

    const onSubmit = async (_values: FormData) => {
        setIsLoading(true);
        try {
            await removeProject({
                projectId: id,
                headers: {
                    authorization: `${userId}`,
                },
            });
            toast({
                title: 'Project Deleted',
                description: 'Your project and all its components has been deleted.',
            });

            await revalidate();

            router.push('/app/projects');
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
        <>
            <Card className='relative border-2 border-[#b80f07]'>
                <CardHeader>
                    <CardTitle>Delete</CardTitle>
                    <CardDescription>
                        This project will be deleted, along with all of its components and data. This action cannot be
                        undone.
                    </CardDescription>
                </CardHeader>
                <CardFooter className='z-10 justify-end'>
                    <Button type='button' onClick={() => setOpen(!open)}>
                        Delete Project
                    </Button>
                </CardFooter>
            </Card>
            <Dialog open={open} onOpenChange={o => setOpen(o)}>
                <DialogContent className='border-[#b80f07]'>
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                        <DialogDescription>
                            This project will be deleted, along with all of its components. This action cannot be
                            undone.
                        </DialogDescription>
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
                                            Enter the Project name{' '}
                                            <span className='font-medium text-content'>{name}</span> to continue:
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} autoComplete='off' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='intent'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='font-normal text-content-subtle'>
                                            To verify, type{' '}
                                            <span className='font-medium text-content'>delete my project</span> below:
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} autoComplete='off' />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className='justify-end gap-4'>
                                <Button
                                    type='button'
                                    disabled={isLoading}
                                    onClick={() => setOpen(!open)}
                                    variant='secondary'>
                                    Cancel
                                </Button>
                                <Button type='submit' disabled={!isValid || isLoading}>
                                    {isLoading ? <Loading /> : 'Delete Project'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
};
