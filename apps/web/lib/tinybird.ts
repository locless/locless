import { env } from '@/lib/env';
import { NoopTinybird, Tinybird } from '@chronark/zod-bird';
import { z } from 'zod';

const token = env().TINYBIRD_TOKEN;
export const TBClient = token ? new Tinybird({ token }) : new NoopTinybird();

export const publishEventApiRequests = (tb: any) =>
  tb.buildIngestEndpoint({
    datasource: 'api_requests__v1',
    event: z.object({
      projectId: z.string(),
      elementId: z.string(),
      type: z.string(),
      workspaceId: z.string(),
      deniedReason: z.string().optional(),
      time: z.number().int(),
    }),
  });

export const publishEventStorageUsage = (tb: any) =>
  tb.buildIngestEndpoint({
    datasource: 'storage_usage__v1',
    event: z.object({
      projectId: z.string(),
      elementId: z.string(),
      type: z.string(),
      workspaceId: z.string(),
      size: z.number().int(),
      time: z.number().int(),
    }),
  });

export const apiRequests = (tb: any) =>
  tb.buildPipe({
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

export const storageUsage = (tb: any) =>
  tb.buildPipe({
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
