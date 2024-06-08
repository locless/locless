import { z } from 'zod';

export const env = () =>
  z
    .object({
      TINYBIRD_TOKEN: z.string().optional(),
    })
    .parse(process.env);

export const dbEnv = () =>
  z
    .object({
      DATABASE_HOST: z.string(),
      DATABASE_USERNAME: z.string(),
      DATABASE_PASSWORD: z.string(),
    })
    .parse(process.env);

const stripeSchema = z.object({
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
});

const stripeParsed = stripeSchema.safeParse(process.env);
export const stripeEnv = () => (stripeParsed.success ? stripeParsed.data : null);
