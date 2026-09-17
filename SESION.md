# Sesión de trabajo — Catavio Sport (retomar desde acá)

Nota de uso: este archivo se actualiza al final de cada sesión para retomar el trabajo con contexto. La info de siempre (cómo correr el proyecto, qué hace cada cosa) está en `README.md`; acá está el detalle técnico de implementación y el "dónde quedamos".

---

## 1. Estado actual (dónde quedamos)

- Último commit: **"Optimización de imágenes a WebP + limpieza"** (fotos ~253KB → ~66KB; logo 944KB → 13KB). Sitio completo ~9.6MB → ~2.6MB.
- Working tree: limpio tras el commit (los cambios se pushearon a GitHub para desplegar en Netlify).
- Cambios de esta sesión:
  - Nuevo script `scripts/optimize-images.mjs` (reutilizable): convierte imágenes a WebP 640px q58 + logo a 512px q85, y actualiza las referencias del frontmatter.
  - 29 fotos de producto convertidas a WebP (`public/images/**/*.webp`), referencias actualizadas en los 16 `src/content/productos/*.md` (imagen + galeria).
  - Logo → `public/images/logo.webp` (13KB); referencias actualizadas en Header, Footer, index y og:image.
  - Borrados los 33 JPEG/PNG originales (incluidos 3 sin usar: pelota2-24/25/26).
- Antes de esta sesión: el pedido de WhatsApp incluía link por artículo (commit `1417de9`).
- URL de producción (configurada en `astro.config.mjs`): `https://catavio.netlify.app`.
- Repo/GitHub: `onixdsg/catavio` (Netlify despliega desde `main`).

### Plan free de Netlify (datos clave, 2026)

- Desde sept/2025 el free es **300 créditos/mes con tope duro** (ya no "100 GB"). Al agotarlos el sitio se pausa hasta el próximo ciclo.
- Tasas: bandwidth = **20 créditos/GB**, deploy de producción = **15 créditos c/u**, web requests = 2 créditos/10.000. Previews = 0.
- **Ojo:** cada guardado del cliente en `/admin` dispara un deploy de producción = 15 créditos. El límite real suele ser la cantidad de deploys, no las visitas.
- Con el sitio optimizado (~1.5-2.5MB por sesión): ~**7.000 visitas/mes** con 1 deploy, ~**5.500** con 5 deploys. De sobra para una tienda local.

## 2. Qué es el proyecto

Tienda web estática **Catavio Sport** (artículos deportivos, Villa María, Córdoba):

- Catálogo público con búsqueda, filtros y ordenamiento.
- Carrito en el navegador (localStorage) que se envía por WhatsApp.
- Panel `/admin` (Decap CMS) para que el cliente edite productos, categorías y datos de la tienda sin tocar código.
- Sin backend ni costos mensuales de servidor.

## 3. Stack y comandos

| Herramienta | Uso |
|---|---|
| Astro 7 (SSG) | Framework |
| Tailwind CSS v4 | Estilos |
| Decap CMS | Panel web `/admin` |
| Netlify | Hosting + auth del CMS |
| JS vanilla | Carrito y catálogo (`src/scripts/`) |

```bash
astro dev --background   # iniciar servidor en segundo plano
astro dev logs           # ver logs
astro dev status         # estado
astro dev stop           # detener
npm run build            # build de producción (genera dist/)
npm run preview          # previsualizar el build
npx astro check          # typecheck
```

Node >= 22 (`engines` en `package.json`).

## 4. Estructura de archivos (mapa)

