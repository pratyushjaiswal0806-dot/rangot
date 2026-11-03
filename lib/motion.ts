// Motion helpers shared by the toys and effects. CSS animations are switched off globally for
// people who ask for reduced motion (app/globals.css); JS-driven motion asks calm() first.
export const calm = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// A quick shake (a block thudding down, a wrong answer). Uses `translate`, so it stacks on top of
// whatever transform the element already has.
export function shake(el: Element | null | undefined, px = 3, ms = 220) {
  if (!el || calm() || typeof (el as HTMLElement).animate !== 'function') return;
  const p = (k: number) => ({ translate: `${(k * px).toFixed(1)}px 0` });
  (el as HTMLElement).animate([p(0), p(-1), p(1), p(-0.7), p(0.5), p(0)], { duration: ms, easing: 'ease-out' });
}

// A soft "boing" on a button or tile: squash, overshoot, settle.
export function boing(el: Element | null | undefined, k = 1) {
  if (!el || calm() || typeof (el as HTMLElement).animate !== 'function') return;
  (el as HTMLElement).animate([{ scale: '1' }, { scale: `${1 + 0.12 * k} ${1 - 0.1 * k}` }, { scale: `${1 - 0.05 * k} ${1 + 0.06 * k}` }, { scale: '1' }], { duration: 380, easing: 'cubic-bezier(.3,1.5,.5,1)' });
}
