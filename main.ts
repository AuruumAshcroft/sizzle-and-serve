// Sizzle & Serve — hand-in program (Node 22 standard library only).
//
// Copies game/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with buildDossier from the
// kit's vendored library. Outside the grader, MAKEFUN_OUTPUT_DIR
// stands in for /output.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

const gameSource = join(repoRoot, 'game');
const shotsSource = join(repoRoot, 'screenshots');

if (!existsSync(gameSource)) {
  throw new Error(`game/ not found next to main.ts: ${gameSource}`);
}
if (!existsSync(shotsSource)) {
  throw new Error(`screenshots/ not found next to main.ts: ${shotsSource}`);
}

// Start from a clean output directory so two runs write identical bytes.
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

const gameOut = join(outputDir, 'game');
const shotsOut = join(outputDir, 'screenshots');
cpSync(gameSource, gameOut, { recursive: true });
cpSync(shotsSource, shotsOut, { recursive: true });

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

if (!(dossier instanceof Uint8Array) || dossier.length === 0) {
  throw new Error('buildDossier returned an empty dossier');
}

const dossierPath = join(outputDir, 'dossier.json');
writeFileSync(dossierPath, dossier, 'utf8');

// Fail fast if anything the grader needs is missing from /output.
for (const needed of [join(gameOut, 'index.html'), dossierPath]) {
  if (!existsSync(needed)) {
    throw new Error(`expected output file missing: ${needed}`);
  }
}
console.log(`wrote ${dossierPath} (${dossier.length} bytes)`);
