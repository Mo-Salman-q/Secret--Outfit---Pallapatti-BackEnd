document.addEventListener('DOMContentLoaded', async () => {
  const sum = document.getElementById('buyProductSummary');
  const img = document.getElementById('buyProductImage');
  const params = new URLSearchParams(window.location.search);
  const productId = document.querySelector('input[name="productId"]')?.value || params.get('productId');
  const qty = parseInt(document.querySelector('input[name="qty"]')?.value || params.get('qty') || '1', 10);
  const size = document.querySelector('input[name="size"]')?.value || params.get('size') || 'M';
  let p = null;
  try {
    const resp = await fetch(`/api/products/${productId}`);
    if (resp.ok) p = await resp.json();
  } catch {}
  if (p) {
    if (sum) sum.textContent = `${p.name} • Size ${size} • Qty ${qty} • ₹${p.price}`;
    if (img) {
      const imageUrl = p.imageUrl || (p.images && p.images[0]?.large) || (p.images && p.images[0]?.thumb) || '';
      if (imageUrl) {
        img.src = imageUrl;
        img.style.display = 'block';
      }
    }
  }
});
