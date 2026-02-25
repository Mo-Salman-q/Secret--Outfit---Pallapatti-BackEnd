function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function getSSRProduct() {
  const el = document.getElementById('productData');
  if (!el) return null;
  try { return JSON.parse(el.textContent); } catch { return null; }
}

function getCurrentProductId(preferAttrEl) {
  if (preferAttrEl && preferAttrEl.getAttribute) {
    const attr = preferAttrEl.getAttribute('data-product-id');
    if (attr) return attr;
  }
  const ssr = getSSRProduct();
  if (ssr && ssr._id) return ssr._id;
  const q = getUrlParam('id');
  if (q) return q;
  const seg = location.pathname.split('/').filter(Boolean).pop();
  return seg || '';
}

async function loadProduct() {
  const ssr = getSSRProduct();
  if (ssr) { renderProduct(ssr); return; }
  const productId = getCurrentProductId();
  let p = null;
  try {
    const res = await fetch(`/api/products/${productId}`);
    if (res.ok) p = await res.json();
  } catch {}
  if (p) renderProduct(p);
}

function renderProduct(product) {
  document.title = product.name + ' — SECRET OUTFITS';
  const mainImg = document.getElementById('mainImg');
  if (mainImg) {
    const src = product.imageUrl || (product.images && product.images[0]?.large) || (product.images && product.images[0]?.thumb) || '';
    if (src) { mainImg.src = src; mainImg.alt = product.name; }
  }
  const thumbsContainer = document.querySelector('.thumbs');
  if (thumbsContainer) {
    thumbsContainer.innerHTML = '';
    if (product.images && product.images.length) {
      product.images.forEach(img => {
        const t = document.createElement('img');
        t.className = 'thumb';
        t.src = img.thumb || img.large || '';
        t.setAttribute('data-large', img.large || img.thumb || '');
        thumbsContainer.appendChild(t);
      });
    } else if (product.imageUrl) {
      const t = document.createElement('img');
      t.className = 'thumb';
      t.src = product.imageUrl;
      t.setAttribute('data-large', product.imageUrl);
      thumbsContainer.appendChild(t);
    }
  }
  const nameEl = document.querySelector('.product-name');
  if (nameEl) nameEl.textContent = product.name;
  const priceEl = document.querySelector('.price');
  if (priceEl) priceEl.textContent = '₹' + product.price;
  const compareEl = document.querySelector('.compare');
  if (compareEl) {
    if (product.comparePrice) { compareEl.textContent = '₹' + product.comparePrice; compareEl.style.display = 'block'; }
    else { compareEl.style.display = 'none'; }
  }
  const skuEl = document.querySelector('.sku');
  if (skuEl && product.sku) skuEl.textContent = 'SKU: ' + product.sku;
  const descP = document.querySelector('.description p');
  if (descP) descP.textContent = product.description || '';
  const addCartBtn = document.getElementById('addCart');
  const wishBtn = document.getElementById('wish');
  const buyNowBtn = document.getElementById('buyNow');
  if (addCartBtn) addCartBtn.setAttribute('data-product-id', product._id);
  if (wishBtn) wishBtn.setAttribute('data-product-id', product._id);
  if (buyNowBtn) buyNowBtn.setAttribute('data-product-id', product._id);
  document.querySelectorAll('.thumb').forEach(t => {
    t.addEventListener('click', (e) => {
      const large = e.currentTarget.getAttribute('data-large');
      if (large && mainImg) mainImg.src = large;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadProduct();
  const incr = document.getElementById('incr');
  const decr = document.getElementById('decr');
  const qtyInput = document.getElementById('qtyInput');
  if (incr) incr.addEventListener('click', () => { qtyInput.value = Math.max(1, Number(qtyInput.value) + 1); });
  if (decr) decr.addEventListener('click', () => { qtyInput.value = Math.max(1, Number(qtyInput.value) - 1); });
});

document.addEventListener('click', (e) => {
  const addBtn = e.target.closest('#addCart');
  const buyBtn = e.target.closest('#buyNow');
  const wishBtn = e.target.closest('#wish');
  const qtyInput = document.getElementById('qtyInput');
  const sizeSel = document.getElementById('sizeSelect');
  if (addBtn) {
    e.preventDefault();
    const productId = getCurrentProductId(addBtn);
    const qty = Number(qtyInput?.value) || 1;
    const size = sizeSel?.value || 'M';
    if (window.addToCart) window.addToCart(productId, qty, size);
    const badge = document.querySelector('.cart-badge');
    if (badge && window.getCartCount) badge.textContent = String(window.getCartCount());
    if (typeof showToast === 'function') showToast('Your item has been added');
  }
  if (buyBtn) {
    e.preventDefault();
    const productId = getCurrentProductId(buyBtn);
    const qty = Number(qtyInput?.value) || 1;
    const size = sizeSel?.value || 'M';
    window.location.href = `/buy?productId=${productId}&qty=${qty}&size=${encodeURIComponent(size)}`;
  }
  if (wishBtn) {
    e.preventDefault();
    const productId = getCurrentProductId(wishBtn);
    if (window.toggleWishlist) window.toggleWishlist(productId);
    wishBtn.innerHTML = '<i class="fas fa-heart" style="color:#ff0000"></i> Wishlist';
    if (typeof showToast === 'function') showToast('Your item has been added');
  }
});
