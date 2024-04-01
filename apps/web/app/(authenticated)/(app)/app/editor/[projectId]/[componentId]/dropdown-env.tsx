'use client';
import React, { useEffect } from 'react';
import useEditor from './useEditor';
import { api } from '@repo/backend/convex/_generated/api';
import { RadioGroupDropdown } from '@/components/radio-group-dropdown';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { usePaginatedQuery, useMutation } from 'convex/react';

interface Props {
    componentId: Id<'components'>;
}

export const DropdownEnv = ({ componentId }: Props) => {
    const {
        results: environments,
        status,
        isLoading,
        loadMore,
    } = usePaginatedQuery(api.environment.get, { componentId }, { initialNumItems: 20 });

    const createEnv = useMutation(api.environment.create);

    const { environment, updateEnvironment, resetEditor } = useEditor();

    const initEnvs = async () => {
        await createEnv({
            name: 'dev',
            componentId,
        });
    };

    useEffect(() => {
        if (!isLoading) {
            if (environments.length === 0) {
                initEnvs();
            } else if (environments.length > 0) {
                const env = environments[0];

                if (env) {
                    updateEnvironment(env);
                }
            }
        }
    }, [environments, isLoading]);

    if (!environment) {
        return null;
    }

    return (
        <RadioGroupDropdown
            activeValue={environment}
            values={environments}
            loadMore={() => loadMore(20)}
            hasMore={status === 'CanLoadMore'}
            isLoading={isLoading}
            onChange={item => {
                const env = environments.find(e => e._id === item._id);

                if (env) {
                    updateEnvironment(env);
                    resetEditor();
                }
            }}
        />
    );
};
