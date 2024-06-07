import { header } from './common';

interface ComponentCodegenProps {
  fileName: string;
  userProps: string[];
  componentName: string;
}

export function componentCodegen({ fileName, userProps, componentName }: ComponentCodegenProps): string {
  const code = `${header('Generated `component` utility.')}
  import { Tunnel } from "../lib";

  export const ${fileName}Id = '${componentName}';

  interface IProps {
    readonly renderLocLoading?: () => JSX.Element;
    readonly renderLocError?: (props: { readonly error: Error }) => JSX.Element;
    readonly dangerouslySetInnerJSXLoc?: boolean;
    readonly onLocError?: (error: Error) => void;
    ${userProps.map(prop => `${prop}`).join('\n')}
  }

  const ${fileName} = (props: IProps) => {
    return <Tunnel componentName='${componentName}' {...props} />
  }

  export default ${fileName};
  `;
  return code;
}
