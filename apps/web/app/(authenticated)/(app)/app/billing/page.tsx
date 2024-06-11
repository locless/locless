import { PageHeader } from '@/components/dashboard/page-header';

import { Separator } from '@repo/ui/components/ui/separator';
import Link from 'next/link';
import { DesktopTopBar } from '../desktop-topbar';
import { getTenantId } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { cn } from '@repo/ui/lib/utils';
import { cva } from 'class-variance-authority';

const tiers = {
  free: {
    name: 'Free',
    id: 'free',
    href: '/app',
    price: 0,
    description: 'Everything you need to start your journey with us!',
    buttonText: 'Revert to free',
    features: ['5 Active Components', '1000 API Requests per month', 'Discord Support'],
    footnotes: ['No credit card required'],
  },
  hobby: {
    name: 'Hobby',
    id: 'hobby',
    href: '/app/billing/stripe/hobby',
    price: 15,
    description: 'For solo and small projects',
    buttonText: 'Upgrade now',
    features: ['20 Active Components *', '20.000 API Requests per month **', 'Priority Support'],
    footnotes: [' *  Additional elements are billed at $0.10', ' ** Additional requests are billed at $1 per 10,000'],
  },
  pro: {
    name: 'Pro',
    id: 'pro',
    href: '/app/billing/stripe/pro',
    price: 25,
    description: 'For those with teams and more demanding needs',
    buttonText: 'Upgrade now',
    features: [
      '100 Active Components *',
      '100.000 API Requests per month **',
      'Workspaces with team members',
      'Priority Support',
    ],
    footnotes: [' *  Additional elements are billed at $0.10', ' ** Additional requests are billed at $1 per 10,000'],
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
      'Custom API Requests Limits',
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

export default async function BillingPage() {
  const tenantId = getTenantId();

  const workspace = await db.query.workspaces.findFirst({
    where: (table, { and, eq, isNull }) => and(eq(table.tenantId, tenantId), isNull(table.deletedAt)),
  });

  if (!workspace) {
    return redirect('/');
  }

  return (
    <>
      <DesktopTopBar className='flex items-center' />
      <div className='p-4 border-l bg-background border-border w-full flex-1 lg:p-8'>
        <PageHeader
          title='Billing'
          description='Manage your billing'
          actions={
            workspace.stripeCustomerId
              ? [
                  <Link
                    href='/app/billing/stripe/manage'
                    target='_blank'
                    className='mr-3 rounded-lg bg-gray-800 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:ring-gray-800'>
                    Manage billing
                  </Link>,
                ]
              : []
          }
        />
        <Separator className='my-6' />
        <div>
          <div className='flex flex-col mt-10 gap-y-6 sm:gap-x-6 lg:flex-row flex-wrap'>
            {(['free', 'hobby', 'pro', 'custom'] as const).map(tier => (
              <div
                key={tiers[tier].id}
                className={
                  'ring-1 ring-gray-200 flex flex-col justify-between rounded-3xl bg-white shadow-none transition-shadow duration-300 p-8 xl:p-10 ease-in-out hover:shadow-xl'
                }>
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
                {workspace.plan === tier ? (
                  <>
                    <Separator className='mt-8' />
                    <p className='my-4 text-sm leading-6 text-gray-600 text-center'>Current plan</p>
                    <Separator />
                  </>
                ) : (
                  <Link
                    href={tiers[tier].href}
                    target='_blank'
                    title=''
                    role='button'
                    aria-disabled={workspace.plan === tier}
                    className={cn(buttonVariants({ variant: 'default' }))}>
                    {workspace.plan === tier ? 'Current plan' : tiers[tier].buttonText}
                  </Link>
                )}
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
    </>
  );
}
