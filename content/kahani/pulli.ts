import type { Kahani } from './types';

const pulli: Kahani = {
  toy: 'pulli',
  title: 'पुल्ली की Kahani', label: 'The story of the dots', gloss: 'the story of the dots',
  lead: 'Every kolam hides a grid of dots. Learn to see it, and every doorstep turns into a puzzle.',
  chapters: [
    { kicker: 'Start with dots', title: 'Straight or tucked in', art: 'dots',
      body: 'Dots in neat rows and columns are [[nerpulli|ner pulli]]. Dots in staggered rows, each row tucked into the gaps of the one before, are [[idukku|idukku pulli]]. Kolam recipes often name the grid, like “7 to 1”: a middle row of seven dots, shrinking to one.' },
    { kicker: 'Two ways to draw', title: 'Join them or loop them', art: 'grid',
      body: 'In one kind of kolam the lines join dot to dot. In a [[kambi]] kolam, *kambi* meaning wire, the line never touches a dot: it bends round them, and in a [[sikku]] kolam it weaves through them all and comes back to where it began.' },
    { kicker: 'All in the head', title: 'A puzzle at dawn', art: 'sun',
      body: 'Kolam drawers carry hundreds of designs in memory, and work out new ones on the doorstep, quickly, before the day starts. In [[margazhi]] the grids get bigger and the patterns harder, and the whole street can see who solved theirs.' },
    { kicker: 'Mathematicians take notes', title: 'Rules that grow', art: 'book',
      body: 'Some kolams grow by a rule: add a ring of dots, follow the same moves, and a bigger kolam appears that is still one line. Computer scientists in Madras studied this in the 1970s, and the mathematician Marcia Ascher wrote about kolams in her 2002 book *Mathematics Elsewhere*.' },
  ],
  play: {
    title: 'Rule से बढ़ाओ', label: 'Grow a kolam by rule',
    intro: 'Each step adds a ring of dots round the last grid, and the same weaving rule turns them into one line again. How big can it get?',
  },
  timeline: [
    { when: 'Every dawn', title: 'The daily puzzle', body: 'Sweep, sprinkle, dot the grid, draw, long before newspapers had crosswords.' },
    { when: 'Margazhi', title: 'The big grids', body: 'Mid-December to mid-January: the biggest dot grids of the year.' },
    { when: 'Early 1970s', title: 'Picture languages', body: 'Gift Siromoney, Rani Siromoney and Kamala Krithivasan describe kolams as rules a computer can follow.' },
    { when: '2002', title: 'Mathematics Elsewhere', body: 'Marcia Ascher’s book puts kolam beside the mathematical ideas of cultures around the world.' },
    { when: 'Today', title: 'Pulli, every day', body: 'This site’s daily puzzle: find the dots behind a kolam. Same puzzle for everyone, one a day.' },
  ],
  places: {
    intro: 'Where dots come before the drawing. Tap a lit tile.',
    list: [
      { state: 'TN', name: 'Pulli kolam', script: 'புள்ளி கோலம்', lang: 'Tamil', note: 'Ner pulli and idukku pulli grids at every door.' },
      { state: 'PY', name: 'Pulli kolam', script: 'புள்ளி கோலம்', lang: 'Tamil', note: 'Street kolam contests in Margazhi.' },
      { state: 'AP', name: 'Chukkala muggu', script: 'చుక్కల ముగ్గు', lang: 'Telugu', note: 'Chukka means dot: the dot muggulu of Sankranti.' },
      { state: 'TS', name: 'Chukkala muggu', script: 'చుక్కల ముగ్గు', lang: 'Telugu', note: 'Big dot grids fill the lanes at Sankranti.' },
      { state: 'KA', name: 'Chukki rangoli', script: 'ಚುಕ್ಕಿ ರಂಗೋಲಿ', lang: 'Kannada', note: 'Chukki also means dot.' },
    ],
  },
  quiz: [
    { text: 'In idukku pulli, the rows of dots are staggered.', sach: true, why: 'Each row sits in the gaps of the one before.' },
    { text: 'A kambi kolam joins the dots with straight lines.', sach: false, why: 'Its line bends round the dots without touching them.' },
    { text: 'Some kolams can keep growing by the same rule.', sach: true, why: 'Add dots, repeat the moves, and it’s still one line.' },
    { text: 'Kolam drawers always copy from a printed book.', sach: false, why: 'Most carry their designs in memory, learned by watching.' },
  ],
  words: ['pulli', 'nerpulli', 'idukku', 'kambi', 'sikku', 'margazhi'],
  sources: [
    { label: 'Pulli kolam, Chantal Jumel', href: 'https://chantal-jumel-kolam-kalam.com/en/pulli-kolam-or-kolam-with-dots/' },
    { label: 'Gift Siromoney’s kolam papers, Chennai Mathematical Institute', href: 'https://www.cmi.ac.in/gift/Kolam/kola_pattern.htm' },
    { label: 'Kolam, Wikipedia', href: 'https://en.wikipedia.org/wiki/Kolam' },
  ],
  next: 'rangoli',
};

export default pulli;
