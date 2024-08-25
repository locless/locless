import { t } from '../trpc';
import { createProject } from './project/create';
import { deleteProject } from './project/delete';
import { updateProjectName } from './project/updateName';
import { changeWorkspaceName } from './workspace/changeName';
import { createWorkspace } from './workspace/create';
import { deleteComponent } from './component/delete';
import { updateProjectKey } from './project/updateKey';
import { toggleStatusComponent } from './component/toggleStatus';
import { changeWorkspacePlan } from './workspace/changePlan';
import { deleteTranslation } from './translation/delete';
import { toggleStatusTranslation } from './translation/toggleStatus';
import { changeTranslation } from './translation/change';

export const router = t.router({
  project: t.router({
    create: createProject,
    delete: deleteProject,
    updateName: updateProjectName,
    updateKey: updateProjectKey,
  }),
  workspace: t.router({
    create: createWorkspace,
    updateName: changeWorkspaceName,
    updatePlan: changeWorkspacePlan,
  }),
  component: t.router({
    delete: deleteComponent,
    toggleStatus: toggleStatusComponent,
  }),
  translation: t.router({
    delete: deleteTranslation,
    toggleStatus: toggleStatusTranslation,
    change: changeTranslation,
  }),
});

// export type definition of API
export type Router = typeof router;
