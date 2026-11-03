import type { Kahani } from './types';

const truck: Kahani = {
  toy: 'truck',
  title: 'Truck कला की Kahani', label: 'The story of truck art', gloss: 'the story of truck art',
  lead: 'India’s goods ride on lorries, and the lorries ride in costume: eyes, tassels, peacocks, poems and a big HORN OK PLEASE on the back.',
  chapters: [
    { kicker: 'Home on wheels', title: 'Dressed like a bride', art: 'truck',
      body: 'A driver may live in his truck for weeks at a time, so it gets dressed up like a home, or a bride: painted panels, chrome, tassels, mirrors and lights. A beautiful truck is its owner’s pride, and the first thing people see.' },
    { kicker: 'Keep watch', title: 'Against the evil eye', art: 'eye',
      body: 'Painted eyes stare back at you. A [[nazarbattu|nazar battu]] face grimaces, a [[nimbumirchi|nimbu-mirchi]] swings and an old shoe may dangle from the bumper. All of it is there to catch the [[nazar]], the envious look, before it brings bad luck. *Buri nazar wale tera munh kala*: evil-eyed one, may your face turn black!' },
    { kicker: 'Fast and freehand', title: 'Painted in a day', art: 'brush',
      body: 'Truck painters work in roadside workshops along the highways, freehand and fast, in bright enamel. Lotuses, parrots, peacocks, mountains, film heroes and the owner’s family names go on in a day or two, between trips.' },
    { kicker: 'A mystery', title: 'Why “OK”?', art: 'letter',
      body: 'HORN PLEASE asks cars to honk before overtaking, since old trucks had poor mirrors. But nobody agrees on the OK. One story says that in the Second World War some trucks ran on kerosene, and “On Kerosene” warned drivers to keep away. Another says it’s just how painters fill the gap.' },
  ],
  play: {
    title: 'Truck को Padho', label: 'Decode the truck',
    intro: 'The back of a lorry is full of messages. Tap each numbered spot to find out what it says.',
  },
  timeline: [
    { when: '1940s', title: 'On Kerosene?', body: 'One popular story traces the “OK” to wartime trucks running on kerosene. Nice tale, no proof.' },
    { when: 'For decades', title: 'Highway workshops', body: 'Body-builders and painters in truck towns turn out lorries painted from bumper to roof.' },
    { when: 'Every Saturday', title: 'Fresh nimbu-mirchi', body: 'Many drivers and shopkeepers hang a fresh lemon and chillies for the week.' },
    { when: '30 April 2015', title: 'Maharashtra says no', body: 'The state’s transport commissioner orders “Horn OK Please” off vehicles to cut needless honking. Painters and drivers grumble.' },
    { when: 'Today', title: 'Off the road', body: 'Truck art turns up on mugs, phone covers and café walls, while real lorries still carry it from Kashmir to Kanyakumari.' },
  ],
  places: {
    intro: 'Painted lorries run everywhere, but some places are famous for them. Tap a lit tile.',
    list: [
      { state: 'PB', name: 'Punjab', script: 'ਟਰੱਕ', lang: 'Punjabi', note: 'Many drivers and owners come from Punjab, and so do bold painted trucks full of poetry.' },
      { state: 'HR', name: 'Haryana', script: 'ट्रक', lang: 'Haryanvi', note: 'Highway towns line the Grand Trunk Road with body shops and painters.' },
      { state: 'TN', name: 'Namakkal', script: 'நாமக்கல்', lang: 'Tamil', note: 'A great lorry town, known for building and painting truck bodies.' },
      { state: 'MH', name: 'Horn OK ban', script: 'हॉर्न ओके प्लीज़', lang: 'Marathi', note: 'In 2015 the state told trucks to stop painting the famous phrase.' },
    ],
  },
  quiz: [
    { text: 'Everyone agrees where the “OK” in Horn OK Please came from.', sach: false, why: 'Nobody knows for sure. “On Kerosene” is one story among several.' },
    { text: 'Painted eyes and nazar battu faces are there to ward off the evil eye.', sach: true, why: 'They catch the nazar before it can bring bad luck.' },
    { text: 'In 2015 Maharashtra told trucks to stop painting Horn OK Please.', sach: true, why: 'To cut down honking, especially near schools and hospitals.' },
    { text: 'Truck art is mostly printed stickers made in factories.', sach: false, why: 'It is mostly painted freehand in roadside workshops.' },
  ],
  words: ['nazar', 'nazarbattu', 'nimbumirchi', 'ustad'],
  sources: [
    { label: 'Horn OK Please, Wikipedia', href: 'https://en.wikipedia.org/wiki/Horn_OK_Please' },
    { label: 'Maharashtra’s Horn OK Please order, Business Insider India', href: 'https://www.businessinsider.in/horn-ok-please-is-not-ok-anymore-maharashtra-govts-new-ploy-to-get-people-to-honk-less/articleshow/47119298.cms' },
    { label: 'Truck art in South Asia, Wikipedia', href: 'https://en.wikipedia.org/wiki/Truck_art_in_South_Asia' },
  ],
  next: 'selfie',
};

export default truck;
