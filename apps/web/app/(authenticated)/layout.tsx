'use client';

import { Toaster } from '@repo/ui/components/ui/toaster';
import { TooltipProvider } from '@repo/ui/components/ui/tooltip';
import { ThemeProvider } from './theme-provider';
import { ClerkProvider } from '@clerk/nextjs';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <ClerkProvider signInFallbackRedirectUrl='/app/projects' signUpFallbackRedirectUrl='/app/projects'>
                <ThemeProvider attribute='class'>
                    <TooltipProvider>{children}</TooltipProvider>
                </ThemeProvider>
            </ClerkProvider>
            <Toaster />
        </>
    );
}
