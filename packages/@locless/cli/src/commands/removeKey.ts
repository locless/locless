import { Command } from 'commander';
import ora from 'ora';
import Conf from 'conf';
import inquirer from 'inquirer';
import chalk from 'chalk';

const spinner = ora({
    text: 'Loading...',
    color: 'yellow',
});

export const removeKey = new Command()
    .name('remove-key')
    .description('Remove auth keys from local storage')
    .action(async () => {
        await runRemoveKey();
    });

export async function runRemoveKey() {
    const config = new Conf({ projectName: 'loclessCLI' });
    const authKeys: any = { ...(config.get('auth-key') ?? {}) };

    if (!Object.keys(authKeys).length) {
        console.log(chalk.green('Storage is empty!'));
        return;
    }

    const projectInputAnswer = await inquirer.prompt([
        {
            type: 'search-list',
            message: 'Select project name:',
            name: 'projectName',
            choices: [...Object.keys(authKeys), 'Clear all'],
            validate: function () {
                return true;
            },
        },
    ]);

    spinner.start('Removing Auth Key...');

    if (projectInputAnswer.projectName === 'Clear all') {
        config.clear();
        spinner.succeed(`Keys are removed!`);
        return;
    }

    const authKey = projectInputAnswer.projectName;

    delete authKeys[authKey];

    config.set('auth-key', {
        ...authKeys,
    });

    spinner.succeed(`Key is remove!`);

    return 'Done';
}
