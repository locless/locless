import { Command } from 'commander';
import Conf from 'conf';
import chalk from 'chalk';

export const reset = new Command()
    .name('reset')
    .description('Reset local storage')
    .action(async () => {
        await runReset();
    });

export async function runReset() {
    const config = new Conf({ projectName: 'loclessCLI' });
    config.clear();

    console.log(chalk.green('Storage is empty!'));

    return 'Done';
}
