const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  comparePrice: { type: Number, default: null },
  sku: { type: String, default: '' },
  category: { type: String, default: '', index: true },
  imageUrl: { type: String, required: true },
  sizes: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
