import { getTenantId } from '@/lib/auth';
import { db } from '@/lib/db';
import { stripeEnv } from '@/lib/env';
import { currentUser } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';

export default async function StripeRedirect() {
  const tenantId = getTenantId();

  if (!tenantId) {
    return redirect('/auth/sign-in');
  }

  const user = await currentUser();

  const ws = await db.query.workspaces.findFirst({
    where: (table, { and, eq, isNull }) => and(eq(table.tenantId, tenantId), isNull(table.deletedAt)),
  });

  if (!ws) {
    return redirect('/');
  }

  const e = stripeEnv();

  if (!e) {
    return redirect('/app');
  }

  const stripe = new Stripe(e.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
    typescript: true,
  });

  // If they have a subscription already, we display the portal
  if (ws.stripeCustomerId) {
    const session = await stripe.billingPortal.sessions.create({
      customer: ws.stripeCustomerId,
      return_url: headers().get('referer') ?? 'https://locless.com/app/billing',
    });

    return redirect(session.url);
  }

  const baseUrl = process.env.VERCEL_URL ? 'https://locless.com/app/billing' : 'http://localhost:3000/app/billing';

  const successUrl = `${baseUrl}/stripe/success?session_id={CHECKOUT_SESSION_ID}`;

  const cancelUrl = headers().get('referer') ?? baseUrl;

  const session = await stripe.checkout.sessions.create({
    client_reference_id: ws.id,
    customer_email: user?.emailAddresses.at(0)?.emailAddress,
    billing_address_collection: 'auto',
    mode: 'setup',
    success_url: successUrl,
    cancel_url: cancelUrl,
    currency: 'USD',
    customer_creation: 'always',
  });

  if (!session.url) {
    return <div>Could not create checkout session</div>;
  }

  return redirect(session.url);
}
