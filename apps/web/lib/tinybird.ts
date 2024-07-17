import { env } from '@/lib/env';
import { NoopTinybird, Tinybird } from '@chronark/zod-bird';
import { z } from 'zod';

const token = env().TINYBIRD_TOKEN;
const tb = token ? new Tinybird({ token }) : new NoopTinybird();

export const apiRequests = tb.buildPipe({
  pipe: 'endpoint__api_requests_by_workspace__v1',
  parameters: z.object({
    workspaceId: z.string(),
    year: z.number().int(),
    month: z.number().int().min(1).max(12),
  }),
  data: z.object({
    success: z.number().int().nullable().default(0),
  }),
  opts: {
    cache: 'no-store',
  },
});

export const storageUsage = tb.buildPipe({
  pipe: 'endpoint__storage_usage_by_workspace__v1',
  parameters: z.object({
    workspaceId: z.string(),
    year: z.number().int(),
    month: z.number().int().min(1).max(12),
  }),
  data: z.object({
    bandwidth: z.number().int().nullable().default(0),
  }),
  opts: {
    cache: 'no-store',
  },
});
