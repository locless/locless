import { getTenantId } from '@/lib/auth';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import JsonEditor from './Editor';

interface Props {
  params: {
    translationId: string;
  };
}

export default async function TranslationEditorPage(props: Props) {
  const tenantId = getTenantId();

  const translation = await db.query.translations.findFirst({
    where: (table, { eq, and, isNull }) => and(eq(table.id, props.params.translationId), isNull(table.deletedAt)),
    with: {
      workspace: true,
    },
  });

  if (!translation || translation.workspace.tenantId !== tenantId) {
    return notFound();
  }

  const resp = await fetch(translation.fileUrl);

  const json = await resp.json();

  return (
    <div className='flex flex-col'>
      <JsonEditor initialContent={json} updatedAt={translation.updatedAt} name={translation.name} id={translation.id} />
    </div>
  );
}
