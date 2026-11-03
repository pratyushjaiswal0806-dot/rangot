import type { Kahani } from './types';

const block: Kahani = {
  toy: 'block',
  title: 'ठप्पा की Kahani', label: 'The story of block printing', gloss: 'the story of block printing',
  lead: 'Carve a flower into wood, ink it, press it. Then again, and again, a few thousand times down the cloth, lining up every press by eye.',
  chapters: [
    { kicker: 'Wood and hands', title: 'One block for each colour', art: 'block',
      body: 'A carver cuts the design into seasoned wood, a separate [[thappa]] for every colour. The printer presses the [[rekh]], the outline, first, then the colour blocks that fit inside it. Each press is lined up by eye, so tiny shifts show a human hand at work.' },
    { kicker: 'Two villages near Jaipur', title: 'Sanganer and Bagru', art: 'vat',
      body: '[[chhipa]] printers are said to have settled here around four hundred years ago. Sanganer is known for fine flowers on white; Bagru for earthier grounds, natural dyes and [[dabu]], a mud paste that keeps dye off and cracks into fine veins.' },
    { kicker: 'Cloth that sailed', title: 'The whole world wanted it', art: 'ship',
      body: 'Indian printed cotton crossed the seas for centuries: medieval pieces have turned up in old Cairo. In the 1600s Europeans went wild for it, and the English word chintz comes from [[chheent]]. It sold so well that England passed laws to ban it.' },
    { kicker: 'Both sides', title: 'Ajrakh of Kutch', art: 'sun',
      body: 'Ajrakh is printed on both sides of the cloth, in indigo and madder red, with resist pastes and many washes, sometimes over weeks. After the 2001 earthquake, Khatri printers built a new village for their craft and named it Ajrakhpur.' },
  ],
  play: {
    title: 'Layer by Layer', label: 'Press the layers',
    intro: 'Press each block in turn: the outline first, then the colours that fit inside it. Every press lands a little differently, just like by hand.',
  },
  timeline: [
    { when: 'Medieval', title: 'Found in old Cairo', body: 'Fragments of block-printed cotton from Gujarat have been dug up at Fustat, old Cairo, far from where they were made.' },
    { when: 'Late 1500s', title: 'Printers settle near Jaipur', body: 'Chhipa families are said to have moved from Gujarat to Bagru and Sanganer around this time.' },
    { when: '1600s–1700s', title: 'Chintz craze', body: 'European trading companies ship printed Indian cotton home by the shipload.' },
    { when: '1721', title: 'Banned in England', body: 'England’s Calico Act bans most printed cotton to protect its own weavers. That’s how popular it was.' },
    { when: '2001', title: 'Ajrakhpur', body: 'Ajrakh printers from Dhamadka resettle after the Kutch earthquake and found a new village.' },
    { when: 'Around 2010', title: 'Places with a name', body: 'Sanganeri and Bagru hand block prints are registered as Geographical Indications.' },
    { when: 'Today', title: 'Spot the hand', body: 'Screen and digital prints copy the look. A real block print shows small joins and wobbles where each press meets the next.' },
  ],
  places: {
    intro: 'Block printing lives in many towns, each with its own look. Tap a lit tile.',
    list: [
      { state: 'RJ', name: 'Sanganer · Bagru', script: 'सांगानेर · बगरू', lang: 'Hindi', note: 'Fine florals on white from Sanganer; dabu mud-resist and natural dyes from Bagru.' },
      { state: 'GJ', name: 'Ajrakh', script: 'અજરખ', lang: 'Gujarati', note: 'Indigo and madder, printed on both sides, from Ajrakhpur and Dhamadka in Kutch.' },
      { state: 'MP', name: 'Bagh print', script: 'बाग़ प्रिंट', lang: 'Hindi', note: 'Red and black geometry from Bagh, near Dhar, washed in the Baghini river.' },
      { state: 'AP', name: 'Kalamkari', script: 'కలంకారి', lang: 'Telugu', note: 'In Machilipatnam and Pedana, kalamkari is printed with blocks in earthy natural dyes.' },
      { state: 'UP', name: 'Farrukhabad print', script: 'फ़र्रुख़ाबाद', lang: 'Hindi', note: 'Big printed bedcovers and fine scarves from Farrukhabad.' },
    ],
  },
  quiz: [
    { text: 'Every colour in a block print needs its own block.', sach: true, why: 'Outline first, then one block per colour, each lined up by eye.' },
    { text: 'Dabu is a kind of wax.', sach: false, why: 'It’s a mud paste. It cracks as it dries and the dye seeps into the cracks.' },
    { text: 'The English word “chintz” comes from an Indian word.', sach: true, why: 'From chheent, spotted or printed cloth.' },
    { text: 'Indian printed cotton was once banned in England.', sach: true, why: 'The Calico Acts of 1700 and 1721 tried to keep it out. It was that popular.' },
  ],
  words: ['thappa', 'rekh', 'chhipa', 'dabu', 'chheent'],
  sources: [
    { label: 'Bagru print, Wikipedia', href: 'https://en.wikipedia.org/wiki/Bagru_print' },
    { label: 'Sanganeri hand block printing, Incredible India', href: 'https://www.incredibleindia.gov.in/en/rajasthan/sanganeri-hand-block-printing' },
    { label: 'Ajrakh, Wikipedia', href: 'https://en.wikipedia.org/wiki/Ajrakh' },
    { label: 'Chintz, Wikipedia', href: 'https://en.wikipedia.org/wiki/Chintz' },
  ],
  next: 'warli',
};

export default block;
