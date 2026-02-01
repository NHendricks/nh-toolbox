import fs from 'fs-extra';
import path from 'path';
import pngToIco from 'png-to-ico';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const iconsDir = path.join(rootDir, 'assets', 'icons');
const sourcePng = path.join(iconsDir, 'icon-1024.png');

// Validate source file exists
if (!fs.existsSync(sourcePng)) {
  console.error('❌ Source icon not found:', sourcePng);
  console.log('   Please ensure icon-1024.png exists in assets/icons/');
  process.exit(1);
}

console.log('🎨 Generating all icon formats from icon-1024.png...\n');

// Icon sizes to generate
const sizes = [16, 32, 48, 64, 128, 256, 512];

async function generateIcons() {
  try {
    // 1. Generate Windows ICO file
    console.log('📦 Generating Windows icon (icon.ico)...');
    const icoPath = path.join(iconsDir, 'icon.ico');
    const icoBuffer = await pngToIco(sourcePng);
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('   ✅ icon.ico created\n');

    // 2. Generate tray icon (256x256)
    console.log('🔔 Generating tray icon (icon-tray.png)...');
    const trayPath = path.join(iconsDir, 'icon-tray.png');
    await sharp(sourcePng).resize(256, 256).png().toFile(trayPath);
    console.log('   ✅ icon-tray.png created (256x256)\n');

    // 3. Generate various PNG sizes
    console.log('📐 Generating PNG sizes for different uses...');
    for (const size of sizes) {
      const outputPath = path.join(iconsDir, `icon-${size}.png`);
      await sharp(sourcePng).resize(size, size).png().toFile(outputPath);
      console.log(`   ✅ icon-${size}.png created`);
    }

    // 4. Try to generate macOS ICNS (requires iconutil on macOS)
    console.log('\n🍎 Checking for macOS icon generation...');
    if (process.platform === 'darwin') {
      await generateMacOSIcon();
    } else {
      console.log('   ⚠️  macOS .icns generation requires macOS (iconutil)');
      console.log(
        '   💡 To generate .icns on macOS, run: bash assets/icons/icons.sh',
      );
    }

    console.log('\n✨ Icon generation complete!');
    console.log('\nGenerated files:');
    console.log('   - icon.ico (Windows executable icon)');
    console.log('   - icon-tray.png (System tray icon)');
    console.log(`   - icon-{${sizes.join(',')}}.png (Various sizes)`);
    if (process.platform === 'darwin') {
      console.log('   - icon.icns (macOS application icon)');
    }
  } catch (error) {
    console.error('\n❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

async function generateMacOSIcon() {
  const { execSync } = await import('child_process');
  const iconsetDir = path.join(iconsDir, 'icon.iconset');

  try {
    // Create iconset directory
    fs.ensureDirSync(iconsetDir);
    console.log('   📁 Creating icon.iconset directory...');

    // Generate all required sizes for macOS
    const macSizes = [
      { size: 16, name: 'icon_16x16.png' },
      { size: 32, name: 'icon_16x16@2x.png' },
      { size: 32, name: 'icon_32x32.png' },
      { size: 64, name: 'icon_32x32@2x.png' },
      { size: 128, name: 'icon_128x128.png' },
      { size: 256, name: 'icon_128x128@2x.png' },
      { size: 256, name: 'icon_256x256.png' },
      { size: 512, name: 'icon_256x256@2x.png' },
      { size: 512, name: 'icon_512x512.png' },
      { size: 1024, name: 'icon_512x512@2x.png' },
    ];

    for (const { size, name } of macSizes) {
      const outputPath = path.join(iconsetDir, name);
      await sharp(sourcePng).resize(size, size).png().toFile(outputPath);
    }
    console.log('   ✅ Generated all iconset images');

    // Convert iconset to icns using iconutil
    console.log('   🔄 Converting to .icns format...');
    const icnsPath = path.join(iconsDir, 'icon.icns');
    execSync(`iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`, {
      stdio: 'inherit',
    });

    // Clean up iconset directory
    fs.removeSync(iconsetDir);
    console.log('   ✅ icon.icns created');
    console.log('   🧹 Cleaned up temporary files');
  } catch (error) {
    console.log('   ⚠️  Could not generate .icns:', error.message);
    // Clean up on error
    if (fs.existsSync(iconsetDir)) {
      fs.removeSync(iconsetDir);
    }
  }
}

// Run the generation
generateIcons();