```
src/
├── content.config.ts            # schema de productos y categorías (Zod)
├── content/
│   ├── productos/*.md           # un archivo Markdown por producto (frontmatter)
│   └── categorias/*.md          # categorías + subcategorías
├── data/
│   └── shop.json                # datos de la tienda (WhatsApp, email, moneda...)
├── layouts/
│   └── BaseLayout.astro         # layout global (header, footer, scripts)
├── lib/
│   └── shop.ts                  # helpers SSR: formatPrice, getProducts, productIndex...
├── scripts/
│   ├── cart.js                  # carrito + WhatsApp (cliente)
│   └── catalog.js               # filtros, orden, "cargar más" (cliente)
├── styles/
│   └── global.css               # tema Tailwind + paleta brand (rojo/negro)
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── ProductCard.astro
│   └── WhatsAppFloat.astro
└── pages/
    ├── index.astro              # inicio (hero destacado, sobre nosotros)
    ├── carrito.astro
    ├── contacto.astro
    ├── 404.astro
    └── productos/
        ├── index.astro          # catálogo con filtros
        └── [slug].astro         # detalle de producto (ruta dinámica)

public/
├── admin/
│   ├── config.yml               # config del Decap CMS
│   └── index.html
└── images/                      # fotos del catálogo (imágenes locales)
```

Otros: `astro.config.mjs` (site + plugin Tailwind), `netlify.toml` (build + publish), `scripts/seed.mjs` (genera productos demo), `scripts/optimize-images.mjs` (convierte imágenes a WebP y actualiza frontmatter).

> **Imágenes:** todas en WebP (640px, q58 para producto; logo 512px q85). Si el cliente sube fotos nuevas por el panel, se guardan en `public/uploads/` **sin optimizar** — hay que pasarlas por `node scripts/optimize-images.mjs` (o ajustar el script para que también procese uploads) para no perder velocidad.

## 5. Contenido y datos

### Schema de productos (`src/content.config.ts`)

Frontmatter de cada `src/content/productos/*.md`:

- `title` (string)
- `categoria` (string, id de la categoría)
- `subcategoria` (string, default `"General"`)
- `precio` (number)
- `destacado` (boolean, default `false`) → muestra el producto en el hero del inicio
- `stock` (`"disponible"` | `"sin_stock"`)
- `imagen` (string, url o ruta)
- `galeria` (array de strings, opcional)
- `descripcion` (string, opcional, corta)
- body Markdown = descripción completa

### Categorías (`src/content/categorias/*.md`)

- `nombre`, `subcategorias` (array), `descripcion` (opcional).

### Datos de la tienda (`src/data/shop.json`)

Campos clave: `empresa` (Catavio Sport), `abreviatura` (Cs), `whatsapp` = `5493536578668`, `email` = `prueba@gmail.com` (placeholder), `moneda` = `ARS`, `simbolo` = `$`, `domicilio`, `horarios`, `nota_envio`, `redes` (instagram/facebook, vacías).

> Nota: el email está en `prueba@gmail.com`; si hay que publicar de verdad, cambiarlo.

## 6. Carrito y WhatsApp

- Clave de localStorage: `laloweb_cart_v1` (`src/scripts/cart.js:1`).
- API del carrito: `add`, `setQty`, `remove`, `clear`, `summary`, `getItems` (todas en `cart.js`).
- Precios formateados con `Intl.NumberFormat('es-AR', ...)` según `shop.moneda`.
- `buildWhatsAppMessage()` (`cart.js:83`) arma el pedido:
  - Cabecera `*NUEVO PEDIDO — Catavio Sport*`
  - Por ítem: `• nombre (xN) — precio` + **link directo** `https://<origin>/productos/<slug>/`
  - `*TOTAL: ...*`, `nota_envio`, y campos "Nombre" / "Dirección de envío" para completar.
- El checkout abre `https://wa.me/<numero>?text=...` (número normalizado sin símbolos).
- Evento `cart:changed` disparado al guardar; badge de contador vía `[data-cart-count]`.
- Bind de botones: `[data-add-to-cart]`, `[data-qty]`, `[data-remove]`, `[data-clear-cart]`, `[data-checkout-wa]`, `[data-qty-input]`.

## 7. Catálogo (`src/scripts/catalog.js`)

