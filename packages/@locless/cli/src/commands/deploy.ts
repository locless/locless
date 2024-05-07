import { Command } from 'commander';
import ora from 'ora';
import path from 'path';
import * as fs from 'fs';
import child_process from 'child_process';
import chalk from 'chalk';

const PROJECT_ID = '2e018eec-7429-4cd2-976a-4d7f3d976a8b';

const DEV_WEBSITE_URL = 'http://127.0.0.1:8787';
const PROD_WEBSITE_URL = 'https://robust-dalmatian-29.convex.site';

const SERVER_URL = DEV_WEBSITE_URL;

const spinner = ora({
    text: 'Loading...',
    color: 'yellow',
});

export const deploy = new Command()
    .name('deploy')
    .description('Transform and deploy TS file to Locless cloud.')
    .action(async () => {
        await runDeploy();
    });

export async function runDeploy() {
    spinner.start('Searching for locless folder...');

    try {
        const __dirname = path.resolve();

        const loclessFolderPath = path.join(__dirname, 'locless');

        if (!fs.existsSync(loclessFolderPath)) {
            spinner.fail(`Locless folder not found in ${loclessFolderPath}`);
            return;
        }

        spinner.succeed(`Found Locless folder: ${loclessFolderPath}`);

        spinner.start('Scanning Locless folder...');

        const fileList = fs.readdirSync(loclessFolderPath, { withFileTypes: true });

        spinner.succeed(`Scan result: ${fileList.length} files`);

        const loclessConfigPath = path.join(__dirname, 'locless', 'locless.json');

        let fileComponentsObject = fs.existsSync(loclessConfigPath)
            ? JSON.parse(fs.readFileSync(loclessConfigPath, 'utf8'))
            : {};

        spinner.start('Compiling...');
        for (const file of fileList) {
            const { name: fileName } = file;
            const fileExt = fileName.split('.').pop();
            if (file.isFile() && (fileExt === 'tsx' || fileExt === 'jsx')) {
                console.log(chalk.gray(`Found ${fileName}...`));

                const fileNameWithoutExt = fileName.slice(0, fileName.length - 4);

                const filePath = path.join(file.path, fileName);

                const buildPath = path.join(__dirname, 'locless', 'build', `${fileNameWithoutExt}.js`);

                try {
                    child_process.execSync(`npx babel ${filePath} -o ${buildPath}`).toString();
                    console.log(chalk.green(`Compiled ${fileName} to ${fileNameWithoutExt}.js`));

                    const content = await fs.readFileSync(buildPath);

                    console.log(chalk.green(`Got file content for upload!`));

                    /*const uploadUrl = await fetch(`${SERVER_URL}/createUrl`); // TODO: Fix fetch inside CLI

                        const { url } = await uploadUrl.json();

                        console.log(chalk.green(`Got upload link!`));

                        const uploadFile = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'text/javascript',
                            },
                            body: content,
                        });

                        const { storageId } = await uploadFile.json();

                        console.log(chalk.green(`File uploaded!`));

                        const saveFile = await fetch(`${SERVER_URL}/saveFile`, {
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
                        }*/

                    const componentId = fileComponentsObject[fileNameWithoutExt];

                    const form = new FormData();
                    const blob = new Blob([content]);
                    form.set('name', fileNameWithoutExt);

                    if (componentId) {
                        form.set('componentId', componentId);
                    }

                    form.set('file', blob, fileName);

                    // TODO: Add auth key header from conf
                    const res = await fetch(`${DEV_WEBSITE_URL}/generate`, {
                        method: 'POST',
                        body: form,
                    });

                    const uploadRes = await res.json();
                    const component = uploadRes[0];

                    console.log(chalk.green(`File saved to storageId...`));
                    fileComponentsObject[fileNameWithoutExt] = component.id;
                } catch (e) {
                    spinner.fail(`${e}`);
                    return;
                }
            }
        }
        spinner.succeed(`All files compiled!`);

        spinner.start(`Changing locless.json...`);
        fs.writeFileSync(loclessConfigPath, JSON.stringify(fileComponentsObject));
        spinner.succeed(`Build is done!`);
    } catch (e) {
        spinner.fail(`${e}`);
        return;
    }

    return 'Upload completed';
}
