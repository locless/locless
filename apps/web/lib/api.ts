export const findWorkspace = async ({ tenantId, headers }: { tenantId: string; headers?: HeadersInit }) => {
    const result = await fetch(`${process.env.NEXT_PUBLIC_LOCLESS_URL}/workspace/${tenantId}`, {
        headers,
    });

    if (!result.ok) {
        return null;
    }

    const workspace = await result.json();

    if (!workspace?.id) {
        return null;
    }

    return workspace;
};

export const createWorkspace = async ({
    tenantId,
    name,
    isPersonal,
    plan,
    headers,
}: {
    tenantId: string;
    name: string;
    isPersonal: boolean;
    plan: string;
    headers?: HeadersInit;
}) => {
    const result = await fetch(`${process.env.NEXT_PUBLIC_LOCLESS_URL}/workspace`, {
        method: 'POST',
        body: JSON.stringify({
            tenantId,
            name,
            isPersonal,
            plan,
        }),
        headers,
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

export const createProject = async ({
    workspaceId,
    name,
    headers,
}: {
    workspaceId: string;
    name: string;
    headers?: HeadersInit;
}) => {
    const result = await fetch(`${process.env.NEXT_PUBLIC_LOCLESS_URL}/projects`, {
        method: 'POST',
        body: JSON.stringify({
            workspaceId,
            name,
        }),
        headers,
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

export const getProjects = async ({
    workspaceId,
    offset,
    headers,
}: {
    workspaceId: string;
    offset: number;
    headers?: HeadersInit;
}) => {
    const result = await fetch(
        `${process.env.NEXT_PUBLIC_LOCLESS_URL}/projects/getAll/${workspaceId}?offset=${offset}`,
        {
            headers,
        }
    );

    if (!result.ok) {
        return null;
    }

    const projects = await result.json();

    if (!projects?.length) {
        return null;
    }

    return projects;
};

export const getProject = async ({ projectId, headers }: { projectId: string; headers?: HeadersInit }) => {
    const result = await fetch(`${process.env.NEXT_PUBLIC_LOCLESS_URL}/projects/${projectId}`, {
        headers,
    });

    if (!result.ok) {
        return null;
    }

    const data = await result.json();

    if (!data?.project.id) {
        return null;
    }

    return data;
};

export const removeProject = async ({ projectId, headers }: { projectId: string; headers?: HeadersInit }) => {
    const result = await fetch(`${process.env.NEXT_PUBLIC_LOCLESS_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers,
    });

    if (!result.ok) {
        return null;
    }

    return projectId;
};

export const renameProject = async ({
    name,
    projectId,
    headers,
}: {
    name: string;
    projectId: string;
    headers?: HeadersInit;
}) => {
    const result = await fetch(`${process.env.NEXT_PUBLIC_LOCLESS_URL}/projects`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
            name,
            projectId,
        }),
    });

    if (!result.ok) {
        return null;
    }

    return projectId;
};

export const getComponents = async ({
    projectId,
    offset,
    headers,
}: {
    projectId: string;
    offset: number;
    headers?: HeadersInit;
}) => {
    const result = await fetch(
        `${process.env.NEXT_PUBLIC_LOCLESS_URL}/components?projectId=${projectId}&offset=${offset}`,
        {
            headers,
        }
    );

    if (!result.ok) {
        return null;
    }

    const components = await result.json();

    if (!components?.length) {
        return null;
    }

    return components;
};

export const getComponent = async ({ componentId, headers }: { componentId: string; headers?: HeadersInit }) => {
    const result = await fetch(`${process.env.NEXT_PUBLIC_LOCLESS_URL}/components/${componentId}`, {
        headers,
    });

    if (!result.ok) {
        return null;
    }

    const component = await result.json();

    if (!component?.id) {
        return null;
    }

    return component;
};

export const refreshKey = async ({
    projectId,
    prevKey,
    headers,
}: {
    projectId: string;
    prevKey: string;
    headers?: HeadersInit;
}) => {
    const result = await fetch(`${process.env.NEXT_PUBLIC_LOCLESS_URL}/keys/refresh`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
            projectId,
            prevKey,
        }),
    });

    if (!result.ok) {
        return null;
    }

    const data = await result.json();

    return data?.key;
};
