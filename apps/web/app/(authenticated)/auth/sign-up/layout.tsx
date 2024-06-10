'use client';
import { FadeIn } from '@/components/landing/fade-in';
import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

const features: {
  title: string;
  description: string;
}[] = [
  {
    title: 'Save development time',
    description: 'Issue, manage, and revoke keys for your APIs in seconds with built in analytics.',
  },
  {
    title: 'Globally distributed',
    description: 'Unkey Globally distrubtes keys in 35+ locations, making it fast for every user.',
  },
  {
    title: 'Features for any use case',
    description: 'Each key has unique settings such as rate limiting, expiration, and limited uses.',
  },
];

export default function AuthLayout(props: { children: React.ReactNode }) {
  const { userId } = useAuth();

  if (userId) {
    return redirect('/app/projects');
  }
  return (
    <FadeIn>
      <div className='relative grid min-h-screen overflow-hidden'>
        <div className='from-background to-background/60 absolute inset-0 bg-gradient-to-t md:hidden' />
        <div className='container absolute top-1/2 col-span-1 flex -translate-y-1/2 items-center md:static md:top-0 md:col-span-2 md:flex md:translate-y-0 lg:col-span-1'>
          {props.children}
        </div>
      </div>
    </FadeIn>
  );
}
