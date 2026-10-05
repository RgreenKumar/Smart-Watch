// Seed local DB with sample royalty-free songs (SoundHelix MP3s) so the
// app's Music page shows playable tracks. Idempotent: clears and re-seeds.
//
// Usage (from backend dir):   node seed_songs.js
const fs = require('fs');
const path = require('path');
const pool = require('./db');

const SONGS_DIR = 'C:\\Users\\sreek\\AppData\\Local\\Temp\\opencode\\songs';
const CATEGORY_MUSIC_ID = 7; // 'Music' from schema seed

const songs = [
  { file: 'SoundHelix-Song-1.mp3', title: 'SoundHelix Song 1', cat: 7 },
  { file: 'SoundHelix-Song-2.mp3', title: 'SoundHelix Song 2', cat: 7 },
  { file: 'SoundHelix-Song-3.mp3', title: 'SoundHelix Song 3', cat: 2 },
  { file: 'SoundHelix-Song-4.mp3', title: 'SoundHelix Song 4', cat: 5 },
  { file: 'SoundHelix-Song-5.mp3', title: 'SoundHelix Song 5', cat: 3 },
  { file: 'SoundHelix-Song-6.mp3', title: 'SoundHelix Song 6', cat: 6 },
  { file: 'SoundHelix-Song-7.mp3', title: 'SoundHelix Song 7', cat: 4 },
  { file: 'SoundHelix-Song-8.mp3', title: 'SoundHelix Song 8', cat: 1 },
];

// Minimal solid-color 8x8 PNG per song (varied colors) for thumbnails.
function placeholderPng(index) {
  const colors = [
    [255, 99, 132], [54, 162, 235], [255, 206, 86],
    [75, 192, 192], [153, 102, 255], [255, 159, 64],
    [46, 204, 113], [231, 76, 60],
  ];
  const c = colors[index % colors.length];
  const size = 8;
  // Build raw RGBA scanlines
  const raw = Buffer.alloc(size * (size * 4 + 1));
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0; // filter none
    for (let x = 0; x < size; x++) {
      raw[o++] = c[0]; raw[o++] = c[1]; raw[o++] = c[2]; raw[o++] = 255;
    }
  }
  // CRC table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let cval = n;
    for (let k = 0; k < 8; k++) cval = cval & 1 ? 0xedb88320 ^ (cval >>> 1) : cval >>> 1;
    crcTable[n] = cval >>> 0;
  }
  function crc32(buf) {
    let cval = 0xffffffff;
    for (let i = 0; i < buf.length; i++) cval = crcTable[(cval ^ buf[i]) & 0xff] ^ (cval >>> 8);
    return (cval ^ 0xffffffff) >>> 0;
  }
  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // bit depth, color type RGBA
  const png = Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', require('zlib').deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
  return png.toString('base64');
}

function estDurationSec(bytes) {
  // Rough: ~128kbps => bytes*8/128k seconds
  return Math.round((bytes * 8) / (128 * 1000));
}
function fmtDuration(sec) {
  const m = Math.floor(sec / 60); const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Clear existing audio + links so the seed is idempotent
    await client.query('DELETE FROM audio_categories');
    await client.query('DELETE FROM watch_later');
    await client.query('DELETE FROM favourite_audio');
    await client.query('DELETE FROM playlist_audios');
    await client.query('DELETE FROM playlist_audios');
    await client.query('DELETE FROM audio_banners');
    await client.query('DELETE FROM audio_files');

    for (let i = 0; i < songs.length; i++) {
      const s = songs[i];
      const p = path.join(SONGS_DIR, s.file);
      const audioBytes = fs.readFileSync(p);
      const thumb = placeholderPng(i);
      const duration = fmtDuration(estDurationSec(audioBytes.length));
      const res = await client.query(
        `INSERT INTO audio_files
           (audio_title, audio_file_name, audio_file, thumbnail_base64,
            audio_duration, rating, description, production_company, paid)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING id`,
        [s.title, s.file, audioBytes, thumb, duration, '4.5',
         `Royalty-free sample track: ${s.title}.`, 'SoundHelix', false]
      );
      const audioId = res.rows[0].id;
      await client.query(
        'INSERT INTO audio_categories (audio_id, category_id) VALUES ($1,$2)',
        [audioId, s.cat]
      );
      // Banner on the first song so the banner row works too
      if (i === 0) {
        await client.query('INSERT INTO audio_banners (audio_id) VALUES ($1)', [audioId]);
      }
      console.log(`Inserted ${s.title} -> audioId ${audioId} (${duration}, ${audioBytes.length} bytes)`);
    }
    await client.query('COMMIT');
    console.log('DONE: songs seeded.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
