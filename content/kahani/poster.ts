import type { Kahani } from './types';

const poster: Kahani = {
  toy: 'poster',
  title: 'अक्षर की Kahani', label: 'The story of painted signs', gloss: 'the story of painted signs',
  lead: 'Before printed flex banners, every shop name, price list and film poster in India was painted by hand, by someone who could letter a word in three scripts without a ruler.',
  chapters: [
    { kicker: 'Brush and enamel', title: 'Every board by hand', art: 'brush',
      body: 'Shop boards, dhaba menus, school gates, election walls, the backs of trucks: all were lettered by sign painters with flat brushes and tins of enamel paint. Many could paint Hindi, English, Urdu and their own state’s script, often on the same board.' },
    { kicker: 'Learning the trade', title: 'Ustad and shagird', art: 'book',
      body: 'Few learned in a school. A [[shagird]] joined an [[ustad]]’s shop, mixed paint, filled in letters someone else had drawn, and copied the master’s boards for years, until the hand could do it alone.' },
    { kicker: 'Read from across the road', title: 'Shadow, shine and outline', art: 'letter',
      body: 'A plain word gets lost in a busy bazaar. So painters build it up in coats: a solid colour, a drop shadow so it lifts off the board, a thin highlight where the light would catch, and an outline to make it crisp. Some lettering uses many colours, one coat at a time.' },
    { kicker: 'Larger than life', title: 'Cinema hoardings', art: 'film',
      body: 'Film posters the size of buildings were painted by hand, often in a few days, with the stars’ faces several storeys tall. As a young man, the painter M. F. Husain earned his living painting cinema hoardings in Bombay.' },
  ],
  play: {
    title: 'Chaar Coat', label: 'A sign in four coats',
    intro: 'Type a word and paint it like a sign painter, one coat at a time: base, shadow, shine, outline.',
  },
  timeline: [
    { when: '1930s', title: 'Husain on the hoardings', body: 'A young M. F. Husain paints cinema hoardings in Bombay before becoming one of India’s best-known artists.' },
    { when: 'For decades', title: 'A painter on every street', body: 'Every town has sign painters’ shops, and every shop needs a board.' },
    { when: 'Late 1990s', title: 'Flex arrives', body: 'Cheap digital printing on vinyl flex spreads fast, and painted boards start to vanish.' },
    { when: '2011', title: 'Saving the letters', body: 'Designer Hanif Kureshi starts HandpaintedType, turning street painters’ lettering into fonts and sharing the money with them.' },
    { when: 'Today', title: 'Back in fashion', body: 'Hand-painted lettering shows up again in cafés, walls and festival posters, often by the same painters.' },
  ],
  places: {
    intro: 'Every state painted its boards in its own script. Tap a lit tile.',
    list: [
      { state: 'MH', name: 'Cinema hoardings', script: 'फलक', lang: 'Marathi', note: 'Bombay’s film industry kept hoarding painters busy for decades.' },
      { state: 'TN', name: 'Star cut-outs', script: 'கட்-அவுட்', lang: 'Tamil', note: 'Giant painted cut-outs of film stars, some tens of feet tall, tower over cinemas on release day.' },
      { state: 'DL', name: 'Bazaar boards', script: 'दुकान का बोर्ड', lang: 'Hindi', note: 'Old Delhi’s lanes are packed with painted signs in Hindi, English and Urdu.' },
      { state: 'GJ', name: 'Painters’ towns', script: 'પાટિયું', lang: 'Gujarati', note: 'HandpaintedType’s founder came from a small Gujarati town where sign painters were local heroes.' },
      { state: 'WB', name: 'Kolkata signs', script: 'সাইনবোর্ড', lang: 'Bengali', note: 'Bengali letters with English below, painted on shutters all over the city.' },
      { state: 'KA', name: 'Kannada boards', script: 'ನಾಮಫಲಕ', lang: 'Kannada', note: 'Shop names have to show Kannada prominently, so its round letters lead on every board.' },
    ],
  },
  quiz: [
    { text: 'Sign painters add a drop shadow so a word reads from far away.', sach: true, why: 'The shadow lifts the word off the board, even in a busy street.' },
    { text: 'Old cinema hoardings were printed by machines.', sach: false, why: 'They were painted by hand, often in just a few days.' },
    { text: 'Some Indian street lettering has been turned into computer fonts.', sach: true, why: 'Projects like HandpaintedType digitised painters’ letters.' },
    { text: 'Sign painters learned the craft in art college.', sach: false, why: 'Most learned on the job, as a shagird to an ustad.' },
  ],
  words: ['ustad', 'shagird', 'akshar'],
  sources: [
    { label: 'HandpaintedType and Delhi’s sign painters, Huck', href: 'https://huckmag.com/article/handpainted-type' },
    { label: 'Saving India’s hand-painted sign type, Creative Bloq', href: 'https://creativebloq.com/typography/saving-indias-hand-painted-street-sign-type-912863' },
    { label: 'Hanif Kureshi, Wikipedia', href: 'https://en.wikipedia.org/wiki/Hanif_Kureshi' },
    { label: 'M. F. Husain, Wikipedia', href: 'https://en.wikipedia.org/wiki/M._F._Husain' },
  ],
  next: 'truck',
};

export default poster;
