// Generates MP3 audio files for all 58 Sanskrit pose names using ElevenLabs.
// Run once — files are committed to the repo as static assets.
//
// Usage:
//   ELEVENLABS_API_KEY=your_key node scripts/generate-audio.mjs
//
// Requires Node 18+ (uses built-in fetch).
// Output: audio/{pose-id}.mp3  (e.g. audio/tadasana.mp3)
//
// Voice: change VOICE_ID to any voice from elevenlabs.io/voice-library
// Model: eleven_multilingual_v2 handles Sanskrit phonemes better than English-only models

import { POSES } from '../js/poses.js';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const API_KEY  = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = '1XNFRxE3WBB7iI0jnm7p';
const MODEL_ID = 'eleven_multilingual_v2';

if (!API_KEY) {
  console.error('Error: ELEVENLABS_API_KEY environment variable is not set.');
  console.error('Usage: ELEVENLABS_API_KEY=your_key node scripts/generate-audio.mjs');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'audio');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
  console.log('Created audio/ directory');
}

function toSpokenText(pose) {
  // Comma before and period after to prevent breathy artefacts at start/end.
  return pose.sanskrit
    .replace(/\bIII\b/, 'Three')
    .replace(/\bII\b/,  'Two')
    .replace(/\bI\b/,   'One') + '.';
}

async function generateAudio(pose) {
  const outPath = path.join(OUTPUT_DIR, pose.id + '.mp3');

  if (fs.existsSync(outPath)) {
    console.log(`  skip  ${pose.sanskrit} (already exists)`);
    return;
  }

  const body = JSON.stringify({
    text:     toSpokenText(pose),  // e.g. ", Virabhadrasana One."
    model_id: MODEL_ID,
    voice_settings: {
      stability:        0.70,
      similarity_boost: 0.70,
      style:            0,
      use_speaker_boost: false,
      speed:            1.05,
    },
  });

  await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.elevenlabs.io',
      path:     `/v1/text-to-speech/${VOICE_ID}`,
      method:   'POST',
      headers: {
        'xi-api-key':    API_KEY,
        'Content-Type':  'application/json',
        'Accept':        'audio/mpeg',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      if (res.statusCode !== 200) {
        let err = '';
        res.on('data', d => { err += d; });
        res.on('end', () => reject(new Error(`ElevenLabs error for "${pose.sanskrit}" (${res.statusCode}): ${err}`)));
        return;
      }
      const out = fs.createWriteStream(outPath);
      res.pipe(out);
      out.on('finish', resolve);
      out.on('error', reject);
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
  // Trim near-silence from start and end to remove breathy artefacts
  const tmp = outPath + '.tmp.mp3';
  execSync(
    `ffmpeg -y -i "${outPath}" -af "silenceremove=start_periods=1:start_silence=0.05:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_silence=0.05:start_threshold=-45dB,areverse" "${tmp}" -loglevel error`
  );
  fs.renameSync(tmp, outPath);

  console.log(`  done  ${pose.sanskrit} → audio/${pose.id}.mp3`);
}

console.log(`Generating audio for ${POSES.length} poses...\n`);
let generated = 0;
let skipped = 0;

for (const pose of POSES) {
  const outPath = path.join(OUTPUT_DIR, pose.id + '.mp3');
  const exists  = fs.existsSync(outPath);

  await generateAudio(pose);

  if (exists) { skipped++; } else { generated++; }

  // Small delay between requests to stay well within rate limits
  if (!exists) await new Promise(r => setTimeout(r, 300));
}

console.log(`\nDone. ${generated} generated, ${skipped} skipped.`);
console.log('Next: commit the audio/ directory and bump CACHE_NAME in sw.js');
