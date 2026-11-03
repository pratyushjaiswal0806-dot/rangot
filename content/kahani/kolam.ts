import type { Kahani } from './types';

const kolam: Kahani = {
  toy: 'kolam',
  title: 'Kolam की Kahani', label: 'The story of kolam', gloss: 'the story of kolam',
  lead: 'Before the sun is up in Tamil Nadu, the doorstep is swept and sprinkled with water, and a few dots of rice flour turn into a whole drawing, often without the hand ever lifting.',
  chapters: [
    { kicker: 'Before sunrise', title: 'The dawn drawing', art: 'sun',
      body: 'In many Tamil homes the day starts at the [[threshold]]: sweep, sprinkle water, draw. The damp ground holds the flour. By the time the milk arrives, a fresh [[kolam]] is waiting at the door.' },
    { kicker: 'Dots first', title: 'Pulli and the line', art: 'dots',
      body: 'A kolam begins with a grid of dots called [[pulli]]. Then a line loops around them. In a [[sikku]] kolam the line weaves round every dot and comes back to where it began, all in one stroke.' },
    { kicker: 'Breakfast for a thousand', title: 'Food for ants and birds', art: 'ants',
      body: 'Rice flour is food. Through the day ants, sparrows and insects eat the kolam away. The writer Vijaya Nagarajan named her book on kolam *Feeding a Thousand Souls*.' },
    { kicker: 'An empty doorstep speaks', title: 'When there is no kolam', art: 'door',
      body: 'A kolam says all is well. When a family is in mourning, the doorstep is left bare for some days, and the neighbours understand without a word being said.' },
    { kicker: 'Maths on the floor', title: 'Kolam and computers', art: 'grid',
      body: 'Kolams follow rules: symmetry, loops, a line with no end. In the early 1970s, computer scientists in Madras used them to study “picture languages”, and mathematicians still write papers about them.' },
  ],
  play: {
    title: 'Line मत तोड़ो', label: 'Don’t lift your finger',
    intro: 'Start at the glowing dot and trace the kolam in one go. Lift your finger and the flour scatters, so start again. Finish it and see who comes for breakfast.',
  },
  timeline: [
    { when: 'Every dawn', title: 'Sweep, sprinkle, draw', body: 'For generations, the kolam has been one of the first things done each day.' },
    { when: 'Margazhi', title: 'The biggest kolams of the year', body: 'From mid-December to mid-January, kolams spread across the whole street, and neighbours quietly compete.' },
    { when: 'Pongal', title: 'Colour and a pot', body: 'Harvest kolams get colours, a pot of pongal boiling over, sugarcane and the sun.' },
    { when: 'Early 1970s', title: 'Kolam array grammars', body: 'Gift Siromoney, Rani Siromoney and Kamala Krithivasan described kolams with formal “array grammars”, picture languages a computer can generate.' },
    { when: '1978', title: '“South Indian kolam patterns”', body: 'Gift Siromoney wrote about kolam for Kalakshetra Quarterly, for readers who were not mathematicians.' },
    { when: '2018', title: 'Feeding a Thousand Souls', body: 'Vijaya Nagarajan’s book, the first full study of kolam in English, looks at its history, maths and ecology.' },
    { when: 'Today', title: 'Paint, stickers and reels', body: 'Busy homes use paint or stick-on kolams that last. Many still say it isn’t really kolam unless the ants can eat it.' },
  ],
  places: {
    intro: 'Dot-and-line floor drawings live across the south. Tap a lit tile.',
    list: [
      { state: 'TN', name: 'Kolam', script: 'கோலம்', lang: 'Tamil', note: 'The heartland of the pulli kolam and the sikku line.' },
      { state: 'PY', name: 'Kolam', script: 'கோலம்', lang: 'Tamil', note: 'Kolam at every door, and street contests in Margazhi.' },
      { state: 'AP', name: 'Muggu', script: 'ముగ్గు', lang: 'Telugu', note: 'Dot muggulu (chukkala muggulu) are drawn the same way: dots first, then lines.' },
      { state: 'TS', name: 'Muggu', script: 'ముగ్గు', lang: 'Telugu', note: 'Chukkala muggulu fill the lanes at Sankranti.' },
      { state: 'KA', name: 'Rangoli', script: 'ರಂಗೋಲಿ', lang: 'Kannada', note: 'Dot rangolis, chukki rangoli, are drawn at the door each morning.' },
      { state: 'KL', name: 'Kolam', script: 'കോലം', lang: 'Malayalam', note: 'Drawn in Tamil-speaking homes and in Palakkad, and for Onam the flower pookalam takes over.' },
    ],
  },
  quiz: [
    { text: 'A sikku kolam’s line weaves round the dots and joins back up with itself.', sach: true, why: 'One unbroken loop, drawn without lifting the hand.' },
    { text: 'Kolam is drawn in the evening, after the house is cleaned.', sach: false, why: 'It is usually drawn at dawn, often before sunrise.' },
    { text: 'Computer scientists have studied kolams.', sach: true, why: 'Kolams inspired “array grammars”, picture languages, from the early 1970s.' },
    { text: 'A bare doorstep can tell the neighbours a family is in mourning.', sach: true, why: 'No kolam is drawn for some days after a death in the family.' },
  ],
  words: ['pulli', 'sikku', 'kolam', 'margazhi', 'threshold', 'muggu'],
  sources: [
    { label: 'Kolam, Wikipedia', href: 'https://en.wikipedia.org/wiki/Kolam' },
    { label: 'Gift Siromoney’s kolam papers, Chennai Mathematical Institute', href: 'https://www.cmi.ac.in/gift/Kolam/kola_pattern.htm' },
    { label: 'A view of India through kolam, Prof. K. Krithivasan (PDF)', href: 'https://www.inae.in/wp-content/uploads/2018/12/A-VIEW-OF-INDIA-THROUGH-KOLAM-Prof-K-Krithivasan-Dec-2014-.pdf' },
    { label: 'Kolam, the art of everyday sustainability, Nature inFocus', href: 'https://www.natureinfocus.in/story/kolam-the-art-of-everyday-sustainability' },
  ],
  next: 'pookalam',
};

export default kolam;
