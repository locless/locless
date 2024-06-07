import type { InferSelectModel } from 'drizzle-orm';
import type * as schema from './schema';

export type Workspace = InferSelectModel<typeof schema.workspaces>;
export type Project = InferSelectModel<typeof schema.projects>;
export type Component = InferSelectModel<typeof schema.components>;
