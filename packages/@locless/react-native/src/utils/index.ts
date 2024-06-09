const globalName = '__LOCLESS__';

export const createComponent = async (global: any, src: string): Promise<React.Component> => {
  // eslint-disable-next-line no-new-func
  const Component = await new Function(
    globalName,
    `${Object.keys(global)
      .map(key => `var ${key} = ${globalName}.${key};`)
      .join('\n')}; const exports = {}; ${src}; return exports.default;`
  )(global);
  if (typeof Component !== 'function') {
    throw new Error(
      `[Locless]: Expected function, encountered ${typeof Component}. Did you forget to mark your Locless as a default export?`
    );
  }
  return Component;
};
