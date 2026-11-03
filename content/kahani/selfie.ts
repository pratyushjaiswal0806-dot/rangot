import type { Kahani } from './types';

const selfie: Kahani = {
  toy: 'selfie',
  title: 'Tasveer की Kahani', label: 'The story of the studio photo', gloss: 'the story of the studio photo',
  lead: 'Long before phones, a photo was an outing. You dressed up, went to the studio, sat very still, and stood in front of a painted world.',
  chapters: [
    { kicker: 'Sit very still', title: 'To the studio', art: 'camera',
      body: 'Early cameras needed long exposures, so you held a pose and didn’t blink. In the 1870s Lala Deen Dayal opened a studio in Indore. He went on to photograph princes, palaces and the Nizam of Hyderabad, who named him *Raja*.' },
    { kicker: 'A world behind you', title: 'The painted backdrop', art: 'backdrop',
      body: 'Studios kept painted backdrops: a palace hall, a garden, a lake between mountains. The same backdrop, carpet and chair turn up in photo after photo from one studio. For a few minutes, anyone could stand in a place they had never been.' },
    { kicker: 'Before colour film', title: 'Coloured by hand', art: 'brush',
      body: 'A black-and-white [[tasveer]] could be tinted by hand: pink cheeks, a red sari, gold jewellery, blue sky. Some studios painted right over the photo until it looked like a painting.' },
    { kicker: 'This toy', title: 'A truck frame for your face', art: 'truck',
      body: 'This toy swaps the painted backdrop for a painted lorry: eyes, flowers and HORN OK PLEASE around your face, the way a truck painter would frame a hero. Nothing leaves your phone.' },
  ],
  play: {
    title: 'Studio में Pose', label: 'Swap the backdrop',
    intro: 'Pick a painted backdrop and see who stands in front of it. Flip between black and white and hand-coloured.',
  },
  timeline: [
    { when: '1860s–70s', title: 'A maharaja with a camera', body: 'Sawai Ram Singh II of Jaipur was himself a keen photographer, taking pictures of his court and family.' },
    { when: 'Around 1874', title: 'Deen Dayal’s first studio', body: 'Lala Deen Dayal opens a studio in Indore; later ones follow in Secunderabad and Bombay.' },
    { when: '1890s', title: 'One backdrop, many sitters', body: 'The same painted backdrop, carpet and furniture appear again and again in his Indore portraits.' },
    { when: 'Mid 1900s', title: 'A studio in every town', body: 'Neighbourhood studios make wedding portraits, school photos and passport pictures, with a backdrop or two to choose from.' },
    { when: '1989', title: 'Saved for the nation', body: 'The Indira Gandhi National Centre for the Arts acquires nearly 2,900 of Deen Dayal’s glass negatives, with his props and registers.' },
    { when: 'Today', title: 'Backdrop as a filter', body: 'Phones swap your background in a tap: the painted backdrop, reborn.' },
  ],
  places: {
    intro: 'Where Indian studio photography made its name. Tap a lit tile.',
    list: [
      { state: 'MP', name: 'Indore', script: 'इंदौर', lang: 'Hindi', note: 'Deen Dayal’s first studio, around 1874.' },
      { state: 'TS', name: 'Hyderabad', script: 'హైదరాబాద్', lang: 'Telugu', note: 'He became court photographer to the Nizam, with a studio in Secunderabad.' },
      { state: 'MH', name: 'Bombay', script: 'मुंबई', lang: 'Marathi', note: 'Another Deen Dayal studio, and later hundreds of neighbourhood studios.' },
      { state: 'RJ', name: 'Jaipur', script: 'जयपुर', lang: 'Hindi', note: 'Maharaja Sawai Ram Singh II photographed his court himself.' },
      { state: 'DL', name: 'Delhi', script: 'दिल्ली', lang: 'Hindi', note: 'The IGNCA keeps Deen Dayal’s glass plates.' },
    ],
  },
  quiz: [
    { text: 'Old studios had painted backdrops of places you had never been.', sach: true, why: 'Palaces, gardens and lakes, painted on cloth behind the chair.' },
    { text: 'Early photos were taken in a split second.', sach: false, why: 'Exposures were long, so sitters had to stay still.' },
    { text: 'Before colour film, photos were sometimes coloured by hand.', sach: true, why: 'Studios tinted cheeks, clothes and sky with brushes.' },
    { text: 'Raja Deen Dayal was a film star.', sach: false, why: 'He was a 19th-century photographer, “Raja” being a title given by the Nizam.' },
  ],
  words: ['tasveer', 'nazar'],
  sources: [
    { label: 'Raja Deen Dayal, Wikipedia', href: 'https://en.wikipedia.org/wiki/Raja_Deen_Dayal' },
    { label: 'A glimpse of 19th-century India through Deen Dayal’s lens, The Wire', href: 'https://thewire.in/67380/glimpse-19th-century-indian-elite-lens-raja-deen-dayal' },
    { label: 'Raja Deen Dayal, ThePrint', href: 'https://theprint.in/theprint-profile/lala-deen-dayal-celebrated-photographer-who-captured-the-whos-who-of-19th-century-india/1655297' },
  ],
  next: 'kathputli',
};

export default selfie;
