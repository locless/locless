import { Resend as Client } from 'resend';

import { render } from '@react-email/render';
import React from 'react';
import { PaymentIssue } from '../emails/payment_issue';
import { WelcomeEmail } from '../emails/welcome_email';

export class Resend {
  public readonly client: Client;
  private readonly replyTo = 'support@locless.com';

  constructor(opts: { apiKey: string }) {
    this.client = new Client(opts.apiKey);
  }

  public async sendWelcomeEmail(req: { email: string }) {
    const html = await render(<WelcomeEmail />);
    try {
      const result = await this.client.emails.send({
        to: req.email,
        from: 'igor@updates.locless.com',
        replyTo: this.replyTo,
        subject: 'Welcome to Locless',
        html,
      });
      if (!result.error) {
        return;
      }
      throw result.error;
    } catch (error) {
      console.error('Error occurred sending welcome email ', JSON.stringify(error));
    }
  }

  public async sendPaymentIssue(req: { email: string; name: string; date: Date }): Promise<void> {
    const html = await render(<PaymentIssue username={req.name} date={req.date.toDateString()} />);
    try {
      const result = await this.client.emails.send({
        to: req.email,
        from: 'igor@updates.locless.com',
        replyTo: this.replyTo,
        subject: 'There was an issue with your payment',
        html,
      });
      if (!result.error) {
        return;
      }
      throw result.error;
    } catch (error) {
      console.error('Error occurred sending payment issue email ', JSON.stringify(error));
    }
  }
}
