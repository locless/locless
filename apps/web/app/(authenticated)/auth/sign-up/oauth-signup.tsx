'use client';
import { Loading } from '@/components/dashboard/loading';
import { Button } from '@repo/ui/components/ui/button';
import { Icons } from '@repo/ui/components/ui/icons';
import { useToast } from '@repo/ui/components/ui/use-toast';
import { useSignUp } from '@clerk/clerk-react';
import { useState } from 'react';

export function OAuthSignUp() {
    const [isLoading, setIsLoading] = useState<any>(null);
    const { signUp, isLoaded: signupLoaded } = useSignUp();

    const { toast } = useToast();

    const oauthSignIn = async (provider: any) => {
        if (!signupLoaded) {
            return null;
        }
        try {
            setIsLoading(provider);
            await signUp.authenticateWithRedirect({
                strategy: provider,
                redirectUrl: '/auth/sso-callback',
                redirectUrlComplete: '/app/projects',
            });
        } catch (cause) {
            console.error(cause);
            setIsLoading(null);
            toast({
                variant: 'destructive',
                description: 'Something went wrong, please try again.',
            });
        }
    };

    return (
        <div className='flex flex-col gap-2'>
            <Button variant='secondary' className='bg-background' onClick={() => oauthSignIn('oauth_github')}>
                {isLoading === 'oauth_github' ? (
                    <Loading className='w-4 h-4 mr-2' />
                ) : (
                    <Icons.gitHub className='w-4 h-4 mr-2' />
                )}
                GitHub
            </Button>
            <Button variant='secondary' className='bg-background' onClick={() => oauthSignIn('oauth_google')}>
                {isLoading === 'oauth_google' ? (
                    <Loading className='w-4 h-4 mr-2' />
                ) : (
                    <Icons.google className='w-4 h-4 mr-2' />
                )}
                Google
            </Button>
        </div>
    );
}
