import { Command } from 'commander';
import ora from 'ora';
import path from 'path';
import * as fs from 'fs';
import child_process from 'child_process';
import chalk from 'chalk';
import { componentCodegen } from '../templates/component';
import { writeFile } from '../utils';

const DEV_WEBSITE_URL = 'http://127.0.0.1:8787';
const PROD_WEBSITE_URL = 'https://api.xan50rus.workers.dev';

const SERVER_URL = PROD_WEBSITE_URL;

const spinner = ora({
  text: 'Loading...',
  color: 'yellow',
});

const parseRequires = (content: string, object: Record<string, string>): any => {
  let contentSplit = content.split(`require(`);
  let stringRequire;

  for (let i = 1; i < contentSplit.length; i++) {
    stringRequire = contentSplit[i]?.split(`)`)[0];

    if (stringRequire) {
      object[stringRequire] = `require(${stringRequire})`;
    }
  }

  return object;
};

export const deploy = new Command()
  .name('deploy')
  .description('Transform and deploy TS file to Locless cloud.')
  .option('-e, --env <name>', 'env file name', '.env')
  .action(async (_, options) => {
    await runDeploy(options.env ?? '.env');
  });

export const runDeploy = async (envFileName: string) => {
  spinner.start('Validating Auth Key...');

  const __dirname = path.resolve();

  const envFilePath = path.join(__dirname, envFileName);

  if (!fs.existsSync(envFilePath)) {
    spinner.fail(`Couldn't locate env file in ${envFilePath}`);
    return;
  }

  const envFile = fs.readFileSync(envFilePath, 'utf-8');

  const envVars = envFile.match(/^[A-Z0-9_]+=.*$/gm);

  if (!envVars) {
    spinner.fail(`Couldn't find any env vars in ${envFilePath}`);
    return;
  }

  const envVarsMap = envVars.reduce(
    (acc, curr) => {
      const [key, value] = curr.split('=');

      if (key && value) {
        return {
          ...acc,
          [key]: value,
        };
      }

      return acc;
    },
    {} as Record<string, string>
  );

  const authKey = envVarsMap.LOCLESS_AUTH_KEY;

  if (!authKey || !authKey?.startsWith('loc_auth_')) {
    spinner.fail(`LOCLESS_AUTH_KEY env var is not set`);
    return;
  }

  spinner.succeed(`Auth Key is valid!`);

  spinner.start('Searching for locless folder...');

  try {
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

    spinner.start('Compiling...');

    for (const file of fileList) {
      const { name: fileName, path: originalPath } = file;
      const fileExt = fileName.split('.').pop();
      if (file.isFile() && (fileExt === 'tsx' || fileExt === 'jsx')) {
        console.log(`\n ${chalk.gray(`Found ${fileName}...`)}`);

        const fileNameWithoutExt = path.parse(fileName).name;

        const filePath = path.join(originalPath, fileName);

        const buildPath = path.join(__dirname, 'locless', 'build', `${fileNameWithoutExt}.js`);
        const tmpPath = path.join(__dirname, 'locless', 'tmp', `${fileNameWithoutExt}.js`);

        try {
          child_process
            .execSync(`npx rollup -c --bundleConfigAsCjs -i ${filePath} -o ${buildPath} --compact --format cjs`)
            .toString();

          // fs.unlinkSync(tmpPath);

          console.log(chalk.green(`Compiled ${fileName} to ${fileNameWithoutExt}.js`));

          const content = await fs.readFileSync(buildPath);

          const requireObject: Record<string, string> = {};

          const result = parseRequires(content.toString(), requireObject);

          if (result) {
            const constantFolderPath = path.join(__dirname, 'locless', 'constants');
            const dest = path.join(constantFolderPath, `index.ts`);

            if (!fs.existsSync(constantFolderPath)) {
              fs.mkdirSync(constantFolderPath);
            }

            fs.writeFileSync(
              dest,
              `
                export const locRequires = {
                  ${Object.keys(result)
                    .map(key => `${key}: ${result[key]}`)
                    .join(',\n')}
                }
              `,
              'utf-8'
            );
          }

          console.log(chalk.green(`Got file content for upload!`));

          const packageJson = await fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8');
          const packageJsonObj = JSON.parse(packageJson);
          const { dependencies } = packageJsonObj;

          const form = new FormData();
          const blob = new Blob([content]);
          form.set('name', fileNameWithoutExt);
          form.set(
            'stats',
            JSON.stringify({
              expo: dependencies['expo'] ?? '0.0.0',
              react: dependencies['react'],
              'react-native': dependencies['react-native'],
            })
          );
          form.set('file', blob, fileNameWithoutExt);

          const res = await fetch(`${SERVER_URL}/generate`, {
            method: 'POST',
            body: form,
            headers: {
              'x-api-key': authKey,
            },
          });

          if (!res.ok) {
            spinner.fail(`Failed to get a component from the cloud!`);
            return;
          }

          const uploadRes = await res.json();
          console.log(uploadRes);
          const component = uploadRes;

          if (!component) {
            spinner.fail(`Failed to get a component from the cloud!`);
            return;
          }

          console.log(chalk.green(`File uploaded!`));
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
        } catch (e) {
          spinner.fail(`${e}`);
          return;
        }
      }
    }
    spinner.succeed(`All files compiled! Happy coding!`);
  } catch (e) {
    spinner.fail(`${e}`);
    return;
  }

  return 'Upload completed';
};
