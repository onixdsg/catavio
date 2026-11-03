import { formatPrice } from './cart.js';

const PAGE_SIZE = 12;

export function initCatalog() {
  const products = window.PRODUCTS || [];
  const state = {
    category: 'all',
    subcategory: 'all',
    search: '',
    min: '',
    max: '',
    sort: 'recomendados',
    page: 1,
  };

  const grid = document.querySelector('[data-catalog-grid]');
  const countEl = document.querySelector('[data-catalog-count]');
  const emptyEl = document.querySelector('[data-catalog-empty]');
  const subSelect = document.querySelector('[data-filter-subcategory]');
  const catSelect = document.querySelector('[data-filter-category]');

  const filterControls = Array.from(
    document.querySelectorAll('[data-filter]')
  );

  function getCategories(products) {
    const map = new Map();
    for (const p of products) {
      if (!map.has(p.categoria)) {
        map.set(p.categoria, {
          slug: p.categoria,
          nombre: p.categoria,
          count: 0,
        });
      }
      map.get(p.categoria).count++;
    }
    return Array.from(map.values());
  }

  function getSubcategories(products, category) {
    const map = new Map();
    for (const p of products) {
      if (category !== 'all' && p.categoria !== category) continue;
      if (!p.subcategoria) continue;
      map.set(p.subcategoria, (map.get(p.subcategoria) || 0) + 1);
    }
    return Array.from(map.entries());
  }

  function fillCategories() {
    if (!catSelect) return;
    const cats = getCategories(products).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
    catSelect.innerHTML =
      `<option value="all">Todas las categorías</option>` +
      cats
        .map((c) => `<option value="${c.slug}">${c.nombre}</option>`)
        .join('');
    catSelect.value = state.category;
  }

  function fillSubcategories() {
    if (!subSelect) return;
    const subs = getSubcategories(products, state.category);
    const sorted = subs.sort((a, b) => a[0].localeCompare(b[0]));
    subSelect.innerHTML =
      `<option value="all">Todas las subcategorías</option>` +
      sorted.map(([s]) => `<option value="${s}">${s}</option>`).join('');
    subSelect.value = state.subcategory;
  }

  function applyFilters() {
    let out = products.slice();

    if (state.category !== 'all') {
      out = out.filter((p) => p.categoria === state.category);
    }
    if (state.subcategory !== 'all') {
      out = out.filter((p) => p.subcategoria === state.subcategory);
    }
    if (state.search) {
      const q = state.search.toLowerCase();
      out = out.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.descripcion || '').toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }
    if (state.min !== '') {
      out = out.filter((p) => p.precio >= Number(state.min));
    }
    if (state.max !== '') {
      out = out.filter((p) => p.precio <= Number(state.max));
    }

    switch (state.sort) {
      case 'precio-asc':
        out.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio-desc':
        out.sort((a, b) => b.precio - a.precio);
        break;
      case 'nombre':
        out.sort((a, b) => a.title.localeCompare(b.title, 'es'));
        break;
    }

    state.page = 1;
    return out;
  }

  function card(p) {
    const badge =
      p.destacado && p.stock !== 'sin_stock'
        ? `<span class="absolute top-3 left-3 bg-brand-600 text-white text-xs font-bold px-2 py-1 rounded-full">Destacado</span>`
        : '';
    const stockBadge =
      p.stock === 'sin_stock'
        ? `<span class="absolute top-3 right-3 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded-full">Sin stock</span>`
        : '';
    return `
    <article class="group bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-brand-600/10 hover:border-slate-700 hover:-translate-y-0.5 transition flex flex-col">
      <a href="/productos/${p.slug}/" class="relative block aspect-square overflow-hidden bg-slate-800">
        <img src="${p.imagen}" alt="${p.title}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        ${badge}${stockBadge}
      </a>
      <div class="p-4 flex flex-col flex-1">
        <p class="text-xs uppercase tracking-wide text-slate-500 font-medium">${p.categoryName}${p.subcategoria ? ` · ${p.subcategoria}` : ''}</p>
        <a href="/productos/${p.slug}/" class="mt-1 font-semibold text-white line-clamp-2 hover:text-brand-400 transition">${p.title}</a>
        <p class="mt-2 text-lg font-bold text-brand-400">${formatPrice(p.precio)}</p>
        <div class="mt-3 pt-3 border-t border-slate-800">
          ${
            p.stock === 'sin_stock'
              ? `<span class="block text-center w-full px-4 py-2 rounded-lg bg-slate-800 text-slate-500 font-medium text-sm">Sin stock</span>`
              : `<button type="button" data-add-to-cart data-slug="${p.slug}" data-title="${p.title}" data-precio="${p.precio}" data-imagen="${p.imagen}" class="w-full px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition">Agregar al carrito</button>`
          }
        </div>
      </div>
    </article>`;
  }

  function render() {
    const filtered = applyFilters();
    const total = filtered.length;
    if (countEl) countEl.textContent = `${total} producto${total === 1 ? '' : 's'}`;
    if (!grid) return;

    if (total === 0) {
      grid.innerHTML = '';
      emptyEl?.classList.remove('hidden');
      return;
    }
    emptyEl?.classList.add('hidden');

    const start = (state.page - 1) * PAGE_SIZE;
    const slice = filtered.slice(start, start + PAGE_SIZE);
    grid.innerHTML = slice.map(card).join('');
    renderPagination(total, start);
  }

  function renderPagination(total, start) {
    const pageInfo = document.querySelector('[data-catalog-page-info]');
    const controls = document.querySelector('[data-catalog-page-controls]');
    const numbers = document.querySelector('[data-catalog-page-numbers]');

    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    if (state.page > totalPages) state.page = totalPages;

    if (pageInfo) {
      const from = total === 0 ? 0 : start + 1;
      const to = Math.min(start + PAGE_SIZE, total);
      pageInfo.textContent = `Mostrando ${from} a ${to} de ${total} producto${total === 1 ? '' : 's'}`;
    }

    const prevBtn = document.querySelector('[data-catalog-prev]');
    const nextBtn = document.querySelector('[data-catalog-next]');
    if (prevBtn) prevBtn.disabled = state.page <= 1;
    if (nextBtn) nextBtn.disabled = state.page >= totalPages;

    if (controls) controls.hidden = totalPages <= 1;
    if (!numbers) return;

    numbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = String(i);
      btn.className = `px-3 py-2 rounded-lg text-sm ${
        i === state.page
          ? 'bg-brand-600 text-white'
          : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
      }`;
      btn.addEventListener('click', () => {
        state.page = i;
        render();
      });
      numbers.appendChild(btn);
    }
  }

  filterControls.forEach((ctl) => {
    ctl.addEventListener('input', () => {
      const key = ctl.dataset.filter;
      state[key] = ctl.value;
      if (key === 'category') {
        state.subcategory = 'all';
        fillSubcategories();
      }
      render();
    });
    ctl.addEventListener('change', () => {
      const key = ctl.dataset.filter;
      state[key] = ctl.value;
      if (key === 'category') {
        state.subcategory = 'all';
        fillSubcategories();
      }
      render();
    });
  });

  document.querySelectorAll('[data-filter-reset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.category = 'all';
      state.subcategory = 'all';
      state.search = '';
      state.min = '';
      state.max = '';
      state.sort = 'recomendados';
      const search = document.querySelector('[data-filter=search]');
      const min = document.querySelector('[data-filter=min]');
      const max = document.querySelector('[data-filter=max]');
      const sort = document.querySelector('[data-filter=sort]');
      if (search) search.value = '';
      if (min) min.value = '';
      if (max) max.value = '';
      if (sort) sort.value = 'recomendados';
      fillCategories();
      fillSubcategories();
      render();
    });
  });

  const prevBtn = document.querySelector('[data-catalog-prev]');
  const nextBtn = document.querySelector('[data-catalog-next]');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.page > 1) {
        state.page -= 1;
        render();
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(products.length / PAGE_SIZE) || 1;
      if (state.page < totalPages) {
        state.page += 1;
        render();
      }
    });
  }

  fillCategories();
  fillSubcategories();
  render();
}