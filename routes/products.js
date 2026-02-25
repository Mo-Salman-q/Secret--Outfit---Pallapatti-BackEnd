const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sort } = req.query;
    const filter = {};
    if (category) {
      filter.category = category;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (q) {
      const rx = new RegExp(q, 'i');
      filter.$or = [
        { name: rx },
        { description: rx },
        { sku: rx },
        { category: rx },
      ];
    }
    let sortSpec = { createdAt: -1 };
    if (sort === 'price_asc') sortSpec = { price: 1 };
    if (sort === 'price_desc') sortSpec = { price: -1 };
    const products = await Product.find(filter).sort(sortSpec);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ error: 'Not found' });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create product (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, price, imageUrl } = req.body;
    if (!name || typeof name !== 'string' || !price || isNaN(Number(price)) || !imageUrl) {
      return res.status(400).json({ message: 'name, price and imageUrl are required' });
    }
    const payload = sanitizePayload(req.body);
    const created = await Product.create(payload);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update product (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const updates = sanitizePayload(req.body);
    const updated = await Product.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete product (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed products (admin only, development convenience)
router.post('/seed', authMiddleware, adminOnly, async (req, res) => {
  try {
    if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: 'Seeding allowed only in development' });
    }
    const existing = await Product.countDocuments();
    if (existing > 0) {
      return res.status(400).json({ message: 'Products already exist' });
    }
    const samples = [
      {
        name: 'Urban Overshirt Black',
        description: 'Premium streetwear overshirt crafted in heavy cotton with contrast stitching.',
        price: 1799,
        comparePrice: 2599,
        sku: 'UO-001',
        category: 'Shirts',
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
        sizes: ['S', 'M', 'L']
      },
      {
        name: 'Graphic Tee White',
        description: 'Classic graphic tee featuring bold streetwear aesthetic.',
        price: 1299,
        sku: 'GT-001',
        category: 'Tees',
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80',
        sizes: ['S', 'M', 'L']
      },
      {
        name: 'Classic Denim Shirt',
        description: 'Timeless denim shirt with a modern twist.',
        price: 2199,
        sku: 'DS-001',
        category: 'Shirts',
        imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80',
        sizes: ['M', 'L']
      },
      {
        name: 'Linen Camp Collar',
        description: 'Breathable linen camp collar shirt perfect for warm weather.',
        price: 1999,
        sku: 'LC-001',
        category: 'Shirts',
        imageUrl: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=900&q=80',
        sizes: ['S', 'M']
      }
    ];
    const inserted = await Product.insertMany(samples);
    res.status(201).json(inserted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function sanitizePayload(body) {
  const allowed = ['name', 'description', 'price', 'comparePrice', 'sku', 'category', 'imageUrl', 'sizes'];
  const payload = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      payload[key] = body[key];
    }
  }
  return payload;
}

module.exports = router;
