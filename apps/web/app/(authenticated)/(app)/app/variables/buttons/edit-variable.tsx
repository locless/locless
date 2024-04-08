'use client';
import { Loading } from '@/components/dashboard/loading';
import { Button } from '@repo/ui/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from '@repo/ui/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui/components/ui/form';
import { Input } from '@repo/ui/components/ui/input';
import { useToast } from '@repo/ui/components/ui/use-toast';
import { Edit } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variableId: Id<'variables'>;
    initialName: string;
    initialValue: string;
}

const formSchema = z.object({
    name: z.string().min(2).max(50),
    value: z.string().min(2).max(50),
});

export const EditVariableButton = ({ variableId, initialName, initialValue, ...rest }: Props) => {
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialName,
            value: initialValue,
        },
    });
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);

    const editVariable = useMutation(api.variables.edit);

    const onSubmit = async ({ name, value }: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            await editVariable({
                variableId,
                name,
                value,
            });
            toast({
                description: 'Your variable has been updated!',
            });
        } catch (err: any) {
            console.error(err);
            toast({
                variant: 'destructive',
                description: err.message,
            });
        } finally {
            setLoading(false);
            setOpen(false);
            form.reset();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className='flex-row items-center gap-1 font-semibold' {...rest}>
                    <Edit size={18} className='w-4 h-4 ' />
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
                                            placeholder='Brand Color'
                                            {...field}
                                            className=' dark:focus:border-gray-700'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            key='form-value'
                            control={form.control}
                            name='value'
                            render={({ field }) => (
                                <FormItem className='mt-4' key='form-value'>
                                    <FormLabel>Value:</FormLabel>
                                    <FormControl>
                                        <Input placeholder='green' {...field} className=' dark:focus:border-gray-700' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className='flex-row justify-end gap-2 pt-4 '>
                            <Button disabled={loading || !form.formState.isValid} className='mt-4 ' type='submit'>
                                {loading ? <Loading /> : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
