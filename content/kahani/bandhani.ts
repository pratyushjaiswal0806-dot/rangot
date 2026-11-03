import type { Kahani } from './types';

const bandhani: Kahani = {
  toy: 'bandhani',
  title: 'बांधणी की Kahani', label: 'The story of bandhani', gloss: 'the story of bandhani',
  lead: 'Pinch up a little cloth, wind thread round it tight, and dip it in dye. Where the thread was, the colour can’t reach. Do that a few thousand times and you have bandhani.',
  chapters: [
    { kicker: 'Tie, dip, untie', title: 'A dot for every knot', art: 'knot',
      body: '[[bandhani]] comes from *bandh*, to tie. Tiny pinches of cloth are tied off with thread, often by women working at home, one knot at a time. After dyeing, the cloth is pulled open and every knot leaves a little ring of the colour underneath.' },
    { kicker: 'Knots with names', title: 'One dot, three, four, a mountain', art: 'cloth',
      body: 'A single dot is an [[ekdali]]. Clusters of three, four and seven, and patterns like *dungar shahi*, the mountain, each have their own names. A red [[gharchola]] wedding sari sets its dots in a grid of squares.' },
    { kicker: 'Light to dark', title: 'The order of the dyes', art: 'vat',
      body: 'The lightest dye goes first. Tie, dip in yellow; tie more, dip in red; tie more, dip in maroon or black. Each round of knots keeps the colour it was wearing, so one cloth can hold four colours without a single brushstroke. A [[rangrez]] who gets the order wrong gets mud.' },
    { kicker: 'Next door in Rajasthan', title: 'Waves instead of dots', art: 'waves',
      body: 'In [[leheriya]], the cloth is rolled on the slant and tied along its length, so the dye comes out in diagonal stripes like waves. It is the colour of the monsoon festival of Teej in Rajasthan.' },
  ],
  play: {
    title: 'रंग का Order', label: 'Dye in the right order',
    intro: 'Tap the three dye pots in the order you would dip the cloth. Knots get tied between dips, so each colour keeps the dots it covers. Light to dark, or mud?',
  },
  timeline: [
    { when: 'Very old', title: 'Dots on the cave walls', body: 'Some of the paintings in the Ajanta caves, from around the 5th century, are often read as showing tie-dyed clothes.' },
    { when: 'For centuries', title: 'Khatri dyers', body: 'Khatri families of Kutch and Saurashtra have long been known as bandhani dyers, with the tying done by women in nearby homes.' },
    { when: 'Local lore', title: 'Jamnagar red', body: 'People in Jamnagar like to say their water gives its reds a brightness no other town can match.' },
    { when: 'Every Navratri', title: 'Nine nights of garba', body: 'Bandhani chaniya cholis and dupattas whirl through the dance nights of Gujarat.' },
    { when: '2010s', title: 'A name of its own', body: 'Jamnagari Bandhani was registered as a Geographical Indication, a craft tied to its place.' },
    { when: 'Today', title: 'Real or printed?', body: 'Printed fakes are everywhere. Real bandhani has puckered, crinkly dots that show on both sides of the cloth.' },
  ],
  places: {
    intro: 'Tie-dye lives in the west, and travelled south too. Tap a lit tile.',
    list: [
      { state: 'GJ', name: 'Bandhani', script: 'બાંધણી', lang: 'Gujarati', note: 'Jamnagar and Kutch are the great centres: fine dots, deep reds, wedding gharcholas.' },
      { state: 'RJ', name: 'Bandhej · Leheriya', script: 'बंधेज · लहरिया', lang: 'Rajasthani', note: 'Bandhej dots and leheriya waves from Jaipur and Jodhpur, worn for Teej and weddings.' },
      { state: 'TN', name: 'Sungudi', script: 'சுங்குடி', lang: 'Tamil', note: 'Madurai’s own tie-dye cotton saris, a craft brought south long ago by weavers from Saurashtra.' },
    ],
  },
  quiz: [
    { text: 'Every dot in real bandhani is a knot tied by hand.', sach: true, why: 'Thousands of them, tied one at a time before the cloth is dyed.' },
    { text: 'The darkest dye goes on first.', sach: false, why: 'Light to dark: yellow, then red, then maroon. A light dye can’t cover a dark one.' },
    { text: 'Leheriya is tied on the slant, so it comes out in stripes.', sach: true, why: 'Lehar means wave, and that’s what the stripes look like.' },
    { text: 'Bandhani dots are stamped on with a wooden block.', sach: false, why: 'That’s block printing. Stamped dots are how fakes are made.' },
  ],
  words: ['bandhani', 'ekdali', 'gharchola', 'leheriya', 'rangrez'],
  sources: [
    { label: 'Bandhani, Wikipedia', href: 'https://en.wikipedia.org/wiki/Bandhani' },
    { label: 'Jamnagari Bandhani, Incredible India', href: 'https://www.incredibleindia.gov.in/en/gujarat/dwarka/jamnagari-bandhani' },
    { label: 'Leheriya, Wikipedia', href: 'https://en.wikipedia.org/wiki/Leheriya' },
    { label: 'Sungudi, Wikipedia', href: 'https://en.wikipedia.org/wiki/Sungudi' },
  ],
  next: 'block',
};

export default bandhani;
