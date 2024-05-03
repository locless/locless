'use client';
import { FadeIn } from '@/components/landing/fade-in';
import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default function AuthLayout(props: { children: React.ReactNode }) {
    const { userId } = useAuth();

    if (userId) {
        return redirect('/app/projects');
    }
    return (
        <FadeIn>
            <div className='grid h-screen  grid-cols-1 place-items-center bg-white'>
                <div className='container'>{props.children}</div>
            </div>
        </FadeIn>
    );
}
