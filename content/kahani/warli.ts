import type { Kahani } from './types';

const warli: Kahani = {
  toy: 'warli',
  title: 'वारली की Kahani', label: 'The story of Warli painting', gloss: 'the story of Warli painting',
  lead: 'In the hills north of Mumbai, the Warli people paint their walls with rice paste and a stick: a whole village of tiny white people, dancing, farming and getting married.',
  chapters: [
    { kicker: 'White on red earth', title: 'Painted walls', art: 'hut',
      body: 'The [[warli]] are an [[adivasi]] people of the Sahyadri hills, mostly in Maharashtra’s Palghar and Thane districts. Their homes have walls of branches, earth and cow dung, which dry a deep red-brown, the colour of [[geru]]. On them they paint in one colour only: white, made from rice paste and water with a little gum. The brush is a bamboo stick, chewed at the end until it is soft.' },
    { kicker: 'Three shapes', title: 'Circle, triangle, square', art: 'shapes',
      body: 'Warli painters build everything from three shapes. The circle comes from the sun and the moon. The triangle comes from mountains and pointed trees. The square is the odd one out: it seems to be a human idea, a sacred enclosure or a piece of land. A person is a circle for the head and two triangles that meet at the waist.' },
    { kicker: 'Round and round', title: 'The tarpa dance', art: 'tarpa',
      body: 'The [[tarpa]] is a long horn made from a dried bottle gourd and bamboo. As it plays, dancers link arms and move round the player in a ring that winds into a spiral, like the circle of life. People say the tarpa player calls with two different notes to tell the line which way to turn.' },
    { kicker: 'Painted for a wedding', title: 'The chauk', art: 'chauk',
      body: 'Walls are painted for special days, like weddings and harvests. At the heart of the painting is the [[chauk]], a square frame: the *lagna chauk* for a wedding, or the *dev chauk*, which holds [[palaghata]], the mother goddess of fertility. Married women traditionally painted it, singing as they worked. Round it goes the whole village: farming, fishing, dancing and playing music.' },
    { kicker: 'From walls to the world', title: 'Jivya Soma Mashe', art: 'paper',
      body: 'In the early 1970s the artist Bhaskar Kulkarni came to the Warli villages and encouraged painters to work on paper and cloth, so their work could travel. Jivya Soma Mashe of Dahanu became the most famous of them. His paintings were shown around the world, and in 2011 he received the Padma Shri.' },
  ],
  play: {
    title: 'आकार से Insaan', label: 'Shapes become people',
    intro: 'A Warli person is just a circle and two triangles. Put the shapes together, then make the figure dance, farm or play the tarpa.',
  },
  timeline: [
    { when: 'Long ago', title: 'How old is it?', body: 'Some writers compare Warli to India’s ancient rock paintings, like those at Bhimbetka. No one knows exactly how old the tradition is.' },
    { when: 'Early 1970s', title: 'Onto paper', body: 'Bhaskar Kulkarni encouraged Warli painters to work on paper. Accounts differ on the exact year he met Jivya Soma Mashe.' },
    { when: '1970s', title: 'Into galleries', body: 'Mashe’s paintings were shown in Delhi and Mumbai, and Warli art began to reach the wider world.' },
    { when: '2011', title: 'Padma Shri', body: 'Jivya Soma Mashe received the Padma Shri, one of India’s highest civilian honours, for his work in Warli painting.' },
    { when: '2014', title: 'A tag of origin', body: 'Warli painting got a Geographical Indication, a legal tag that ties the name to the Warli community of Maharashtra.' },
    { when: '2018', title: 'A master is gone', body: 'Jivya Soma Mashe died at his home in Dahanu, aged 84. His sons and many other Warli artists carry on.' },
    { when: 'Today', title: 'Everywhere at once', body: 'Warli figures now dance on city walls, saris, mugs and phone covers. Warli artists ask people to buy from the community itself.' },
  ],
  places: {
    intro: 'Many Adivasi communities paint their walls, each in their own way. Tap a lit tile to see a few.',
    list: [
      { state: 'MH', name: 'Warli', script: 'वारली', lang: 'Marathi', note: 'White rice-paste figures on red-earth walls, painted for weddings and harvests in Palghar and Thane.' },
      { state: 'GJ', name: 'Pithora', script: 'પીઠોરા', lang: 'Gujarati', note: 'Rathwa and Bhil families paint rows of bright horses on the wall inside the house, for Baba Pithora.' },
      { state: 'MP', name: 'Gond', script: 'गोंड', lang: 'Hindi', note: 'Animals, trees and gods filled with dots, dashes and lines, painted by Gond artists.' },
      { state: 'OD', name: 'Saura idital', lang: 'Sora', note: 'Wall paintings by the Saora people, with stick figures that look like cousins of the Warli ones.' },
      { state: 'JH', name: 'Sohrai', script: 'सोहराय', lang: 'Hindi', note: 'Women paint the mud walls with earth colours for the harvest festival of Sohrai.' },
      { state: 'BR', name: 'Mithila', script: 'मिथिला', lang: 'Maithili', note: 'Walls of the wedding room are painted with bright, crowded pictures for the bride and groom.' },
      { state: 'RJ', name: 'Mandana', script: 'मांडणा', lang: 'Rajasthani', note: 'Like Warli, white lines on red earth, but painted on floors and walls by women for festivals.' },
    ],
  },
  quiz: [
    { text: 'Warli painters use a chewed bamboo stick as a brush.', sach: true, why: 'The end is chewed until it is soft like a brush.' },
    { text: 'Warli paintings use lots of bright colours.', sach: false, why: 'Traditionally only one: white rice paste on a red-brown wall.' },
    { text: 'A Warli person is a circle and two triangles.', sach: true, why: 'A circle for the head, and two triangles that meet at the waist.' },
    { text: 'The tarpa is a drum.', sach: false, why: 'It is a horn, made from a dried bottle gourd and bamboo.' },
  ],
  words: ['warli', 'adivasi', 'geru', 'tarpa', 'chauk', 'palaghata'],
  sources: [
    { label: 'Warli painting, Wikipedia', href: 'https://en.wikipedia.org/wiki/Warli_painting' },
    { label: 'Jivya Soma Mashe, Wikipedia', href: 'https://en.wikipedia.org/wiki/Jivya_Soma_Mashe' },
    { label: 'A return to the land: a history of Warli paintings, Sarmaya', href: 'https://sarmaya.in/spotlight/a-return-to-the-land-a-history-of-warli-paintings/' },
    { label: 'Warli painting: the traditional tribal art of Maharashtra, Vikaspedia', href: 'https://en.vikaspedia.in/viewcontent/social-welfare/entrepreneurship/warli-painting-the-traditional-tribal-art-of-maharashtra?lgn=en' },
  ],
  next: 'poster',
};

export default warli;
