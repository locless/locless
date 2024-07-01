import { Tinybird as Client } from '@chronark/zod-bird';
import { z } from 'zod';

export class Tinybird {
  private readonly tb: Client;

  constructor(token: string) {
    this.tb = new Client({ token });
  }

  public get apiRequests() {
    return this.tb.buildPipe({
      pipe: 'endpoint__api_requests_by_workspace__v1',
      parameters: z.object({
        workspaceId: z.string(),
        year: z.number().int(),
        month: z.number().int().min(1).max(12),
      }) as any,
      data: z.object({
        success: z.number().int().nullable().default(0),
      }) as any,
      opts: {
        cache: 'no-store',
      },
    }) as any;
  }
  public get storageUsage() {
    return this.tb.buildPipe({
      pipe: 'endpoint__storage_usage_by_workspace__v1',
      parameters: z.object({
        workspaceId: z.string(),
        year: z.number().int(),
        month: z.number().int().min(1).max(12),
      }) as any,
      data: z.object({
        bandwidth: z.number().int().nullable().default(0),
      }) as any,
      opts: {
        cache: 'no-store',
      },
    }) as any;
  }
}
