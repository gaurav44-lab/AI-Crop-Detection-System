/**
 * AI Service Integration
 * Connects to OpenAI GPT-4 Vision or any custom AI model API
 * Replace the implementation with your preferred AI provider
 */

const DISEASE_DATABASE = {
  wheat: ['wheat_rust', 'powdery_mildew', 'septoria_leaf_blotch', 'fusarium_head_blight'],
  rice: ['rice_blast', 'brown_spot', 'bacterial_leaf_blight', 'sheath_blight'],
  maize: ['northern_corn_leaf_blight', 'gray_leaf_spot', 'common_rust', 'ear_rot'],
  tomato: ['early_blight', 'late_blight', 'fusarium_wilt', 'bacterial_speck', 'leaf_mold'],
  potato: ['late_blight', 'early_blight', 'scab', 'blackleg'],
  cotton: ['bacterial_blight', 'fusarium_wilt', 'alternaria_leaf_spot'],
};

const ADVISORY_TEMPLATES = {
  wheat_rust: {
    diseaseInfo: {
      name: 'Wheat Rust (Stripe Rust)',
      scientificName: 'Puccinia striiformis',
      category: 'fungal',
      description: 'A fungal disease causing yellow/orange stripes on leaves, reducing photosynthesis and grain yield significantly.'
    },
    treatment: {
      immediate: [
        { action: 'Apply fungicide spray', product: 'Propiconazole 25% EC', dosage: '1ml/L water', frequency: 'Every 14-21 days' }
      ],
      preventive: ['Use rust-resistant varieties', 'Ensure proper plant spacing', 'Monitor fields regularly'],
      organic: ['Neem oil spray (5ml/L)', 'Remove infected plant debris', 'Crop rotation with non-host crops'],
      chemical: [{ name: 'Tebuconazole', activeIngredient: 'Tebuconazole 25.9% EW', applicationRate: '1L/ha', safetyPrecautions: 'Use PPE, avoid during flowering' }]
    },
    estimatedYieldLoss: { min: 10, max: 70 }
  }
};

class AIService {
  async analyzeDisease({ cropType, symptoms, severity, images }) {
    // In production, replace with actual API call:
    // const response = await fetch(process.env.AI_API_URL + '/chat/completions', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${process.env.AI_API_KEY}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     model: 'gpt-4-vision-preview',
    //     messages: [{
    //       role: 'user',
    //       content: [
    //         { type: 'text', text: buildPrompt(cropType, symptoms) },
    //         ...images.map(img => ({ type: 'image_url', image_url: { url: img.path } }))
    //       ]
    //     }]
    //   })
    // });

    // MOCK RESPONSE for development:
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

    const cropDiseases = DISEASE_DATABASE[cropType] || ['unknown_disease'];
    const primaryDisease = cropDiseases[Math.floor(Math.random() * cropDiseases.length)];
    
    return {
      detectedDisease: primaryDisease.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      confidence: Math.floor(75 + Math.random() * 20),
      possibleDiseases: cropDiseases.slice(0, 3).map((d, i) => ({
        name: d.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        confidence: Math.floor(90 - i * 20)
      })),
      recommendations: [
        'Isolate affected plants immediately',
        'Apply appropriate fungicide/pesticide',
        'Improve field drainage',
        'Monitor surrounding crops daily'
      ],
      urgency: severity === 'critical' ? 'treat_immediately' : severity === 'high' ? 'treat_soon' : 'monitor'
    };
  }

  async generateAdvisory(analysis) {
    // In production, generate via AI API
    // This returns structured advisory data
    
    const diseaseKey = analysis.detectedDisease.toLowerCase().replace(/\s+/g, '_');
    const template = ADVISORY_TEMPLATES[diseaseKey];

    return {
      diseaseInfo: template?.diseaseInfo || {
        name: analysis.detectedDisease,
        scientificName: '',
        category: 'unknown',
        description: `${analysis.detectedDisease} detected with ${analysis.confidence}% confidence.`
      },
      treatment: template?.treatment || {
        immediate: [{ action: 'Consult local agronomist for treatment plan', product: 'N/A', dosage: 'N/A', frequency: 'ASAP' }],
        preventive: ['Regular monitoring', 'Maintain field hygiene'],
        organic: ['Neem-based solutions'],
        chemical: []
      },
      management: {
        shortTerm: ['Remove and destroy infected plant material', 'Apply recommended treatment'],
        longTerm: ['Select resistant varieties for next season', 'Improve soil health'],
        cropRotation: 'Consider rotating with non-host crops next season',
        soilManagement: ['Maintain proper pH', 'Ensure adequate drainage']
      },
      estimatedYieldLoss: template?.estimatedYieldLoss || { min: 5, max: 30 },
      economicImpact: 'Estimated 10-30% yield loss if untreated. Early intervention can minimize losses significantly.'
    };
  }
}

module.exports = new AIService();
