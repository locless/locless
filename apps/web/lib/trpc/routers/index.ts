import { t } from '../trpc';
import { createProject } from './project/create';
import { deleteProject } from './project/delete';
import { updateProjectName } from './project/updateName';
import { changeWorkspaceName } from './workspace/changeName';
import { createWorkspace } from './workspace/create';
import { deleteComponent } from './component/delete';
import { updateProjectKey } from './project/updateKey';

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
  }),
  component: t.router({
    delete: deleteComponent,
  }),
});

// export type definition of API
export type Router = typeof router;
