const mongoose = require('mongoose');

const slaPolicySchema = new mongoose.Schema(
  {
    priority: {
      type: String,
      enum: ['urgent', 'high', 'medium', 'low'],
      required: true,
      unique: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model('SlaPolicy', slaPolicySchema);

