import type { Kahani } from './types';

const rangoli: Kahani = {
  toy: 'rangoli',
  title: 'रंगोली की Kahani', label: 'The story of rangoli', gloss: 'the story of rangoli',
  lead: 'Long before doormats, there were doorsteps drawn in colour. Every morning, somewhere in India, someone is bending down to draw a welcome.',
  chapters: [
    { kicker: 'A welcome', title: 'Drawn at the door', art: 'door',
      body: 'Rangoli goes on the floor at the [[threshold]], where the outside world meets the home. It greets guests, and at Diwali it welcomes [[lakshmi|Lakshmi]], the goddess of good fortune. A fresh design says: this house is awake, cared for and happy to see you.' },
    { kicker: 'Made to vanish', title: 'Here today, swept tomorrow', art: 'broom',
      body: 'Rice flour, coloured powder, petals, chalk: everything in a rangoli can be swept away. Feet walk over it, wind blows it, rain washes it off. Then it is drawn again. The joy is in *making* it, not keeping it.' },
    { kicker: 'No books needed', title: 'Passed from hand to hand', art: 'book',
      body: 'Most people learn by watching a mother, a grandmother or the aunty next door, and copying until the hand remembers. Designs travel from house to house. Many families keep notebooks full of favourite patterns.' },
    { kicker: 'One old story says', title: 'The painting that brought a boy back', art: 'legend',
      body: 'The *Chitralakshana*, an old Sanskrit text on painting, tells of a king whose high priest lost his son. Brahma, the creator, asked the king to paint the boy on the floor, then breathed life into the picture. A legend, but it shows how old the love of floor art is.' },
    { kicker: 'Same art, many names', title: 'From kolam to alpana', art: 'map',
      body: 'Tamil Nadu calls it [[kolam]], Andhra and Telangana [[muggu]], Bengal [[alpana]], Rajasthan [[mandana]], Bihar [[aripan]] and Odisha [[jhoti]]. Each has its own material, its own tools and its own favourite shapes.' },
  ],
  play: {
    title: 'एक Art, कई Floors', label: 'One art, many floors',
    intro: 'Pick a place and watch its floor art draw itself, in its own colours and materials. Then sweep it away, like every morning.',
  },
  timeline: [
    { when: 'Legend', title: 'The Chitralakshana story', body: 'An old treatise on painting tells of a floor painting that brought a priest’s son back to life.' },
    { when: 'For generations', title: 'Learned by watching', body: 'Designs pass from mother to daughter and neighbour to neighbour, with no written rules.' },
    { when: 'Every Margazhi', title: 'Street-sized kolams', body: 'In the Tamil month of Margazhi, mid-December to mid-January, families draw huge kolams at dawn and the whole street competes.' },
    { when: 'Every Sankranti', title: 'Harvest floors', body: 'Kolams and muggulu show the pongal pot, sugarcane and the sun. In Andhra, little cow-dung mounds topped with flowers, [[gobbemma|gobbemmalu]], sit in the middle.' },
    { when: 'Every Diwali', title: 'Footsteps for Lakshmi', body: 'Small footprints are drawn walking *into* the house, so good fortune knows the way in.' },
    { when: 'Early 1970s', title: 'Kolam meets computer science', body: 'In Madras, Gift Siromoney, Rani Siromoney and Kamala Krithivasan used kolams to study “picture languages”.' },
    { when: 'Today', title: 'Stencils, stickers and reels', body: 'City homes use stencils and stick-on rangoli. Giant festival rangolis and time-lapse videos carry the art to people who never had a courtyard.' },
  ],
  places: {
    intro: 'Tap a lit tile to see what the floor art is called there.',
    list: [
      { state: 'TN', name: 'Kolam', script: 'கோலம்', lang: 'Tamil', note: 'Dots first, then a line looping round them, drawn at dawn in rice flour.' },
      { state: 'PY', name: 'Kolam', script: 'கோலம்', lang: 'Tamil', note: 'Like Tamil Nadu next door: a fresh kolam at the door each morning.' },
      { state: 'AP', name: 'Muggu', script: 'ముగ్గు', lang: 'Telugu', note: 'At Sankranti, courtyards fill with muggulu, often with gobbemmalu (flower-topped cow-dung mounds) in the middle.' },
      { state: 'TS', name: 'Muggu', script: 'ముగ్గు', lang: 'Telugu', note: 'The courtyard is washed first, then muggulu are drawn in white powder and colours.' },
      { state: 'KA', name: 'Rangavalli', script: 'ರಂಗವಲ್ಲಿ', lang: 'Kannada', note: 'White powder and colours at the door, biggest at Sankranti and Deepavali.' },
      { state: 'MH', name: 'Rangoli', script: 'रांगोळी', lang: 'Marathi', note: 'Powder let fall in a fine line from between thumb and finger. Diwali rangolis are a matter of family pride.' },
      { state: 'GA', name: 'Rangoli', script: 'रांगोळी', lang: 'Konkani', note: 'Coloured rangoli at the door for Diwali and Ganesh Chaturthi.' },
      { state: 'GJ', name: 'Sathiya', script: 'સાથિયા', lang: 'Gujarati', note: 'Bright patterns at the doorstep for Diwali and the Gujarati New Year.' },
      { state: 'RJ', name: 'Mandana', script: 'मांडणा', lang: 'Rajasthani', note: 'White chalk (khadia) lines on a floor of red earth and cow dung. Meena women are famous for it.' },
      { state: 'MP', name: 'Mandana', script: 'मांडणा', lang: 'Hindi', note: 'Mandana again; here it is drawn on floors.' },
      { state: 'UP', name: 'Chowk purana', script: 'चौक पूरना', lang: 'Hindi', note: 'A square “filled in” with auspicious patterns for pujas and weddings.' },
      { state: 'UK', name: 'Aipan', script: 'ऐपण', lang: 'Kumaoni', note: 'In Kumaon, white rice-paste lines on a base of red geru.' },
      { state: 'BR', name: 'Aripan', script: 'अरिपन', lang: 'Maithili', note: 'Rice-paste designs in Mithila homes for pujas and weddings: lotuses, fish, footprints.' },
      { state: 'WB', name: 'Alpana', script: 'আলপনা', lang: 'Bengali', note: 'White rice paste, drawn with a fingertip or a scrap of cloth: flowing lotuses and creepers.' },
      { state: 'OD', name: 'Jhoti', script: 'ଝୋଟି', lang: 'Odia', note: 'White rice paste. On Manabasa Thursdays, Lakshmi’s footprints lead into the house.' },
      { state: 'KL', name: 'Pookalam', script: 'പൂക്കളം', lang: 'Malayalam', note: 'No powder at all: a carpet of flower petals for Onam.' },
    ],
  },
  quiz: [
    { text: 'A rangoli is meant to last for years.', sach: false, why: 'It is made to be swept away and drawn fresh, often the very next morning.' },
    { text: 'Traditional kolam uses rice flour, so ants and birds get a meal.', sach: true, why: 'Feeding small creatures is one of the reasons it is drawn in rice flour.' },
    { text: 'Every part of India calls it “rangoli”.', sach: false, why: 'It is kolam, muggu, alpana, mandana, aripan, jhoti and more, depending on where you are.' },
    { text: 'At Diwali, Lakshmi’s footprints are drawn walking into the house.', sach: true, why: 'They show good fortune the way in, never the way out.' },
  ],
  words: ['threshold', 'kolam', 'muggu', 'alpana', 'mandana', 'aripan', 'jhoti', 'lakshmi'],
  sources: [
    { label: 'Rangoli, Wikipedia', href: 'https://en.wikipedia.org/wiki/Rangoli' },
    { label: 'Threshold arts of India, Craft Revival Trust', href: 'https://www.asiainch.org/craft/rangoli-kolam-threshold-arts-of-india/' },
    { label: 'Mandana art of Rajasthan, INHCRF', href: 'https://inhcrf.org/blogs/mandana-art-of-rajasthan-a-feminine-preserve/' },
    { label: 'Jhoti chita, Wikipedia', href: 'https://en.wikipedia.org/wiki/Jhoti_chita' },
  ],
  next: 'kolam',
};

export default rangoli;
