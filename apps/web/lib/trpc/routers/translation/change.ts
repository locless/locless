import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { UTApi } from 'uploadthing/server';

import { db, eq, schema } from '@/lib/db';
import { auth, t } from '../../trpc';
import { env } from '@/lib/env';
import { publishEventApiRequests, publishEventStorageUsage } from '@/lib/tinybird';

const GIGABYTE = Math.pow(1024, 3);
const MAX_FREE_SIZE = 1 * GIGABYTE;

export const changeTranslation = t.procedure
  .use(auth)
  .input(
    z.object({
      translationId: z.string(),
      content: z.string(),
      updatedAt: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const translation = await db.query.translations.findFirst({
      where: (table, { eq, and, isNull }) => and(eq(table.id, input.translationId), isNull(table.deletedAt)),
      with: {
        workspace: true,
      },
    });

    if (!translation || translation.workspace.tenantId !== ctx.tenant.id) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'translation not found' });
    }

    if (translation.updatedAt === null) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'translation does not have an updatedAt date' });
    }

    if (new Date(input.updatedAt).getTime() !== new Date(translation.updatedAt).getTime()) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'translation is outdated' });
    }

    const secrets = env();

    const blob = new Blob([input.content], { type: 'application/json' });

    const fd = new FormData();
    fd.append('file', blob, `${translation.name}_${translation.id}.json`);

    const file: any = fd.get('file');

    if (!file && file! instanceof File)
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'file not found' });

    if (translation.workspace.plan === 'free') {
      if (translation.workspace.size - translation.size + file.size > MAX_FREE_SIZE) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'size limit exceeded' });
      }
    }

    const utapi = new UTApi({
      apiKey: secrets.UPLOADTHING_SECRET,
    });

    const response = await utapi.uploadFiles(file);

    if (!response.data) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'file not uploaded' });

    const { size, key, url } = response.data;

    await utapi.deleteFiles([translation.fileId]);

    const currentDate = new Date();

    await db.transaction(async tx => {
      await tx
        .update(schema.translations)
        .set({
          size: size,
          fileUrl: url,
          fileId: key,
          updatedAt: currentDate,
        })
        .where(eq(schema.translations.id, translation.id));

      await tx
        .update(schema.workspaces)
        .set({
          size: translation.workspace.size - translation.size + size,
        })
        .where(eq(schema.workspaces.id, translation.workspaceId));
    });

    await publishEventStorageUsage({
      projectId: translation.projectId,
      elementId: translation.id,
      type: 'translation',
      workspaceId: translation.workspaceId,
      size: size,
      time: Date.now(),
    });

    await publishEventApiRequests({
      projectId: translation.projectId,
      elementId: translation.id,
      type: 'translation',
      workspaceId: translation.workspaceId,
      deniedReason: '',
      time: Date.now(),
    });

    return {
      success: true,
      updatedAt: currentDate,
    };
  });
