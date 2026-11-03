import type { Metadata } from 'next';
import Link from 'next/link';
import Page from '../../components/site/Page';
import SectionHead from '../../components/SectionHead';
import ScriptTitle from '../../components/about/ScriptTitle';
import ImageSlot from '../../components/ImageSlot';
import makers from '../../data/makers.json';

// Makers appear on this page only once their entry in data/makers.json has "shown": true.
const shown = makers.filter((m) => m.shown);
import { TOYS } from '../../lib/toys';
import s from '../../components/about/About.module.css';

export const metadata: Metadata = {
  title: 'About · Rangotsav',
  description: 'How each Rangotsav toy works, written down like recipe cards.',
};

const RECIPES = [
  { n: 1, art: 'Rangoli', title: 'Mirror, mirror, ×24', tilt: -1.2, body: 'Every point you touch is turned by 360°/n around the centre, then flipped across the axis. One stroke, 2n copies, zero effort.', code: 'for k in 0…n:\n  θ = k · 2π / n\n  draw(rotate(p, θ))\n  draw(rotate(flipY(p), θ))' },
  { n: 2, art: 'Kolam', title: 'One line, never lifted', tilt: 1, body: 'We find a short tour through your dots, then sweep an arc around each one. Leaving a dot, the line crosses over to its neighbour. That crossing is the weave.', code: 'tour = nearest(dots).untangle()\nfor dot in tour:\n  arc(dot, from: prev + 0.6,\n           to:   next + 0.6)' },
  { n: 3, art: 'Lettering', title: 'Letters with attitude', tilt: -0.6, body: 'Each letter is its own span with a tiny lift and twist. Two stacked text-shadows, nudged a few pixels, fake a misregistered screen print.', code: 'span { rotate: 2deg; }\ntext-shadow:\n  6px 5px 0 vermilion,\n  10px 9px 0 ink;' },
  { n: 4, art: 'Block print', title: 'Hand-pressed, by code', tilt: 1.4, body: 'The block is drawn once, then we punch hundreds of tiny random holes out of it and multiply it onto the cloth. So no two stamps match.', code: "block.speckle(random)\ncloth.blend = 'multiply'\ncloth.stamp(block, tilt ±3°)" },
];

export default function AboutPage() {
  return (
    <Page>
      <section className={s.intro}>
        <div className={s.left}>
          <svg aria-hidden="true" viewBox="0 0 220 24" style={{ width: 'clamp(140px,40vw,220px)', height: 'auto', filter: 'url(#roughLg)' }}><path d="M3 13 C30 5 70 8 110 7 C150 6 190 10 217 8 L215 17 C185 20 150 15 110 18 C70 21 30 17 5 19 Z" fill="#FFC21A" stroke="#1B1410" strokeWidth="2" /></svg>
          <ScriptTitle />
        </div>
        <div className={s.right}>
          <p className={s.lead}>Ancient art, meet creative code.</p>
          <p className={s.p}>Swagat! <em>Rangotsav</em> means “festival of colours”. For centuries, people across India have drawn rangolis at the doorstep, woven kolams before sunrise, carved wooden blocks for cloth and painted lorries till they sing.</p>
          <p className={s.p}>Here, each of those crafts becomes a little toy. Pick a pigment, make a mess, save it to your phone. Code is our brush, and like any brush it takes practice.</p>
          <nav aria-label="Toys" className={s.toys}>
            {TOYS.map((t, i) => <Link key={t.id} href={t.href} className={s.toy}><b>{String(i + 1).padStart(2, '0')}</b>{t.title}</Link>)}
          </nav>
        </div>
      </section>

      <section id="behind" className={s.section}>
        <SectionHead title="Code के पीछे" label="Behind the code" gloss="behind the code" panel="#2D4C7C" kicker="Recipes" kn="ಪಾಕವಿಧಾನ" hi="नुस्ख़े">
          No magic here, only maths and patience. This is how each toy works, written down like Ammamma’s recipe cards.
        </SectionHead>
        <div className={s.recipes}>
          {RECIPES.map((r) => (
            <article key={r.n} data-reveal className={s.recipe} style={{ ['--tilt' as string]: `${r.tilt}deg`, animationDelay: `${(r.n - 1) * 0.08}s` }}>
              <div className={s.recipeHead}><span>Recipe Nº {r.n}</span><span>{r.art}</span></div>
              <h3>{r.title}</h3>
              <p>{r.body}</p>
              <pre tabIndex={0}>{r.code}</pre>
            </article>
          ))}
        </div>
      </section>

      {shown.length > 0 && (
        <section id="makers" className={s.section}>
          <SectionHead title="Meet the कारीगर" label="Meet the makers" gloss="meet the makers" size="clamp(38px,10vw,76px)" kicker="Makers" kn="ಕಲಾವಿದರು" hi="कारीगर" />
          <div className={s.makers}>
            {shown.map((m) => (
              <figure key={m.name} className={s.maker}>
                <div className={s.arch} style={{ background: m.color }}>
                  <div className={s.window}>
                    <ImageSlot id={'maker-' + (makers.indexOf(m) + 1)} placeholder={'Photo of ' + m.name.split(' ')[0]} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                    <div aria-hidden="true" className={s.lattice} />
                  </div>
                </div>
                <div aria-hidden="true" className={s.sill} />
                <figcaption><strong>{m.name}</strong><span>{m.role}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </Page>
  );
}
