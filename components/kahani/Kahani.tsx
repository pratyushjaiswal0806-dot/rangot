// "Kahani": the story under a toy. The toy fills the first screen; scroll down (or tap "Kahani ↓"
// in its bar) for the craft's history: short illustrated chapters, the toy's own hands-on
// explainer, a timeline, where in India it lives, a fact-or-tall-tale quiz, words to learn and
// where to read more. Content is in content/kahani/<toy>.ts. Server-rendered; only the
// interactive parts are client islands. It moves as you read: a kolam thread fills along the top,
// chapters drop in like pinned posters and their pictures build themselves, timeline cards swing
// in from their pins, and the map lights up like diyas.
import Link from 'next/link';
import SectionHead from '../SectionHead';
import Desi from '../site/Desi';
import Mandala from '../site/Mandala';
import Art from './Art';
import Rich from './Rich';
import Word from './Word';
import { wordById } from '../../lib/words';
import IndiaTiles from './IndiaTiles';
import SachGappa from './SachGappa';
import NextPreview from './NextPreview';
import PlayKahani from './PlayKahani';
import KahaniMusic from './KahaniMusic';
import { toyById, type ToyId } from '../../lib/toys';
import type { Kahani as Story } from '../../content/kahani/types';
import rangoli from '../../content/kahani/rangoli';
import kolam from '../../content/kahani/kolam';
import pookalam from '../../content/kahani/pookalam';
import bandhani from '../../content/kahani/bandhani';
import block from '../../content/kahani/block';
import poster from '../../content/kahani/poster';
import truck from '../../content/kahani/truck';
import selfie from '../../content/kahani/selfie';
import naam from '../../content/kahani/naam';
import pulli from '../../content/kahani/pulli';
import phuljhadi from '../../content/kahani/phuljhadi';
import kathputli from '../../content/kahani/kathputli';
import warli from '../../content/kahani/warli';
import patang from '../../content/kahani/patang';
import RangoliPlay from './play/RangoliPlay';
import KolamPlay from './play/KolamPlay';
import PookalamPlay from './play/PookalamPlay';
import BandhaniPlay from './play/BandhaniPlay';
import BlockPlay from './play/BlockPlay';
import PosterPlay from './play/PosterPlay';
import TruckPlay from './play/TruckPlay';
import SelfiePlay from './play/SelfiePlay';
import NaamPlay from './play/NaamPlay';
import PulliPlay from './play/PulliPlay';
import PhuljhadiPlay from './play/PhuljhadiPlay';
import KathputliPlay from './play/KathputliPlay';
import WarliPlay from './play/WarliPlay';
import PatangPlay from './play/PatangPlay';
import s from './Kahani.module.css';

const STORIES: Record<ToyId, { story: Story; Play: () => React.ReactNode }> = {
  rangoli: { story: rangoli, Play: RangoliPlay },
  kolam: { story: kolam, Play: KolamPlay },
  pookalam: { story: pookalam, Play: PookalamPlay },
  bandhani: { story: bandhani, Play: BandhaniPlay },
  block: { story: block, Play: BlockPlay },
  poster: { story: poster, Play: PosterPlay },
  truck: { story: truck, Play: TruckPlay },
  selfie: { story: selfie, Play: SelfiePlay },
  naam: { story: naam, Play: NaamPlay },
  pulli: { story: pulli, Play: PulliPlay },
  phuljhadi: { story: phuljhadi, Play: PhuljhadiPlay },
  kathputli: { story: kathputli, Play: KathputliPlay },
  warli: { story: warli, Play: WarliPlay },
  patang: { story: patang, Play: PatangPlay },
};
export const hasKahani = (toy: ToyId) => !!STORIES[toy];

// ink or ivory text, whichever reads on a toy's floor colour
const onFloor = (hex: string) => {
  const n = parseInt(hex.slice(1), 16), l = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return l > 150 ? '#1B1410' : '#FBF3E4';
};

// a small heading for each part of the story: English kicker over Hinglish lettering
function PartHead({ kicker, title, label }: { kicker: string; title: string; label: string }) {
  return (
    <div className={s.partHead}>
      <span className={s.partKicker}>{kicker}</span>
      <Desi as="h3" text={title} label={label} tone="sindoor" pop rough={false} className={s.partTitle} />
    </div>
  );
}

