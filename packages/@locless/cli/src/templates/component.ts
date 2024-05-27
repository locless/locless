import { header } from './common';

interface ComponentCodegenProps {
    fileName: string;
    userProps: string[];
    componentId: string;
}

export function componentCodegen({ fileName, userProps, componentId }: ComponentCodegenProps): string {
    const code = `${header('Generated `component` utility.')}
  import { Tunnel } from "@locless/components";

  interface IProps {
    ${userProps.map(prop => `${prop}`).join('\n')}
  }

  const ${fileName} = (props: IProps) => {
    return <Tunnel source={{ componentId: '${componentId}' }} userProps={props} />
  }

  export default ${fileName};
  `;
    return code;
}
