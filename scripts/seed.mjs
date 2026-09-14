import { rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catDir = path.join(root, 'src/content/categorias');
const prodDir = path.join(root, 'src/content/productos');

mkdirSync(catDir, { recursive: true });
mkdirSync(prodDir, { recursive: true });

const categorias = {
  ropa: {
    nombre: 'Ropa Deportiva',
    descripcion: 'Indumentaria deportiva cómoda y de calidad para entrenar y jugar.',
    sub: ['Remeras', 'Shorts', 'Buzos', 'Medias'],
  },
  calzado: {
    nombre: 'Calzado Deportivo',
    descripcion: 'Zapatillas y botines para las distintas disciplinas.',
    sub: ['Zapatillas Running', 'Botines', 'Zapatillas Urbanas'],
  },
  pelotas: {
    nombre: 'Pelotas',
    descripcion: 'Pelotas de fútbol, vóley, básquet y más.',
    sub: ['Fútbol', 'Vóley', 'Básquet', 'Tenis'],
  },
  gimnasio: {
    nombre: 'Gimnasio y Fitness',
    descripcion: 'Elementos para entrenar en casa o en el gimnasio.',
    sub: ['Pesas', 'Colchonetas', 'Accesorios'],
  },
  running: {
    nombre: 'Running',
    descripcion: 'Ropa técnica, hidratación y accesorios para correr.',
    sub: ['Ropa técnica', 'Hidratación', 'Accesorios'],
  },
  natacion: {
    nombre: 'Natación',
    descripcion: 'Trajes, anteojos y gorras para entrenar en el agua.',
    sub: ['Trajes', 'Anteojos', 'Gorras'],
  },
  accesorios: {
    nombre: 'Accesorios Deportivos',
    descripcion: 'Complementos para mejorar tu juego y entreno.',
    sub: ['Redes', 'Botelleros', 'Kits'],
  },
};

const productos = [
  ['Remera Deportiva Dry-Fit', 'ropa', 'Remeras', 18500, 'Remera transpirable de microfibra con tecnología dry-fit.'],
  ['Camiseta de Fútbol Réplica', 'ropa', 'Remeras', 24900, 'Camiseta réplica con diseño clásico, ideal para jugar o alentar.'],
  ['Short de Fútbol Profesional', 'ropa', 'Shorts', 12800, 'Short liviano con elastano para total libertad de movimiento.'],
  ['Buzo Deportivo Técnico', 'ropa', 'Buzos', 34900, 'Buzo abrigado y liviano, perfecto para pre y post entreno.'],
  ['Medias Deportivas Altas x3', 'ropa', 'Medias', 6900, 'Pack de 3 medias con refuerzo en talón y empeine.'],
  ['Zapatillas Running Amortiguadas', 'calzado', 'Zapatillas Running', 89900, 'Zapatillas con media suela amortiguada y malla transpirable.'],
  ['Botines de Fútbol Tercero', 'calzado', 'Botines', 59900, 'Botines con tapones de goma para jugar en cancha de césped.'],
  ['Zapatillas Urbanas Cómodas', 'calzado', 'Zapatillas Urbanas', 74900, 'Zapatillas casuales para el día a día.'],
  ['Pelota de Fútbol N°5', 'pelotas', 'Fútbol', 15900, 'Pelota oficial N°5 con sellado termofundido.'],
  ['Balón de Vóley', 'pelotas', 'Vóley', 14900, 'Balón de vóley con cuero sintético y buena retención de aire.'],
  ['Pelota de Básquet N°7', 'pelotas', 'Básquet', 16900, 'Pelota de básquet reforzada para piso de madera o cemento.'],
  ['Pelotas de Tenis x3', 'pelotas', 'Tenis', 8900, 'Tubo de 3 pelotas de tenis con alta presión.'],
  ['Juego de Mancuernas x2', 'gimnasio', 'Pesas', 25900, 'Par de mancuernas con agarre ergonómico antideslizante.'],
  ['Colchoneta de Yoga', 'gimnasio', 'Colchonetas', 18900, 'Colchoneta antideslizante de 6mm con correa de transporte.'],
  ['Cuerda para Saltar Ajustable', 'gimnasio', 'Accesorios', 5400, 'Cuerda de velocidad con rodamientos y largo ajustable.'],
  ['Botella de Hidratación 750ml', 'running', 'Hidratación', 7900, 'Botella deportiva sin BPA con boquilla de flujo rápido.'],
  ['Anteojos de Natación Anti-vaho', 'natacion', 'Anteojos', 8900, 'Anteojos de natación con protección UV y ajuste cómodo.'],
  ['Gorra de Natación Siliconada', 'natacion', 'Gorras', 3200, 'Gorra de silicona de larga duración, talla única.'],
  ['Botellero Deportivo', 'accesorios', 'Botelleros', 5800, 'Botellero ajustable para llevar tu bebida a todos lados.'],
];

rmSync(catDir, { recursive: true, force: true });
rmSync(prodDir, { recursive: true, force: true });
mkdirSync(catDir, { recursive: true });
mkdirSync(prodDir, { recursive: true });

for (const [catSlug, cat] of Object.entries(categorias)) {
  writeFileSync(
    path.join(catDir, `${catSlug}.md`),
    `---\nnombre: ${cat.nombre}\nsubcategorias:\n${cat.sub.map((s) => `  - ${s}`).join('\n')}\ndescripcion: ${cat.descripcion}\n---\n`
  );
}

let destacadoFlip = false;
for (const [name, catSlug, sub, precio, resumen] of productos) {
  const slug = slugify(name);
  const destacado = ['Zapatillas Running Amortiguadas', 'Pelota de Fútbol N°5'].includes(name);
  destacadoFlip = !destacadoFlip;
  const cat = categorias[catSlug];
  const galeria = [
    `https://picsum.photos/seed/${slug}-a/800/600`,
    `https://picsum.photos/seed/${slug}-b/800/600`,
    `https://picsum.photos/seed/${slug}-c/800/600`,
  ];
  const body = `## Descripción completa\n\n**${name}** de alta calidad, ideal para ${cat.descripcion}\n\n- Acabado profesional\n- Garantía por escrito\n- Consulte stock y variedad\n\n### Uso recomendado\n\nPerfecto para entrenamiento y práctica deportiva. Fácil de usar y mantener.\n\n### Contenido de la caja\n\n- 1 x ${name}\n- Manual de uso y cuidados\n- Accesorios incluidos\n`;
  const md = `---\ntitle: ${name}\ncategoria: ${catSlug}\nsubcategoria: ${sub}\nprecio: ${precio}\ndestacado: ${destacado}\nstock: disponible\nimagen: https://picsum.photos/seed/${slug}/800/600\ngaleria:\n${galeria.map((g) => `  - ${g}`).join('\n')}\ndescripcion: ${resumen}\n---\n\n${body}\n`;
  writeFileSync(path.join(prodDir, `${slug}.md`), md);
}

console.log(`Seed sport listo: ${productos.length} productos y ${Object.keys(categorias).length} categorías.`);

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}