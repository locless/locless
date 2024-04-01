'use client';
import { Button } from '@repo/ui/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@repo/ui/components/ui/dialog';
import { Play } from 'lucide-react';
import React from 'react';
import useEditor from './useEditor';
import { Id } from '@repo/backend/convex/_generated/dataModel';
import { useQRCode } from 'next-qrcode';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    projectId: Id<'projects'>;
    componentId: Id<'components'>;
}

export const PreviewNodeButton = ({ projectId, componentId, ...rest }: Props) => {
    const { componentsData, environment } = useEditor();
    const { SVG } = useQRCode();

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    className='flex-row items-center gap-1 font-semibold '
                    {...rest}
                    disabled={componentsData.layout.length === 0}>
                    <Play size={18} className='w-4 h-4 ' />
                    Preview
                </Button>
            </DialogTrigger>
            <DialogContent className='w-10/12'>
                <DialogHeader>
                    <DialogTitle className='text-black'>Preview your component</DialogTitle>
                    <DialogDescription>
                        Download official Locless app and scan the QR code to preview your component in real-time.
                    </DialogDescription>
                    {environment ? (
                        <SVG
                            text={JSON.stringify({ projectId, componentId, environmentId: environment._id })}
                            options={{
                                margin: 2,
                                width: 200,
                            }}
                        />
                    ) : null}
                </DialogHeader>
                <div className='gap-4 py-4'></div>
            </DialogContent>
        </Dialog>
    );
};
