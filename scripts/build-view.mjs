// Compiles design/Rangotsav.dc.html (template language: sc-if / sc-for / {{ path }} /
// style-hover) into plain React JSX + CSS. Re-run with `npm run gen` after the design changes.
import { readFileSync, writeFileSync } from 'node:fs';
import { parseFragment } from 'parse5';

const SRC = new URL('../design/Rangotsav.dc.html', import.meta.url);
const OUT_VIEW = new URL('../components/RangotsavView.generated.tsx', import.meta.url);
const OUT_CSS = new URL('../app/design.generated.css', import.meta.url);

const src = readFileSync(SRC, 'utf8');
const body = src.slice(src.indexOf('<x-dc>') + 6, src.lastIndexOf('</x-dc>'));
const helmet = /<helmet>([\s\S]*?)<\/helmet>/.exec(body)[1];
const baseCss = /<style>([\s\S]*?)<\/style>/.exec(helmet)[1].trim();
const template = body.replace(/<helmet>[\s\S]*?<\/helmet>/, '');

// ---------- expressions ({{ path }}, !x, a === b, literals) ----------
const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*/;
let scope = []; // loop variable names, innermost last
const jsName = (n) => '$' + n;

function parensWrapWhole(e) {
  let d = 0;
  for (let i = 0; i < e.length - 1; i++) {
    if (e[i] === '(') d++;
    else if (e[i] === ')' && --d === 0) return false;
  }
  return true;
}
function findEq(e) {
  let d = 0;
  for (let i = 0; i < e.length; i++) {
    const c = e[i];
    if (c === '[' || c === '(') d++;
    else if (c === ']' || c === ')') d--;
    else if (d === 0 && (c === '=' || c === '!') && e[i + 1] === '=') {
      if (i > 0 && (e[i - 1] === '=' || e[i - 1] === '!')) continue;
      if (!e.slice(0, i).trim()) continue;
      return { index: i, op: e[i + 2] === '=' ? c + '==' : c + '=' };
    }
  }
  return null;
}
function expr(src) {
  const e = String(src).trim();
  if (!e) return 'undefined';
  if (e[0] === '(' && e.at(-1) === ')' && parensWrapWhole(e)) return `(${expr(e.slice(1, -1))})`;
  const eq = findEq(e);
  if (eq) return `(${expr(e.slice(0, eq.index))} ${eq.op} ${expr(e.slice(eq.index + eq.op.length))})`;
  if (e[0] === '!') return `!${expr(e.slice(1))}`;
  if (['true', 'false', 'null', 'undefined'].includes(e)) return e;
  if (/^-?\d+(\.\d+)?$/.test(e)) return e;
  if (e.length >= 2 && (e[0] === '"' || e[0] === "'") && e.at(-1) === e[0]) return JSON.stringify(e.slice(1, -1));
  const head = e.match(IDENT);
  if (!head) throw new Error('bad expression: ' + e);
  let out;
  if (head[0] === '$index') out = jsName('index' + scope.length);
  else if (scope.includes(head[0])) out = jsName(head[0]);
  else out = `$v.${head[0]}`;
  let i = head[0].length;
  while (i < e.length) {
    if (e[i] === '.') {
      const m = e.slice(i + 1).match(IDENT) || e.slice(i + 1).match(/^\d+/);
      if (!m) throw new Error('bad path: ' + e);
      out += /^\d/.test(m[0]) ? `?.[${m[0]}]` : `?.${m[0]}`;
      i += 1 + m[0].length;
    } else if (e[i] === '[') {
      let d = 1, j = i + 1;
      while (j < e.length && d > 0) { if (e[j] === '[') d++; else if (e[j] === ']' && --d === 0) break; j++; }
      out += `?.[${expr(e.slice(i + 1, j))}]`;
      i = j + 1;
    } else throw new Error('bad path: ' + e);
  }
  return out;
}

