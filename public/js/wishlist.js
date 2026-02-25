// Render wishlist page using PRODUCTS + storage helpers

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('wishlistGrid');
  const emptyState = document.getElementById('emptyWishlist');
  const countText = document.getElementById('wishlistCountText');
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
    const ids = window.getWishlistItems ? window.getWishlistItems() : [];
    if (!grid || !emptyState || !countText) return;
    if (!ids.length) {
      grid.style.display = 'none';
      emptyState.style.display = 'block';
      countText.textContent = '0 items in your wishlist';
      return;
    }
    await ensureProducts(ids);
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    countText.textContent = `${ids.length} item${ids.length > 1 ? 's' : ''} in your wishlist`;
    grid.innerHTML = '';
    ids.forEach(id => {
      const product = window.PRODUCTS[id];
      if (!product) return;
      const imgSrc = product.imageUrl || (product.images && product.images[0]?.thumb) || '';
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <a href="/product?id=${id}" style="text-decoration:none; color:inherit;">
          <div class="product-badge">Saved</div>
          <img src="${imgSrc}" class="product-image" alt="${product.name}">
          <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-price">₹${product.price.toLocaleString('en-IN')}</p>
          </div>
        </a>
        <div style="padding: 0 12px 12px; display:flex; gap:8px;">
          <button class="quick-add" data-wishlist-add="${id}">Add to Cart</button>
          <button class="quick-add" style="background:#f5f5f5;color:#111;" data-wishlist-remove="${id}">
            Remove
          </button>
        </div>
      `;
      grid.appendChild(card);
    });
  }
  await render();
  document.addEventListener('click', async (e) => {
    const addBtn = e.target.closest('[data-wishlist-add]');
    const removeBtn = e.target.closest('[data-wishlist-remove]');
    if (addBtn) {
      const id = addBtn.getAttribute('data-wishlist-add');
      if (window.addToCart) window.addToCart(id, 1, 'M');
      addBtn.textContent = 'Added ✓';
      setTimeout(() => { addBtn.textContent = 'Add to Cart'; }, 1000);
    }
    if (removeBtn) {
      const id = removeBtn.getAttribute('data-wishlist-remove');
      if (window.toggleWishlist) window.toggleWishlist(id);
      await render();
    }
  });
});





