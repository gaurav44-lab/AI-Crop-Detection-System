const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

// Initialize Gemini SDK
// Initialize Gemini SDK
// Requires GEMINI_API_KEY inside the .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  async analyzeDisease({ cropType, symptoms, severity, images }) {
    try {
      // Create Gemini Flash Model Instance
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      const promptText = `
        You are an expert agronomist AI. Analyze the following crop report.
        Crop: ${cropType || 'Unknown'}
        Symptoms: ${symptoms || 'None reported'}
        Severity: ${severity || 'Unknown'}
        
        I have provided images of the diseased crop.
        Analyze the images and symptoms, then output your diagnosis strictly in the following JSON format:
        {
          "detectedDisease": "Primary Disease Name",
          "confidence": 85,
          "possibleDiseases": [
            { "name": "Disease 1", "confidence": 85 },
            { "name": "Disease 2", "confidence": 40 }
          ],
          "recommendations": [
            "Action 1",
            "Action 2"
          ],
          "urgency": "monitor" // must be one of: "monitor", "treat_soon", "treat_immediately"
        }
        Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
      `;

      const parts = [{ text: promptText }];

      // Attach local images by converting to base64 inline data
      if (images && images.length > 0) {
        for (const img of images) {
          // img.path is roughly /uploads/user_id/filename.ext
          const relativeImagePath = img.path.replace(/^\//, '');
          const absolutePath = path.join(__dirname, '..', relativeImagePath);
          if (fs.existsSync(absolutePath)) {
            parts.push({
              inlineData: {
                data: fs.readFileSync(absolutePath).toString('base64'),
                mimeType: img.mimetype || 'image/jpeg'
              }
            });
          }
        }
      }

      // Generate actual AI content!
      const result = await model.generateContent(parts);
      let responseText = result.response.text().trim();
      
      // Cleanup markdown backticks if AI decided to inject it
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/```json/g, '').replace(/```html/g, '').replace(/```/g, '').trim();
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/```/g, '').trim();
      }

      const analysisJSON = JSON.parse(responseText);
      return analysisJSON;
    } catch (err) {
      console.error("Gemini Analysis Error:", err);
      // Fallback in case of failure
      return {
        detectedDisease: "Analysis Failed",
        confidence: 0,
        possibleDiseases: [],
        recommendations: ["Could not process AI analysis. Please verify your API key or consult an agronomist manually."],
        urgency: "monitor"
      };
    }
  }

  async generateAdvisory(analysis) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      const promptText = `
        You are an expert agronomist AI. Based on the following disease analysis, generate a detailed advisory plan.
        Disease: ${analysis.detectedDisease} 
        Confidence: ${analysis.confidence}%
        
        Generate the advisory strictly in the following JSON format:
        {
          "diseaseInfo": {
            "name": "${analysis.detectedDisease}",
            "scientificName": "Scientific Pathogen Name",
            "category": "fungal/bacterial/viral/pest",
            "description": "Brief description"
          },
          "treatment": {
            "immediate": [
              { "action": "Action", "product": "Product", "dosage": "Dosage", "frequency": "Frequency" }
            ],
            "preventive": ["Step 1"],
            "organic": ["Step 1"],
            "chemical": [
              { "name": "Chem", "activeIngredient": "Ingredient", "applicationRate": "Rate", "safetyPrecautions": "Safety" }
            ]
          },
          "management": {
            "shortTerm": ["Step 1"],
            "longTerm": ["Step 1"],
            "cropRotation": "Rotation advice",
            "soilManagement": ["Step 1"]
          },
          "estimatedYieldLoss": { "min": 5, "max": 30 },
          "economicImpact": "Brief impact summary"
        }
        Return ONLY valid JSON. Do not include markdown formatting.
      `;

      const result = await model.generateContent(promptText);
      let responseText = result.response.text().trim();
      
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/```/g, '').trim();
      }

      return JSON.parse(responseText);
    } catch (err) {
      console.error("Gemini Advisory Error:", err);
      return {
        diseaseInfo: { name: analysis.detectedDisease, description: "Failed to generate advisory." },
        treatment: { immediate: [], preventive: [], organic: [], chemical: [] },
        management: { shortTerm: [], longTerm: [] },
      };
    }
  }
}

module.exports = new AIService();
