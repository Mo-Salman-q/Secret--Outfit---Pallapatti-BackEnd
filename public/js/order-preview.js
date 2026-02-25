document.addEventListener('DOMContentLoaded', async () => {
  try {
    const dataEl = document.getElementById('orderData');
    if (!dataEl) return;
    const parsed = JSON.parse(dataEl.textContent || '{}');
    const cust = parsed.customer || {};
    const order = parsed.order || {};
    const number = parsed.whatsapp || '';
    let p = parsed.product || null;
    if (!p && order.productId) {
      try {
        const resp = await fetch(`/api/products/${order.productId}`);
        if (resp.ok) p = await resp.json();
      } catch {}
    }
    if (!p) return;
    const qty = Number(order.qty) || 1;
    const priceVal = Number(p.price) || 0;
    const total = priceVal * qty;
    const priceText = priceVal.toLocaleString('en-IN');
    const totalText = total.toLocaleString('en-IN');
    const address = [cust.address1, cust.address2, cust.city, cust.state, cust.zip].filter(Boolean).join(', ');
    const imageUrl = p.imageUrl || (p.images && p.images[0]?.large) || (p.images && p.images[0]?.thumb) || '';
    const productPageUrl = `${window.location.origin}/product?id=${order.productId}`;
    const structured = [
      '🧾 *New Order Request*',
      '',
      `🆔 Order ID: ${order.orderId || ''}`,
      '',
      '👤 *Customer Details*',
      `Name: ${cust.name || ''}`,
      `Phone: ${cust.phone || ''}`,
      `Address: ${address}`,
      '',
      '🛍️ *Product Details*',
      `Product: ${p.name}`,
      `Size: ${order.size || ''}`,
      `Quantity: ${qty}`,
      `Price (1): ₹${priceText}`,
      `Total: ₹${totalText}`,
      '',
      `🖼️ Image: ${imageUrl}`,
      `🔗 View Product: ${productPageUrl}`,
      '',
      '✨ Send this message, our team will contact you shortly.'
    ].join('\n');
    const pv = document.getElementById('previewProduct');
    const cv = document.getElementById('previewCustomer');
    const tv = document.getElementById('previewTotal');
    const btn = document.getElementById('sendWhatsapp');
    if (pv) pv.textContent = `${p.name} • Qty ${qty} • Size ${order.size || ''} • ₹${priceText}`;
    if (tv) tv.textContent = `Total: ₹${totalText} (₹${priceText} × ${qty})`;
    if (cv) cv.textContent = `${cust.name || ''} • ${cust.phone || ''} • ${address}`;
    if (btn && number) {
      btn.href = `https://wa.me/${number}?text=${encodeURIComponent(structured)}`;
    }
  } catch {}
});
