import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catDir = path.join(root, 'src/content/categorias');
const prodDir = path.join(root, 'src/content/productos');

const categorias = {
  herramientas: {
    nombre: 'Herramientas',
    descripcion: 'Herramientas manuales y eléctricas para todo tipo de trabajo.',
    sub: ['Eléctricas', 'Manuales', 'De medición'],
  },
  electro: {
    nombre: 'Electro y Bazar',
    descripcion: 'Electrodomésticos y artículos para el hogar.',
    sub: ['Cocina', 'Limpieza', 'Climatización'],
  },
  construccion: {
    nombre: 'Materiales de Construcción',
    descripcion: 'Materiales para obra, reciclado y terminaciones.',
    sub: ['Aglomerados', 'Terminaciones', 'Adhesivos y selladores'],
  },
  pintura: {
    nombre: 'Pinturas y Accesorios',
    descripcion: 'Pinturas, esmaltes y accesorios de pintura.',
    sub: ['Pinturas', 'Pinceles y rodillos', 'Enduidos'],
  },
  plomeria: {
    nombre: 'Plomería',
    descripcion: 'Todo para instalaciones sanitarias e hidráulicas.',
    sub: ['Caños y conexiones', 'Griferías', 'Accesorios'],
  },
  electricidad: {
    nombre: 'Electricidad',
    descripcion: 'Material eléctrico, iluminación y seguridad.',
    sub: ['Iluminación', 'Baja tensión', 'Seguridad eléctrica'],
  },
  jardin: {
    nombre: 'Jardín y Exterior',
    descripcion: 'Herramientas y accesorios para jardín.',
    sub: ['Máquinas', 'Accesorios', 'Mangueras y riego'],
  },
};

const nombres = [
  ['Taladro percutor 13mm', 52000], ['Juego de destornilladores', 14800],
  ['Martillo de uña 500g', 9800], ['Cinta métrica 5m', 7200],
  ['Nivel de burbuja 60cm', 11500], ['Amoladora 720W', 68000],
  ['Pistola termofusible', 23500], ['Llave inglesa 12"', 18600],
  ['Pila doble A 4 un.', 1300], ['Andamio de aluminio', 189000],
  ['Cargador de baterías', 24500], ['Soldadora inverter 140A', 98000],
  ['Pinza universal 8"', 8900], ['Destornillador phillips', 5200],
  ['Sierra caladora 450W', 45700], ['Flexómetro láser', 27300],
  ['Caja de herramientas 19"', 31200], ['Tester digital', 16400],
  ['Pincada de fibra de vidrio', 8400], ['Soplete a gas', 12400],
  ['Candado antitaladro', 9800], ['Escalera telescópica', 76000],
  ['Llave francesa 10"', 11200], ['Atornillador inalámbrico', 38900],
  ['Corrente metálica 3m', 6900], ['Kit de llaves allen', 7300],
  ['Sargento 12"', 15600], ['Guantes de trabajo', 6900],
  ['Gafas de seguridad', 3800], ['Casco con barbijo', 14500],
  ['Pintura látex interior x4L', 32900], ['Esmalte sintético x4L', 29800],
  ['Enduido plástico 1kg', 6200], ['Rodillo lana 25cm', 8400],
  ['Pincel cerda 2"', 2600], ['Cinta de papelería 48mm', 1900],
  ['Lija agua N°220 x50', 3400], ['Brocha plana 3"', 2900],
  ['Máscara de pintor', 4500], ['Sellador acrílico', 8600],
  ['Caño PVC 110mm x3m', 7800], ['Grifería monocomando', 48900],
  ['Termofusión máquina motor', 38500], ['Desconector 3/4"', 4200],
  ['Cinta Teflón', 1100], ['Llave ajustable 12"', 17800],
  ['Curva PVC 90°', 900], ['Sifón de rejilla', 5600],
  ['Conexión vidrio-rosca', 2400], ['Válvula esférica 1/2"', 9800],
  ['Lámpara LED 18W', 6900], ['Spot LED dicroico', 8900],
  ['Portalámparas de cerámica', 3900], ['Cable eléctrico 2x1,50 x100m', 32400],
  ['Llave térmica 16A', 9700], ['Tomacorriente doble', 5400],
  ['Disyuntor 40A', 18900], ['Zócalo de madera x2m', 4300],
  ['Timer programable', 11200], ['Banda LED 5m RGB', 14600],
  ['Cortadora de pasto 1200W', 89000], ['Manguera 1/2" x20m', 17800],
  ['Regadera plástica', 6900], ['Rociador a presión 5L', 15800],
  ['Desmalezadora a litio', 64500], ['Palita de jardín', 4300],
  ['Tijera de podar', 9800], ['Abono orgánico 5kg', 5200],
  ['Aspersor de impacto', 8300], ['Guia de césped', 3900],
  ['Electrodoméstico batidora', 25600], ['Plancha a vapor', 33400],
  ['Mochila aspiradora', 59800], ['Cafetera 12 tazas', 27800],
  ['Tostador 2 ranuras', 18900], ['Esmaltes para puerta', 22900],
  ['Lavandina uso general', 2900], ['Detergente conce. x1L', 4800],
  ['Escoba y recogedor', 7900], ['Trapo de piso', 4200],
  ['Clavos 2" x500', 1600], ['Paint thinner 1L', 5600],
  ['Balasto electrónico', 7200], ['Bornera 12 polos', 8900],
  ['Cordón de seguridad 6mm', 2300], ['Faja lumbar', 6400],
  ['Banco de trabajo', 68000], ['Sierra de mano 24"', 8600],
  ['Cerrojo doble balancín', 17800], ['Espejo de baño', 24900],
  ['Juego de 12 brocas', 9800], ['Masita reparadora 1kg', 3900],
  ['Cordón de encendedor', 2100], ['Tuerca y bulones kit', 4800],
  ['Cinta aisladora x10', 3800], ['Contratuerca 1/2"', 1400],
  ['Manómetro 0-4 bar', 9600], ['Filtro de agua 1/2"', 12900],
];

