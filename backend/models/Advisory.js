const mongoose = require('mongoose');

const advisorySchema = new mongoose.Schema({
  report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  diseaseInfo: {
    name: { type: String, required: true },
    scientificName: { type: String, default: '' },
    category: { type: String, enum: ['fungal', 'bacterial', 'viral', 'pest', 'nutritional', 'environmental', 'unknown'], default: 'unknown' },
    description: { type: String, default: '' }
  },
  treatment: {
    immediate: [{ action: String, product: String, dosage: String, frequency: String }],
    preventive: [String],
    organic: [String],
    chemical: [{ name: String, activeIngredient: String, applicationRate: String, safetyPrecautions: String }]
  },
  management: {
    shortTerm: [String],
    longTerm: [String],
    cropRotation: { type: String, default: '' },
    soilManagement: [String]
  },
  estimatedYieldLoss: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    unit: { type: String, default: 'percent' }
  },
  economicImpact: { type: String, default: '' },
  sources: [{ title: String, url: String }],
  generatedBy: {
    type: String,
    enum: ['ai', 'expert', 'hybrid'],
    default: 'ai'
  },
  isRead: { type: Boolean, default: false },
  feedback: {
    helpful: { type: Boolean },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, default: '' }
  }
}, { timestamps: true });

advisorySchema.index({ user: 1, createdAt: -1 });
advisorySchema.index({ report: 1 });

module.exports = mongoose.model('Advisory', advisorySchema);
