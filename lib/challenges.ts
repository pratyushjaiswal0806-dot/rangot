// Chunauti (challenge): three goals per toy for after the first try. A toy calls done(id) at a
// moment it already notices (a carpet finished, one unbroken line, a fast run of presses); the
// star is kept in this browser (lib/progress.ts) and announced with a toast and a cheer. Stars
// unlock things too (UNLOCKS in lib/progress.ts).
import type { ToyId } from './toys';
import { earn } from './progress';

export type Challenge = { id: string; toy: ToyId; label: string };

export const CHALLENGES: Challenge[] = [
  { id: 'rangoli-colours', toy: 'rangoli', label: 'Use 4 pigments on one floor' },
  { id: 'rangoli-spin', toy: 'rangoli', label: 'Draw while the floor spins' },
  { id: 'rangoli-diyas', toy: 'rangoli', label: 'Light diyas round your rangoli' },
  { id: 'phuljhadi-mandala', toy: 'phuljhadi', label: 'Paint a Mandala ×8' },
  { id: 'phuljhadi-colours', toy: 'phuljhadi', label: 'Use 4 colours in one painting' },
  { id: 'phuljhadi-camera', toy: 'phuljhadi', label: 'Let the light fade, then bring it back' },
  { id: 'kolam-one9', toy: 'kolam', label: 'One unbroken line round 9 dots or more' },
  { id: 'kolam-one16', toy: 'kolam', label: 'One unbroken line round 16 dots or more' },
  { id: 'kolam-twist', toy: 'kolam', label: 'Twist 3 loops into 1 by hand' },
  { id: 'pookalam-full', toy: 'pookalam', label: 'Lay a whole carpet' },
  { id: 'pookalam-flowers', toy: 'pookalam', label: 'Use 6 kinds of flower in one carpet' },
  { id: 'pookalam-free', toy: 'pookalam', label: 'Lay 30 flowers one by one, symmetry off' },
  { id: 'bandhani-three', toy: 'bandhani', label: 'Dip one cloth in three dyes' },
  { id: 'bandhani-knots', toy: 'bandhani', label: 'Tie 300 knots in one cloth' },
  { id: 'bandhani-motifs', toy: 'bandhani', label: 'Use 3 knot patterns in one cloth' },
  { id: 'block-row', toy: 'block', label: 'Print a border: drag a row of 5' },
  { id: 'block-combo', toy: 'block', label: 'Hit a ×8 combo (press fast!)' },
  { id: 'block-kurta', toy: 'block', label: 'Try your cloth on as a kurta' },
  { id: 'warli-twenty', toy: 'warli', label: 'Get 20 dancers into the circle' },
  { id: 'warli-palto', toy: 'warli', label: 'Turn the dance the other way: Palto!' },
  { id: 'warli-village', toy: 'warli', label: 'Paint a hut, a tree and an animal' },
  { id: 'poster-layouts', toy: 'poster', label: 'Try all 4 layouts' },
  { id: 'poster-indic', toy: 'poster', label: 'Write a word in हिन्दी or ಕನ್ನಡ' },
  { id: 'poster-nachao', toy: 'poster', label: 'Make your poster dance' },
  { id: 'truck-horn', toy: 'truck', label: 'Honk the horn 5 times' },
  { id: 'truck-styles', toy: 'truck', label: 'Try all 4 styles' },
  { id: 'truck-chalo', toy: 'truck', label: 'Send the truck off: Chalo!' },
  { id: 'selfie-snap', toy: 'selfie', label: 'Take a truck-art selfie' },
  { id: 'selfie-stickers', toy: 'selfie', label: 'Add 3 stickers' },
  { id: 'selfie-frames', toy: 'selfie', label: 'Try 3 frames' },
  { id: 'kathputli-nacho', toy: 'kathputli', label: 'Make the puppet dance: Nacho!' },
  { id: 'kathputli-show', toy: 'kathputli', label: 'Record a 10-second show' },
  { id: 'kathputli-all', toy: 'kathputli', label: 'Work all 3 puppets' },
  { id: 'patang-pech', toy: 'patang', label: 'Cut a kite: Kai po che!' },
  { id: 'patang-three', toy: 'patang', label: 'Cut 3 kites without losing yours' },
  { id: 'patang-high', toy: 'patang', label: 'Fly to the very top of the sky' },
  { id: 'naam-three', toy: 'naam', label: 'Weave 3 names' },
  { id: 'naam-for', toy: 'naam', label: 'Weave a name for someone' },
  { id: 'naam-share', toy: 'naam', label: 'Share a Naam card' },
  { id: 'pulli-solve', toy: 'pulli', label: 'Solve a day’s puzzle' },
  { id: 'pulli-three', toy: 'pulli', label: 'Solve it in 3 tries or fewer' },
  { id: 'pulli-streak', toy: 'pulli', label: 'Play 3 days in a row' },
];
export const challengesFor = (toy: ToyId) => CHALLENGES.filter((c) => c.toy === toy);
export const challengeById = (id: string) => CHALLENGES.find((c) => c.id === id);

// The goal is met: keep the star (once) and announce it.
export function done(id: string) {
  const c = challengeById(id);
  if (c) earn(c.id, c.label, CHALLENGES.length);
}