export default function Kahani({ toy }: { toy: ToyId }) {
  const entry = STORIES[toy];
  if (!entry) return null;
  const { story: k, Play } = entry;
  const t = toyById(toy), next = toyById(k.next);
  return (
    <section id="kahani" aria-label={k.label} className={s.kahani}>
      <div className={s.thread} aria-hidden="true" />
      <div className={s.edge} aria-hidden="true" />
      <div className={s.wrap}>
        <header className={s.head}>
          <SectionHead title={k.title} label={k.label} gloss={k.gloss} kicker="Kahani" kn={t.kn} hi={t.hi} size="clamp(40px,10vw,84px)" />
          <p className={s.lead}>{k.lead}</p>
          <div className={s.headBtns}>
            <PlayKahani toy={toy} title={k.title} label={k.label} lead={k.lead} chapters={k.chapters} floor={t.floor} toyTitle={t.title} />
            <KahaniMusic toy={toy} />
          </div>
        </header>

        <ol className={s.chapters}>
          {k.chapters.map((c, i) => (
            <li key={c.title} data-reveal className={s.chapter} style={{ ['--tilt' as string]: `${i % 2 ? 0.8 : -0.8}deg`, ['--ci' as string]: i % 2 }}>
              <div className={s.art} data-live=""><Art id={c.art} /></div>
              <div className={s.text}>
                <span className={s.kicker}>{String(i + 1).padStart(2, '0')} · {c.kicker}</span>
                <h3 className={s.title}>{c.title}</h3>
                <p className={s.body}><Rich text={c.body} /></p>
              </div>
            </li>
          ))}
        </ol>

        <div className={s.play}>
          <Mandala />
          <div className={s.playHead}>
            <span className={s.partKicker}>Haath se seekho · learn by doing</span>
            <Desi as="h3" text={k.play.title} label={k.play.label} pop rough={false} className={s.partTitle} />
            <p className={s.playIntro}>{k.play.intro}</p>
          </div>
          <Play />
        </div>

        <div className={s.part}>
          <PartHead kicker="Through time" title="Samay की Yatra" label="A journey through time" />
          <ol className={s.timeline} tabIndex={0} aria-label="Timeline" data-reveal="">
            {k.timeline.map((m, i) => (
              <li key={m.title} className={s.moment} style={{ ['--mi' as string]: Math.min(i, 5) }}>
                <span className={s.when}>{m.when}</span>
                <b className={s.momentTitle}>{m.title}</b>
                <p><Rich text={m.body} /></p>
              </li>
            ))}
          </ol>
        </div>

        <div className={s.part}>
          <PartHead kicker="Across India" title="Bharat में कहाँ?" label="Where in India?" />
          <p className={s.note}>{k.places.intro}</p>
          <IndiaTiles label={`Where ${t.title.toLowerCase()} lives in India`} lit={k.places.list.map((p) => ({ state: p.state, title: p.name, script: p.script, lang: p.lang, body: <Rich text={p.note} /> }))} />
        </div>

        <div id="sach-gappa" className={s.part}>
          <PartHead kicker="Fact or tall tale?" title="Sach या Gappa?" label="Fact or tall tale?" />
          <SachGappa claims={k.quiz} />
        </div>

        <div className={s.part}>
          <PartHead kicker="Words to take home" title="नए Shabd" label="New words" />
          <ul className={s.words}>
            {k.words.map((id) => {
              const w = wordById(id);
              return w ? <li key={id}><Word id={id}><span className={s.wordChip}>{w.term}<span>{w.script}</span></span></Word></li> : null;
            })}
          </ul>
        </div>

        <footer className={s.end}>
          <div className={s.sources}>
            <span className={s.partKicker}>Read more</span>
            <ul>{k.sources.map((src) => <li key={src.href}><a href={src.href} target="_blank" rel="noopener noreferrer">{src.label}</a></li>)}</ul>
          </div>
          <div className={s.after}>
            <a href="#toy" className={s.again}>↑ Back to {t.title}</a>
            <Link href={next.href} className={s.next} style={{ ['--floor' as string]: next.floor, ['--on' as string]: onFloor(next.floor) }} transitionTypes={['nav-forward']}>
              <NextPreview toy={next.id} />
              <span className={s.nextText}>
                <span>Next toy</span>
                <b>{next.title}</b>
                <small>{next.blurb}</small>
              </span>
            </Link>
          </div>
        </footer>
      </div>
    </section>
  );
}
