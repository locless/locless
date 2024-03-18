'use client';

import { Button } from '@repo/ui/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@repo/ui/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/ui/popover';
import { PropsValues } from './constants';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface IProps {
    onPropChosen: (value: string) => void;
}

export const PropSearch = ({ onPropChosen }: IProps) => {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button role='combobox' aria-expanded={open}>
                    <Plus size={18} className='w-4 h-4 ' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[400px] p-0 mr-4'>
                <Command>
                    <CommandInput placeholder='Search prop...' className='h-9' />
                    <CommandEmpty>No props found.</CommandEmpty>
                    <CommandList className='overflow-scroll overflow-x-hidden'>
                        <CommandEmpty>No props found.</CommandEmpty>
                        <CommandGroup>
                            {Object.values(PropsValues).map(prop => (
                                <CommandItem
                                    key={prop.tag}
                                    value={prop.tag}
                                    onSelect={currentValue => {
                                        onPropChosen(currentValue);
                                        setOpen(false);
                                    }}>
                                    {prop.tag}
                                    <div className='ml-auto'>{prop.prefix ?? ''}</div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
