import { Command } from 'commander';
import ora from 'ora';
import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import Conf from 'conf';
import inquirer from 'inquirer';
import { writeFile } from '../utils';
import { componentCodegen } from '../templates/component';

const spinner = ora({
  text: 'Loading...',
  color: 'yellow',
});

export const generate = new Command()
  .name('generate')
  .description('Generate components for locless')
  .action(async () => {
    await runGenerate();
  });

export async function runGenerate() {
  const config: Conf<Record<string, Record<string, string | undefined> | undefined>> = new Conf({
    projectName: 'loclessCLI',
  });
  const authKeys = config.get('auth-key') ?? {};

  if (!Object.keys(authKeys).length) {
    console.log(chalk.red("Couldn't find Auth Key! Try to run `npx locless set-key <authKey>` before deploy"));
    return;
  }

  const projectInputAnswer = await inquirer.prompt([
    {
      type: 'search-list',
      message: 'Select project name:',
      name: 'projectName',
      choices: Object.keys(authKeys),
      validate: function () {
        return true;
      },
    },
  ]);

  spinner.start('Start generating...');

  const __dirname = path.resolve();

  const loclessFolderPath = path.join(__dirname, 'locless');

  if (!fs.existsSync(loclessFolderPath)) {
    spinner.fail(`Locless folder not found in ${loclessFolderPath}`);
    return;
  }

  const loclessConfigPath = path.join(__dirname, 'locless', 'locless.json');

  let fileComponentsObject = fs.existsSync(loclessConfigPath)
    ? JSON.parse(fs.readFileSync(loclessConfigPath, 'utf8'))
    : {};

  const projectObject: Record<string, string> = { ...(fileComponentsObject[projectInputAnswer.projectName] ?? {}) };

  const generatedFolderPath = path.join(__dirname, 'locless', 'generated');

  if (!fs.existsSync(generatedFolderPath)) {
    fs.mkdirSync(generatedFolderPath);
  }

  try {
    for (const component of Object.entries(projectObject)) {
      const name = component[0];
      const componentId = component[1];
      const locComponentFileName = `Loc${name}`;

      await writeFile({
        ctx: fs,
        filename: locComponentFileName,
        folderPath: generatedFolderPath,
        source: componentCodegen({
          componentId,
          fileName: locComponentFileName,
          userProps: [],
        }),
      });
    }

    spinner.succeed(`All files generated! Happy coding!`);
  } catch (e) {
    spinner.fail(`${e}`);
    return;
  }

  return 'Done';
}
