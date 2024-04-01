'use client';
import { Button } from '@repo/ui/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
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
import { useMutation } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';

export const CreateEnvButton = ({ ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const { toast } = useToast();

    const [name, setName] = useState('');

    const createEnv = useMutation(api.environment.create);

    const { component, updateEnvironment } = useEditor();

    const handleCreateActiveEnv = async () => {
        if (!component || name === '') {
            return;
        }

        const env = await createEnv({
            name,
            componentId: component._id,
        });

        if (env) {
            updateEnvironment(env);
            toast({
                description: 'New branch has been created!',
            });

            setName('');
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className='flex-row items-center gap-1 font-semibold ' {...rest}>
                    <Plus size={18} className='w-4 h-4 ' />
                </Button>
            </DialogTrigger>
            <DialogContent className='w-10/12'>
                <DialogHeader>
                    <DialogTitle className='text-black'>Create new branch</DialogTitle>
                </DialogHeader>
                <div className='gap-4 py-4'>
                    <div className='flex flex-col gap-4'>
                        <Label htmlFor='name' className='text-black'>
                            Branch Name
                        </Label>
                        <Input
                            id='name'
                            value={name}
                            className='col-span-3 text-black'
                            onChange={e => setName(e.currentTarget.value)}
                        />
                    </div>
                </div>
                <DialogFooter className='flex-row justify-end gap-2 pt-4 '>
                    <DialogClose asChild>
                        <Button type='button' onClick={handleCreateActiveEnv}>
                            Create
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
