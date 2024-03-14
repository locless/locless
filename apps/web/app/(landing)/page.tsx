import Link from 'next/link';

export default async function Home() {
    return (
        <div className='-mt-16'>
            <div className='flex items-center justify-center overflow-auto'>
                <div className='relative isolate px-6 py-14 lg:px-8'>
                    <div className='max-w-3xl'>
                        <div className='text-center'>
                            <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl'>
                                Remote UI for
                                <br />
                                <span className='text-gray-500'>React Native</span> Developers
                            </h1>
                            <p className='mt-6 text-lg leading-8 text-gray-600'>
                                Mobile dev is better than ever. Create UI remotely and forget about updates pain.
                            </p>
                            <div className='mt-10 flex items-center justify-center gap-x-6'>
                                <Link
                                    href='/app'
                                    className='h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90'>
                                    Get started
                                </Link>
                                <Link
                                    className='text-sm font-semibold leading-6 text-gray-900'
                                    href='https://docs.locless.com'>
                                    Learn more <span aria-hidden='true'>→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}