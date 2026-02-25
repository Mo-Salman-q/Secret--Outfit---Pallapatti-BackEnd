const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const Product = require('../models/Product');

// Home page
router.get('/', optionalAuth, async (req, res) => {
  try {
    const fastMoving = await Product.find({}).sort({ createdAt: -1 }).limit(8).lean();
    res.render('index', {
      title: 'Home',
      user: req.user || null,
      fastMoving,
    });
  } catch (e) {
    res.render('index', {
      title: 'Home',
      user: req.user || null,
      fastMoving: [],
    });
  }
});

// Shop page (SSR + CSR)
router.get('/shop', optionalAuth, async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      const rx = new RegExp(search, 'i');
      filter.$or = [{ name: rx }, { description: rx }, { sku: rx }, { category: rx }];
    }
    let sortSpec = { createdAt: -1 };
    if (sort === 'price_asc') sortSpec = { price: 1 };
    if (sort === 'price_desc') sortSpec = { price: -1 };
    const products = await Product.find(filter).sort(sortSpec).lean();
    res.render('shop', {
      title: 'Shop',
      user: req.user || null,
      products,
      stylesheets: ['shop.css'],
      scripts: ['shop.js'],
    });
  } catch (e) {
    res.render('shop', {
      title: 'Shop',
      user: req.user || null,
      products: [],
      stylesheets: ['shop.css'],
      scripts: ['shop.js'],
    });
  }
});

// Product page
router.get('/product', optionalAuth, async (req, res) => {
  try {
    const id = req.query.id;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.redirect('/shop');
    }
    const product = await Product.findById(id).lean();
    if (!product) {
      return res.redirect('/shop');
    }
    res.render('product', {
      title: product.name || 'Product',
      user: req.user || null,
      product,
      stylesheets: ['product.css'],
      scripts: ['product.js'],
    });
  } catch (e) {
    res.redirect('/shop');
  }
});

router.get('/product/:id', optionalAuth, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.redirect('/shop');
    }
    const product = await Product.findById(id).lean();
    if (!product) {
      return res.redirect('/shop');
    }
    res.render('product', {
      title: product.name || 'Product',
      user: req.user || null,
      product,
      stylesheets: ['product.css'],
      scripts: ['product.js'],
    });
  } catch (e) {
    res.redirect('/shop');
  }
});

// Wishlist page
router.get('/wishlist', optionalAuth, (req, res) => {
  res.render('wishlist', {
    title: 'Wishlist',
    user: req.user || null,
    stylesheets: ['shop.css'],
    scripts: ['wishlist.js'],
  });
});

// Cart page
router.get('/cart', optionalAuth, (req, res) => {
  res.render('cart', {
    title: 'Cart',
    user: req.user || null,
    stylesheets: ['shop.css'],
    scripts: ['cart.js'],
  });
});

// Login page (no layout, no partials)
router.get('/login', optionalAuth, (req, res) => {
  // Redirect if already logged in
  if (req.user) {
    return res.redirect('/');
  }
  res.render('login', {
    title: 'Login',
    user: null,
    layout: null,
  });
});

// Signup page (no layout, no partials)
router.get('/signup', optionalAuth, (req, res) => {
  // Redirect if already logged in
  if (req.user) {
    return res.redirect('/');
  }
  res.render('signup', {
    title: 'Sign Up',
    user: null,
    layout: null,
  });
});

module.exports = router;
