import fs from 'fs-extra';
import path from 'path';
import pngToIco from 'png-to-ico';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const pngPath = path.join(rootDir, 'assets', 'icons', 'icon-1024.png');
const icoPath = path.join(rootDir, 'assets', 'icons', 'icon.ico');

console.log('🎨 Converting PNG to ICO...');
console.log(`   Input: ${pngPath}`);
console.log(`   Output: ${icoPath}`);

pngToIco(pngPath)
  .then((buf) => {
    fs.writeFileSync(icoPath, buf);
    console.log('   ✅ Icon converted successfully!');
  })
  .catch((err) => {
    console.error('   ❌ Error converting icon:', err);
    process.exit(1);
  });
