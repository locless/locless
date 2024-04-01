'use client';
import React from 'react';
import { api } from '@repo/backend/convex/_generated/api';
import { RadioGroupDropdown, RadioGroupItem } from '@/components/radio-group-dropdown';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { usePaginatedQuery } from 'convex/react';

interface Props {
    chosenEnv?: RadioGroupItem;
    onUpdate?: (item: RadioGroupItem) => void;
    componentId: Id<'components'>;
}

export const DropdownEnvInternal = ({ componentId, chosenEnv, onUpdate }: Props) => {
    const {
        results: environments,
        status,
        isLoading,
        loadMore,
    } = usePaginatedQuery(api.environment.get, { componentId }, { initialNumItems: 20 });

    return (
        <RadioGroupDropdown
            activeValue={chosenEnv}
            values={environments}
            loadMore={() => loadMore(20)}
            hasMore={status === 'CanLoadMore'}
            isLoading={isLoading}
            onChange={item => {
                onUpdate?.(item);
            }}
        />
    );
};
