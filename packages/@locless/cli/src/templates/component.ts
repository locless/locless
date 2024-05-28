import { header } from './common';

interface ComponentCodegenProps {
  fileName: string;
  userProps: string[];
  componentId: string;
}

export function componentCodegen({ fileName, userProps, componentId }: ComponentCodegenProps): string {
  const code = `${header('Generated `component` utility.')}
  import { Tunnel } from "@locless/react-native";

  export const ${fileName}Id = '${componentId}';

  interface IProps {
    readonly renderLocLoading?: () => JSX.Element;
    readonly renderLocError?: (props: { readonly error: Error }) => JSX.Element;
    readonly dangerouslySetInnerJSXLoc?: boolean;
    readonly onLocError?: (error: Error) => void;
    ${userProps.map(prop => `${prop}`).join('\n')}
  }

  const ${fileName} = (props: IProps) => {
    return <Tunnel componentId='${componentId}' {...props} />
  }

  export default ${fileName};
  `;
  return code;
}
