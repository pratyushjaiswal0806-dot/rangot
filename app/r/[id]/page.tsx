import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SharedView from '../../../components/SharedView';
import Greeting from '../../../components/Greeting';
import { getCreation } from '../../../lib/store';
import { LABEL, type Recipe } from '../../../lib/recipe';
import { festivalById } from '../../../lib/festivals';

function describe(r: Recipe) {
  const by = r.by;
  if (r.type === 'greeting') {
    const f = festivalById(r.data.f);
    const what = f.key === 'anyday' ? 'a diya' : `a ${f.name} greeting`;
    return { title: by ? `${by} sent you ${what}` : `You have ${what}`, description: 'Open it, then light a diya back.' };
  }
  if (r.type === 'naam') return { title: `${r.data.n}, woven as a kolam`, description: 'Every name makes its own kolam. What does yours look like?' };
  const label = LABEL[r.type];
  return { title: by ? `${by}'s ${label}` : `A ${label} from Rangotsav`, description: `Watch it replay, then make your own ${label} at Rangotsav.` };
}

export async function generateMetadata({ params }: PageProps<'/r/[id]'>): Promise<Metadata> {
  const r = await getCreation((await params).id);
  if (!r) return { title: 'Rangotsav' };
  const { title, description } = describe(r);
  return {
    title: `${title} · Rangotsav`,
    description,
    openGraph: { title, description, type: 'website', siteName: 'Rangotsav' },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: false }, // personal creations stay out of search results
  };
}

export default async function Page({ params }: PageProps<'/r/[id]'>) {
  const { id } = await params;
  const r = await getCreation(id);
  if (!r) notFound();
  return r.type === 'greeting' ? <Greeting recipe={r} id={id} /> : <SharedView recipe={r} id={id} />;
}
