// Shop page behavior enhancements
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const count = document.getElementById('shopCount');
  const grid = document.getElementById('shopGrid');

  // If server already rendered products, just update count and wishlist icons
  let cards = grid ? Array.from(grid.querySelectorAll('.product-card')) : [];
  if (cards.length) {
    if (count) {
      count.textContent = `${cards.length} products • Free shipping on orders above ₹999`;
    }
  } else if (window.fetchProducts) {
    // Fallback: client-render if server has no products bound
    let productMap = {};
    if (search || category) {
      productMap = await window.fetchProducts({ q: search, category });
    } else {
      productMap = await window.fetchProducts();
    }
    if (grid) {
      grid.innerHTML = '';
      const values = Object.values(productMap);
      if (count) {
        count.textContent = values.length
          ? `${values.length} products • Free shipping on orders above ₹999`
          : 'No products found';
      }
      if (!values.length) {
        const empty = document.createElement('div');
        empty.style.cssText = 'text-align:center;color:#666;padding:40px 0;';
        empty.textContent = 'No products available';
        grid.appendChild(empty);
      } else {
        values.forEach(p => {
          const a = document.createElement('a');
          a.href = `/product?id=${p._id}`;
          a.className = 'product-card';
          const imgSrc = p.imageUrl || (p.images && p.images[0] && p.images[0].thumb) || '';
          const compare = p.comparePrice ? `<span style="text-decoration: line-through; color: #999; font-size: 14px; margin-left: 5px;">₹${p.comparePrice}</span>` : '';
          a.innerHTML = `
            <button class="product-badge" style="right:10px; left:auto;" data-wishlist-toggle="${p._id}"><i class="far fa-heart"></i></button>
            <img src="${imgSrc}" class="product-image" alt="${p.name}">
            <div class="product-info">
              <h3 class="product-title">${p.name}</h3>
              <p class="product-price">₹${p.price}${compare}</p>
              <button class="quick-add" data-product-id="${p._id}">Quick Add</button>
            </div>
          `;
          grid.appendChild(a);
        });
        cards = Array.from(grid.querySelectorAll('.product-card'));
      }
    }
  }

  if (count && (!grid || !cards.length)) {
    count.textContent = 'No products available';
  }
  const initWishlistIcons = () => {
    const toggles = document.querySelectorAll('[data-wishlist-toggle]');
    toggles.forEach(btn => {
      const id = btn.getAttribute('data-wishlist-toggle');
      if (window.isWishlisted && window.isWishlisted(id)) {
        btn.innerHTML = '<i class="fas fa-heart" style="color:#fff"></i>';
        btn.style.background = '#ff0000';
      }
    });
  };
  initWishlistIcons();
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.quick-add');
    if (addBtn) {
      e.preventDefault();
      const pidAttr = addBtn.getAttribute('data-product-id');
      const productId = pidAttr || null;
      if (productId && window.addToCart && window.getCartCount) {
        window.addToCart(productId, 1, 'M');
        const badge = document.querySelector('.cart-badge');
        if (badge) badge.textContent = String(window.getCartCount());
        addBtn.textContent = 'Added!';
        addBtn.style.background = '#00a000';
        setTimeout(() => { addBtn.textContent = 'Quick Add'; addBtn.style.background = ''; }, 1200);
      }
      return;
    }
    const wishToggle = e.target.closest('[data-wishlist-toggle]');
    if (wishToggle) {
      e.preventDefault();
      const id = wishToggle.getAttribute('data-wishlist-toggle');
      if (window.toggleWishlist) {
        window.toggleWishlist(id);
        wishToggle.innerHTML = '<i class="fas fa-heart" style="color:#fff"></i>';
        wishToggle.style.background = '#ff0000';
        if (typeof showToast === 'function') showToast('Your item has been added');
      }
    }
  });
});