// ---------- attributes ----------
const EVENTS = {
  onclick: 'onClick', onchange: 'onChange', oninput: 'onInput', onkeydown: 'onKeyDown', onkeyup: 'onKeyUp',
  onfocus: 'onFocus', onblur: 'onBlur', onpointerdown: 'onPointerDown', onpointerup: 'onPointerUp',
  onpointermove: 'onPointerMove', onpointerenter: 'onPointerEnter', onpointerleave: 'onPointerLeave',
  onpointercancel: 'onPointerCancel',
};
const HTML_ATTRS = { class: 'className', for: 'htmlFor', maxlength: 'maxLength', autocomplete: 'autoComplete', spellcheck: 'spellCheck', tabindex: 'tabIndex', readonly: 'readOnly', autofocus: 'autoFocus' };
const BOOL = new Set(['hidden', 'disabled', 'checked', 'required', 'readOnly', 'autoFocus', 'multiple']);
const kebabToCamel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function splitDecls(css) {
  const out = []; let cur = '', depth = 0, q = '';
  for (const c of css) {
    if (q) { if (c === q) q = ''; cur += c; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === '(') depth++; else if (c === ')') depth--;
    if (c === ';' && depth === 0) { out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur);
  return out.filter((d) => d.includes(':'));
}
const cssKey = (p) => (p.startsWith('--') ? p : kebabToCamel(p));
function staticStyle(css) {
  const parts = splitDecls(css).map((d) => {
    const i = d.indexOf(':');
    return `${JSON.stringify(cssKey(d.slice(0, i).trim()))}:${JSON.stringify(d.slice(i + 1).trim())}`;
  });
  return `{{${parts.join(',')}}}`;
}

const hasTpl = (s) => s.includes('{{');
function tplLiteral(raw) {
  const parts = raw.split(/\{\{([\s\S]+?)\}\}/g);
  return '`' + parts.map((s, i) => (i & 1 ? '${' + expr(s) + ' ?? ""}' : s.replace(/[`\\$]/g, '\\$&'))).join('') + '`';
}
function valueExpr(raw) {
  const whole = raw.match(/^\s*\{\{([\s\S]+?)\}\}\s*$/);
  if (whole) return expr(whole[1]);
  return tplLiteral(raw);
}

let hoverN = 0;
const hoverCss = [];
const hoverCache = new Map();
function pseudoClass(pseudo, css) {
  const k = pseudo + '|' + css;
  if (hoverCache.has(k)) return hoverCache.get(k);
  const cls = 'scp' + (hoverN++).toString(36);
  const decls = splitDecls(css).map((d) => d.trim() + ' !important').join(';');
  hoverCss.push(`.${cls}:${pseudo}{${decls}}`);
  hoverCache.set(k, cls);
  return cls;
}

function attrs(el) {
  const svg = el.namespaceURI?.endsWith('svg');
  const props = [];
  const pseudo = [];
  let cls = null;
  for (const { name, value } of el.attrs) {
    if (name.startsWith('hint-') || name === 'sc-name' || name === 'data-dc-tpl') continue;
    if (name.startsWith('style-')) { pseudo.push(pseudoClass(name.slice(6), value)); continue; }
    let key = name;
    if (name.startsWith('on')) key = EVENTS[name] ?? (() => { throw new Error('event ' + name); })();
    else if (name.startsWith('aria-') || name.startsWith('data-')) key = name;
    else if (name === 'xlink:href') key = 'xlinkHref';
    else if (HTML_ATTRS[name]) key = HTML_ATTRS[name];
    else if (name.includes('-')) key = kebabToCamel(name);
    if (key === 'className') { cls = value; continue; }
    let val;
    if (key === 'style') val = hasTpl(value) ? `css(${valueExpr(value)})` : staticStyle(value);
    else if (hasTpl(value)) {
      val = valueExpr(value);
      if (key === 'value' || key === 'checked') val = `(${val} ?? ${key === 'checked' ? 'false' : '""'})`;
    } else if (value === '' && BOOL.has(key)) val = 'true';
    else val = JSON.stringify(value);
    if (key === 'style' && !hasTpl(value)) { props.push(`style=${val}`); continue; }
    props.push(`${key}={${val}}`);
  }
  if (cls != null || pseudo.length) {
    const names = [cls, ...pseudo].filter(Boolean).join(' ');
    props.push(`className=${JSON.stringify(names)}`);
  }
  return props;
}

// ---------- nodes ----------
let usesImageSlot = false;
function walk(node) {
  if (node.nodeName === '#comment') return '';
  if (node.nodeName === '#text') {
    const t = node.value;
    if (!t.trim() && !t.includes(' ')) return '';
    if (!hasTpl(t)) return `{${JSON.stringify(t)}}`;
    return t.split(/\{\{([\s\S]+?)\}\}/g).map((p, i) => (i & 1 ? `{${expr(p)}}` : p ? `{${JSON.stringify(p)}}` : '')).join('');
  }
  const tag = node.tagName;
  const kids = (n) => (n.childNodes || []).map(walk).join('');
  const aget = (n) => node.attrs.find((a) => a.name === n)?.value ?? '';
  if (tag === 'sc-for') {
    const as = aget('as') || 'item';
    const outer = scope.length;
    const list = expr(aget('list').replace(/^\s*\{\{([\s\S]+?)\}\}\s*$/, '$1'));
    scope = [...scope, as];
    const idx = jsName('index' + scope.length);
    const inner = kids(node);
    scope = scope.slice(0, outer);
    return `{(${list} as any[] ?? []).map((${jsName(as)}: any, ${idx}: number) => (<Fragment key={${idx}}>${inner}</Fragment>))}`;
  }
  if (tag === 'sc-if') {
    const v = aget('value').replace(/^\s*\{\{([\s\S]+?)\}\}\s*$/, '$1');
    return `{${expr(v)} ? (<>${kids(node)}</>) : null}`;
  }
  if (tag === 'image-slot') {
    usesImageSlot = true;
    return `<ImageSlot ${attrs(node).join(' ')} />`;
  }
  const content = tag === 'template' ? node.content : node;
  const inner = kids(content);
  const props = attrs(node).join(' ');
  return inner ? `<${tag} ${props}>${inner}</${tag}>` : `<${tag} ${props} />`;
}

const frag = parseFragment(template);
const jsx = frag.childNodes.map(walk).join('\n');

writeFileSync(
  OUT_VIEW,
  `// GENERATED by scripts/build-view.mjs from design/Rangotsav.dc.html. Do not edit by hand.
/* eslint-disable */
// @ts-nocheck
import { Fragment, type CSSProperties } from 'react';
import ImageSlot from './ImageSlot';

function css(s: string): CSSProperties {
  const o: Record<string, string> = {};
  let cur = '', depth = 0, q = '';
  const decls: string[] = [];
  for (const c of s) {
    if (q) { if (c === q) q = ''; cur += c; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === '(') depth++; else if (c === ')') depth--;
    if (c === ';' && depth === 0) { decls.push(cur); cur = ''; } else cur += c;
  }
  decls.push(cur);
  for (const d of decls) {
    const i = d.indexOf(':');
    if (i < 0) continue;
    const p = d.slice(0, i).trim();
    o[p.startsWith('--') ? p : p.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = d.slice(i + 1).trim();
  }
  return o as CSSProperties;
}

export default function RangotsavView($v: Record<string, any>) {
  return (
    <>
${jsx}
    </>
  );
}
`,
);
writeFileSync(OUT_CSS, `/* GENERATED by scripts/build-view.mjs. Do not edit. */\n${baseCss}\n${hoverCss.join('\n')}\n`);
console.log(`view: ${jsx.length} chars, ${hoverCss.length} hover/active rules, image-slot: ${usesImageSlot}`);
