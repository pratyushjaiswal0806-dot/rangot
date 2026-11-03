import type { Kahani } from './types';

const naam: Kahani = {
  toy: 'naam',
  title: 'नाम की Kahani', label: 'The story of names and scripts', gloss: 'the story of names and scripts',
  lead: 'Your name is the first gift you get. In India it can be written in more than a dozen scripts, and here it becomes a kolam.',
  chapters: [
    { kicker: 'The first gift', title: 'Naamkaran', art: 'cradle',
      body: 'Many families hold a [[naamkaran]], a naming ceremony, some days after a baby is born. A name might come from a grandparent, a god, a star, a river or simply a meaning the parents love, and it is often whispered into the baby’s ear first.' },
    { kicker: 'One country, many scripts', title: 'Lipi', art: 'map',
      body: 'India has 22 languages in its Constitution’s list and many more besides. Hindi, Marathi, Nepali and Sanskrit share Devanagari; Bengali and Assamese share one script; Tamil, Telugu, Kannada, Malayalam, Odia, Gujarati and Gurmukhi each have their own [[lipi]]. Urdu and Kashmiri use a Perso-Arabic script, and Santali has Ol Chiki.' },
    { kicker: 'The grandmother', title: 'Brahmi', art: 'pillar',
      body: 'Most of these scripts grew from [[brahmi]], the script of Emperor Ashoka’s inscriptions on rocks and pillars, 2,300 years ago. Its letters travelled too: Tibetan, Thai and Khmer are its grandchildren. It was forgotten for centuries until James Prinsep cracked it in 1837.' },
    { kicker: 'Check your wallet', title: 'Seventeen on one note', art: 'note',
      body: 'An Indian banknote shows its value in Hindi and English on the front, and in a panel of fifteen more languages on the back. Find the one you can read.' },
    { kicker: 'This toy', title: 'A name that weaves', art: 'dots',
      body: 'Here the letters of your name become [[pulli]], and one line weaves round them, like a kolam. The same name always makes the same kolam, so it is yours alone.' },
  ],
  play: {
    title: 'एक Shabd, कई Lipi', label: 'One word, many scripts',
    intro: 'The word “rangoli” written in ten Indian scripts. Tap one to see it big and learn who writes it. Then try your own name in Devanagari.',
  },
  timeline: [
    { when: '3rd century BCE', title: 'Ashoka’s edicts', body: 'Messages carved on rocks and pillars across the empire, mostly in Brahmi, some in Kharosthi in the north-west.' },
    { when: 'Over centuries', title: 'One script becomes many', body: 'Brahmi slowly grows into the scripts of the north and the south, each shaped by its writers and their tools.' },
    { when: '1837', title: 'Brahmi deciphered', body: 'James Prinsep works out the forgotten script, and Ashoka’s words can be read again.' },
    { when: '1925', title: 'Ol Chiki', body: 'Pandit Raghunath Murmu creates a new script for the Santali language.' },
    { when: '1950', title: 'The Eighth Schedule', body: 'The Constitution lists 14 languages; today the list has 22.' },
    { when: 'Today', title: 'Every script on your phone', body: 'Unicode lets phones type and show every major Indian script.' },
  ],
  places: {
    intro: 'A few scripts and where they live. Tap a lit tile.',
    list: [
      { state: 'TN', name: 'Tamil', script: 'தமிழ்', lang: 'Tamil', note: 'One of the world’s oldest living literatures, with early inscriptions in Tamil-Brahmi.' },
      { state: 'KA', name: 'Kannada', script: 'ಕನ್ನಡ', lang: 'Kannada', note: 'Round letters, close cousins of Telugu’s.' },
      { state: 'WB', name: 'Bangla', script: 'বাংলা', lang: 'Bengali', note: 'Letters hang from a line on top. Assamese uses nearly the same script.' },
      { state: 'PB', name: 'Gurmukhi', script: 'ਗੁਰਮੁਖੀ', lang: 'Punjabi', note: 'Shaped and spread by the Sikh Gurus in the 16th century.' },
      { state: 'OD', name: 'Odia', script: 'ଓଡ଼ିଆ', lang: 'Odia', note: 'Its round letters are said to come from writing on palm leaves, where straight lines would split the leaf.' },
      { state: 'JH', name: 'Ol Chiki', script: 'ᱚᱞ ᱪᱤᱠᱤ', lang: 'Santali', note: 'The Santali script, used here and in West Bengal and Odisha.' },
      { state: 'MN', name: 'Meitei Mayek', script: 'ꯃꯩꯇꯩ ꯃꯌꯦꯛ', lang: 'Manipuri', note: 'Manipur’s own script, brought back into schools in recent decades.' },
      { state: 'MH', name: 'Devanagari · Modi', script: 'देवनागरी', lang: 'Marathi', note: 'Marathi is written in Devanagari; until the 20th century, a running hand called Modi was used too.' },
    ],
  },
  quiz: [
    { text: 'Hindi and Marathi are written in the same script.', sach: true, why: 'Both use Devanagari, with a few letters of their own.' },
    { text: 'Every Indian language has its own script.', sach: false, why: 'Many share: Devanagari alone writes Hindi, Marathi, Nepali, Sanskrit and more.' },
    { text: 'Most Indian scripts grew out of Brahmi.', sach: true, why: 'Ashoka’s script is the ancestor of scripts from Gurmukhi to Tamil.' },
    { text: 'Indian banknotes show their value in only two languages.', sach: false, why: 'Seventeen: Hindi and English on the front, fifteen more on the back.' },
  ],
  words: ['naamkaran', 'lipi', 'brahmi', 'akshar', 'pulli'],
  sources: [
    { label: 'Brahmi script, Wikipedia', href: 'https://en.wikipedia.org/wiki/Brahmi_script' },
    { label: 'Ol Chiki script, Wikipedia', href: 'https://en.wikipedia.org/wiki/Ol_Chiki_script' },
    { label: 'Languages with official recognition in India, Wikipedia', href: 'https://en.wikipedia.org/wiki/Languages_with_official_recognition_in_India' },
    { label: 'Mahatma Gandhi New Series banknotes, Wikipedia', href: 'https://en.wikipedia.org/wiki/Mahatma_Gandhi_New_Series' },
  ],
  next: 'pulli',
};

export default naam;
