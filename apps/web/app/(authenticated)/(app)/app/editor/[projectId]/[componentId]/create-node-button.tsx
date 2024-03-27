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
import { v4 as uuid } from 'uuid';
import { typesWithoutChildren } from './constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/ui/tabs';
import { MetaType, metaTypeArray } from '@repo/backend/constants';

export const CreateNodeButton = ({ ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const { toast } = useToast();

    const [name, setName] = useState('');
    const [value, setValue] = useState('');

    const [tab, setTab] = useState('native-components');

    const { componentsData, addToLayout, updateMeta, updateProps, updateStyles } = useEditor();

    const handleSetActiveComponent = (type: string) => {
        setValue(value === type ? '' : type);
    };

    const handleCreateActiveComponent = () => {
        const id = uuid();

        const type = tab === 'native-components' ? (value as MetaType) : componentsData.meta[value]?.type;
        const styles = tab === 'native-components' ? undefined : componentsData.styles?.[value];
        const props = tab === 'native-components' ? undefined : componentsData.props?.[value];

        if (!type) {
            return;
        }

        if (props) {
            updateProps(id, props);
        }

        if (styles) {
            updateStyles(id, styles);
        }

        updateMeta(id, {
            id,
            type,
            name,
        });

        const canHaveChildren = !typesWithoutChildren.includes(type);
        addToLayout({
            id,
            value: name,
            canHaveChildren,
            children: canHaveChildren ? [] : undefined,
        });

        toast({
            description: 'Your element has been created!',
        });

        setName('');
        setValue('');
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className='flex-row items-center gap-1 font-semibold ' {...rest}>
                    <Plus size={18} className='w-4 h-4 ' />
                    Create Element
                </Button>
            </DialogTrigger>
            <DialogContent className='w-10/12'>
                <DialogHeader>
                    <DialogTitle className='text-black'>Create new component</DialogTitle>
                    <DialogDescription>
                        Choose one of components from the list. Click create when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <div className='gap-4 py-4'>
                    <div className='flex flex-col gap-4'>
                        <Label htmlFor='name' className='text-black'>
                            Component Name
                        </Label>
                        <Input
                            id='name'
                            value={name}
                            className='col-span-3 text-black'
                            onChange={e => setName(e.currentTarget.value)}
                        />
                    </div>
                    <div className='flex flex-col gap-4 mt-6'>
                        <Tabs
                            defaultValue='native-components'
                            value={tab}
                            onValueChange={value => {
                                setValue('');
                                setTab(value);
                            }}
                            className='w-full'>
                            <TabsList className='flex'>
                                <TabsTrigger value='native-components' className='flex-1'>
                                    Native
                                </TabsTrigger>
                                <TabsTrigger value='created-components' className='flex-1'>
                                    Created
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value='native-components'>
                                <div className='flex flex-wrap gap-4 mt-4'>
                                    {metaTypeArray.map(type => (
                                        <Button
                                            key={type}
                                            variant={value === type ? 'default' : 'outline'}
                                            className={`${value !== type ? 'text-black' : ''} h-14`}
                                            onClick={() => handleSetActiveComponent(type)}>
                                            {`${type[0]?.toUpperCase()}${type.slice(1)}`}
                                        </Button>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value='created-components'>
                                <div className='flex flex-wrap gap-4 mt-4'>
                                    {Object.keys(componentsData.meta).map(id => (
                                        <Button
                                            key={id}
                                            variant={value === id ? 'default' : 'outline'}
                                            className={`${value !== id ? 'text-black' : ''} h-14`}
                                            onClick={() => handleSetActiveComponent(id)}>
                                            {componentsData.meta[id]?.name}
                                        </Button>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                <DialogFooter className='flex-row justify-end gap-2 pt-4 '>
                    <DialogClose asChild>
                        <Button type='button' onClick={handleCreateActiveComponent}>
                            Create
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
