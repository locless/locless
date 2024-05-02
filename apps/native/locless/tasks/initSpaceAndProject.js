const DEV_WEBSITE_URL = 'http://127.0.0.1:8787';

const init = async () => {
    const res = await fetch(`${DEV_WEBSITE_URL}/workspace`, {
        method: 'POST',
        body: JSON.stringify({
            name: 'Test123',
            tenantId: 'user_test1234',
            plan: 'free',
            isPersonal: true,
        }),
    });

    const workspaces = await res.json();
    const workspace = workspaces[0];

    if (workspace) {
        const projectRes = await fetch(`${DEV_WEBSITE_URL}/projects`, {
            method: 'POST',
            body: JSON.stringify({
                name: 'TestProject',
                workspaceId: workspace.id,
            }),
        });

        const project = await projectRes.json()[0];

        console.log(project.id);
    }
};

init();
