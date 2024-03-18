'use client';
import { Button } from '@repo/ui/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@repo/ui/components/ui/dialog';
import { Input } from '@repo/ui/components/ui/input';
import { useToast } from '@repo/ui/components/ui/use-toast';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { Label } from '@repo/ui/components/ui/label';
import useEditor from './useEditor';
import { typesGlobalProps } from './constants';

type PropValue = 'string' | 'number' | 'boolean' | 'object' | 'function' | 'array' | '';

export const CreateComponentProp = ({ ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const { toast } = useToast();

    const [name, setName] = useState('');
    const [value, setValue] = useState<PropValue>('');

    const { componentsData, updateOutsideProp } = useEditor();

    const handleSetActiveComponent = (prop: PropValue) => {
        setValue(value === prop ? '' : prop);
    };

    const handleCreateActiveComponent = () => {
        if (componentsData.outsideProps?.find(prop => prop.name === name)) {
            toast({
                variant: 'destructive',
                description: 'Prop with this name already exists!',
            });
            return;
        }

        if (value === '') {
            toast({
                variant: 'destructive',
                description: 'Please choose prop type!',
            });
            return;
        }

        updateOutsideProp({ name, type: value });

        toast({
            description: 'New prop has been added!',
        });

        setName('');
        setValue('');
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className='flex-row items-center gap-1 font-semibold ' {...rest}>
                    <Plus size={18} className='w-4 h-4 ' />
                    Add Prop
                </Button>
            </DialogTrigger>
            <DialogContent className='w-10/12'>
                <DialogHeader>
                    <DialogTitle className='text-black'>Add Outside Prop</DialogTitle>
                    <DialogDescription>
                        Write prop name which you gonna send outside of the component in your app and choose one of the
                        types. You will be able to use this prop anywhere in the component.{' '}
                        <strong>
                            Locless will assume by default that all props are optional and can be undefined!
                        </strong>
                    </DialogDescription>
                </DialogHeader>
                <div className='gap-4 py-4'>
                    <div className='flex flex-col gap-4'>
                        <Label htmlFor='name' className='text-black'>
                            Prop Name
                        </Label>
                        <Input
                            id='name'
                            value={name}
                            className='col-span-3 text-black'
                            onChange={e => setName(e.currentTarget.value)}
                        />
                    </div>
                    <div className='flex flex-col gap-4 mt-6'>
                        <div className='flex flex-wrap gap-4'>
                            {typesGlobalProps.map(prop => (
                                <Button
                                    key={prop}
                                    variant={value === prop ? 'default' : 'outline'}
                                    className={`${value !== prop ? 'text-black' : ''} h-14`}
                                    onClick={() => handleSetActiveComponent(prop as PropValue)}>
                                    {prop}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter className='flex-row justify-end gap-2 pt-4 '>
                    <DialogClose asChild>
                        <Button type='button' onClick={handleCreateActiveComponent}>
                            Save
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