let idx = 0;
const slugs = [];
for (const [catSlug, cat] of Object.entries(categorias)) {
  writeFileSync(
    path.join(catDir, `${catSlug}.md`),
    `---\nnombre: ${cat.nombre}\nsubcategorias:\n${cat.sub.map((s) => `  - ${s}`).join('\n')}\ndescripcion: ${cat.descripcion}\n---\n`
  );
}

const rng = mulberry(2026);
for (const [name, precio] of nombres) {
  const catSlug = Object.keys(categorias)[Math.floor(rng() * Object.keys(categorias).length)];
  const cat = categorias[catSlug];
  const sub = cat.sub[Math.floor(rng() * cat.sub.length)];
  const slug = slugify(name);
  if (slugs.includes(slug)) continue;
  slugs.push(slug);
  idx++;
  const destacado = idx % 47 === 0;
  const galeria = [
    `https://picsum.photos/seed/${slug}-a/800/600`,
    `https://picsum.photos/seed/${slug}-b/800/600`,
    `https://picsum.photos/seed/${slug}-c/800/600`,
  ];
  const body = `## Descripción completa\n\n**${name}** de alta calidad, ideal para ${cat.descripcion}\n\n- Acabado profesional\n- Garantía por escrito\n- Consulte stock y variedad\n\n### Uso recomendado\n\nPerfecto para hogar, taller o industria. Fácil de usar y mantener.\n\n### Contenido de la caja\n\n- 1 x ${name}\n- Manual de instrucciones\n- Accesorios incluidos\n`;
  const md = `---\ntitle: ${name}\ncategoria: ${catSlug}\nsubcategoria: ${sub}\nprecio: ${precio}\ndestacado: ${destacado}\nstock: disponible\nimagen: https://picsum.photos/seed/${slug}/800/600\ngaleria:\n${galeria.map((g) => `  - ${g}`).join('\n')}\ndescripcion: ${name} de primer nivel. ${cat.descripcion}\n---\n\n${body}\n`;
  writeFileSync(path.join(prodDir, `${slug}.md`), md);
}

console.log(`Seed listo: ${idx} productos y ${Object.keys(categorias).length} categorías.`);

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mulberry(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}