import type { Readable } from 'node:stream';
import { db } from '@/lib/db';
import { stripeEnv, webhookEnv } from '@/lib/env';
import { Webhook } from 'svix';
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false,
  },
  runtime: 'nodejs',
};

async function buffer(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function webhookHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({});
      return;
    }
    const idempotencyKey = req.headers['svix-id'];
    const payload = (await buffer(req)).toString();

    const wh = new Webhook(webhookEnv()!.OPEN_METER_WEBHOOK_SECRET_API_REQUESTS_TOTAL);

    const msg: any = wh.verify(payload, req.headers as Record<string, string>);

    // See webhooks docs about how to verify signatures
    if (msg.type === 'report.meter' && typeof idempotencyKey === 'string') {
      await reportUsageToStripe(idempotencyKey, msg);
      return res.send('OK');
    }

    res.status(400).json({ message: 'Unknown event type' });
    return;
  } catch (e) {
    const err = e as Error;
    console.error(err);
    res.status(500).send(err.message);
    return;
  } finally {
    res.end();
  }
}

async function reportUsageToStripe(idempotencyKey: string, msg: any) {
  const { usage, meter, query } = msg;

  const ws = await db.query.workspaces.findFirst({
    where: (table, { and, eq, isNull }) => and(eq(table.stripeSubscriptionId, query.subject), isNull(table.deletedAt)),
  });

  if (!ws) {
    throw new Error('workspace does not exist');
  }

  if (!ws.stripeSubscriptionId) {
    throw new Error('stripeSubscriptionId does not exist');
  }

  const stripe = new Stripe(stripeEnv()!.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
    typescript: true,
  });

  for (const item in usage) {
    const { value, windowend } = item as any;
    if (ws.stripeCustomerId && meter.slug === 'api_requests_total_webhook') {
      await stripe.billing.meterEvents.create({
        event_name: 'api_requests',
        timestamp: windowend,
        payload: {
          value: value,
          stripe_customer_id: ws.stripeCustomerId,
        },
        identifier: idempotencyKey,
      });
    }
  }
}
