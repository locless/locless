'use client';

import { AuthLoading, Authenticated } from 'convex/react';
import { ThemeProvider } from './theme-provider';
import { Loading } from '@/components/dashboard/loading';
import { RedirectToSignUp, SignedIn, SignedOut } from '@clerk/clerk-react';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <SignedIn>
                <Authenticated>{children}</Authenticated>
                <AuthLoading>
                    <div className='flex h-screen items-center justify-center '>
                        <Loading />
                    </div>
                </AuthLoading>
            </SignedIn>
            <SignedOut>
                <RedirectToSignUp />
            </SignedOut>
        </ThemeProvider>
    );
}
