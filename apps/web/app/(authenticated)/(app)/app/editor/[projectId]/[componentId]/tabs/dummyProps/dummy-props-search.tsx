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
import { Plus } from 'lucide-react';
import { useState } from 'react';
import useEditor from '../../useEditor';
import { OutsidePropType } from '@repo/backend/constants';

interface IProps {
    onChosen: (value: string, type: OutsidePropType) => void;
}

export const DummyPropSearch = ({ onChosen }: IProps) => {
    const [open, setOpen] = useState(false);
    const { componentsData } = useEditor();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button role='combobox' aria-expanded={open}>
                    <Plus size={18} className='w-4 h-4 ' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[400px] p-0 mr-4'>
                <Command>
                    <CommandInput placeholder='Search outside props...' className='h-9' />
                    <CommandList className='overflow-scroll overflow-x-hidden'>
                        <CommandEmpty>No outside props found.</CommandEmpty>
                        <CommandGroup>
                            {componentsData.outsideProps
                                ? componentsData.outsideProps.map(prop => (
                                      <CommandItem
                                          key={prop.name}
                                          value={prop.name}
                                          onSelect={currentValue => {
                                              onChosen(currentValue, prop.type);
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
