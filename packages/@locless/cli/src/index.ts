#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import inquirerSearchList from 'inquirer-search-list';

import { version } from '../package.json';
import { deploy } from './commands/deploy';
import { setKey } from './commands/setKey';

const MINIMUM_MAJOR_VERSION = 18;
const MINIMUM_MINOR_VERSION = 0;

async function main() {
    inquirer.registerPrompt('search-list', inquirerSearchList);

    const nodeVersion = process.versions.node;
    const majorVersion = parseInt(nodeVersion.split('.')[0] ?? '0', 10);
    const minorVersion = parseInt(nodeVersion.split('.')[1] ?? '0', 10);

    if (
        majorVersion < MINIMUM_MAJOR_VERSION ||
        (majorVersion === MINIMUM_MAJOR_VERSION && minorVersion < MINIMUM_MINOR_VERSION)
    ) {
        console.error(
            chalk.red(
                `Your Node version ${nodeVersion} is too old. Locless requires at least Node v${MINIMUM_MAJOR_VERSION}.${MINIMUM_MINOR_VERSION}`
            )
        );
        console.error(
            chalk.gray(
                `You can use ${chalk.bold(
                    'nvm'
                )} (https://github.com/nvm-sh/nvm#installing-and-updating) to manage different versions of Node.`
            )
        );
        console.error(
            chalk.gray(
                'After installing `nvm`, install the latest version of Node with ' + chalk.bold('`nvm install node`.')
            )
        );
        console.error(
            chalk.gray('Then, activate the installed version in your terminal with ' + chalk.bold('`nvm use`.'))
        );
        process.exit(1);
    }

    const program = new Command();
    program
        .name('locless')
        .usage('<command> [options]')
        .description('Start developing with Locless by running `npx locless dev`.')
        .addCommand(deploy)
        .addCommand(setKey)
        .helpCommand('help <command>', 'Show help for given <command>')
        .version(version || '0.0.0')
        // Hide version and help so they don't clutter
        // the list of commands.
        .configureHelp({ visibleOptions: () => [] })
        .showHelpAfterError();

    try {
        await program.parseAsync(process.argv);
    } catch (e) {
        process.exitCode = 1;
        console.error(chalk.red('Unexpected Error: ' + e));
    }
    process.exit();
}

void main();
