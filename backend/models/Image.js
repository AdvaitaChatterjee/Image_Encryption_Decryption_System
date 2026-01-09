const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  encryptedPath: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: String,
    default: 'anonymous'
  }
});

module.exports = mongoose.model('Image', imageSchema);
