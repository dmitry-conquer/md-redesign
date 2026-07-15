import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SRC_ASSETS = path.resolve(__dirname, "../dist/assets");
const DEST_ASSETS = path.resolve(__dirname, "../wp-theme/assets");

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return console.warn(`⚠️ Not found: ${src}`);
  fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src, { withFileTypes: true }).forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ ${path.relative(src, srcPath)} → ${path.relative(DEST_ASSETS, destPath)}`);
    }
  });
}

console.log("Copying assets to WordPress theme...");
copyDir(SRC_ASSETS, DEST_ASSETS);
console.log("✅ Copied!");
