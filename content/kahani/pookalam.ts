import type { Kahani } from './types';

const pookalam: Kahani = {
  toy: 'pookalam',
  title: 'Pookalam की Kahani', label: 'The story of pookalam', gloss: 'the story of pookalam',
  lead: 'For ten days every year, Kerala’s doorsteps bloom. A small ring of flowers on the first morning grows, day by day, into a carpet fit for a king.',
  chapters: [
    { kicker: 'Ten mornings', title: 'A carpet that grows', art: 'flower',
      body: 'The [[pookalam]] begins on [[atham]], the first day of [[onam]], as one small ring of flowers. Each morning another ring goes round it, until [[thiruvonam]], the tenth day, when it is at its biggest and brightest.' },
    { kicker: 'The story behind it', title: 'The king who comes home', art: 'crown',
      body: 'Long ago, the story goes, the kind king [[mahabali]] ruled Kerala so well that everyone was equal and happy. The god Vishnu came as Vamana, a small boy, asked him for three steps of land, and sent him to the world below. Mahabali asked one thing: to visit his people once a year. Onam is that visit, and the flowers are laid to welcome him.' },
    { kicker: 'His favourite', title: 'Thumba comes first', art: 'thumba',
      body: '[[thumba]] is a tiny white flower that grows wild by the roadside. It is said to be Mahabali’s favourite, so many homes start with it on Atham. It shows that the simplest flower is as welcome as the grandest.' },
    { kicker: 'Only petals', title: 'Flowers, not powder', art: 'door',
      body: 'A pookalam is made only of petals and leaves, laid by hand, never coloured powder. Children once went out at dawn to pick them from gardens and hedges. Now trucks of marigold and chrysanthemum come over the hills from Tamil Nadu and Karnataka for the season.' },
  ],
  play: {
    title: 'Atham से Thiruvonam', label: 'Atham to Thiruvonam',
    intro: 'Slide through the ten days of Onam and watch the carpet grow a ring each morning. Every day has a name, and something special to do.',
  },
  timeline: [
    { when: 'Legend', title: 'Three steps of land', body: 'Vamana asks Mahabali for three steps, covers earth and sky in two, and the king offers his own head for the third.' },
    { when: 'Very old', title: 'An Onam in a Tamil poem', body: 'The Sangam poem *Maduraikkanchi* is often cited as the earliest mention of an Onam festival, celebrated in Madurai.' },
    { when: 'Every Atham', title: 'The Athachamayam parade', body: 'On the first day, Thrippunithura near Kochi holds a grand street procession that once set out from the Kochi royal palace.' },
    { when: 'Every Chingam', title: 'Ten days of flowers', body: 'Onam falls in the Malayalam month of Chingam, August–September, as the monsoon eases and the harvest comes in.' },
    { when: 'Every Uthradam', title: 'First Onam', body: 'The ninth day is the last-minute rush: markets overflow and families shop for the next day’s [[sadya]].' },
    { when: 'Since 1961', title: 'Kerala’s own festival', body: 'Onam was made Kerala’s state festival, celebrated by people of every faith.' },
    { when: 'Today', title: 'Pookalam contests', body: 'Schools, offices and clubs compete for the best carpet, and some towns lay record-sized ones in their squares.' },
  ],
  places: {
    intro: 'Pookalam belongs to Kerala, but its flowers and its festival travel. Tap a lit tile.',
    list: [
      { state: 'KL', name: 'Pookalam', script: 'പൂക്കളം', lang: 'Malayalam', note: 'At almost every door for the ten days of Onam.' },
      { state: 'PY', name: 'Pookalam', script: 'പൂക്കളം', lang: 'Malayalam', note: 'Mahé, a piece of Puducherry tucked inside Kerala, celebrates Onam like its neighbours.' },
      { state: 'TN', name: 'Flower markets', script: 'பூ சந்தை', lang: 'Tamil', note: 'Markets like Thovalai near Kanyakumari send flowers over the hills by the truckload in Onam week.' },
      { state: 'KA', name: 'Marigold fields', script: 'ಚೆಂಡು ಹೂ', lang: 'Kannada', note: 'Around Gundlupet, near the Kerala border, fields of marigold and sunflower bloom in time for Onam.' },
    ],
  },
  quiz: [
    { text: 'A pookalam is made from coloured powder.', sach: false, why: 'Only petals and leaves go into it, laid by hand.' },
    { text: 'The pookalam gets bigger every day of Onam.', sach: true, why: 'One ring on Atham, then a ring more each morning until Thiruvonam.' },
    { text: 'King Mahabali is said to visit his people at Onam.', sach: true, why: 'Onam is his yearly homecoming, and the flowers welcome him.' },
    { text: 'Onam is a winter festival.', sach: false, why: 'It comes in Chingam, August–September, at the end of the monsoon.' },
  ],
  words: ['pookalam', 'onam', 'atham', 'thiruvonam', 'thumba', 'mahabali', 'sadya'],
  sources: [
    { label: 'Ona pookkalam, Kerala Tourism', href: 'https://keralatourism.org/onam/onam-rituals/ona-pookkalam' },
    { label: 'Onam, Wikipedia', href: 'https://en.wikipedia.org/wiki/Onam' },
    { label: 'Onam, saying it with flowers, Chantal Jumel', href: 'https://chantal-jumel-kolam-kalam.com/en/onam-saying-it-with-flowers-part-2/' },
  ],
  next: 'bandhani',
};

export default pookalam;
