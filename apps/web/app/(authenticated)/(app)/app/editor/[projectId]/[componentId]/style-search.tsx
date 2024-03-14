'use client';
import * as React from 'react';

import { Button } from '@repo/ui/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@repo/ui/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/ui/popover';
import { StylesValues } from './constants';
import { Plus } from 'lucide-react';

interface IProps {
    onStyleChosen: (value: string) => void;
}

export const StyleSearch = ({ onStyleChosen }: IProps) => {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button role='combobox' aria-expanded={open}>
                    <Plus size={18} className='w-4 h-4 ' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[400px] h-[500px] p-0 mr-4'>
                <Command>
                    <CommandInput placeholder='Search style...' className='h-9' />
                    <CommandEmpty>No style found.</CommandEmpty>
                    <CommandGroup className='overflow-scroll overflow-x-hidden'>
                        {Object.values(StylesValues).map(style => (
                            <CommandItem
                                key={style.tag}
                                value={style.tag}
                                onSelect={currentValue => {
                                    onStyleChosen(currentValue);
                                    setOpen(false);
                                }}>
                                {style.tag}
                                <div className='ml-auto'>{style.prefix ?? ''}</div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
