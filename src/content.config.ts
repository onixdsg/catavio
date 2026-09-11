import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const productos = defineCollection({
  loader: glob({ base: './src/content/productos', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    categoria: z.string(),
    subcategoria: z.string().default('General'),
    precio: z.number(),
    destacado: z.boolean().default(false),
    stock: z.enum(['disponible', 'sin_stock']).default('disponible'),
    imagen: z.string(),
    galeria: z.array(z.string()).default([]),
    descripcion: z.string().default(''),
  }),
});

const categorias = defineCollection({
  loader: glob({ base: './src/content/categorias', pattern: '**/*.md' }),
  schema: z.object({
    nombre: z.string(),
    subcategorias: z.array(z.string()).default([]),
    descripcion: z.string().default(''),
  }),
});

export const collections = { productos, categorias };