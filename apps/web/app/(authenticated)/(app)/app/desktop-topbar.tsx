'use client';
import { cn } from '@repo/ui/lib/utils';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from '@repo/ui/components/ui/breadcrumb';
import React from 'react';
import { UserButton } from '@clerk/clerk-react';
import { Id } from '@repo/backend/convex/_generated/dataModel';

type Props = {
    className?: string;
    projectName?: string;
    projectId?: Id<'projects'>;
    componentName?: string;
};

export const DesktopTopBar: React.FC<Props> = ({ className, projectName, componentName, projectId }) => {
    return (
        <aside className={cn('w-full pr-6 z-10 py-4', className)}>
            <Breadcrumb>
                <BreadcrumbList className='item-center'>
                    {projectName ? (
                        <>
                            <BreadcrumbSeparator />
                            {componentName && projectId ? (
                                <BreadcrumbLink href={`/app/projects/${projectId}`}>{projectName}</BreadcrumbLink>
                            ) : (
                                <BreadcrumbItem>{projectName}</BreadcrumbItem>
                            )}
                        </>
                    ) : null}
                    {componentName ? (
                        <>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>{componentName}</BreadcrumbItem>
                        </>
                    ) : null}
                </BreadcrumbList>
            </Breadcrumb>
            <div className='ml-auto'>
                <UserButton />
            </div>
        </aside>
    );
};
