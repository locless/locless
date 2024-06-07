import { Command } from 'commander';
import ora from 'ora';
import path from 'path';
import fs from 'fs';
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
  const __dirname = path.resolve();

  spinner.start('Start generating...');

  const loclessFolderPath = path.join(__dirname, 'locless');

  if (!fs.existsSync(loclessFolderPath)) {
    spinner.fail(`Locless folder not found in ${loclessFolderPath}`);
    return;
  }

  spinner.succeed(`Found Locless folder: ${loclessFolderPath}`);

  spinner.start('Scanning Locless folder...');

  const fileList = fs.readdirSync(loclessFolderPath, { withFileTypes: true });

  spinner.succeed(`Scan result: ${fileList.length} files`);

  const generatedFolderPath = path.join(__dirname, 'locless', 'generated');

  if (!fs.existsSync(generatedFolderPath)) {
    fs.mkdirSync(generatedFolderPath);
  }

  try {
    for (const file of fileList) {
      const { name: fileName } = file;
      const fileExt = fileName.split('.').pop();

      if (file.isFile() && (fileExt === 'tsx' || fileExt === 'jsx')) {
        const fileNameWithoutExt = fileName.replaceAll(`.${fileExt}`, '');
        const locComponentFileName = `Loc${fileNameWithoutExt}`;

        await writeFile({
          ctx: fs,
          filename: locComponentFileName,
          folderPath: generatedFolderPath,
          source: componentCodegen({
            componentName: fileNameWithoutExt,
            fileName: locComponentFileName,
            userProps: [],
          }),
        });
      }
    }

    spinner.succeed(`All files generated! Happy coding!`);
  } catch (e) {
    spinner.fail(`${e}`);
    return;
  }

  return 'Done';
}
