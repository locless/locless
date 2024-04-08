'use client';
import { Loading } from '@/components/dashboard/loading';
import { Button } from '@repo/ui/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from '@repo/ui/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui/components/ui/form';
import { Input } from '@repo/ui/components/ui/input';
import { useToast } from '@repo/ui/components/ui/use-toast';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    workspaceId: Id<'workspaces'>;
}

const formSchema = z.object({
    name: z.string().min(2).max(50),
});

export const CreateTranslationGroupButton = ({ workspaceId, ...rest }: Props) => {
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
        },
    });
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);

    const createTranslationGroup = useMutation(api.translations.createGroup);

    const onSubmit = async ({ name }: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            await createTranslationGroup({
                name,
                workspaceId,
            });
            toast({
                description: 'Your translation group has been created!',
            });
        } catch (err: any) {
            console.error(err);
            toast({
                variant: 'destructive',
                description: err.message,
            });
        } finally {
            setOpen(false);
            setLoading(false);
            form.reset();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className='flex-row items-center gap-1 font-semibold' {...rest}>
                    <Plus size={18} className='w-4 h-4 ' />
                    Create Group
                </Button>
            </DialogTrigger>
            <DialogContent className='w-11/12'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            key='form-name'
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem key='form-name'>
                                    <FormLabel>Name:</FormLabel>
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
    );
};
