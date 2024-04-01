'use client';

import { Button } from '@repo/ui/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@repo/ui/components/ui/dropdown-menu';
import { ScrollArea, ScrollBar } from '@repo/ui/components/ui/scroll-area';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loading } from './dashboard/loading';

export interface RadioGroupItem {
    name: string;
    _id: string;
}

interface Props {
    activeValue?: RadioGroupItem;
    values: RadioGroupItem[];
    onChange: (value: RadioGroupItem) => void;
    loadMore?: () => void;
    hasMore?: boolean;
    isLoading?: boolean;
}

export function RadioGroupDropdown({
    activeValue,
    values,
    onChange,
    hasMore = false,
    isLoading = false,
    loadMore,
}: Props) {
    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasMore) {
            loadMore?.();
        }
    }, [inView, hasMore]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='outline'>{activeValue?.name}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56'>
                <ScrollArea className='max-h-[500px] w-[350px]'>
                    <DropdownMenuRadioGroup
                        value={activeValue?._id}
                        onValueChange={value => {
                            const item = values.find(v => v._id === value);

                            if (item) {
                                onChange(item);
                            }
                        }}>
                        {values.map(value => (
                            <DropdownMenuRadioItem key={value._id} value={value._id}>
                                {value.name}
                            </DropdownMenuRadioItem>
                        ))}
                        <div ref={ref} />
                    </DropdownMenuRadioGroup>
                    <ScrollBar orientation='vertical' />
                    {isLoading && (
                        <div className='flex items-center justify-center '>
                            <Loading />
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
