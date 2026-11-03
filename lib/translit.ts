// Romanised names and sayings into Devanagari, the way a sign painter would spell them by ear:
// "Priya" → प्रिया, "Nazar na lage" → नज़र ना लगे, "Rangotsav" → रंगोत्सव. Rules, not a dictionary,
// so it's charmingly wrong now and then, which suits a truck.
const CONS: [string, string][] = [
  ['chh', 'छ'], ['ksh', 'क्ष'], ['kh', 'ख'], ['gh', 'घ'], ['ch', 'च'], ['jh', 'झ'], ['th', 'थ'], ['dh', 'ध'], ['ph', 'फ'], ['bh', 'भ'],
  ['sh', 'श'], ['gy', 'ज्ञ'], ['tr', 'त्र'],
  ['k', 'क'], ['g', 'ग'], ['c', 'क'], ['j', 'ज'], ['t', 'त'], ['d', 'द'], ['n', 'न'], ['p', 'प'], ['f', 'फ़'], ['b', 'ब'], ['m', 'म'],
  ['y', 'य'], ['r', 'र'], ['l', 'ल'], ['v', 'व'], ['w', 'व'], ['s', 'स'], ['h', 'ह'], ['z', 'ज़'], ['q', 'क'], ['x', 'क्स'],
];
// [roman, standalone letter, matra after a consonant]
const VOW: [string, string, string][] = [
  ['aa', 'आ', 'ा'], ['ai', 'ऐ', 'ै'], ['ei', 'ए', 'े'], ['ea', 'ई', 'ी'], ['au', 'औ', 'ौ'], ['ee', 'ई', 'ी'], ['ii', 'ई', 'ी'], ['oo', 'ऊ', 'ू'], ['uu', 'ऊ', 'ू'],
  ['a', 'अ', ''], ['i', 'इ', 'ि'], ['u', 'उ', 'ु'], ['e', 'ए', 'े'], ['o', 'ओ', 'ो'],
];
const VIRAMA = '्', ANUSVARA = 'ं';
const isV = (c: string | undefined) => !!c && 'aeiou'.includes(c);

function word(w: string): string {
  const s = w.toLowerCase();
  let out = '', i = 0, after = false; // after: the last thing written was a bare consonant
  while (i < s.length) {
    // n or m before another consonant becomes the anusvara dot: rang → रंग
    if ((s[i] === 'n' || s[i] === 'm') && after === false && i > 0 && s[i + 1] && !isV(s[i + 1]) && /[a-z]/.test(s[i + 1]) && s[i + 1] !== 'y' && s[i + 1] !== 'h' && s[i + 1] !== s[i]) {
      out += ANUSVARA; i++; continue;
    }
    const v = VOW.find(([r]) => s.startsWith(r, i));
    if (v) {
      const [r, alone, matra] = v;
      const end = i + r.length >= s.length;
      if (after) {
        // a final short a or i is sung long: Priya → प्रिया, na → ना, Ravi → रवी
        out += end && r === 'a' ? 'ा' : end && r === 'i' ? 'ी' : matra;
      } else out += alone;
      after = false; i += r.length; continue;
    }
    // a final y after a consonant is a long i: Murthy → मुर्थी
    if (s[i] === 'y' && after && i === s.length - 1) { out += 'ी'; after = false; i++; continue; }
    const c = CONS.find(([r]) => s.startsWith(r, i));
    if (c) {
      if (after) out += VIRAMA;
      out += c[1]; after = true; i += c[0].length; continue;
    }
    out += s[i]; after = false; i++;
  }
  return out;
}

// Latin words are converted; anything already in an Indian script, digits and punctuation pass through.
export function toDevanagari(text: string): string {
  return text.replace(/[A-Za-z]+/g, word);
}
