const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cropType: {
    type: String,
    required: [true, 'Crop type is required'],
    enum: [
      'wheat', 'rice', 'maize', 'cotton', 'soybean', 'sugarcane',
      'tomato', 'potato', 'onion', 'groundnut', 'sunflower', 'barley', 'other'
    ]
  },
  cropStage: {
    type: String,
    enum: ['seedling', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvest'],
    default: 'vegetative'
  },
  location: {
    address: { type: String, default: '' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  symptoms: {
    type: String,
    required: [true, 'Symptom description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  images: [{
    filename: String,
    originalName: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  }],
  affectedArea: {
    value: { type: Number, default: 0 },
    unit: { type: String, enum: ['sqm', 'acres', 'hectares'], default: 'acres' }
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  aiAnalysis: {
    detectedDisease: { type: String, default: '' },
    confidence: { type: Number, default: 0 }, // percentage
    possibleDiseases: [{ name: String, confidence: Number }],
    recommendations: [String],
    urgency: { type: String, enum: ['monitor', 'treat_soon', 'treat_immediately', 'consult_expert'] },
    analyzedAt: { type: Date }
  },
  status: {
    type: String,
    enum: ['pending', 'analyzing', 'analyzed', 'advisory_sent', 'resolved', 'escalated'],
    default: 'pending'
  },
  expertReview: {
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
    finalDiagnosis: { type: String, default: '' },
    reviewedAt: { type: Date }
  },
  weatherConditions: {
    temperature: Number,
    humidity: Number,
    rainfall: Number,
    recordedAt: Date
  },
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for efficient querying
reportSchema.index({ user: 1, createdAt: -1 });
reportSchema.index({ cropType: 1, status: 1 });
reportSchema.index({ 'aiAnalysis.detectedDisease': 1 });

module.exports = mongoose.model('Report', reportSchema);
