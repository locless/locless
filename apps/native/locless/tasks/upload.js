const fs = require('fs');

const PROJECT_ID = 'jh78ma42hvw94pm6xsavk8pqjd6mnb9w';

const downloadFile = async () => {
    const uploadUrl = await fetch('https://robust-dalmatian-29.convex.site/createUrl');

    const { url } = await uploadUrl.json();

    console.log(url);

    const uploadFile = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/javascript',
        },
        body: fs.readFileSync('../build/MyNewWormhol.js'),
    });

    const { storageId } = await uploadFile.json();

    const saveFile = await fetch(`https://robust-dalmatian-29.convex.site/saveFile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            storageId,
            projectId: PROJECT_ID,
        }),
    });

    console.log(saveFile);

    if (!saveFile.ok) {
        throw new Error('Failed to save file');
    }

    console.log('File saved to storageId: ', storageId);
};

downloadFile();
