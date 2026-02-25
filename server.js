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

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// Start server (not gated on DB connect as requested)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});