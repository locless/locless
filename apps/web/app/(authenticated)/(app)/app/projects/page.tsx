'use client';

import { PageHeader } from '@/components/dashboard/page-header';
import { CreateProjectButton } from './create-project-button';

import { Separator } from '@repo/ui/components/ui/separator';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { ProjectList } from './client';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';
import { useEffect } from 'react';
import { Loading } from '@/components/dashboard/loading';

export default function ApisOverviewPage() {
    const workspace = useQuery(api.workspace.getWorkspace);
    const createPersonal = useMutation(api.workspace.createPersonal);
    const { isLoading } = useConvexAuth();

    useEffect(() => {
        const createSpace = async () => {
            await createPersonal();
        };

        if (!isLoading && workspace === null) {
            createSpace();
        }
    }, [workspace, isLoading]);

    if (workspace === null) {
        return null;
    }

    if (workspace === undefined) {
        return (
            <div className='flex h-screen items-center justify-center '>
                <Loading />
            </div>
        );
    }

    const unpaid = workspace.tenantId.startsWith('org_') && workspace.plan === 'free';

    return (
        <div className=''>
            {unpaid ? (
                <div>
                    <PageHeader title='Applications' description='Manage your projects' />
                    <Separator className='my-6' />
                    <section className='my-4 flex flex-col gap-4 md:flex-row md:items-center'>
                        <div className='border-border focus-within:border-primary/40 flex h-8 flex-grow items-center gap-2 rounded-md border bg-transparent px-3 py-2 text-sm'>
                            <Search className='h-4 w-4' />
                            <input
                                disabled
                                className='placeholder:text-content-subtle flex-grow bg-transparent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 '
                                placeholder='Search..'
                            />
                        </div>
                        <CreateProjectButton workspaceId={workspace?._id} disabled />
                    </section>
                    <div className='mt-10 flex min-h-[400px] flex-col items-center  justify-center space-y-6 rounded-lg border border-dashed px-4 md:mt-24'>
                        <h3 className='text-center text-xl font-semibold leading-none tracking-tight md:text-2xl'>
                            Please add billing to your account
                        </h3>
                        <p className='text-center text-sm text-gray-500 md:text-base'>
                            Team workspaces is a paid feature. Please add billing to your account to continue using it.
                        </p>
                        <Link
                            href='/app/settings/billing/stripe'
                            target='_blank'
                            className='mr-3 rounded-lg bg-gray-800 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-800'>
                            Add billing
                        </Link>
                    </div>
                </div>
            ) : (
                <ProjectList workspaceId={workspace?._id} />
            )}
        </div>
    );
}
