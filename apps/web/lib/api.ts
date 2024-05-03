export const findWorkspace = async ({ tenantId }: { tenantId: string }) => {
    const result = await fetch(`http://127.0.0.1:8787/workspace/${tenantId}`);

    if (!result.ok) {
        return null;
    }

    const workspace = await result.json();

    if (!workspace?.id) {
        return null;
    }

    return workspace;
};

export const createWorkspace = async (params: {
    tenantId: string;
    name: string;
    isPersonal: boolean;
    plan: string;
}) => {
    const result = await fetch(`http://127.0.0.1:8787/workspace`, {
        method: 'POST',
        body: JSON.stringify(params),
    });

    if (!result.ok) {
        return null;
    }

    const workspaces = await result.json();

    if (!workspaces?.length) {
        return null;
    }

    return workspaces[0];
};

export const createProject = async (params: { workspaceId: string; name: string }) => {
    const result = await fetch(`http://127.0.0.1:8787/projects`, {
        method: 'POST',
        body: JSON.stringify(params),
    });

    if (!result.ok) {
        return null;
    }

    const projects = await result.json();

    if (!projects?.length) {
        return null;
    }

    return projects[0];
};

export const getProjects = async ({ workspaceId, offset }: { workspaceId: string; offset: number }) => {
    console.log(123);
    const result = await fetch(`http://127.0.0.1:8787/projects/getAll/${workspaceId}?offset=${offset}`);

    if (!result.ok) {
        return null;
    }

    const projects = await result.json();

    if (!projects?.length) {
        return null;
    }

    return projects;
};

export const getProject = async ({ projectId }: { projectId: string }) => {
    const result = await fetch(`http://127.0.0.1:8787/projects/${projectId}`);

    if (!result.ok) {
        return null;
    }

    const project = await result.json();

    if (!project?.id) {
        return null;
    }

    return project;
};

export const getComponents = async ({ projectId, offset }: { projectId: string; offset: number }) => {
    const result = await fetch(`http://127.0.0.1:8787/components?projectId=${projectId}&offset=${offset}`);

    if (!result.ok) {
        return null;
    }

    const components = await result.json();

    if (!components?.length) {
        return null;
    }

    return components;
};

export const getComponent = async ({ componentId }: { componentId: string }) => {
    const result = await fetch(`http://127.0.0.1:8787/components/${componentId}`);

    if (!result.ok) {
        return null;
    }

    const component = await result.json();

    if (!component?.id) {
        return null;
    }

    return component;
};
