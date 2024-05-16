import { Command } from 'commander';
import Conf from 'conf';
import chalk from 'chalk';

export const showProjects = new Command()
    .name('show-projects')
    .description('Show all projects from local storage')
    .action(async () => {
        await runShowProjects();
    });

export async function runShowProjects() {
    const config = new Conf({ projectName: 'loclessCLI' });
    const projects: any = config.get('auth-key');

    if (!Object.keys(projects).length) {
        console.log(chalk.green('Storage is empty!'));
    }

    for (const project of Object.keys(projects)) {
        console.log(chalk.gray(`${project}`));
    }

    return 'Done';
}
