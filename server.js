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

const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// Middleware
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ======================
// Handlebars Config
// ======================
const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// ======================
// Static Files
// ======================
app.use(express.static(path.join(__dirname, 'public')));

// ======================
// Auth Middleware
// ======================
app.use(optionalAuth);

// ======================
// Routes
// ======================
app.use('/api/products', productsRoutes);
app.use('/', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/', indexRoutes);

// ======================
// 404 Handler
// ======================
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.status(404).render('404');
});

// ======================
// Global Error Handler
// ======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('404');
});

// ======================
// MongoDB Connection
// ======================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// ======================
// Start Server
// ======================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});