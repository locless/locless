'use client';

import Link from 'next/link';

import { Footer } from './footer';
import LoclessHero from './hero';
import { cn } from '@repo/ui/lib/utils';
import { AnimateOnScroll } from './AnimationOnScroll';

function Header() {
  return (
    <header className='sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm'>
      <nav className='mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8' aria-label='Global'>
        <div className='flex lg:flex-1'>
          <Link className='flex flex-row items-baseline' href='/'>
            <h1 className='relative flex flex-row items-baseline text-2xl font-bold'>
              <span className='sr-only text-white'>Locless</span>
              <span className='tracking-tight hover:cursor-pointer text-white'>locless</span>
              <sup className='absolute left-[calc(100%+.1rem)] top-0 text-xs font-bold text-white'>[BETA]</sup>
            </h1>
          </Link>
        </div>
        <div className='hidden lg:flex lg:gap-x-12'>
          <Link
            href='/docs'
            target='_blank'
            className='text-sm font-semibold leading-6 text-white opacity-80 hover:opacity-100'
            rel='noreferrer'>
            Docs
          </Link>
          <Link
            href='/pricing'
            target='_self'
            className='text-sm font-semibold leading-6 text-white opacity-80 hover:opacity-100'
            rel='noreferrer'>
            Pricing
          </Link>
        </div>
        <div className='hidden flex-1 items-center justify-end gap-x-6 md:flex'>
          <div className='flex items-center gap-4'>
            <Link
              href='/app/projects'
              className='custom-button h-10 px-4 py-2 text-sm text-primary-foreground bg-btn_bg'>
              Sign in
              <div className='custom-button__left'></div>
              <div className='custom-button__right'></div>
            </Link>
            <Link
              href='/sign-up'
              className='custom-button-reverse h-10 px-4 py-2 text-sm text-primary-foreground bg-white/20 hover:bg-btn_bg'>
              Create Account
              <div className='custom-button-reverse__left'></div>
              <div className='custom-button-reverse__right'></div>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

const tiers = {
  free: {
    name: 'Free',
    id: 'free',
    href: '/app',
    price: 0,
    description: 'Everything you need to start your journey with us!',
    buttonText: 'Start building',
    features: ['1000 API Requests per month', '1GB of file storage', '1GB of file bandwidth', 'Discord Support'],
    footnotes: ['No credit card required'],
  },
  pro: {
    name: 'Pro',
    id: 'paid',
    href: '/app',
    price: 25,
    description: 'For those with teams and more demanding needs',
    buttonText: 'Upgrade now',
    features: [
      '100.000 API Requests per month *',
      '100GB of file storage **',
      '50GB of file bandwidth ***',
      'Workspaces with team members',
      'Priority Support',
    ],
    footnotes: [
      ' * Additional requests are billed at $1 per 10,000',
      ' ** 0.03$/month per GB',
      ' *** 0.3$/month per GB',
    ],
  },
  custom: {
    name: 'Custom',
    id: 'enterprise',
    href: 'mailto:support@locless.com',
    price: "Let's talk",
    description: 'We offer custom pricing for those with volume needs',
    buttonText: 'Contact us',
    features: [
      'Custom API Requests Limits',
      'Custom File Storage Limits',
      'Custom File Bandwidth Limits',
      'Pricing based on your needs',
      'Dedicated support',
      'Feature requests',
    ],
    footnotes: [],
  },
};

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-screen flex-col justify-between'>
      <LoclessHero />
      <section className='container mx-auto flex flex-col items-center mt-20 gap-10'>
        <AnimateOnScroll>
          <h1 className='text-4xl font-bold tracking-tight text-center sm:text-5xl bg-gradient-to-b from-primary-foreground to-gray-500 inline-block text-transparent bg-clip-text'>
            Pricing built for everyone
          </h1>
        </AnimateOnScroll>
        <AnimateOnScroll delay={0.3}>
          <p className='text-lg leading-8 text-gray-300 text-center max-w-[720px]'>
            We wanted pricing to be simple and affordable for anyone, so we've created a flexible plans that don't need
            an accounting degree to figure out.
          </p>
        </AnimateOnScroll>
        <div className='flex flex-col w-full px-10 py-[60px] rounded-2xl border-y-2 border-white/10'>
          <div className='flex flex-col mt-10 gap-y-6 sm:gap-x-6 lg:flex-row'>
            {(['free', 'pro', 'custom'] as const).map((tier, index) => (
              <AnimateOnScroll
                key={tiers[tier].id}
                delay={0.6 + 0.3 * index}
                className={cn(
                  'flex w-full flex-col items-center justify-between rounded-3xl bg-[#15151566] p-8 shadow-lg lg:w-1/3 xl:p-10',
                  tier === 'pro' ? 'border border-white/10' : 'border-y border-white/10'
                )}>
                <h2 id={tiers[tier].id} className={'text-white text-2xl font-semibold leading-8'}>
                  {tiers[tier].name}
                </h2>
                <p className='mt-2 min-h-[3rem] max-w-[250px] text-sm leading-6 text-white text-center'>
                  {tiers[tier].description}
                </p>
                <p className='flex items-center mx-auto my-6 gap-x-1'>
                  {typeof tiers[tier].price === 'number' ? (
                    <>
                      <span className='text-4xl font-bold tracking-tight text-center text-white'>
                        {`$${tiers[tier].price}`}
                      </span>
                      <span className='text-sm font-semibold leading-6 text-white mx-autotext-center'>{'/month'}</span>
                    </>
                  ) : (
                    <span className='mx-auto text-4xl font-bold tracking-tight text-center text-white'>
                      {tiers[tier].price}
                    </span>
                  )}
                </p>
                {tier === 'pro' ? (
                  <Link
                    href={tiers[tier].href}
                    className='custom-button-reverse text-sm text-primary-foreground bg-[#434343] hover:bg-btn_bg'>
                    {tiers[tier].buttonText}
                    <div className='custom-button-reverse__left'></div>
                    <div className='custom-button-reverse__right'></div>
                  </Link>
                ) : (
                  <Link className='custom-button text-primary-foreground bg-btn_bg' href={tiers[tier].href}>
                    {tiers[tier].buttonText}
                    <div className='custom-button__left'></div>
                    <div className='custom-button__right'></div>
                  </Link>
                )}
                <div className='flex flex-col justify-between grow'>
                  <ul className='mt-8 space-y-3 text-sm leading-6 text-white xl:mt-10'>
                    {tiers[tier].features.map(feature => (
                      <li key={feature} className='flex gap-x-3'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 24 24'
                          className='flex-none w-5 h-6 text-white'
                          aria-hidden='true'>
                          <path
                            fill='currentColor'
                            fillRule='evenodd'
                            d='M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353l8.493-12.739a.75.75 0 0 1 1.04-.208Z'
                            clipRule='evenodd'
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {tiers[tier].footnotes && (
                    <ul className='mt-4'>
                      {tiers[tier].footnotes.map((footnote, i) => (
                        <li key={`note-${i}`} className='flex text-xs text-white/60 gap-x-3 mt-2'>
                          {footnote}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
