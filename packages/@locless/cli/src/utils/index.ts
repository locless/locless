import * as fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import chalk from 'chalk';

const format = (source: string, filetype: string): Promise<string> => {
  return prettier.format(source, { parser: filetype, pluginSearchDirs: false });
};

interface WriteFileParams {
  filename: string;
  source: string;
  folderPath: string;
  filetype?: string;
  ctx: typeof fs;
}

export const writeFile = async ({ ctx, filename, source, folderPath, filetype = 'typescript' }: WriteFileParams) => {
  const formattedSource = await format(source, filetype);
  const dest = path.join(folderPath, `${filename}.tsx`);

  console.log(`\n${chalk.yellow(`writing ${filename}`)}`);

  ctx.writeFileSync(dest, formattedSource, 'utf-8');
};
