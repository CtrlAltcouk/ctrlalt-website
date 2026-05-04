#!/usr/bin/env node
// Run: node add-model.js

import { readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';
import { execSync } from 'child_process';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));
const prompt = async (label, def) => {
  const val = await ask(def ? `${label} [${def}]: ` : `${label}: `);
  return val.trim() || def || '';
};

async function fetchModelData(url) {
  process.stdout.write('  Fetching Creality Cloud page... ');
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const ogTitle =
    html.match(/property="og:title"\s+content="([^"]+)"/)?.[1] ||
    html.match(/content="([^"]+)"\s+property="og:title"/)?.[1];
  const ogImage =
    html.match(/property="og:image"\s+content="([^"]+)"/)?.[1] ||
    html.match(/content="([^"]+)"\s+property="og:image"/)?.[1];
  const titleTag = html.match(/<title>([^<]+)<\/title>/)?.[1]
    ?.replace(/\s*[-|].*?(Creality|Cloud).*$/i, '').trim();

  const cleanTitle = ogTitle
    ? ogTitle.split('|').map(s => s.trim()).find(s => s && !/^(3d printer|3mf file|creality)/i.test(s)) || ogTitle
    : null;

  const ogDesc =
    html.match(/property="og:description"\s+content="([^"]+)"/)?.[1] ||
    html.match(/content="([^"]+)"\s+property="og:description"/)?.[1] ||
    html.match(/name="description"\s+content="([^"]+)"/)?.[1] ||
    html.match(/content="([^"]+)"\s+name="description"/)?.[1] || '';

  // Decode HTML entities and take the first sentence
  const decoded = ogDesc
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
  const firstSentence = decoded.match(/^[^.!?]+[.!?]/)?.[0].trim() || decoded.slice(0, 120).trim();

  console.log('done.');
  return { name: cleanTitle || titleTag || '', thumb: ogImage || null, blurb: firstSentence };
}

function toFilename(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/, '') + '.3mf';
}

function formatEntry(e) {
  const lines = [
    `  {`,
    `    name: ${JSON.stringify(e.name)},`,
    `    file: ${JSON.stringify(e.file)},`,
    `    diff: '${e.diff}',`,
    `    category: ${JSON.stringify(e.category)},`,
    `    nozzle: ${JSON.stringify(e.nozzle)}, layer: ${JSON.stringify(e.layer)}, infill: ${JSON.stringify(e.infill)}, material: ${JSON.stringify(e.material)}, supports: ${JSON.stringify(e.supports)},`,
    `    blurb: ${JSON.stringify(e.blurb)},`,
    `    thumb: ${e.thumb ? JSON.stringify(e.thumb) : 'null'},`,
    `    url: ${JSON.stringify(e.url)},`,
  ];
  if (e.github) lines.push(`    github: ${JSON.stringify(e.github)},`);
  lines.push(`  },`);
  return lines.join('\n');
}

console.log('\n── Add a new model ─────────────────────────────\n');

// 1. Creality URL
const url = await prompt('Creality Cloud URL');
if (!url.startsWith('http')) { console.error('Invalid URL.'); process.exit(1); }

// 2. Fetch name, thumbnail, blurb
const { name: fetchedName, thumb, blurb: fetchedBlurb } = await fetchModelData(url);

// 3. Confirm / edit name
const name = await prompt('Model name', fetchedName);

// 4. Difficulty
let diff = '';
while (!['easy','medium','hard','expert'].includes(diff)) {
  diff = (await prompt('Difficulty (easy / medium / hard / expert)', 'easy')).toLowerCase();
}

// 5. Category
const category = await prompt('Category (e.g. Desk, Electronics, Decor, Workspace)', 'TBC');

// 6. Blurb
const blurb = await prompt('Short description (blurb)', fetchedBlurb);

// 7. Print settings
console.log('\n  Print settings — press Enter to keep the default:\n');
const nozzle   = await prompt('  Nozzle',   '0.4mm');
const layer    = await prompt('  Layer',    '0.2mm');
const infill   = await prompt('  Infill',   '15% grid');
const material = await prompt('  Material', 'PLA');
const supInput = (await prompt('  Supports (yes / no)', 'no')).toLowerCase();
const supports = supInput.startsWith('y') ? 'Yes' : 'No';

// 8. GitHub (optional)
const githubRaw = await prompt('\nGitHub URL (press Enter to skip)');
const github = githubRaw.startsWith('http') ? githubRaw : null;

rl.close();

// Build entry
const file = toFilename(name);
const entry = { name, file, diff, category, nozzle, layer, infill, material, supports, blurb, thumb, url, github };

// Insert into Files.jsx
const filePath = 'site/Files.jsx';
let src = readFileSync(filePath, 'utf8');
const comingSoonIdx = src.indexOf("name: 'Coming Soon'");
const insertAt = comingSoonIdx !== -1
  ? src.lastIndexOf('  {', comingSoonIdx)
  : src.lastIndexOf('];');
src = src.slice(0, insertAt) + formatEntry(entry) + '\n' + src.slice(insertAt);
writeFileSync(filePath, src);

// Git commit and push
console.log('\n── Pushing to GitHub ────────────────────────────\n');
try {
  execSync(`git add site/Files.jsx`, { stdio: 'inherit' });
  execSync(`git commit -m "Add model: ${name.replace(/"/g, "'")}"`, { stdio: 'inherit' });
  execSync(`git push`, { stdio: 'inherit' });
  console.log(`\n✓ Done! "${name}" is live — Cloudflare will deploy in ~30 seconds.`);
} catch {
  console.error('\nGit step failed. Your entry was saved to Files.jsx — run git add/commit/push manually.');
}
