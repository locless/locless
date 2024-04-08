'use client';
import { EmptyPlaceholder } from '@/components/dashboard/empty-placeholder';
import { Button } from '@repo/ui/components/ui/button';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@repo/ui/components/ui/table';
import { BookOpen, Code, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { useMutation, usePaginatedQuery } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';
import { Loading } from '@/components/dashboard/loading';
import { EditVariableButton } from './buttons/edit-variable';
import { useToast } from '@repo/ui/components/ui/use-toast';

interface Props {
    workspaceId: Id<'workspaces'>;
}

export function VariableList({ workspaceId }: Props) {
    const { results, isLoading } = usePaginatedQuery(api.variables.get, { workspaceId }, { initialNumItems: 20 });
    const removeVariable = useMutation(api.variables.remove);

    const { toast } = useToast();

    const onRemoveVariable = async (variableId: Id<'variables'>) => {
        try {
            await removeVariable({
                variableId,
            });
            toast({
                description: 'Your variable has been removed!',
            });
        } catch (err: any) {
            console.error(err);
            toast({
                variant: 'destructive',
                description: err.message,
            });
        }
    };

    if (isLoading) {
        return (
            <div className='flex h-screen items-center justify-center '>
                <Loading />
            </div>
        );
    }

    return (
        <div>
            {results.length ? (
                <Table>
                    <TableCaption>A list of your recent invoices.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Group</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map(variable => (
                            <TableRow key={variable._id}>
                                <TableCell className='font-medium'>{variable.name}</TableCell>
                                <TableCell>{variable.value}</TableCell>
                                <TableCell>{variable.variableGroupId}</TableCell>
                                <TableCell className='flex gap-4'>
                                    <EditVariableButton
                                        variableId={variable._id}
                                        initialName={variable.name}
                                        initialValue={variable.value}
                                    />
                                    <Button
                                        className='flex-row items-center gap-1 font-semibold'
                                        onClick={() => onRemoveVariable(variable._id)}>
                                        <Trash2 size={18} className='w-4 h-4 ' />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <EmptyPlaceholder className='my-4 '>
                    <EmptyPlaceholder.Icon>
                        <Code />
                    </EmptyPlaceholder.Icon>
                    <EmptyPlaceholder.Title>No variables found</EmptyPlaceholder.Title>
                    <EmptyPlaceholder.Description>
                        You haven&apos;t created any variables yet. Create one to get started.
                    </EmptyPlaceholder.Description>
                    <div className='flex flex-col items-center justify-center gap-2 md:flex-row'>
                        <Link href='/docs' target='_blank'>
                            <Button variant='secondary' className='w-full items-center gap-2 '>
                                <BookOpen className='h-4 w-4 md:h-5 md:w-5' />
                                Read the docs
                            </Button>
                        </Link>
                    </div>
                </EmptyPlaceholder>
            )}
        </div>
    );
}
