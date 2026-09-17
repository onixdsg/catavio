import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const PRODUCTOS_DIR = resolve(ROOT, 'src/content/productos');
const IMAGE_RE = /\/images\/[\w/.-]+\.(jpe?g|png)/g;

const WIDTH = 640;
const QUALITY = 58;

function mdFiles(dir) {
  return readdirSync(dir).filter((f) => f.endsWith('.md'));
}

function collectRefs(files) {
  const refs = new Set();
  const fileMap = new Map();
  for (const f of files) {
    const text = readFileSync(resolve(PRODUCTOS_DIR, f), 'utf8');
    const matches = text.match(IMAGE_RE) || [];
    const local = new Set();
    for (const m of matches) local.add(m);
    for (const m of local) refs.add(m);
    fileMap.set(f, { text, local });
  }
  return { refs, fileMap };
}

async function main() {
  const files = mdFiles(PRODUCTOS_DIR);
  const { refs, fileMap } = collectRefs(files);

  console.log(`Productos: ${files.length} | Imágenes únicas referenciadas: ${refs.size}\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const url of refs) {
    const src = resolve(ROOT, 'public', url.replace(/^\//, ''));
    if (!existsSync(src)) {
      console.log(`SKIP (no existe): ${url}`);
      continue;
    }
    const out = src.replace(/\.(jpe?g|png)$/i, '.webp');
    const meta = await sharp(src).metadata();
    const before = statSync(src).size;
    totalBefore += before;

    await sharp(src)
      .rotate()
      .resize({ width: WIDTH, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(out);

    const after = statSync(out).size;
    totalAfter += after;
    const pct = Math.max(0, Math.round(100 - (after / before) * 100));
    console.log(
      `${url} (${meta.width}x${meta.height}) ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB (-${pct}%)`
    );
  }

  console.log(`\nTOTAL productos: ${(totalBefore / 1048576).toFixed(2)} MB -> ${(totalAfter / 1048576).toFixed(2)} MB (-${Math.round(100 - (totalAfter / totalBefore) * 100)}%)`);

  // Logo: usa espacio de color/sin recorte, tamaño para header y "sobre nosotros"
  const logo = resolve(ROOT, 'public/images/logo.jpeg');
  if (existsSync(logo)) {
    const before = statSync(logo).size;
    const logoOut = resolve(ROOT, 'public/images/logo.webp');
    await sharp(logo)
      .rotate()
      .resize({ width: 512, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85, effort: 4 })
      .toFile(logoOut);
    const after = statSync(logoOut).size;
    console.log(`logo.jpeg ${(before / 1024).toFixed(0)}KB -> logo.webp ${(after / 1024).toFixed(0)}KB (-${Math.round(100 - (after / before) * 100)}%)`);
  }

  // Reescribir referencias en frontmatter: nombre.x -> nombre.webp
  let changed = 0;
  for (const [f, { text, local }] of fileMap) {
    if (local.size === 0) continue;
    let next = text;
    for (const m of local) {
      next = next.split(m).join(m.replace(/\.(jpe?g|png)$/i, '.webp'));
    }
    if (next !== text) {
      writeFileSync(resolve(PRODUCTOS_DIR, f), next);
      changed++;
    }
  }
  console.log(`\nFrontmatter actualizado en ${changed} productos.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});