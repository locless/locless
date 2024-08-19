import { Command } from 'commander';
import ora from 'ora';
import path from 'path';
import * as fs from 'fs';
import child_process from 'child_process';
import chalk from 'chalk';
import { componentCodegen } from '../templates/component';
import { format, writeFile } from '../utils';
import isLocale from '../utils/isLocale';

const SERVER_URL = 'https://api.locless.com';

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

export const translations = new Command()
  .name('translations')
  .description('Transform and deploy TS file to Locless cloud.')
  .option('--push', 'push translations to the cloud')
  .option('--pull', 'pull translations from the cloud')
  .option('-e, --env <name>', 'env file name', '.env')
  .action(async (_, options) => {
    await runDeploy(options);
  });

export const runDeploy = async (options: Record<string, any>) => {
  spinner.start('Validating Auth Key...');

  const envFileName = options.env ?? '.env';

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

  try {
    const loclessTranslationsFolderPath = path.join(__dirname, 'locless', 'translations');

    if (options.pull || !options.push) {
      spinner.start('Pulling data about translations from the cloud...');

      const result = await fetch(`${SERVER_URL}/translations-pull`, {
        method: 'GET',
        headers: {
          'x-api-key': authKey,
        },
      });

      if (!result.ok) {
        spinner.fail(`Failed to get a data from the cloud!`);
        return;
      }

      const translations = await result.json();

      spinner.succeed(`Pulled ${translations.length} translations`);

      spinner.start('Pulling translations from the cloud...');

      if (!fs.existsSync(loclessTranslationsFolderPath)) {
        fs.mkdirSync(loclessTranslationsFolderPath);
      }

      let generatedTranslationsData: Record<string, Date | null> = {};

      for (const item of translations) {
        const filePath = path.join(loclessTranslationsFolderPath, `${item.name}.json`);

        const translation = await fetch(`${SERVER_URL}/translations/${item.name}`, {
          method: 'GET',
          headers: {
            'x-api-key': authKey,
          },
        });

        if (!translation.ok) {
          spinner.fail(`Failed to get a translation from the cloud!`);
          return;
        }

        const translationRes = await translation.json();

        const fileContent = JSON.stringify(translationRes, null, 2);

        fs.writeFileSync(filePath, fileContent, 'utf-8');

        generatedTranslationsData[item.name] = item.updatedAt;
      }

      spinner.succeed(`All translations pulled!`);

      spinner.start('Generating translations info...');
      fs.writeFileSync(
        path.join(loclessTranslationsFolderPath, 'generated.json'),
        JSON.stringify(generatedTranslationsData, null, 2),
        'utf-8'
      );
      spinner.start('Successfully generated translations info!');
    } else if (options.push) {
      spinner.start('Searching for translations folder...');

      const loclessTranslationsGeneratedPath = path.join(__dirname, 'locless', 'translations', 'generated.json');

      if (!fs.existsSync(loclessTranslationsFolderPath)) {
        spinner.fail(`Translations folder not found in ${loclessTranslationsFolderPath}`);
        return;
      }

      if (!fs.existsSync(loclessTranslationsGeneratedPath)) {
        spinner.fail(`generated.json not found. Please run ` + chalk.bold('locless translations --pull') + ' first.');
        return;
      }

      spinner.succeed(`Found Translations folder: ${loclessTranslationsFolderPath}`);

      spinner.start('Scanning Translations folder...');

      const fileList = fs.readdirSync(loclessTranslationsFolderPath, { withFileTypes: true });

      const generatedTranslationsData = JSON.parse(fs.readFileSync(loclessTranslationsGeneratedPath, 'utf-8'));

      spinner.succeed(`Scan result: ${fileList.length} files`);

      spinner.start('Pushing translations to the cloud...');

      for (const file of fileList) {
        const { name: fileName } = file;
        const fileExt = fileName.split('.').pop();
        const fileNameWithoutExt = path.parse(fileName).name;
        if (file.isFile() && fileExt === 'json' && fileName !== 'generated.json' && isLocale(fileNameWithoutExt)) {
          console.log(`\n ${chalk.gray(`Found ${fileName}...`)}`);

          const filePath = path.join(__dirname, 'locless', 'translations', `${fileNameWithoutExt}.json`);

          const content = await fs.readFileSync(filePath);

          const packageJson = await fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8');
          const packageJsonObj = JSON.parse(packageJson);
          const { dependencies } = packageJsonObj;

          const form = new FormData();
          const blob = new Blob([content]);
          form.set('name', fileNameWithoutExt);
          form.set('pulledAt', generatedTranslationsData[fileNameWithoutExt]);
          form.set(
            'stats',
            JSON.stringify({
              expo: dependencies['expo'] ?? '0.0.0',
              react: dependencies['react'],
              'react-native': dependencies['react-native'],
            })
          );
          form.set('file', blob, fileNameWithoutExt);

          const res = await fetch(`${SERVER_URL}/generate-translation`, {
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

          if (!uploadRes) {
            spinner.fail(`Failed to get a component from the cloud!`);
            return;
          }

          if (uploadRes === 'TRANSLATION_OUTDATED') {
            spinner.fail(
              `Translation is outdated. Please run ` + chalk.bold('locless translations --pull') + ' first.'
            );
            return;
          }

          if (uploadRes.id) {
            generatedTranslationsData[fileNameWithoutExt] = uploadRes.updatedAt;
          }
        }
      }

      spinner.succeed(`All translations pushed!`);

      spinner.start('Generating translations info...');
      fs.writeFileSync(loclessTranslationsGeneratedPath, JSON.stringify(generatedTranslationsData, null, 2), 'utf-8');
      spinner.start('Successfully generated translations info!');
    }
  } catch (e) {
    spinner.fail(`${e}`);
    return;
  }

  return 'Upload completed';
};
