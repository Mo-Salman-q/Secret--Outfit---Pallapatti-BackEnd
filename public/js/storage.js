// Cart & Wishlist persistence helpers using localStorage

const CART_KEY = 'cart_items';
const WISHLIST_KEY = 'wishlist_items';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return fallback;
  }
}

// CART
window.getCartItems = function () {
  const val = readJSON(CART_KEY, []);
  if (!Array.isArray(val)) return [];
  // sanitize
  return val
    .filter(i => i && typeof i.productId === 'string' && i.productId.length > 0)
    .map(i => ({
      productId: String(i.productId),
      qty: Math.max(1, Number(i.qty) || 1),
      size: i.size || 'M'
    }));
};

window.saveCartItems = function (items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

window.addToCart = function (productId, qty = 1, size = 'M') {
  const items = getCartItems();
  const existing = items.find(i => i.productId === productId && i.size === size);
  if (existing) {
    existing.qty += qty;
  } else {
    items.push({ productId, qty, size });
  }
  saveCartItems(items);
};

window.removeFromCart = function (productId, size = 'M') {
  const items = getCartItems().filter(
    i => !(i.productId === productId && i.size === size)
  );
  saveCartItems(items);
};

window.setCartQty = function (productId, size, qty) {
  let items = getCartItems();
  items = items.map(i => {
    if (i.productId === productId && i.size === size) {
      return { ...i, qty: Math.max(1, qty) };
    }
    return i;
  });
  saveCartItems(items);
};

window.getCartCount = function () {
  const items = getCartItems();
  const count = items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
  return Math.max(0, count);
};

window.getCartTotal = function () {
  const products = window.PRODUCTS || {};
  return getCartItems().reduce((sum, item) => {
    const p = products[item.productId];
    if (!p) return sum;
    return sum + p.price * item.qty;
  }, 0);
};

// WISHLIST
window.getWishlistItems = function () {
  return readJSON(WISHLIST_KEY, []);
};

window.saveWishlistItems = function (items) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
};

window.toggleWishlist = function (productId) {
  let items = getWishlistItems();
  if (items.includes(productId)) {
    items = items.filter(id => id !== productId);
  } else {
    items.push(productId);
  }
  saveWishlistItems(items);
};

window.isWishlisted = function (productId) {
  return getWishlistItems().includes(productId);
};




