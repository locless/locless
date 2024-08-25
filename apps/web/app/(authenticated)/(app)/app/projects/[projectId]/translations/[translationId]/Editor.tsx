'use client';
import { useCallback, useState } from 'react';
import type { JSONContent, Content } from 'vanilla-jsoneditor';
import JSONEditorReact from './JSONEditorReact';
import { SaveTranslationButton } from './save-translation-button';

interface Props {
  initialContent: any;
  updatedAt: Date | null;
  name: string;
  id: string;
}

export default function JsonEditor({ initialContent, updatedAt, name, id }: Props) {
  const [jsonContent, setJsonContent] = useState<Content>({ json: initialContent });
  const [enabled, setEnabled] = useState(false);
  const [updatedTime, setUpdatedTime] = useState(updatedAt);

  const handler = useCallback(
    (content: Content) => {
      setJsonContent(content);
      setEnabled(true);
    },
    [jsonContent]
  );

  const onSave = useCallback((date: Date) => {
    setUpdatedTime(date);
    setEnabled(false);
  }, []);

  return (
    <div className='flex flex-col w-full h-full'>
      <div className='flex justify-between'>
        <h1 className='text-2xl font-semibold tracking-tight'>{name}</h1>
        {updatedTime ? (
          <SaveTranslationButton
            content={JSON.stringify((jsonContent as JSONContent).json)}
            name={name}
            translationId={id}
            enabled={enabled}
            updatedAt={updatedTime}
            onSuccess={onSave}
          />
        ) : null}
      </div>
      <JSONEditorReact content={jsonContent} onChange={handler} />
    </div>
  );
}
