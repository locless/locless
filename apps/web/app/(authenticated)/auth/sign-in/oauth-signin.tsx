'use client';
import { Loading } from '@/components/dashboard/loading';
import { Button } from '@repo/ui/components/ui/button';
import { Icons } from '@repo/ui/components/ui/icons';
import { useToast } from '@repo/ui/components/ui/use-toast';
import { useSignIn } from '@clerk/nextjs';
import * as React from 'react';

export function OAuthSignIn() {
  const [isLoading, setIsLoading] = React.useState<any>(null);
  const { signIn, isLoaded: signInLoaded } = useSignIn();

  const { toast } = useToast();

  const oauthSignIn = async (provider: any) => {
    if (!signInLoaded) {
      return null;
    }
    try {
      setIsLoading(provider);
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/auth/sso-callback',
        redirectUrlComplete: '/app/projects',
      });
    } catch (err) {
      console.error(err);
      setIsLoading(null);
      toast({
        variant: 'destructive',
        description: (err as Error).message,
      });
    }
  };

  return (
    <div className='flex flex-col gap-2'>
      <Button
        className='bg-gray-50 text-black border-gray-300 hover:bg-black hover:text-white'
        onClick={() => oauthSignIn('oauth_github')}>
        {isLoading === 'oauth_github' ? (
          <Loading className='w-4 h-4 mr-2' />
        ) : (
          <Icons.gitHub className='w-4 h-4 mr-2' />
        )}
        GitHub
      </Button>
    </div>
  );
}
