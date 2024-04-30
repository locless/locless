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
        await runDeploy();
    });

export async function runDeploy() {
    spinner.start('Searching for locless folder...');

    try {
        const __dirname = path.resolve();

        const loclessFolderPath = path.join(__dirname, 'locless');

        console.log(chalk.gray(`\nChecking path: ${loclessFolderPath}...`));

        if (!fs.existsSync(loclessFolderPath)) {
            spinner.fail(`Locless folder not found in ${loclessFolderPath}`);
            return;
        }

        console.log(chalk.gray(`\nLocless folder found...`));

        console.log(chalk.gray(`\nScanning Locless folder...`));

        const fileList = fs.readdirSync(loclessFolderPath, { withFileTypes: true });

        console.log(chalk.gray(`\nScan result: ${fileList.length} files`));

        fileList.forEach(file => {
            if (file.isFile() && file.name.includes('.jsx')) {
                console.log(chalk.gray(`\nFound ${file.path}...`));

                const filePath = path.join(file.path, file.name);

                const buildPath = path.join(__dirname, 'locless', 'build', file.name.replace('.jsx', '.js'));

                try {
                    child_process.execSync(`npx babel ${filePath} -o ${buildPath}`).toString();
                    spinner.succeed(`Compiled ${filePath} to ${buildPath}`);
                } catch (e) {
                    spinner.fail(`${e}`);
                    return;
                }
            }
        });
    } catch (e) {
        spinner.fail(`${e}`);
        return;
    }

    return 'Upload completed';
}
