'use client';

import { Toaster } from '@repo/ui/components/ui/toaster';
import { TooltipProvider } from '@repo/ui/components/ui/tooltip';
import { ThemeProvider } from './theme-provider';
import { ClerkProvider } from '@clerk/nextjs';
import { ReactQueryProvider } from './react-query-provider';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ClerkProvider signInFallbackRedirectUrl='/app/projects' signUpFallbackRedirectUrl='/app/projects'>
        <ReactQueryProvider>
          <ThemeProvider attribute='class' enableSystem={false}>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </ClerkProvider>
      <Toaster />
    </>
  );
}
