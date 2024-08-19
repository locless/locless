import { z } from 'zod';

export const env = () =>
  z
    .object({
      TINYBIRD_TOKEN: z.string().optional(),
      OPEN_METER_TOKEN: z.string(),
      UPLOADTHING_SECRET: z.string(),
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

export const webhookEnv = () =>
  z
    .object({
      OPEN_METER_WEBHOOK_SECRET_API_REQUESTS_TOTAL: z.string(),
      OPEN_METER_WEBHOOK_SECRET_ACTIVE_COMPONENTS_TOTAL: z.string(),
    })
    .parse(process.env);
