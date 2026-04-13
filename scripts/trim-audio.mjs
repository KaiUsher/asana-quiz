// Trims near-silence from the start and end of all generated MP3 files.
// Run after generate-audio.mjs if any files have breathy artefacts.
//
// Usage:
//   node scripts/trim-audio.mjs
//
// Requires ffmpeg to be installed (brew install ffmpeg).
// Overwrites files in place — originals are not kept.

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const AUDIO_DIR  = path.join(__dirname, '..', 'audio');

const files = fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3'));

if (files.length === 0) {
  console.error('No MP3 files found in audio/. Run generate-audio.mjs first.');
  process.exit(1);
}

console.log(`Trimming ${files.length} files...\n`);

for (const file of files) {
  const input  = path.join(AUDIO_DIR, file);
  const tmp    = input + '.tmp.mp3';

  try {
    execSync(
      `ffmpeg -y -i "${input}" -af "silenceremove=start_periods=1:start_silence=0.05:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_silence=0.05:start_threshold=-45dB,areverse" "${tmp}" -loglevel error`,
    );
    fs.renameSync(tmp, input);
    console.log(`  trimmed  ${file}`);
  } catch (err) {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    console.error(`  error    ${file}: ${err.message}`);
  }
}

console.log('\nDone.');
