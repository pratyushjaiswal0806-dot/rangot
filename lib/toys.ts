// Every toy in one list: the home shelf, the header, old-link redirects and the "make your own"
// buttons on share pages all read from here.
import type { RecipeType } from './recipe';
import type { StampId } from './progress';

export type ToyId = 'naam' | 'rangoli' | 'phuljhadi' | 'kolam' | 'pookalam' | 'bandhani' | 'block' | 'poster' | 'truck' | 'pulli' | 'selfie' | 'kathputli' | 'warli' | 'patang';

export type Toy = {
  id: ToyId;
  href: string;
  title: string;
  // the Hinglish poster title on the shelf tile
  mix: string;
  kn: string;
  hi: string;
  blurb: string;
  tag: string;
  stamp: StampId;
  // the recipe type this toy makes, for remix links and "make your own"
  makes?: RecipeType;
  // the tile's backdrop behind the live preview
  floor: string;
  cta: string;
};

export const TOYS: Toy[] = [
  { id: 'naam', href: '/naam', title: 'Naam Kolam', mix: 'Naam कोलम', kn: 'ಹೆಸರಿನ ರಂಗೋಲಿ', hi: 'नाम कोलम', blurb: 'Your name, woven into its own kolam.', tag: 'Start here', stamp: 'naam', makes: 'naam', floor: '#7A0E3A', cta: 'Weave your name' },
  { id: 'rangoli', href: '/rangoli', title: 'Draw Rangoli', mix: 'Draw रंगोली', kn: 'ರಂಗೋಲಿ', hi: 'रंगोली', blurb: 'Scribble once, get sixteen mirrored copies.', tag: '16 mirrors', stamp: 'rangoli', makes: 'rangoli', floor: '#3B2117', cta: 'Start drawing' },
  { id: 'phuljhadi', href: '/phuljhadi', title: 'Phuljhadi', mix: 'फुलझड़ी Light', kn: 'ಸುರುಸುರು ಬತ್ತಿ', hi: 'फुलझड़ी', blurb: 'Paint with a Diwali sparkler: write your name in light, or spin a mandala of sparks.', tag: 'New · Diwali', stamp: 'phuljhadi', makes: 'phuljhadi', floor: '#1A0A2E', cta: 'Light the sparkler' },
  { id: 'kolam', href: '/kolam', title: 'Kolam Weaver', mix: 'कोलम Weaver', kn: 'ಚುಕ್ಕಿ ರಂಗೋಲಿ', hi: 'पुल्ली कोलम', blurb: 'Place dots, twist the line, and weave them all into one unbroken loop.', tag: 'Puzzle', stamp: 'kolam', makes: 'kolam', floor: '#3B2117', cta: 'Start weaving' },
  { id: 'pookalam', href: '/pookalam', title: 'Pookalam', mix: 'Pookalam फूल', kn: 'ಹೂವಿನ ರಂಗೋಲಿ', hi: 'फूलों की रंगोली', blurb: "Kerala's Onam flower carpet. Tap a ring, the petals fall into place.", tag: 'New · Onam', stamp: 'pookalam', makes: 'pookalam', floor: '#4A2C1A', cta: 'Lay the flowers' },
  { id: 'bandhani', href: '/bandhani', title: 'Bandhani', mix: 'बांधणी Dye', kn: 'ಬಂಧನಿ', hi: 'बांधणी', blurb: 'Tie knots, dip the cloth in dye, then untie it to find the dots.', tag: 'New · Dye', stamp: 'bandhani', makes: 'bandhani', floor: '#C42330', cta: 'Tie and dye' },
  { id: 'block', href: '/block', title: 'Block Print', mix: 'Block छपाई', kn: 'ಅಚ್ಚು ಮುದ್ರಣ', hi: 'ठप्पा छपाई', blurb: 'Ink a carved block and press it on cloth.', tag: '8 blocks', stamp: 'block', makes: 'block', floor: '#F2E4C6', cta: 'Open the workshop' },
  { id: 'warli', href: '/warli', title: 'Warli', mix: 'वारली Dance', kn: 'ವಾರ್ಲಿ ಚಿತ್ರ', hi: 'वारली', blurb: 'Paint a Warli village: tap, and dancers join hands round the tarpa player.', tag: 'New · Dance', stamp: 'warli', makes: 'warli', floor: '#8E3B20', cta: 'Join the dance' },
  { id: 'poster', href: '/poster', title: 'Type Distorter', mix: 'अक्षर Distorter', kn: 'ಅಕ್ಷರ ಕಲೆ', hi: 'अक्षर कला', blurb: 'Bend a word like a bazaar banner.', tag: 'Mela poster', stamp: 'poster', makes: 'poster', floor: '#B0246A', cta: 'Bend a word' },
  { id: 'truck', href: '/truck', title: 'Truck Art', mix: 'Truck कला', kn: 'ಲಾರಿ ಕಲೆ', hi: 'ट्रक कला', blurb: 'Your name, painted like the back of a lorry.', tag: 'Horn OK', stamp: 'plate', makes: 'plate', floor: '#1B1410', cta: 'Paint your name' },
  { id: 'selfie', href: '/selfie', title: 'Truck-art Selfie', mix: 'Truck-art सेल्फ़ी', kn: 'ಲಾರಿ ಸೆಲ್ಫಿ', hi: 'ट्रक सेल्फ़ी', blurb: 'Your face, framed like the back of a lorry.', tag: 'New · Camera', stamp: 'selfie', floor: '#1B1410', cta: 'Strike a pose' },
  { id: 'kathputli', href: '/kathputli', title: 'Kathputli', mix: 'कठपुतली Show', kn: 'ಸೂತ್ರದ ಗೊಂಬೆ', hi: 'कठपुतली', blurb: 'Rajasthani string puppets: work the strings and they dance to the dholak.', tag: 'New · Puppets', stamp: 'kathputli', makes: 'kathputli', floor: '#5A1A12', cta: 'Raise the curtain' },
  { id: 'patang', href: '/patang', title: 'Patang', mix: 'पतंग Udao', kn: 'ಗಾಳಿಪಟ', hi: 'पतंग', blurb: 'Design a kite and fly it over Ahmedabad on Uttarayan. Cross a string, pull hard: Kai po che!', tag: 'New · Game', stamp: 'patang', makes: 'patang', floor: '#2D4C7C', cta: 'Fly a kite' },
  { id: 'pulli', href: '/pulli', title: 'Pulli Puzzle', mix: 'पुल्ली Puzzle', kn: 'ಚುಕ್ಕಿ ಆಟ', hi: 'पुल्ली पहेली', blurb: "Find the dots behind today's kolam.", tag: 'Daily', stamp: 'pulli', floor: '#7A0E3A', cta: "Play today's puzzle" },
];

export const toyById = (id: ToyId) => TOYS.find((t) => t.id === id)!;

// Where a creation of this type is made (and remixed).
export function hrefFor(type: RecipeType): string {
  return TOYS.find((t) => t.makes === type)?.href ?? '/';
}

// Whether a toy can open this creation for remixing. Mehendi's toy is gone, so old Mehendi links
// replay but can't be remixed (sending them to "/" would loop through the legacy ?remix= redirect).
export const canRemix = (type: RecipeType) => TOYS.some((t) => t.makes === type);

// The old one-page site opened toys with /?tool=<recipe type>; share links in the wild use it.
// (Never map one to '/': redirects pass the query through, so that would loop.)
export const LEGACY_TOOLS: Record<string, string> = {
  rangoli: '/rangoli', kolam: '/kolam', block: '/block', poster: '/poster', pookalam: '/pookalam', bandhani: '/bandhani',
  plate: '/truck', naam: '/naam',
};
