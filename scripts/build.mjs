import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { buildSite, dist } from './lib/site.mjs';

const result = await buildSite('production');

console.log('\nBuild output:');
for (const file of Object.keys(result.metafile.outputs)) {
  const abs = path.resolve(file);
  const raw = statSync(abs).size;
  const gz = gzipSync(readFileSync(abs)).length;
  console.log(`  ${path.relative(dist, abs).padEnd(28)} ${(raw / 1024).toFixed(1)} kB  (${(gz / 1024).toFixed(1)} kB gzip)`);
}
