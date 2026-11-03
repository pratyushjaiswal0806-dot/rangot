import type { Kahani } from './types';

const patang: Kahani = {
  toy: 'patang',
  title: 'पतंग की Kahani', label: 'The story of the kite', gloss: 'the story of the kite',
  lead: 'Every 14 January, the whole of Gujarat goes up on the roof. From sunrise to long after dark the sky is full of kites, and every few minutes someone shouts: Kai po che!',
  chapters: [
    { kicker: 'The sun turns north', title: 'Uttarayan', art: 'kite',
      body: '[[uttarayan]] means the sun’s journey north. It marks the turn from winter towards summer, and falls on [[sankranti|Makar Sankranti]], around 14 January. In Gujarat it is the kite festival: families spend the day on their rooftops with kites, music and food, and Ahmedabad has held an International Kite Festival since 1989.' },
    { kicker: 'Kite against kite', title: 'Kai po che!', art: 'cut',
      body: 'Indian kites are fighter kites. Flyers cross strings with a neighbour’s kite in a [[pech]] and try to cut it, either by pulling in fast or by letting the string out fast. When a string snaps, the winner shouts [[kaipoche|kai po che]], roughly “I have cut it!”, and the cut kite drifts away for children to chase.' },
    { kicker: 'Paper, bamboo and thread', title: 'How a kite flies', art: 'spool',
      body: 'A patang is thin paper on two strips of bamboo: a straight spine and a bow bent across the top. The [[kanna]], a little bridle of thread, ties it to the line, and where you knot it decides how the kite flies. The string is wound on a [[firki]], a spool that a friend holds while you fly.' },
    { kicker: 'A sharp string', title: 'Manja and the birds', art: 'bird',
      body: 'For fights, string is coated with paste and powdered glass: [[manja]]. It cuts kites, but also birds, and people on scooters. In 2017 the National Green Tribunal banned nylon and synthetic manja, and glass-coated string too. Every Uttarayan, volunteers and vets set up camps to treat injured birds.' },
    { kicker: 'More kite days', title: 'Kites of freedom', art: 'flag',
      body: 'Kites fill the sky over Delhi on 15 August, Independence Day. People say that in the late 1920s, kites carrying “Simon Go Back” flew in protest against a British commission. Punjab flies kites for Basant, and Rajasthan, Telangana and Maharashtra fly them at Sankranti too.' },
  ],
  play: {
    title: 'कन्ना Baandho', label: 'Tie the kanna',
    intro: 'The kanna is the knot that ties a kite to its string. Slide it along the spine and test the kite in the wind: too far up, too far down, or just right?',
  },
  timeline: [
    { when: 'Centuries ago', title: 'Kites arrive', body: 'Kites are thought to have reached India from China. Paintings from Mughal times show people flying them.' },
    { when: 'Late 1920s', title: 'Simon Go Back', body: 'Popular accounts say kites with the slogan flew against the Simon Commission. Sources disagree on 1927 or 1928.' },
    { when: '15 August 1947', title: 'Freedom in the sky', body: 'Kite flying became part of Independence Day, above all in Delhi, where the sky fills with kites every year.' },
    { when: '1989', title: 'The world comes to fly', body: 'Gujarat Tourism held the first International Kite Festival in Ahmedabad.' },
    { when: '11 July 2017', title: 'Manja banned', body: 'The National Green Tribunal ordered a ban on nylon and synthetic kite string and string coated with glass, to protect birds and people.' },
    { when: 'Every 14 January', title: 'Uttarayan', body: 'Gujarat’s rooftops fill with kites from dawn. At night, paper lanterns called tukkal rise on kite strings.' },
    { when: 'Today', title: 'Fly kindly', body: 'Many campaigns ask flyers to use plain cotton string and to rest in the early morning and evening, when birds are flying home.' },
  ],
  places: {
    intro: 'Kite days come at different times across India. Tap a lit tile.',
    list: [
      { state: 'GJ', name: 'Uttarayan', script: 'ઉત્તરાયણ', lang: 'Gujarati', note: 'On 14 January the whole state flies from its rooftops. Ahmedabad hosts the International Kite Festival.' },
      { state: 'RJ', name: 'Makar Sankranti', script: 'मकर संक्रांति', lang: 'Hindi', note: 'Jaipur’s sky fills with kites over the old city’s rooftops.' },
      { state: 'DL', name: '15 August', script: 'पंद्रह अगस्त', lang: 'Hindi', note: 'Independence Day kites over Old Delhi’s roofs, many in the colours of the flag.' },
      { state: 'PB', name: 'Basant', script: 'ਬਸੰਤ', lang: 'Punjabi', note: 'A spring kite festival, with yellow clothes and yellow kites.' },
      { state: 'TS', name: 'Sankranti', script: 'సంక్రాంతి', lang: 'Telugu', note: 'Hyderabad flies kites at Sankranti, and holds a kite festival too.' },
      { state: 'MH', name: 'Makar Sankranti', script: 'मकर संक्रांत', lang: 'Marathi', note: 'Kites go up and people swap sesame sweets, tilgul, saying “Tilgul ghya, god god bola”.' },
    ],
  },
  quiz: [
    { text: 'Kai po che means roughly “I have cut it”.', sach: true, why: 'It is the shout when your kite cuts another kite’s string.' },
    { text: 'Uttarayan falls in the monsoon.', sach: false, why: 'It falls in January, at Makar Sankranti, as winter turns towards summer.' },
    { text: 'Glass-coated manja is safe for birds.', sach: false, why: 'It injures thousands of birds every year, and was banned in 2017.' },
    { text: 'The kanna ties the kite to its string.', sach: true, why: 'Where the kanna is knotted decides how the kite flies.' },
  ],
  words: ['uttarayan', 'sankranti', 'pech', 'kaipoche', 'kanna', 'firki', 'manja', 'tukkal'],
  sources: [
    { label: 'International Kite Festival in Gujarat, Uttarayan, Wikipedia', href: 'https://en.wikipedia.org/wiki/International_Kite_Festival_in_Gujarat_%E2%80%93_Uttarayan' },
    { label: 'A History of Kite Flying in India, Sahapedia', href: 'https://www.sahapedia.org/history-kite-flying-india' },
    { label: 'NGT judgement on synthetic and glass-coated manja (11 July 2017), India Environment Portal', href: 'https://indiaenvironmentportal.org.in/in-court/judgement-of-the-national-green-tribunal-regarding-the-issue-of-synthetic-glass-coated-and-chinese-manjha-for-kite-flying-11072017' },
    { label: 'From “Simon Go Back” to August 15, Open', href: 'https://openthemagazine.com/india/when-india-took-its-freedom-fight-to-the-sky-the-kites-remarkable-journey-from-simon-go-back-to-august-15' },
  ],
  next: 'phuljhadi',
};

export default patang;
