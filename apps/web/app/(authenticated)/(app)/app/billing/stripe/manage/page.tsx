import { getTenantId } from '@/lib/auth';
import { db } from '@/lib/db';
import { stripeEnv } from '@/lib/env';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Stripe from 'stripe';

export default async function StripeManageRedirect() {
  const tenantId = getTenantId();

  if (!tenantId) {
    return redirect('/auth/sign-in');
  }

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

  if (ws.stripeCustomerId) {
    const session = await stripe.billingPortal.sessions.create({
      customer: ws.stripeCustomerId,
      return_url: headers().get('referer') ?? 'https://locless.com/app/billing',
    });

    return redirect(session.url);
  }

  return notFound();
}
