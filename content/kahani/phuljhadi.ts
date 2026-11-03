import type { Kahani } from './types';

const phuljhadi: Kahani = {
  toy: 'phuljhadi',
  title: 'रोशनी की Kahani', label: 'The story of light', gloss: 'the story of light',
  lead: 'On the darkest night of the month, India lights it up: rows of diyas, paper lanterns, and a sparkler fizzing in a child’s hand.',
  chapters: [
    { kicker: 'A row of lamps', title: 'Deep + avali', art: 'diyas',
      body: '*Deepavali* comes from Sanskrit: *deepa*, a lamp, and *avali*, a row. Its main night falls on [[amavasya]], the new moon, so the lamps have the whole dark sky to themselves. Homes are cleaned, doorsteps get a fresh [[rangoli]] and every ledge gets a [[diya]].' },
    { kicker: 'Many stories, one night', title: 'Whose Diwali is it?', art: 'stambh',
      body: 'In the north it welcomes Rama home to Ayodhya. In the south and in Goa it marks the end of [[narakasura|Narakasura]]. Bengal worships Kali. Sikhs celebrate [[bandichhor|Bandi Chhor Divas]], the release of Guru Hargobind, and Jains remember the day Mahavira attained nirvana. Same lamps, different stories.' },
    { kicker: 'Fizz in the hand', title: 'A shower of flowers', art: 'sparkler',
      body: 'A [[phuljhadi]] is a stiff wire dipped in a paste that burns slowly. Its name means a shower (*jhadi*) of flowers (*phool*), and that is just what it throws: tiny bits of burning iron that pop and branch into stars.' },
    { kicker: 'Colour from metals', title: 'Why is that one green?', art: 'flask',
      body: 'Every firework colour comes from a metal in the mix. Strontium burns red, barium green, copper blue-green and sodium a deep yellow. Aluminium throws silvery-white sparks and iron the gold, branching ones. Blue is the hardest colour of all to make.' },
    { kicker: 'Made in one town', title: 'Sivakasi', art: 'matchbox',
      body: 'Most of India’s fireworks, and a great many of its matches, are made in and around Sivakasi in Tamil Nadu, where the dry weather suits the work. It is skilled and risky work. Children once worked in these factories, until the Supreme Court ordered them out.' },
    { kicker: 'Drawing with light', title: 'Picasso’s torch', art: 'torch',
      body: 'In 1949 the photographer Gjon Mili visited Pablo Picasso in the south of France. In a dark room, with the camera’s shutter left open, Picasso drew in the air with a small torch. The drawings lived only in the photos. This toy works the same way: a long exposure, with light for ink.' },
  ],
  play: {
    title: 'लौ का Rang', label: 'The colour of a flame',
    intro: 'Every firework colour is a metal burning. Drop a pinch into the flame and watch what colour it turns. Then try two at once.',
  },
  timeline: [
    { when: 'Around 1400', title: 'Fireworks reach India', body: 'The historian P. K. Gode traced Indian fireworks to about this time, soon after gunpowder arrived.' },
    { when: '1443', title: 'Sparks at Vijayanagara', body: 'Abdur Razzaq, a Persian envoy at the Vijayanagara court, wrote about fire displays at the Mahanavami festival.' },
    { when: '1518', title: 'Rockets at a wedding', body: 'The Portuguese traveller Duarte Barbosa described rockets lit at a wedding in Gujarat.' },
    { when: '1949', title: 'Picasso draws with light', body: 'Gjon Mili’s long-exposure photos of Picasso’s torch drawings went on show at New York’s Museum of Modern Art in 1950.' },
    { when: '10 December 1996', title: 'Children out of the factories', body: 'In *M. C. Mehta v. State of Tamil Nadu*, the Supreme Court ordered that children must not work in fireworks factories.' },
    { when: '2018', title: 'Green crackers', body: 'Scientists at CSIR-NEERI made “green” crackers that give off less smoke and dust. Courts began setting hours for bursting crackers in polluted cities.' },
    { when: 'Today', title: 'More diyas, fewer crackers', body: 'Many families now light more lamps and burst fewer crackers. Ayodhya’s Deepotsav lines the river ghats with lakhs of diyas.' },
  ],
  places: {
    intro: 'Diwali is many festivals in one. Tap a lit tile to see how it is marked there.',
    list: [
      { state: 'UP', name: 'Deepotsav', script: 'दीपोत्सव', lang: 'Hindi', note: 'In Ayodhya, lakhs of diyas are lit along the ghats of the Saryu for Rama’s homecoming.' },
      { state: 'TN', name: 'Deepavali', script: 'தீபாவளி', lang: 'Tamil', note: 'It starts before dawn with an oil bath, the Ganga snanam, then new clothes and crackers. Sivakasi, which makes most of them, is here.' },
      { state: 'GA', name: 'Narakasur', script: 'नरकासुर', lang: 'Konkani', note: 'Neighbourhoods spend weeks building giant Narakasura effigies, then burn them before dawn on Naraka Chaturdashi.' },
      { state: 'WB', name: 'Kali Puja', script: 'কালীপুজো', lang: 'Bengali', note: 'On the new-moon night Bengal worships Kali, with lamps on every ledge and fireworks overhead.' },
      { state: 'PB', name: 'Bandi Chhor Divas', script: 'ਬੰਦੀ ਛੋੜ ਦਿਵਸ', lang: 'Punjabi', note: 'Sikhs remember Guru Hargobind’s release from Gwalior Fort. The Golden Temple in Amritsar glows with lamps.' },
      { state: 'GJ', name: 'Bestu Varas', script: 'બેસતું વર્ષ', lang: 'Gujarati', note: 'The day after Diwali is the Gujarati New Year: new account books, visits and sweets.' },
      { state: 'MH', name: 'Akash kandil', script: 'आकाश कंदील', lang: 'Marathi', note: 'Paper star lanterns, akash kandils, hang outside homes and glow all through Diwali.' },
      { state: 'OD', name: 'Bada Badua Daka', script: 'ବଡ଼ ବଡୁଆ ଡାକ', lang: 'Odia', note: 'Families raise burning jute sticks, kaunria kathi, to the sky to call their ancestors and light their way.' },
    ],
  },
  quiz: [
    { text: 'A sparkler’s branching sparks are tiny bits of burning iron.', sach: true, why: 'Iron with a little carbon in it bursts into those star-shaped branches as it burns.' },
    { text: 'Blue is the easiest firework colour to make.', sach: false, why: 'Blue is famously the hardest: the copper that makes it loses its colour if the flame gets too hot.' },
    { text: 'Diwali’s main night falls on the full moon.', sach: false, why: 'It falls on amavasya, the new moon, the darkest night of the month.' },
    { text: 'A used sparkler wire should go into a bucket of water.', sach: true, why: 'The wire stays hot long after the sparks stop. Real sparklers burn at over 1,000°C.' },
  ],
  words: ['amavasya', 'diya', 'phuljhadi', 'anaar', 'chakri', 'narakasura', 'bandichhor', 'kandil'],
  sources: [
    { label: 'Sparkler, Wikipedia', href: 'https://en.wikipedia.org/wiki/Sparkler' },
    { label: 'Diwali, Wikipedia', href: 'https://en.wikipedia.org/wiki/Diwali' },
    { label: 'P. K. Gode, The History of Fireworks in India between A.D. 1400 and 1900 (1953)', href: 'https://archive.org/details/historyoffireworksinindiaad1400to1900godep.k._352_H' },
    { label: 'Gjon Mili’s photographs of Picasso, MoMA press release (1950)', href: 'https://www.moma.org/docs/press_archives/1399/releases/MOMA_1950_0008_1950-01-19_500119-8.pdf' },
    { label: 'Narak Chaturdashi in Goa, Incredible India', href: 'https://www.incredibleindia.gov.in/en/festivals-and-events/goa/narak-chaturdashi' },
  ],
  next: 'naam',
};

export default phuljhadi;
