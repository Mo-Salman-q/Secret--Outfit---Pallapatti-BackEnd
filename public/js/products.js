// Shared product catalog for SECRET OUTFITS
// Exposed on window.PRODUCTS so all pages can reuse it.

window.PRODUCTS = {};
window.PRODUCTS_LOADED = false;

window.fetchProducts = async (opts = null) => {
  // If options are provided (e.g., search), always fetch fresh and bypass cache
  if (!opts && window.PRODUCTS_LOADED) return window.PRODUCTS;

  try {
    let url = '/api/products';
    if (opts) {
      const params = new URLSearchParams();
      if (opts.q) params.set('q', opts.q);
      if (opts.category) params.set('category', opts.category);
      if (opts.minPrice) params.set('minPrice', String(opts.minPrice));
      if (opts.maxPrice) params.set('maxPrice', String(opts.maxPrice));
      if (opts.sort) params.set('sort', opts.sort);
      url += `?${params.toString()}`;
    }
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();

      // Transform array to object mapped by ID for compatibility
      const productMap = {};
      data.forEach(p => {
        productMap[p._id] = {
          ...p,
          // Handle cases where the backend supplies a direct imageUrl vs images array
          images: p.imageUrl ? [
            { thumb: p.imageUrl, large: p.imageUrl }
          ] : p.images || []
        };
      });

      if (!opts) {
        window.PRODUCTS = productMap;
        window.PRODUCTS_LOADED = true;
      }
      return productMap;
    } else {
      console.error('Failed to fetch products from API:', res.statusText);
      return {};
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    return {};
  }
};


