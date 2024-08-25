import type { IncomingHttpHeaders } from 'node:http';
import { env } from '@/lib/env';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { Resend } from '@repo/resend';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { WebhookRequiredHeaders } from 'svix';
import { Webhook } from 'svix';

export const maxDuration = 60;
export const config = {
  maxDuration: 60,
  runtime: 'nodejs',
};

const { CLERK_WEBHOOK_SECRET, RESEND_API_KEY, RESEND_AUDIENCE_ID } = env();
export default async function handler(req: NextApiRequestWithSvixRequiredHeaders, res: NextApiResponse) {
  const payload = JSON.stringify(req.body);
  const headers = req.headers;
  if (!CLERK_WEBHOOK_SECRET || !RESEND_API_KEY || !RESEND_AUDIENCE_ID) {
    return res.status(400).json({ Error: 'Missing environment variables' });
  }
  const wh = new Webhook(CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(payload, headers) as WebhookEvent;
  } catch (_) {
    return res.status(400).json({});
  }

  const resend = new Resend({ apiKey: RESEND_API_KEY });
  const eventType = evt.type;
  if (eventType === 'user.created') {
    const email = evt.data.email_addresses[0].email_address;
    if (!email) {
      return res.status(400).json({ Error: 'No email address found' });
    }
    try {
      await resend.client.contacts.create({
        audienceId: RESEND_AUDIENCE_ID,
        email: email,
      });
      await resend.sendWelcomeEmail({
        email,
      });
      return res.status(200).json({});
    } catch (err) {
      return res.status(400).json({
        error: (err as Error).message,
      });
    }
  }
}

type NextApiRequestWithSvixRequiredHeaders = NextApiRequest & {
  headers: IncomingHttpHeaders & WebhookRequiredHeaders;
};