- Estado: categoría, subcategoría, búsqueda, rango de precio (min/max), orden (`recomendados` | `precio-asc` | `precio-desc` | `nombre`).
- Página de 12 ítems con botón "cargar más" (`PAGE_SIZE = 12`, `[data-catalog-more]`).
- Datos del catálogo se exponen en `window.PRODUCTS` (generado desde `productIndex()` en `src/lib/shop.ts`).
- Filtros declarados en el HTML con `[data-filter]` (search, category, subcategory, min, max, sort) y reset con `[data-filter-reset]`.
- Una card muestra badge "Destacado" y "Sin stock"; con stock se muestra el botón agregar al carrito, sin stock un bloque deshabilitado.

## 8. Diseño (tema dark rojo/negro)

Definido en `src/styles/global.css`:

- Fondo `#020617` (slate-950), texto `#f1f5f9`.
- Paleta `brand` (rojo): escala de `#fef2f2` (brand-50) a `#7f1d1d` (brand-900); el primario es `brand-600` = `#dc2626`.
- Tipografía: Inter.
- Usos típicos: botones `bg-brand-600 hover:bg-brand-700`, precios `text-brand-400`, selección de texto rojo.

## 9. Panel de administración (`/admin`)

Config en `public/admin/config.yml`:

- Backend: `git-gateway`, branch `main` (requiere Netlify Identity + Git Gateway).
- `media_folder: public/uploads` → se publican en `/uploads/...`.
- Colecciones:
  - **Configuración**: un archivo `src/data/shop.json` con todos los datos de la tienda.
  - **Categorías**: folder `src/content/categorias`, con `identifier_field: nombre`.
  - **Productos**: folder `src/content/productos`, campos mapeados al schema de contenido, con `body` = descripción completa (markdown).
- El CMS usa el email de Netlify Identity para autenticar (roles admin/editor).

## 10. Despliegue (Netlify)

`netlify.toml`: build `npm run build`, publish `dist`, Node 22.

Pasos (documentados en `README.md`):
1. Importar el repo en Netlify.
2. Activar **Identity** y **Git Gateway**.
3. Invitar al cliente por email con rol **Editor** desde Identity.
4. El cliente entra a `tusitio.netlify.app/admin` y edita el catálogo.

Alternativa: Vercel (requiere OAuth de GitHub, más engorroso).

## 11. Historial reciente (referencia)

```
Optimización de imágenes a WebP + limpieza      (último commit de esta sesión)
1417de9 Agrega link de cada articulo en el pedido enviado por WhatsApp
219f78d Update Configuración "shop"
09627ef Delete Producto "short-de-futbol-profesional"
a493130 Delete Producto "remera-deportiva-dry-fit"
006c18d Delete Producto "zapatillas-running-amortiguadas"
461ce6a Foto reales de pelotas en todos los productos del catalogo
51655e6 Rediseño dark rojo/negro en todas las páginas y componentes del catálogo
7276bb4 Estética rojo/blanco: logo real, fotos de pelotas, paleta de colores actualizada
4e6c48b Catálogo sport: reemplazo productos demo de ferretería por artículos deportivos
a493e57 Agrego widget de Netlify Identity para aceptar invitaciones del panel /admin
```

## 12. Pendientes / ideas (completar en cada sesión)

- [ ] **Fotos reales por producto:** TODA el catálogo aún usa fotos de pelotas genéricas (incluso "colchoneta de yoga", "botines", "zapatillas"...). Es lo más importante antes de un lanzamiento real.
- [ ] Cambiar el email de `prueba@gmail.com` a uno real antes de lanzar.
- [ ] Completar `redes.instagram` y `redes.facebook` en `src/data/shop.json`.
- [ ] (Idea) Procesar también `public/uploads/` (fotos que suba el cliente por el CMS) con el script de optimización.
- [ ] (Idea) Analytics: Netlify free guarda solo 1 día → sumar Cloudflare Web Analytics (gratis, sin cookies) para ver tendencias mensuales.