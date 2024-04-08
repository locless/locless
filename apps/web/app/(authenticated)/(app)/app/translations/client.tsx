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
import { BookOpen, Code } from 'lucide-react';
import Link from 'next/link';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { usePaginatedQuery } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';
import { Loading } from '@/components/dashboard/loading';

interface Props {
    workspaceId: Id<'workspaces'>;
}

export function TranslationsList({ workspaceId }: Props) {
    const { results, isLoading } = usePaginatedQuery(api.translations.get, { workspaceId }, { initialNumItems: 20 });

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
                            <TableHead>Languages</TableHead>
                            <TableHead>Group ID</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.map(translation => (
                            <TableRow key={translation._id}>
                                <TableCell className='font-medium'>{translation.name}</TableCell>
                                <TableCell>
                                    {translation.value.map(
                                        (item, index) =>
                                            `${item.lang}${index === 0 || index === results.length ? '' : ', '}`
                                    )}
                                </TableCell>
                                <TableCell>{translation.translationGroupId}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <EmptyPlaceholder className='my-4 '>
                    <EmptyPlaceholder.Icon>
                        <Code />
                    </EmptyPlaceholder.Icon>
                    <EmptyPlaceholder.Title>No translations found</EmptyPlaceholder.Title>
                    <EmptyPlaceholder.Description>
                        You haven&apos;t created any translations yet. Create one to get started.
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
