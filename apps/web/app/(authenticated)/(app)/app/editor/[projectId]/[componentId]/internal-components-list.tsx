'use client';
import { Button } from '@repo/ui/components/ui/button';
import React, { useState } from 'react';
import { usePaginatedQuery } from 'convex/react';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { api } from '@repo/backend/convex/_generated/api';
import { Loading } from '@/components/dashboard/loading';
import { DropdownEnvInternal } from './dropdown-env-internal';
import { RadioGroupItem } from '@/components/radio-group-dropdown';

interface Props {
    projectId: Id<'projects'>;
    componentId: Id<'components'>;
    onUpdateComponent: (name: string, componentId: Id<'components'>) => void;
    onUpdateEnv: (envId: Id<'environments'>) => void;
}

export const InternalComponentsList = ({ projectId, componentId, onUpdateComponent, onUpdateEnv }: Props) => {
    const [chosenComponent, setChosenComponent] = useState<RadioGroupItem | undefined>(undefined);
    const [chosenEnv, setChosenEnv] = useState<RadioGroupItem | undefined>(undefined);

    const { results, status, isLoading, loadMore } = usePaginatedQuery(
        api.component.get,
        { projectId },
        { initialNumItems: 20 }
    );

    if (isLoading) {
        <div className='flex h-screen items-center justify-center '>
            <Loading />
        </div>;
    }

    return (
        <>
            <div className='flex flex-wrap gap-4 mt-4'>
                {results.map(component =>
                    componentId !== component._id ? (
                        <Button
                            key={component._id}
                            variant={chosenComponent?.name === component.name ? 'default' : 'outline'}
                            className={`${chosenComponent?.name !== component.name ? 'text-black' : ''} h-14`}
                            onClick={() => {
                                setChosenComponent(component);
                                onUpdateComponent(component.name, component._id);
                            }}>
                            {component.name}
                        </Button>
                    ) : null
                )}
            </div>
            {chosenComponent ? (
                <div key='envId' className='flex items-center w-full gap-2 font-mono font-medium ph-no-capture mt-6'>
                    <label>Select the branch: </label>
                    <DropdownEnvInternal
                        componentId={chosenComponent._id as Id<'components'>}
                        chosenEnv={chosenEnv}
                        onUpdate={item => {
                            setChosenEnv(item);
                            onUpdateEnv(item._id as Id<'environments'>);
                        }}
                    />
                </div>
            ) : (
                <Button
                    key='loadMoreButton'
                    className='h-10 mt-6'
                    onClick={() => {
                        if (status === 'CanLoadMore') {
                            loadMore(20);
                        }
                    }}>
                    Load More
                </Button>
            )}
        </>
    );
};
