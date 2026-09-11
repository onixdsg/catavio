const STORAGE_KEY = 'laloweb_cart_v1';

let items = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((i) => i && i.slug) : [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart:changed', { detail: summary() }));
}

export function getItems() {
  return items.map((i) => ({ ...i }));
}

export function add(slug, datos = {}) {
  const existing = items.find((i) => i.slug === slug);
  if (existing) {
    existing.cantidad += 1;
  } else {
    items.push({
      slug,
      title: datos.title || slug,
      precio: datos.precio || 0,
      imagen: datos.imagen || '',
      cantidad: 1,
    });
  }
  save();
}

export function setQty(slug, cantidad) {
  const item = items.find((i) => i.slug === slug);
  if (!item) return;
  item.cantidad = Math.max(1, Math.min(999, Math.floor(cantidad)));
  save();
}

export function remove(slug) {
  items = items.filter((i) => i.slug !== slug);
  save();
}

export function clear() {
  items = [];
  save();
}

export function summary() {
  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const count = items.reduce((acc, i) => acc + i.cantidad, 0);
  return { items, total, count };
}

export function formatPrice(n) {
  const shop = window.SHOP || {};
  try {
    const fmt = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: shop.moneda || 'ARS',
      maximumFractionDigits: 2,
    });
    return fmt.format(n);
  } catch {
    return `${shop.simbolo || '$'}${Number(n).toLocaleString('es-AR')}`;
  }
}

function whatsappLink(texto) {
  const shop = window.SHOP || {};
  const numero = String(shop.whatsapp || '').replace(/[^\d]/g, '');
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export function buildWhatsAppMessage() {
  const shop = window.SHOP || {};
  const lines = [];
  lines.push(`*NUEVO PEDIDO — ${shop.empresa || 'Tienda web'}*`);
  lines.push('');
  items.forEach((i) => {
    lines.push(`• ${i.title} (x${i.cantidad}) — ${formatPrice(i.precio * i.cantidad)}`);
  });
  lines.push('');
  const total = summary().total;
  lines.push(`*TOTAL: ${formatPrice(total)}*`);
  if (shop.nota_envio) {
    lines.push('');
    lines.push(shop.nota_envio);
  }
  lines.push('');
  lines.push('Nombre: (indicar)');
  lines.push('Dirección de envío: (indicar)');
  return lines.join('\n');
}

export function checkoutWhatsApp() {
  const msg = buildWhatsAppMessage();
  window.open(whatsappLink(msg), '_blank');
}

export function bindCartUI(root = document) {
  root.addEventListener('click', (e) => {
    const target = e.target.closest('[data-add-to-cart]');
    if (target) {
      e.preventDefault();
      add(target.dataset.slug, {
        title: target.dataset.title,
        precio: Number(target.dataset.precio || 0),
        imagen: target.dataset.imagen || '',
      });
      const toast = root.querySelector('#toast-cart');
      if (toast) {
        toast.textContent = `"${target.dataset.title}" agregado al carrito`;
        toast.classList.remove('opacity-0', 'pointer-events-none');
        clearTimeout(bindCartUI._toast);
        bindCartUI._toast = setTimeout(() => {
          toast.classList.add('opacity-0', 'pointer-events-none');
        }, 2200);
      }
      return;
    }

    const qtyBtn = e.target.closest('[data-qty]');
    if (qtyBtn && qtyBtn.dataset.action) {
      const { slug, action } = qtyBtn.dataset;
      const item = items.find((i) => i.slug === slug);
      if (item) {
        setQty(slug, action === 'inc' ? item.cantidad + 1 : item.cantidad - 1);
        renderCart();
      }
      return;
    }

    const removeBtn = e.target.closest('[data-remove]');
    if (removeBtn) {
      remove(removeBtn.dataset.remove);
      renderCart();
      return;
    }

    const clearBtn = e.target.closest('[data-clear-cart]');
    if (clearBtn) {
      clear();
      renderCart();
      return;
    }

    if (e.target.closest('[data-checkout-wa]')) {
      checkoutWhatsApp();
    }
  });

  root.addEventListener('change', (e) => {
    const qtyInput = e.target.closest('[data-qty-input]');
    if (qtyInput) {
      setQty(qtyInput.dataset.slug, Number(qtyInput.value || 1));
      renderCart();
    }
  });
}

export function updateBadge() {
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    const count = summary().count;
    el.textContent = count > 99 ? '99+' : String(count);
    el.classList.toggle('hidden', count === 0);
  });
}

export function renderCart() {
  updateBadge();
  const container = document.querySelector('[data-cart-container]');
  if (!container) return;
  const { items: cart, total } = summary();
  const shop = window.SHOP || {};

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16">
        <p class="text-2xl mb-2">🛒</p>
        <p class="text-lg font-semibold text-slate-700">Tu carrito está vacío</p>
        <p class="text-slate-500 mb-6">Agregá productos desde el catálogo para comenzar.</p>
        <a href="/productos" class="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition">Ver productos</a>
      </div>`;
    return;
  }

  const rows = cart
    .map(
      (i) => `
    <div class="flex gap-4 py-5 items-center" data-cart-row>
      <a href="/productos/${i.slug}/" class="shrink-0">
        <img src="${i.imagen}" alt="${i.title}" class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg" loading="lazy" />
      </a>
      <div class="flex-1 min-w-0">
        <a href="/productos/${i.slug}/" class="font-semibold text-slate-800 hover:text-brand-600 line-clamp-2">${i.title}</a>
        <p class="text-slate-500 text-sm">${formatPrice(i.precio)} / unidad</p>
        <div class="mt-2 flex items-center gap-2">
      <button type="button" data-qty data-slug="${i.slug}" data-action="dec" aria-label="Restar" class="w-8 h-8 rounded border border-slate-300 hover:bg-slate-100">−</button>
      <input type="number" value="${i.cantidad}" min="1" data-qty-input data-slug="${i.slug}" class="w-16 h-8 text-center border border-slate-300 rounded" />
      <button type="button" data-qty data-slug="${i.slug}" data-action="inc" aria-label="Sumar" class="w-8 h-8 rounded border border-slate-300 hover:bg-slate-100">+</button>
    </div>
      </div>
      <div class="text-right shrink-0">
        <p class="font-bold text-slate-900">${formatPrice(i.precio * i.cantidad)}</p>
        <button type="button" data-remove="${i.slug}" class="mt-2 text-sm text-red-500 hover:text-red-700">Quitar</button>
      </div>
    </div>`
    )
    .join('');

  container.innerHTML = rows;
  const totalEl = document.querySelector('[data-cart-total]');
  if (totalEl) totalEl.textContent = formatPrice(total);
}

export function cartInitialState() {
  return {
    visible: false,
    items: getItems(),
    ...summary(),
  };
}

export { items };