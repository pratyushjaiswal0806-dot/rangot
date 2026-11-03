// "Remix this one": a toy page opened with ?remix=<id> loads that creation so you can add to it.
// The query is dropped from the address bar once read, so a refresh starts fresh.
import { ID_RE, validateRecipe, type Recipe, type RecipeType } from './recipe';
import { track } from './track';
import { flash } from './toast';

export function queryParam(name: string): string | null {
  try { return new URLSearchParams(location.search).get(name); } catch { return null; }
}

function dropQuery() {
  try { history.replaceState(history.state, '', location.pathname + location.hash); } catch {}
}

export async function readRemix(type: RecipeType): Promise<Recipe | null> {
  const id = queryParam('remix');
  if (!id) return null;
  dropQuery();
  if (!ID_RE.test(id)) return null;
  const r = await fetch('/api/creations/' + id).then((x) => (x.ok ? x.json() : null)).then(validateRecipe).catch(() => null);
  if (!r || r.type !== type) { flash('That creation could not be found.'); return null; }
  track('remix', { kind: r.type });
  return r;
}
