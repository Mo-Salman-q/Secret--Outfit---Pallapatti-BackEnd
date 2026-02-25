document.addEventListener('DOMContentLoaded', async () => {
  const list = document.getElementById('cartList');
  const totalEl = document.getElementById('cartTotal');
  const empty = document.getElementById('emptyCart');

  async function ensureProducts(ids) {
    if (!window.PRODUCTS || !Object.keys(window.PRODUCTS).length) {
      if (window.fetchProducts) await window.fetchProducts();
    }
    const missing = ids.filter(id => !window.PRODUCTS || !window.PRODUCTS[id]);
    for (const id of missing) {
      try {
        const resp = await fetch(`/api/products/${id}`);
        if (resp.ok) {
          const p = await resp.json();
          const imgArr = p.imageUrl ? [{ thumb: p.imageUrl, large: p.imageUrl }] : (p.images || []);
          window.PRODUCTS = window.PRODUCTS || {};
          window.PRODUCTS[p._id] = { ...p, images: imgArr };
        }
      } catch {}
    }
  }

  async function render() {
    const items = window.getCartItems ? window.getCartItems() : [];
    const badge = document.querySelector('.cart-badge');
    if (badge && window.getCartCount) badge.textContent = String(window.getCartCount());
    if (!items.length) {
      if (list) list.style.display = 'none';
      if (empty) empty.style.display = 'block';
      if (totalEl) totalEl.textContent = '₹0';
      return;
    }
    await ensureProducts(items.map(i => i.productId));
    if (!list) return;
    list.style.display = 'grid';
    if (empty) empty.style.display = 'none';
    list.innerHTML = '';
    let total = 0;
    items.forEach(it => {
      const p = window.PRODUCTS[it.productId];
      if (!p) return;
      total += p.price * it.qty;
      const imgSrc = p.imageUrl || (p.images && p.images[0]?.thumb) || '';
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <a href="/product?id=${it.productId}" style="text-decoration:none; color:inherit;">
          <img src="${imgSrc}" class="product-image" alt="${p.name}">
          <div class="product-info">
            <h3 class="product-title">${p.name}</h3>
            <p class="product-price">₹${p.price.toLocaleString('en-IN')}</p>
            <p style="font-size:12px; color:#666;">Size ${it.size} • Qty ${it.qty}</p>
          </div>
        </a>
        <div style="padding: 0 12px 12px; display:flex; gap:8px;">
          <button class="quick-add" data-buy="${it.productId}" data-size="${it.size}" data-qty="${it.qty}">Buy Now</button>
          <button class="quick-add" style="background:#f5f5f5;color:#111;" data-remove="${it.productId}" data-size="${it.size}">Remove</button>
        </div>
      `;
      list.appendChild(card);
    });
    if (totalEl) totalEl.textContent = '₹' + total.toLocaleString('en-IN');
  }

  await render();
  document.addEventListener('click', async (e) => {
    const buy = e.target.closest('[data-buy]');
    const rem = e.target.closest('[data-remove]');
    if (buy) {
      const id = buy.getAttribute('data-buy');
      const size = buy.getAttribute('data-size') || 'M';
      const qty = buy.getAttribute('data-qty') || '1';
      window.location.href = `/buy?productId=${id}&qty=${qty}&size=${encodeURIComponent(size)}`;
    }
    if (rem) {
      const id = rem.getAttribute('data-remove');
      const size = rem.getAttribute('data-size') || 'M';
      if (window.removeFromCart) {
        window.removeFromCart(id, size);
      }
      await render();
    }
  });
});
