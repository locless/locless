import { Command } from 'commander';
import ora from 'ora';
import Conf from 'conf';

const spinner = ora({
    text: 'Loading...',
    color: 'yellow',
});

export const setKey = new Command()
    .name('set-key')
    .description('Set auth key from Locless Cloud.')
    .argument('<string>', 'Auth key from dashboard')
    .action(async str => {
        await runSetKey(str);
    });

export async function runSetKey(str: string) {
    spinner.start('Trying to save a key...');

    try {
        if (!str?.startsWith('loc_auth_')) {
            spinner.fail(`Invalid Auth Key!`);
            return;
        }

        const config = new Conf({ projectName: 'loclessCLI' });
        config.set('auth-key', str);
        spinner.succeed(`Key is saved!`);
    } catch (e) {
        spinner.fail(`${e}`);
        return;
    }

    return 'SetKey completed';
}
