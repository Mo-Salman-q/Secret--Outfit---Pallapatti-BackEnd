const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const { optionalAuth } = require('./middleware/auth');
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Handlebars configuration
const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, '../frontend/views/layouts'),
  partialsDir: path.join(__dirname, '../frontend/views/partials'),
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Static files (accessible from public root)
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Apply optional auth middleware globally
app.use(optionalAuth);

// Routes
app.use('/api/products', productsRoutes);
app.use('/', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/', indexRoutes);

// 404 handler
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.status(404).send('404 - Page Not Found');
});

// Global Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

function maskUri(u) {
  try {
    const url = new URL(u);
    if (url.username) url.username = '****';
    if (url.password) url.password = '****';
    return url.toString();
  } catch { return u; }
}

async function connectDB() {
  try {
    const uri = (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) ||
      'mongodb+srv://mohamedsalman_db_user:sandahalal@cluster0.qy8lkg2.mongodb.net/secret-outfits';
    const options = {
      serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS) || 20000,
      socketTimeoutMS: 30000,
      retryWrites: true,
      family: 4,
    };
    console.log(`[DB] Connecting → ${maskUri(uri)}`);
    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    if (process.env.NODE_ENV === 'development' && process.env.SEED_PRODUCTS === 'true') {
      try {
        const count = await Product.countDocuments();
        if (count === 0) {
          await Product.insertMany([
            {
              name: 'Urban Overshirt Black',
              description: 'Premium streetwear overshirt crafted in heavy cotton with contrast stitching.',
              price: 1799,
              comparePrice: 2599,
              sku: 'UO-001',
              category: 'Shirts',
              imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80',
              sizes: ['S', 'M', 'L']
            }
          ]);
          console.log('Seeded sample product');
        }
      } catch (e) {
        console.warn('Seeding skipped due to error:', e.message);
      }
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // SRV lookup failing (DNS) – try direct seed list if provided
    if (/querySrv|ENOTFOUND|getaddrinfo/i.test(String(error.message)) && process.env.MONGODB_URI_DIRECT) {
      try {
        const direct = process.env.MONGODB_URI_DIRECT.trim();
        console.warn(`[DB] SRV lookup failed. Trying direct seed list → ${maskUri(direct)}`);
        const options = {
          serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS) || 20000,
          socketTimeoutMS: 30000,
          retryWrites: true,
          family: 4,
        };
        const conn = await mongoose.connect(direct, options);
        console.log(`MongoDB Connected (direct): ${conn.connection.host}`);
        return;
      } catch (e) {
        console.error('MongoDB direct connect error:', e.message);
      }
    }
    process.exit(1);
  }
}

// Connect to MongoDB (simple direct connect per your request)
connectDB();

// Start server (not gated on DB connect as requested)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
