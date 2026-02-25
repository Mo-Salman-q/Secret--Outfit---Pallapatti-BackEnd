const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { optionalAuth } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Buy page: collects customer details
router.get('/buy', optionalAuth, async (req, res) => {
  try {
    const { productId, qty = 1, size = 'M' } = req.query;
    if (!productId) {
      return res.redirect('/shop');
    }
    res.render('buy', {
      title: 'Delivery Details',
      user: req.user || null,
      stylesheets: ['product.css'],
      scripts: ['buy.js'],
      productId,
      qty,
      size,
    });
  } catch (e) {
    res.redirect('/shop');
  }
});

// Create order and render preview with WhatsApp
router.post('/order/preview', optionalAuth, async (req, res) => {
  try {
    const {
      name, phone, email, address1, address2, city, state, zip,
      productId, qty = 1, size = 'M'
    } = req.body;

    if (!productId || !name || !phone || !address1 || !city || !state || !zip) {
      return res.status(400).render('order-preview', {
        title: 'Order Preview',
        user: req.user || null,
        error: 'Please fill all required fields.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).render('order-preview', {
        title: 'Order Preview',
        user: req.user || null,
        error: 'Invalid product id.',
        scripts: ['order-preview.js'],
      });
    }
    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).render('order-preview', {
        title: 'Order Preview',
        user: req.user || null,
        error: 'Product not found.',
        scripts: ['order-preview.js'],
      });
    }

    const imageUrl = product.imageUrl || (product.images && product.images[0]?.large) || (product.images && product.images[0]?.thumb) || '';
    const orderId = 'ORD' + Date.now();
    const price = Number(product.price) || 0;

    const orderDoc = await Order.create({
      orderId,
      product: product._id,
      productName: product.name,
      productImageUrl: imageUrl,
      price,
      qty: Number(qty) || 1,
      size,
      customer: { name, phone, email: email || '', address1, address2: address2 || '', city, state, zip }
    });

    const whatsapp = process.env.WHATSAPP_NUMBER || '';

    res.render('order-preview', {
      title: 'Order Preview',
      user: req.user || null,
      order: orderDoc.toObject(),
      product,
      whatsapp,
      scripts: ['order-preview.js'],
    });
  } catch (e) {
    res.status(400).render('order-preview', {
      title: 'Order Preview',
      user: req.user || null,
      error: 'Failed to create order.',
      scripts: ['order-preview.js'],
    });
  }
});

module.exports = router;
