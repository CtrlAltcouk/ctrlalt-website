#!/usr/bin/env node
// Usage: node add-model.js --url <creality-url> --diff <easy|medium|hard|expert> [--github <url>]

import { readFileSync, writeFileSync } from 'fs';

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i].startsWith('--')) {
    args[process.argv[i].slice(2)] = process.argv[i + 1];
    i++;
  }
}

if (!args.url || !args.diff) {
  console.error('Usage: node add-model.js --url <creality-url> --diff <easy|medium|hard|expert> [--github <url>]');
  process.exit(1);
}

const VALID_DIFFS = ['easy', 'medium', 'hard', 'expert'];
if (!VALID_DIFFS.includes(args.diff)) {
  console.error(`--diff must be one of: ${VALID_DIFFS.join(', ')}`);
  process.exit(1);
}

async function fetchModelData(url) {
  console.log('Fetching Creality Cloud page...');
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  // Extract og:title (handles both attribute orderings)
  const ogTitle =
    html.match(/property="og:title"\s+content="([^"]+)"/)?.[1] ||
    html.match(/content="([^"]+)"\s+property="og:title"/)?.[1];

  // Extract og:image (handles both attribute orderings)
  const ogImage =
    html.match(/property="og:image"\s+content="([^"]+)"/)?.[1] ||
    html.match(/content="([^"]+)"\s+property="og:image"/)?.[1];

  // Fallback: grab <title> and strip site name
  const titleTag = html.match(/<title>([^<]+)<\/title>/)?.[1]
    ?.replace(/\s*[-|].*?(Creality|Cloud).*$/i, '').trim();

  // Creality og:title is "3D Printer Files | 3MF File | <Model Name> | Creality Cloud"
  // Extract the model name segment
  const cleanTitle = ogTitle
    ? ogTitle.split('|').map(s => s.trim()).find(s => s && !/^(3d printer|3mf file|creality)/i.test(s)) || ogTitle
    : null;
  const name = cleanTitle || titleTag || 'Unknown Model';
  return { name, thumb: ogImage || null };
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
    `    category: 'TBC',`,
    `    nozzle: '0.4mm', layer: '0.2mm', infill: '15% grid', material: 'PLA', supports: 'No',`,
    `    blurb: '',`,
    `    thumb: ${e.thumb ? JSON.stringify(e.thumb) : 'null'},`,
    `    url: ${JSON.stringify(e.url)},`,
  ];
  if (e.github) lines.push(`    github: ${JSON.stringify(e.github)},`);
  lines.push(`  },`);
  return lines.join('\n');
}

const { name, thumb } = await fetchModelData(args.url);
const file = toFilename(name);

const entry = {
  name,
  file,
  diff: args.diff,
  thumb,
  url: args.url,
  github: args.github || null,
};

const filePath = 'site/Files.jsx';
let src = readFileSync(filePath, 'utf8');

// Insert before the first "Coming Soon" placeholder, or before the closing ];
const comingSoonIdx = src.indexOf("name: 'Coming Soon'");
let insertAt;
if (comingSoonIdx !== -1) {
  insertAt = src.lastIndexOf('  {', comingSoonIdx);
} else {
  insertAt = src.lastIndexOf('];');
}

src = src.slice(0, insertAt) + formatEntry(entry) + '\n' + src.slice(insertAt);
writeFileSync(filePath, src);

console.log(`\n✓ Added "${name}"`);
console.log(`  Difficulty : ${entry.diff}`);
console.log(`  File       : ${file}`);
console.log(`  Thumb      : ${thumb || '(none found — add manually)'}`);
if (entry.github) console.log(`  GitHub     : ${entry.github}`);
console.log(`\nOpen site/Files.jsx and fill in: category, blurb, and print settings (nozzle, layer, infill, material, supports).`);
console.log(`Then: git add . && git commit -m "Add ${name}" && git push`);
