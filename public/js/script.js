// DOM Elements (guarded where appropriate so file can be used on all pages)
const mainContent = document.getElementById('mainContent');
const categoryPage = document.getElementById('categoryPage');
const searchOverlay = document.getElementById('searchOverlay');
const cartDrawer = document.getElementById('cartDrawer');
const searchBtn = document.getElementById('searchBtn');
const closeSearch = document.getElementById('closeSearch');
const cartBtn = document.getElementById('cartBtn');
const closeCart = document.getElementById('closeCart');
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

// Navigation helpers
function goToShop() { window.location.href = '/shop'; }
function goHome() { window.location.href = '/'; }

// Search Overlay
if (searchBtn && searchOverlay) {
  searchBtn.addEventListener('click', () => {
    searchOverlay.style.display = 'flex';
    const si = document.getElementById('searchInput');
    if (si) { setTimeout(() => si.focus(), 0); }
  });
}
if (closeSearch && searchOverlay) {
  closeSearch.addEventListener('click', () => { searchOverlay.style.display = 'none'; });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && searchOverlay && searchOverlay.style.display === 'flex') {
    searchOverlay.style.display = 'none';
  }
});

// Mini cart renderers
function renderCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (badge && window.getCartCount) {
    const c = window.getCartCount();
    badge.textContent = String(c);
  }
}
function renderMiniCart() {
  const countEl = document.getElementById('miniCount');
  const totalEl = document.getElementById('miniTotal');
  const itemsEl = document.getElementById('miniCartItems');
  if (countEl && window.getCartCount) countEl.textContent = String(window.getCartCount());
  if (totalEl && window.getCartTotal) totalEl.textContent = '₹' + window.getCartTotal().toLocaleString('en-IN');
  if (itemsEl && window.getCartItems) {
    const items = window.getCartItems();
    const PRODUCTS = window.PRODUCTS || {};
    itemsEl.innerHTML = items.slice(0,3).map(i => {
      const p = PRODUCTS[i.productId];
      if (!p) return '';
      return `<div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
        <img src="${p.images?.[0]?.thumb || ''}" alt="${p.name}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;">
        <div style="flex:1;">
          <div style="font-size:14px;">${p.name}</div>
          <div style="font-size:12px;color:#666;">Size ${i.size} • Qty ${i.qty}</div>
        </div>
        <div style="font-weight:600;">₹${(p.price * i.qty).toLocaleString('en-IN')}</div>
      </div>`;
    }).join('');
  }
}
document.addEventListener('DOMContentLoaded', () => {
  renderCartBadge();
  renderMiniCart();
  window.addEventListener('storage', (e) => {
    if (e.key === 'cart_items') {
      renderCartBadge();
      renderMiniCart();
    }
  });
});

function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => { el.classList.remove('show'); }, 1500);
}
// Quick Add global enhancement: if data-product-id exists, add to cart
document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.classList && t.classList.contains('quick-add') && t.hasAttribute('data-product-id')) {
    const pid = t.getAttribute('data-product-id');
    if (pid && window.addToCart) {
      e.preventDefault();
      e.stopPropagation();
      window.addToCart(pid, 1, 'M');
      renderCartBadge();
      showToast('Your item has been added');
      if (loaderManager) {
        loaderManager.show(); setTimeout(() => loaderManager.hide(), 600);
      }
    }
  }
});

// Wishlist toggle global handler
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-wishlist-toggle]');
  if (btn) {
    e.preventDefault();
    e.stopPropagation();
    const id = btn.getAttribute('data-wishlist-toggle');
    if (window.toggleWishlist && id) {
      window.toggleWishlist(id);
      btn.innerHTML = '<i class="fas fa-heart" style="color:#fff"></i>';
      btn.style.background = '#ff0000';
      showToast('Your item has been added');
    }
  }
});

// Search input handling (header and overlay)
document.addEventListener('DOMContentLoaded', () => {
  const inputs = document.querySelectorAll('.search-input, .search-bar-desktop input');
  inputs.forEach(inp => {
    inp.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        const term = inp.value.trim();
        if (term.length) {
          window.location.href = `/shop?search=${encodeURIComponent(term)}`;
        }
        if (searchOverlay) searchOverlay.style.display = 'none';
      }
    });
  });
  const submitBtn = document.getElementById('searchSubmit');
  const overlayInput = document.getElementById('searchInput');
  if (submitBtn && overlayInput) {
    submitBtn.addEventListener('click', () => {
      const term = overlayInput.value.trim();
      if (term.length) {
        window.location.href = `/shop?search=${encodeURIComponent(term)}`;
      }
      if (searchOverlay) searchOverlay.style.display = 'none';
    });
  }
});

// Wishlist button
const wishlistBtn = document.getElementById('wishlistBtn');
if (wishlistBtn) {
  wishlistBtn.addEventListener('click', function() {
    window.location.href = '/wishlist';
  });
}

// Mobile menu drawer toggle
if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
        const isOpen = mobileMenu.style.right === '0px' || mobileMenu.style.right === '0';
        mobileMenu.style.right = isOpen ? '-100%' : '0';
    });
    // allow closing mobile menu by clicking close button inside
    const mobileClose = mobileMenu.querySelector('.mobile-close');
    if (mobileClose) mobileClose.addEventListener('click', () => { mobileMenu.style.right = '-100%'; });
}

// Logo click returns home (guarded)
const logoEl = document.querySelector('.logo');
if (logoEl) logoEl.addEventListener('click', goHome);
