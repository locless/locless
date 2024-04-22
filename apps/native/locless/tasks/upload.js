const fs = require('fs');

const PROJECT_ID = 'jh78ma42hvw94pm6xsavk8pqjd6mnb9w';

const downloadFile = async () => {
    let fileName = '';

    await process.argv.forEach(function (val, index, array) {
        if (index === 2) {
            fileName = val;
        }
    });

    if (fileName) {
        const uploadUrl = await fetch('https://robust-dalmatian-29.convex.site/createUrl');

        const { url } = await uploadUrl.json();

        const uploadFile = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/javascript',
            },
            body: fs.readFileSync(`../build/${fileName}`),
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

        if (!saveFile.ok) {
            throw new Error('Failed to save file');
        }

        console.log('File saved to storageId: ', storageId);
    } else {
        throw new Error('Please provide file name');
    }
};

downloadFile();
