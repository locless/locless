import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { db, eq, schema } from '@/lib/db';
import { auth, t } from '../../trpc';
import { env } from '@/lib/env';
import { UTApi } from 'uploadthing/server';
import { unkey, unkey_api_id } from '@/lib/unkey';

export const deleteProject = t.procedure
  .use(auth)
  .input(
    z.object({
      projectId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const project = await db.query.projects.findFirst({
      where: (table, { eq, and, isNull }) => and(eq(table.id, input.projectId), isNull(table.deletedAt)),
      with: {
        workspace: true,
      },
    });

    if (!project || project.workspace.tenantId !== ctx.tenant.id) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'project not found' });
    }

    const fileIDs: string[] = [];
    let size = project.workspace.size;

    await db.transaction(async tx => {
      await tx.delete(schema.projects).where(eq(schema.projects.id, input.projectId));

      const componentIds = await tx.query.components.findMany({
        where: eq(schema.components.projectId, input.projectId!),
        columns: { id: true, fileId: true, size: true },
      });

      if (componentIds.length > 0) {
        fileIDs.push(...componentIds.map(c => c.fileId));
        size -= componentIds.reduce((acc, curr) => acc + curr.size, 0);
        await tx.delete(schema.components).where(eq(schema.components.projectId, input.projectId!));
      }

      const translationIds = await tx.query.translations.findMany({
        where: eq(schema.translations.projectId, input.projectId!),
        columns: { id: true, fileId: true, size: true },
      });

      if (translationIds.length > 0) {
        fileIDs.push(...translationIds.map(t => t.fileId));
        size -= translationIds.reduce((acc, curr) => acc + curr.size, 0);
        await tx.delete(schema.translations).where(eq(schema.translations.projectId, input.projectId!));
      }

      await tx
        .update(schema.workspaces)
        .set({
          size,
        })
        .where(eq(schema.workspaces.id, project.workspaceId));
    });

    const secrets = env();

    const utapi = new UTApi({
      apiKey: secrets.UPLOADTHING_SECRET,
    });

    await utapi.deleteFiles(fileIDs);

    const listKeys = await unkey.apis.listKeys({
      apiId: unkey_api_id,
      limit: 100,
      ownerId: project.id,
    });

    if (listKeys.result && listKeys.result.keys.length > 0) {
      await Promise.all(listKeys.result.keys.map(async key => await unkey.keys.delete({ keyId: key.id })));
    }
  });
