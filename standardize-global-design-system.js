// Global Design System Standardizer (Black & Pink Theme)
// Scans all TSX files under src and normalizes legacy blue/white/gray UI to black + pink system

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(process.cwd(), 'src');

// Ordered (longer patterns first to avoid partial collisions)
const MAPPINGS = [
  // Focus rings & borders (blue -> pink)
  [/focus:ring-2 focus:ring-blue-500/g, 'focus:ring-2 focus:ring-pink-500'],
  [/focus:ring-blue-500/g, 'focus:ring-pink-500'],
  [/focus:border-blue-500/g, 'focus:border-pink-500'],
  [/border-t-blue-500/g, 'border-t-pink-500'],
  [/text-blue-800/g, 'text-pink-400'],
  [/text-blue-700/g, 'text-pink-400'],
  [/text-blue-600/g, 'text-pink-400'],
  [/text-blue-500/g, 'text-pink-400'],
  [/text-blue-400/g, 'text-pink-400'],
  [/text-blue-300/g, 'text-pink-300'],
  [/bg-blue-50/g, 'bg-gray-900'],
  [/bg-blue-100/g, 'bg-gray-800'],
  [/border-blue-200/g, 'border-pink-500/30'],
  [/border-blue-300/g, 'border-pink-500/40'],
  [/border-blue-400/g, 'border-pink-500/50'],
  [/border-blue-500/g, 'border-pink-500'],
  [/ring-blue-500/g, 'ring-pink-500'],
  [/ring-blue-400/g, 'ring-pink-400'],

  // Generic gray borders -> darker
  [/border-gray-200/g, 'border-gray-700'],
  [/border-gray-300/g, 'border-gray-700'],
  [/border-gray-400/g, 'border-gray-600'],

  // Whites & light surfaces -> dark surfaces
  [/bg-white\/95/g, 'bg-gray-900/95'],
  [/bg-white\/90/g, 'bg-gray-900/90'],
  [/bg-white\/80/g, 'bg-gray-900/80'],
  [/bg-white\/70/g, 'bg-gray-900/70'],
  [/bg-white\/60/g, 'bg-gray-900/60'],
  [/bg-white\/50/g, 'bg-gray-900/50'],
  [/bg-white\/40/g, 'bg-gray-900/40'],
  [/bg-white\/30/g, 'bg-gray-900/30'],
  [/bg-white\/25/g, 'bg-gray-900/25'],
  [/bg-white\/20/g, 'bg-gray-900/30'],
  [/bg-white\/15/g, 'bg-gray-900/25'],
  [/bg-white\/10/g, 'bg-gray-900/20'],
  [/bg-white\b/g, 'bg-black'],
  [/text-gray-900/g, 'text-white'],
  [/text-black/g, 'text-white'],

  // Light hover backgrounds
  [/hover:bg-gray-50/g, 'hover:bg-gray-800'],
  [/hover:bg-gray-100/g, 'hover:bg-gray-700'],
  [/hover:bg-white\/30/g, 'hover:bg-gray-800/70'],
  [/hover:bg-white\/20/g, 'hover:bg-gray-800/60'],
  [/hover:bg-white\/10/g, 'hover:bg-gray-800/50'],
  [/hover:bg-zinc-100/g, 'hover:bg-gray-800'],
  [/hover:bg-pink-50/g, 'hover:bg-pink-600/20'],

  // Buttons converting white to pink primary where semantic
  [/bg-white text-pink-600 hover:bg-pink-50/g, 'bg-pink-500 text-white hover:bg-pink-600'],
  [/bg-white text-black hover:bg-zinc-100/g, 'bg-pink-500 text-white hover:bg-pink-600'],

  // Translucent chip / badge borders
  [/border-white\/30/g, 'border-gray-600'],
  [/border-white\/20/g, 'border-gray-700'],
  [/border-white\/10/g, 'border-gray-800'],
  [/ring-white\/20/g, 'ring-gray-700'],

  // Misc blue svg strokes/fills
  [/stroke-blue-500/g, 'stroke-pink-400'],
  [/fill-blue-500/g, 'fill-pink-400'],

  // Spinners
  [/border-t-blue-500/g, 'border-t-pink-500'],

  // iOS leftover tokens -> dark
  [/bg-ios-surface/g, 'bg-black'],
  [/text-ios-text(?!-primary-dark)/g, 'text-white'],
  [/text-ios-text-primary-dark/g, 'text-white'],
  [/border-ios-border/g, 'border-gray-700'],
  [/text-ios-text-secondary/g, 'text-gray-300'],
  [/text-ios-text-primary/g, 'text-white'],
  [/text-ios-accent/g, 'text-pink-500'],
  [/bg-ios-accent/g, 'bg-pink-500'],
  [/peer-checked:bg-ios-accent/g, 'peer-checked:bg-pink-600'],
];

const EXTENSIONS = ['.tsx'];

function collectFiles(dir, list = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) collectFiles(full, list);
    else if (EXTENSIONS.includes(path.extname(e.name))) list.push(full);
  }
  return list;
}

function processFile(file) {
  const original = fs.readFileSync(file, 'utf8');
  let updated = original;
  let changed = false;
  for (const [pattern, replacement] of MAPPINGS) {
    if (pattern.test(updated)) {
      updated = updated.replace(pattern, replacement);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, updated, 'utf8');
  }
  return changed;
}

function main() {
  console.log('🌐 Global Design Standardization (Black & Pink)');
  const files = collectFiles(SRC_DIR);
  console.log(`Found ${files.length} TSX files`);
  let modified = 0;
  files.forEach(f => { if (processFile(f)) { modified++; console.log('✔ Updated', path.relative(process.cwd(), f)); } });
  console.log(`\nSummary: Modified ${modified}/${files.length} files`);
  console.log('Done.');
}

main();
