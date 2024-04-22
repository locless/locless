import { Command } from 'commander';
import ora from 'ora';
import path from 'path';
import * as fs from 'fs';
import child_process from 'child_process';
import chalk from 'chalk';

const spinner = ora({
    text: 'Loading...',
    color: 'yellow',
});

export const deploy = new Command()
    .name('deploy')
    .description('Transform and deploy TS file to Locless cloud.')
    .action(async () => {
        await runExample();
    });

export async function runExample() {
    spinner.start('Searching for locless folder...');

    try {
        const __dirname = path.resolve();

        console.log(chalk.gray(`Current directory: ${__dirname}`));

        const loclessFolderPath = path.join(__dirname, 'locless');

        console.log(chalk.gray(`Locless Path: ${loclessFolderPath}`));

        if (!fs.existsSync(loclessFolderPath)) {
            spinner.fail(`Locless folder not found in ${loclessFolderPath}`);
            return;
        }

        spinner.text = 'Locless folder found...';

        await fs.readdir(loclessFolderPath, (err, files) => {
            spinner.text = 'Scanning Locless folder...';
            files.forEach(file => {
                if (file.includes('.jsx')) {
                    spinner.text = `Found ${file}...`;

                    const filePath = path.join(__dirname, 'locless', file);

                    const buildPath = path.join(__dirname, 'locless', 'build', file.replace('.jsx', '.js'));

                    try {
                        child_process.execSync(`npx babel ${filePath} -o ${buildPath}`).toString();
                        spinner.succeed(`Compiled ${file} to ${buildPath}`);
                    } catch (e) {
                        spinner.fail(`${e}`);
                        return;
                    }
                }
            });
        });
    } catch (e) {
        spinner.fail(`${e}`);
        return;
    }

    return `Uploaded to Locless cloud`;
}
