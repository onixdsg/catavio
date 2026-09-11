import { getCollection } from 'astro:content';
import shop from '../data/shop.json';

export function formatPrice(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: shop.moneda,
    maximumFractionDigits: 2,
  }).format(n);
}

export async function getProducts() {
  const products = await getCollection('productos');
  return [...products].sort((a, b) =>
    a.data.title.localeCompare(b.data.title, 'es')
  );
}

export async function getCategories() {
  const cats = await getCollection('categorias');
  return [...cats].sort((a, b) =>
    a.data.title.localeCompare(b.data.title, 'es')
  );
}

export async function buildCategoryMap() {
  const cats = await getCollection('categorias');
  const map = new Map<string, string>();
  for (const c of cats) {
    map.set(c.id, c.data.title);
  }
  return map;
}

export async function productIndex() {
  const products = await getProducts();
  const cats = await buildCategoryMap();
  return products.map((p) => ({
    slug: p.id,
    title: p.data.title,
    precio: p.data.precio,
    categoria: p.data.categoria,
    subcategoria: p.data.subcategoria,
    imagen: p.data.imagen,
    destacado: p.data.destacado,
    stock: p.data.stock,
    descripcion: p.data.descripcion,
    categoryName: cats.get(p.data.categoria) ?? p.data.categoria,
  }));
}