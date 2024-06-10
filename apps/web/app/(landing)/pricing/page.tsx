import { cn } from '@repo/ui/lib/utils';
import { cva } from 'class-variance-authority';
import Link from 'next/link';

const tiers = {
  free: {
    name: 'Free Tier',
    id: 'free',
    href: '/app',
    price: 0,
    description: 'Everything you need to start your journey with us!',
    buttonText: 'Start building',
    features: ['5 Active Components', '2500 Requests per month', '1000 File loads per month', 'Discord Support'],
    footnotes: [],
  },
  pro: {
    name: 'Pro Tier',
    id: 'paid',
    href: '/app',
    price: 25,
    description: 'For those with teams and more demanding needs',
    buttonText: 'Upgrade now',
    features: [
      '100 Active Components *',
      '150.000 Requests per month **',
      '100.000 File loads per month ***',
      'Workspaces with team members',
      'Priority Support',
    ],
    footnotes: [
      ' *  Additional elements are billed at $0.10',
      ' ** Additional requests are billed at $1 per 100,000',
      ' *** Additional file loads are billed at $1 per 10,000',
    ],
  },
  custom: {
    name: 'Custom',
    id: 'enterprise',
    href: '', // TODO: add call url
    price: "Let's talk",
    description: 'We offer custom pricing for those with volume needs',
    buttonText: 'Schedule a call',
    features: [
      'Custom Active Components Limits',
      'Custom Active Variables Limits',
      'Custom Active Translations Limits',
      'Custom Requests Limits',
      'Pricing based on your needs',
      'Dedicated support',
      'Feature requests',
    ],
    footnotes: [],
  },
};

const buttonVariants = cva(
  'mt-8 h-10 px-4 py-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const metadata = {
  title: 'Pricing | Locless',
  description: 'Pricing for Locless',
  openGraph: {
    title: 'Pricing | Locless',
    description: 'Pricing for Locless',
    url: 'https://locless.com/pricing',
    siteName: 'locless.com',
  },
};

export default async function PricingPage() {
  return (
    <div>
      <div className='flex items-center justify-center overflow-auto'>
        <div className='relative w-full max-w-6xl px-6 py-10 isolate lg:px-8'>
          <div>
            <div className='text-center'>
              <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
                {'Pricing built for '}
                <br />
                <span className='text-gray-500'>{'everyone.'}</span>
              </h1>
              <p className='mt-6 text-lg leading-8 text-gray-600'>
                {
                  "We wanted pricing to be simple and affordable for anyone, so we've created a flexible plans that don't need an accounting degree to figure out."
                }
              </p>
            </div>
            <div className='flex flex-col mt-10 gap-y-6 sm:gap-x-6 lg:flex-row'>
              {(['free', 'pro', 'custom'] as const).map(tier => (
                <div
                  key={tiers[tier].id}
                  className={cn(
                    'ring-1 ring-gray-200 flex w-full flex-col justify-between rounded-3xl bg-white p-8 shadow-lg lg:w-1/3 xl:p-10',
                    tier === 'pro' ? 'border-2 border-black' : ''
                  )}>
                  <div className='flex items-center justify-between gap-x-4'>
                    <h2 id={tiers[tier].id} className={'text-gray-900 text-2xl font-semibold leading-8'}>
                      {tiers[tier].name}
                    </h2>
                  </div>
                  <p className='mt-4 min-h-[3rem] text-sm leading-6 text-gray-600 tex'>{tiers[tier].description}</p>
                  <p className='flex items-center mx-auto mt-6 gap-x-1'>
                    {typeof tiers[tier].price === 'number' ? (
                      <>
                        <span className='text-4xl font-bold tracking-tight text-center text-gray-900'>
                          {`$${tiers[tier].price}`}
                        </span>
                        <span className='text-sm font-semibold leading-6 text-gray-600 mx-autotext-center'>
                          {'/month'}
                        </span>
                      </>
                    ) : (
                      <span className='mx-auto text-4xl font-bold tracking-tight text-center text-gray-900'>
                        {tiers[tier].price}
                      </span>
                    )}
                  </p>
                  <Link
                    href={tiers[tier].href}
                    target='_blank'
                    title=''
                    role='button'
                    className={cn(buttonVariants({ variant: tier === 'pro' ? 'default' : 'outline' }))}>
                    {tiers[tier].buttonText}
                  </Link>
                  <div className='flex flex-col justify-between grow'>
                    <ul className='mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10'>
                      {tiers[tier].features.map(feature => (
                        <li key={feature} className='flex gap-x-3'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                            className='flex-none w-5 h-6 text-gray-700'
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
                      <ul className='mt-6'>
                        {tiers[tier].footnotes.map((footnote, i) => (
                          <li key={`note-${i}`} className='flex text-xs text-gray-600 gap-x-3'>
                            {footnote}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
