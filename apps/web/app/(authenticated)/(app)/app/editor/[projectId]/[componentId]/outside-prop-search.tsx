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
import { Cable } from 'lucide-react';
import { useState } from 'react';
import useEditor from './useEditor';

interface IProps {
    isAssigned?: boolean;
    value?: string;
    currentTag?: string;
    onChosen: ({
        outsidePropName,
        currentTag,
        value,
    }: {
        outsidePropName: string;
        currentTag?: string;
        value?: string;
    }) => void;
}

export const OutsidePropSearch = ({ isAssigned, value, currentTag, onChosen }: IProps) => {
    const [open, setOpen] = useState(false);

    const { componentsData } = useEditor();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button role='combobox' aria-expanded={open}>
                    <Cable size={18} className='w-4 h-4 ' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[400px] p-0 mr-4'>
                <Command>
                    <CommandInput placeholder='Search outside props...' className='h-9' />
                    <CommandList className='overflow-scroll overflow-x-hidden'>
                        <CommandEmpty>No outside props found.</CommandEmpty>
                        <CommandGroup>
                            {isAssigned ? (
                                <CommandItem
                                    key='remove-outside-prop'
                                    value='remove-outside-prop'
                                    onSelect={currentValue => {
                                        onChosen({ outsidePropName: currentValue, currentTag, value });
                                        setOpen(false);
                                    }}>
                                    Remove currently assigned prop
                                </CommandItem>
                            ) : null}
                            {componentsData.outsideProps
                                ? Object.values(componentsData.outsideProps).map(prop => (
                                      <CommandItem
                                          key={prop.name}
                                          value={prop.name}
                                          onSelect={currentValue => {
                                              onChosen({ outsidePropName: currentValue, currentTag, value: prop.name });
                                              setOpen(false);
                                          }}>
                                          {prop.name}
                                          <div className='ml-auto'>{prop.type}</div>
                                      </CommandItem>
                                  ))
                                : null}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
