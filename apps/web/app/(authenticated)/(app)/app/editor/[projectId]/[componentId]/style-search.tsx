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
import { StylesValues } from './constants';
import { Plus } from 'lucide-react';
import { useState } from 'react';

interface IProps {
    onStyleChosen: (value: string) => void;
}

export const StyleSearch = ({ onStyleChosen }: IProps) => {
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
                    <CommandInput placeholder='Search style...' className='h-9' />
                    <CommandList className='overflow-scroll overflow-x-hidden'>
                        <CommandEmpty>No style found.</CommandEmpty>
                        <CommandGroup>
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
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
