import { Command } from 'commander';
import ora from 'ora';
import Conf from 'conf';
import inquirer from 'inquirer';

const spinner = ora({
    text: 'Loading...',
    color: 'yellow',
});

export const setKey = new Command()
    .name('set-key')
    .description('Set auth key from Locless Cloud.')
    .action(async () => {
        await runSetKey();
    });

export async function runSetKey() {
    const projectInputAnswer = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: 'Please write a project name here. The name will be saved locally for better experience:',
        },
    ]);

    const authKeyInputAnswer = await inquirer.prompt([
        {
            type: 'input',
            name: 'authKey',
            message: 'Please write a auth key from dashboard:',
        },
    ]);

    spinner.start('Trying to save a key...');

    const key = authKeyInputAnswer.authKey;

    try {
        if (!key?.startsWith('loc_auth_')) {
            spinner.fail(`Invalid Auth Key!`);
            return;
        }

        const config = new Conf({ projectName: 'loclessCLI' });
        const oldKeys = config.get('auth-key') ?? {};
        config.set('auth-key', {
            ...oldKeys,
            [projectInputAnswer.projectName]: key,
        });
        spinner.succeed(`Key is saved!`);
    } catch (e) {
        spinner.fail(`${e}`);
        return;
    }

    return 'SetKey completed';
}
