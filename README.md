# Tienda web estática (Astro + Decap CMS + Netlify)

Sitio de catálogo con carrito de compras que se envía por WhatsApp. Sin backend ni costos mensuales. El cliente administra productos, fotos, precios y categorías desde un panel web (`/admin`).

## Funcionalidades

- **Inicio:** producto destacado, sección "sobre nosotros", características del servicio.
- **Productos:** catálogo completo con búsqueda, filtro por categoría, subcategoría y rango de precio, ordenamiento y carga incremental ("cargar más"). Botón de agregar al carrito directo.
- **Detalle de producto:** galería de fotos, descripción completa (Markdown), selector de cantidad, "Agregar al carrito" y "Comprar por WhatsApp" directo, productos relacionados.
- **Carrito:** cantidades, subtotales y total, botón "Enviar pedido por WhatsApp". El pedido llega pre-armado con cada ítem, cantidad, precio y total. Pago y envío se coordinan por WhatsApp.
- **Contacto:** datos de la empresa y formulario que abre WhatsApp con el mensaje.
- **Panel de administración (`/admin`):** el cliente edita productos, categorías y datos de la tienda sin tocar código.

## Stack

| Herramienta | Uso |
|---|---|
| Astro 7 | Framework estático (SSG) |
| Tailwind CSS v4 | Estilos |
| Decap CMS | Panel web para el cliente |
| Netlify | Hosting + autenticación del CMS (gratis) |
| JavaScript (vanilla) | Carrito: localStorage + WhatsApp |

Los datos de la tienda (WhatsApp, email, moneda, etc.) están en `src/data/shop.json`. Los productos viven como Markdown en `src/content/productos/` (schema en `src/content.config.ts`).

## Desarrollo local

```bash
npm install
npm run dev          # o: astro dev --background / astro dev logs / astro dev stop
npm run build        # genera la carpeta dist/
```

### Generar productos de demo

```bash
node scripts/seed.mjs
```

Crea 98 productos y 7 categorías con imágenes placeholder (reemplazables desde el panel).

## Despliegue en Netlify

La configuración ya está en `netlify.toml` (build: `npm run build`, publish: `dist`).

1. Subí el proyecto a un repositorio de GitHub (`git init` ya hecho; el branch se llama `main`).
2. En [netlify.com](https://netlify.com) → **Add new site → Import an existing project** → elegí tu repo.
   Build command: `npm run build` — Publish directory: `dist` (auto detecta desde `netlify.toml`).
3. Activá **Identity** (en *Site → Identity → Enable Identity*).
4. Activá **Git Gateway** (en *Site → Settings → Access control → Git Gateway → Enable*).
5. Invitá al cliente por email desde *Identity → Invite users* con rol **Editor**.
6. El cliente entra a `tusitio.netlify.app/admin`, acepta la invitación y ya puede editar el catálogo.

> Alternativa: **Vercel** también funciona cambiando el backend de Decap CMS a OAuth de GitHub (más engorroso; con Netlify el login es por email y viene integrado).

## Datos editables desde el panel

- **Datos de la tienda:** nombre, WhatsApp, email, domicilio, horarios, moneda, nota de envío.
- **Categorías:** nombre + lista de subcategorías.
- **Productos:** nombre, categoría, subcategoría, precio, destacado (sí/no), stock (disponible/sin stock), foto principal, galería, descripción corta y completa.

Agregar un producto con la casilla "Destacado en la portada" activada lo muestra automáticamente en el hero del inicio.