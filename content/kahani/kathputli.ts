import type { Kahani } from './types';

const kathputli: Kahani = {
  toy: 'kathputli',
  title: 'कठपुतली की Kahani', label: 'The story of the string puppet', gloss: 'the story of the string puppet',
  lead: 'A little stage, a bright skirt, a squeaky voice and a dholak: for hundreds of years, Rajasthan’s puppeteers have carried a whole theatre on their backs from village to village.',
  chapters: [
    { kicker: 'Wood and doll', title: 'Kath + putli', art: 'puppet',
      body: '*Kath* means wood and *putli* means a doll, so a [[kathputli]] is a doll made of wood. Its head and body are usually carved from mango wood, its arms are stuffed cloth, and its face is painted with big almond eyes. Most have no legs (horse riders are the exception): a long skirt sweeps the floor instead, so the puppet can glide, spin and fly.' },
    { kicker: 'A theatre on your back', title: 'The Bhat families', art: 'dholak',
      body: 'The puppeteers are the [[bhat]] families of Rajasthan, who also kept the family histories of their patrons. They travelled with everything rolled up: a few puppets, a cloth stage and a [[dholak]]. The women sang and drummed while the men worked the strings from behind the curtain.' },
    { kicker: 'The squeaky voice', title: 'Who is talking?', art: 'reed',
      body: 'The puppeteer holds a small reed whistle, the [[boli]], in his mouth, and speaks through it in a high, warbling squeak. Then someone out front, often the drummer, repeats each line in plain words for the audience. The one holding the strings is the [[sutradhar]].' },
    { kicker: 'The hero of the show', title: 'Amar Singh Rathore', art: 'sword',
      body: 'The best-loved play tells of Amar Singh Rathore, a seventeenth-century Rajput noble of Nagaur famed for his courage at the Mughal court. Puppeteers say his family were their patrons. Shows also have jugglers, snake charmers, horse riders and a dancer, Anarkali, whose skirt flies out as she spins.' },
    { kicker: 'Strings, rods and shadows', title: 'Puppets of India', art: 'shadow',
      body: 'Karnataka has [[gombeyata]], with heavy wooden string puppets. In Bengal, the [[putulnach|putul nach]] puppeteer ties big rod puppets to his waist and dances them. In Andhra, [[tholubommalata|tholu bommalata]] puppets are leather painted on both sides, so they throw coloured shadows on a lit screen.' },
  ],
  play: {
    title: 'परछाईं का Khel', label: 'The shadow game',
    intro: 'In shadow theatre the puppet sits between a lamp and a cloth screen. Move it near the lamp and its shadow grows big and soft; press it to the screen and the shadow is small and sharp.',
  },
  timeline: [
    { when: 'Centuries ago', title: 'The holder of strings', body: 'In old Sanskrit drama the director is the *sutradhar*, a word usually explained as “the one who holds the strings”. Many people think puppet plays came first, though no one can be sure.' },
    { when: '1600s', title: 'Amar Singh’s story', body: 'Amar Singh Rathore of Nagaur lived and died in this century. Puppeteers have told his story ever since, and say his family helped them.' },
    { when: '1952', title: 'A home for folk arts', body: 'Devilal Samar founded the Bharatiya Lok Kala Mandal in Udaipur to keep Rajasthan’s puppetry, dance and music alive. Its museum still has a puppet theatre.' },
    { when: '1950s', title: 'Kathputli Colony', body: 'Travelling puppeteers, acrobats and magicians began to settle at Shadipur in Delhi. The settlement came to be called Kathputli Colony.' },
    { when: '2003', title: 'World Puppetry Day', body: 'The international puppetry union, UNIMA, began marking 21 March as World Puppetry Day.' },
    { when: '2017', title: 'The colony comes down', body: 'Kathputli Colony was demolished for a housing project. Many families moved to a transit camp, waiting for new flats, and kept performing.' },
    { when: 'Today', title: 'Still on stage', body: 'Kathputli shows play at fairs, hotels, schools and festivals. Puppeteers now tell new stories too, from health to saving water.' },
  ],
  places: {
    intro: 'Almost every part of India has its own puppets: strings, rods, gloves or shadows. Tap a lit tile to meet them.',
    list: [
      { state: 'RJ', name: 'Kathputli', script: 'कठपुतली', lang: 'Hindi', note: 'Carved wooden string puppets with long skirts and no legs, worked to the dholak by Bhat families.' },
      { state: 'DL', name: 'Kathputli Colony', script: 'कठपुतली कॉलोनी', lang: 'Hindi', note: 'For decades, Delhi’s largest home for travelling puppeteers, magicians and acrobats.' },
      { state: 'KA', name: 'Gombeyata', script: 'ಗೊಂಬೆಯಾಟ', lang: 'Kannada', note: 'Wooden string puppets in the style of Yakshagana theatre, with the same costumes and music.' },
      { state: 'TN', name: 'Bommalattam', script: 'பொம்மலாட்டம்', lang: 'Tamil', note: 'Among the heaviest string puppets in India, worked with strings and rods from an iron ring on the puppeteer’s head.' },
      { state: 'WB', name: 'Putul nach', script: 'পুতুল নাচ', lang: 'Bengali', note: 'Big rod puppets tied to a bamboo at the puppeteer’s waist, so the puppet dances when he dances.' },
      { state: 'AP', name: 'Tholu bommalata', script: 'తోలు బొమ్మలాట', lang: 'Telugu', note: 'Big leather puppets painted on both sides, glowing in colour on a lit screen.' },
      { state: 'OD', name: 'Ravanachhaya', script: 'ରାବଣଛାୟା', lang: 'Odia', note: 'Small shadow puppets cut from deer hide with no moving joints, so the whole figure tells the story.' },
      { state: 'KL', name: 'Tholpavakoothu', script: 'തോൽപ്പാവക്കൂത്ത്', lang: 'Malayalam', note: 'Shadow puppetry played in temples, telling the Ramayana over many nights by oil lamp.' },
    ],
  },
  quiz: [
    { text: 'Kathputli means a doll made of wood.', sach: true, why: '*Kath* is wood and *putli* is a doll.' },
    { text: 'Kathputli shows are performed in silence.', sach: false, why: 'They are loud and musical: a dholak, songs, and the squeak of the boli reed.' },
    { text: 'Tholu bommalata puppets throw coloured shadows.', sach: true, why: 'They are thin leather painted on both sides, so light shines through the colours.' },
    { text: 'Ravanachhaya puppets have lots of moving joints.', sach: false, why: 'They have none: each figure is a single piece of hide.' },
  ],
  words: ['kathputli', 'bhat', 'boli', 'sutradhar', 'dholak', 'gombeyata', 'putulnach', 'tholubommalata', 'khammaghani'],
  sources: [
    { label: 'Kathputli (puppetry), Wikipedia', href: 'https://en.wikipedia.org/wiki/Kathputli_(puppetry)' },
    { label: 'Bharatiya Lok Kala Mandal, Wikipedia', href: 'https://en.wikipedia.org/wiki/Bharatiya_Lok_Kala_Mandal' },
    { label: 'Kathputli Colony, Wikipedia', href: 'https://en.wikipedia.org/wiki/Kathputli_Colony' },
    { label: 'Puppetry in India, CCRT', href: 'https://ccrtindia.gov.in/puppetry/' },
    { label: 'Kathputli puppet HC.1999.1430, Horniman Museum', href: 'https://www.horniman.ac.uk/object/HC.1999.1430/' },
    { label: 'World Puppetry Day, UNIMA', href: 'https://www.unima.org/en/world-puppetry-day/' },
  ],
  next: 'patang',
};

export default kathputli;
