'use client';

import { Toaster } from '@repo/ui/components/ui/toaster';
import { TooltipProvider } from '@repo/ui/components/ui/tooltip';
import ConvexClientProvider from './ConvexClientProvider';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <TooltipProvider>
                <ConvexClientProvider>{children}</ConvexClientProvider>
            </TooltipProvider>
            <Toaster />
        </>
    );
}
