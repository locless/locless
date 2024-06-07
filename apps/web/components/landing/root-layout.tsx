'use client';

import Link from 'next/link';

import { Footer } from './footer';

function Header() {
    return (
        <header className='sticky top-0 z-50 w-full bg-gradient-to-b from-white via-white/60 via-70%'>
            <nav
                className='mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8'
                aria-label='Global'>
                <div className='flex lg:flex-1'>
                    <Link className='flex flex-row items-baseline' href='/'>
                        <h1 className='relative flex flex-row items-baseline text-2xl font-bold'>
                            <span className='sr-only'>Locless</span>
                            <span className='tracking-tight hover:cursor-pointer'>locless</span>
                            <sup className='absolute left-[calc(100%+.1rem)] top-0 text-xs font-bold text-black'>
                                [BETA]
                            </sup>
                        </h1>
                    </Link>
                </div>
                <div className='hidden lg:flex lg:gap-x-12'>
                    <Link
                        href='https://docs.locless.com'
                        target='_blank'
                        className='text-sm font-semibold leading-6 text-gray-900 opacity-80 hover:opacity-100'
                        rel='noreferrer'>
                        Docs
                    </Link>
                    <Link
                        href='/pricing'
                        target='_self'
                        className='text-sm font-semibold leading-6 text-gray-900 opacity-80 hover:opacity-100'
                        rel='noreferrer'>
                        Pricing
                    </Link>
                </div>
                <div className='hidden flex-1 items-center justify-end gap-x-6 md:flex'>
                    <div className='flex items-center gap-4'>
                        <Link
                            href='/'
                            className='h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90'>
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className='flex h-screen flex-col justify-between'>
            <Header />
            {children}
            <Footer />
        </div>
    );
}
