import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('VITE_GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Cache for storing category mappings to reduce API calls
const categoryCache = new Map();

export async function categorizePost(description) {
  console.log('categorizePost called with:', description);
  
  // Check cache first
  const cacheKey = description.toLowerCase().trim();
  if (categoryCache.has(cacheKey)) {
    console.log('Returning cached category for:', cacheKey);
    return categoryCache.get(cacheKey);
  }

  try {
    console.log('Initializing Gemini model...');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3, // Lower temperature for more deterministic outputs
        maxOutputTokens: 50, // Increased for longer category names
      },
    });
    
    const validCategories = [
      'Accident Prone Area',
      'Biomedical Waste Mismanagement',
      'Broken Speed Camera',
      'Contaminated Water',
      'Damaged Speed Breaker',
      'Dead Animal Removal',
      'Dengue / Malaria Risk Area',
      'Drainage Issue',
      'Electric Pole Damage',
      'Encroachment on Public Land',
      'Exposed Cables',
      'Flooding',
      'Food Safety Violation',
      'Footpath Broken',
      'Footpath Encroachment',
      'Garbage',
      'Garbage Not Collected',
      'Pothole',
      'Power Line Sparking',
      'Power Outage',
      'Public Toilet Issue',
      'Public Toilet Maintenance',
      'Road Damage',
      'Road Sweeping',
      'Sewage Overflow',
      'Signal Not Working',
      'Stagnant Water',
      'Storm Water Drain Blockage',
      'Stray Animal Menace',
      'Streetlight',
      'Streetlight Not Working',
      'Traffic Congestion Hotspot',
      'Traffic Signal Timing Issue',
      'Transformer Failure',
      'Unauthorized Speed Breaker',
      'Unfinished Road Work',
      'Voltage Fluctuation',
      'Water Leakage',
      'Waterlogging on Road',
      'Wrong Way Driving',
      'Others'
    ];
    
    const prompt = `You are a classification system. Analyze the following complaint and respond with EXACTLY ONE of these categories (case-sensitive):
${validCategories.join('\n')}

Complaint: "${description}"

Rules:
1. Respond with ONLY the exact category name, nothing else
2. If the complaint doesn't clearly match any specific category, respond with 'Others'
3. Do not include any other text, punctuation, or special characters
4. If you're unsure or the complaint is too vague, choose 'Others'
5. Only use the exact category names provided above`;

    const result = await model.generateContent(prompt);
    console.log('Gemini API call completed');
    const response = await result.response;
    let category = response.text().trim();
    console.log('Raw Gemini response:', category);
    
    // Clean up the response - remove any code blocks, backticks, or special characters
    category = category.replace(/[`\n\r\t]/g, '').replace(/[^\w\s]/g, ' ').trim();
    console.log('Cleaned category:', category);
    
    // Find a case-insensitive and partial match
    const matchedCategory = validCategories.find(cat => {
      const cleanCat = cat.toLowerCase().trim();
      const cleanResponse = category.toLowerCase().trim();
      const match = cleanResponse === cleanCat || 
             cleanResponse.includes(cleanCat) || 
             cleanCat.includes(cleanResponse);
      if (match) {
        console.log(`Matched: "${cleanResponse}" with "${cleanCat}"`);
      }
      return match;
    });

    // Default to 'Others' if no match found or if response is empty/whitespace
    const finalCategory = matchedCategory || 'Others';
    console.log('Final category result:', finalCategory);
    
    // Cache the result
    categoryCache.set(cacheKey, finalCategory);
    
    return finalCategory;
  } catch (error) {
    console.error('Error in categorizePost:', error);
    return 'Others'; // Return 'Others' as fallback in case of error
  }
}
