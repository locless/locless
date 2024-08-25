import { z } from 'zod';
import { billingTier } from './tiers';

const fixedSubscriptionSchema = z.object({
  productId: z.string(),
  cents: z.string().regex(/^\d{1,15}(\.\d{1,12})?$/), // in cents, e.g. "10.124" = $0.10124
});
export type FixedSubscription = z.infer<typeof fixedSubscriptionSchema>;

const tieredSubscriptionSchema = z.object({
  productId: z.string(),
  tiers: z.array(billingTier),
});

export type TieredSubscription = z.infer<typeof tieredSubscriptionSchema>;

export const subscriptionsSchema = z.object({
  apiRequests: tieredSubscriptionSchema.optional(),
  fileStorage: tieredSubscriptionSchema.optional(),
  fileBandwidth: tieredSubscriptionSchema.optional(),
  plan: fixedSubscriptionSchema.optional(),
});

export type Subscriptions = z.infer<typeof subscriptionsSchema>;

export function defaultProSubscriptions(): Subscriptions | null {
  const stripeEnv = z.object({
    STRIPE_PRODUCT_ID_PRO_PLAN: z.string(),
    STRIPE_PRODUCT_ID_API_REQUESTS: z.string(),
    STRIPE_PRODUCT_ID_FILE_STORAGE: z.string(),
    STRIPE_PRODUCT_ID_FILE_BANDWIDTH: z.string(),
  });
  const env = stripeEnv.parse(process.env);
  if (!env) {
    return null;
  }
  return {
    plan: {
      productId: env.STRIPE_PRODUCT_ID_PRO_PLAN,
      cents: '2500', // $25
    },
    apiRequests: {
      productId: env.STRIPE_PRODUCT_ID_API_REQUESTS,
      tiers: [
        {
          firstUnit: 1,
          lastUnit: 100_000,
          centsPerUnit: null,
        },
        {
          firstUnit: 100_001,
          lastUnit: null,
          centsPerUnit: '0.01', // $0.0001 per api request or $1 per 10k api requests
        },
      ],
    },
    fileStorage: {
      productId: env.STRIPE_PRODUCT_ID_FILE_STORAGE,
      tiers: [
        {
          firstUnit: 1,
          lastUnit: 102_400, // 100 GB (in MB)
          centsPerUnit: null,
        },
        {
          firstUnit: 102_401, // 100 GB (in MB) + 1 MB
          lastUnit: null,
          centsPerUnit: '0.003', // $0.00003 per MB or $0.03 per 1GB
        },
      ],
    },
    fileBandwidth: {
      productId: env.STRIPE_PRODUCT_ID_FILE_BANDWIDTH,
      tiers: [
        {
          firstUnit: 1,
          lastUnit: 51_200, // 50 GB (in MB)
          centsPerUnit: null,
        },
        {
          firstUnit: 51_201, // 50 GB (in MB) + 1 MB
          lastUnit: null,
          centsPerUnit: '0.03', // $0.0003 per MB or $0.3 per 1GB
        },
      ],
    },
  };
}
