import { redirect } from 'next/navigation';
import { getCreation } from '../../../lib/store';
import { canRemix, hrefFor } from '../../../lib/toys';

// /remix/<id>: open the toy that made this creation, loaded with it.
export default async function Page({ params }: PageProps<'/remix/[id]'>) {
  const { id } = await params;
  const r = await getCreation(id);
  if (!r) redirect('/');
  if (r.type === 'naam' || r.type === 'greeting') redirect(hrefFor(r.type));
  // no toy makes it any more (old Mehendi links): just show it
  if (!canRemix(r.type)) redirect(`/r/${id}`);
  redirect(`${hrefFor(r.type)}?remix=${id}`);
}
