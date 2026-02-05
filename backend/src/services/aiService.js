const axios = require('axios');

/**
 * AI Service for generating personalized carbon footprint recommendations
 * Uses Google Gemini API for intelligent suggestions
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Generate personalized recommendations based on user's emission data
 * @param {object} emissionData - User's emission summary
 * @param {string} userQuery - Optional user question
 * @returns {object} - AI-generated recommendations
 */
async function generateRecommendations(emissionData, userQuery = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    // Return fallback recommendations if API key not configured
    return generateFallbackRecommendations(emissionData);
  }
  
  try {
    const prompt = userQuery 
      ? `Based on this carbon emission data: ${JSON.stringify(emissionData)}\n\nUser question: ${userQuery}\n\nProvide helpful, actionable advice.`
      : `You are an expert environmental consultant. Analyze this carbon footprint data and provide personalized recommendations:

${JSON.stringify(emissionData, null, 2)}

Provide:
1. Top 3 areas for improvement based on the data
2. Specific actionable tips for each area
3. Estimated CO2 savings if tips are followed

Be encouraging, specific, and practical. Format your response clearly with sections.`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const textResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (textResponse) {
      return {
        success: true,
        recommendations: textResponse,
        source: 'ai'
      };
    } else {
      return generateFallbackRecommendations(emissionData);
    }
  } catch (error) {
    // Silently fall back to rule-based recommendations
    return generateFallbackRecommendations(emissionData);
  }
}

/**
 * Generate fallback recommendations when AI is not available
 * @param {object} emissionData - User's emission summary
 * @returns {object} - Rule-based recommendations
 */
function generateFallbackRecommendations(emissionData) {
  const recommendations = [];
  const byCategory = emissionData.byCategory || {};
  
  // Transport recommendations
  if (byCategory.transport > 10) {
    recommendations.push({
      category: 'Transport',
      tip: 'Consider carpooling or using public transport. Switching to public transit can reduce your transport emissions by up to 65%.',
      potentialSaving: `${Math.round(byCategory.transport * 0.5)} kg CO2`
    });
    recommendations.push({
      category: 'Transport',
      tip: 'For short trips under 5km, try cycling or walking instead of driving.',
      potentialSaving: '0.5-2 kg CO2 per trip'
    });
  }
  
  // Energy recommendations
  if (byCategory.energy > 5) {
    recommendations.push({
      category: 'Energy',
      tip: 'Switch to LED bulbs and turn off lights when not in use. This can reduce home electricity by 10-20%.',
      potentialSaving: `${Math.round(byCategory.energy * 0.15)} kg CO2`
    });
    recommendations.push({
      category: 'Energy',
      tip: 'Lower your thermostat by 1-2°C in winter and use fans instead of AC when possible.',
      potentialSaving: '3-5% energy reduction'
    });
  }
  
  // Food recommendations
  if (byCategory.food > 5) {
    recommendations.push({
      category: 'Food',
      tip: 'Try having one or two meatless days per week. Replacing beef with plant-based meals can save up to 5kg CO2 per meal.',
      potentialSaving: '10-20 kg CO2 per week'
    });
    recommendations.push({
      category: 'Food',
      tip: 'Reduce food waste by planning meals and storing food properly. About 6% of global emissions come from food waste.',
      potentialSaving: '1-2 kg CO2 per week'
    });
  }
  
  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push({
      category: 'General',
      tip: 'Great job tracking your carbon footprint! Keep logging activities to identify patterns and areas for improvement.',
      potentialSaving: 'Knowledge is power!'
    });
    recommendations.push({
      category: 'General',
      tip: 'Consider offsetting your emissions by supporting reforestation projects or renewable energy initiatives.',
      potentialSaving: 'Variable'
    });
  }
  
  return {
    success: true,
    recommendations: recommendations,
    source: 'rule-based',
    message: 'Showing rule-based suggestions based on your data.'
  };
}

/**
 * Chat with AI about carbon footprint
 * @param {string} message - User's chat message
 * @param {object} context - User's emission context
 * @returns {object} - AI response
 */
async function chat(message, context = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return {
      success: true,
      response: "I'm your carbon footprint assistant! To get AI-powered responses, please configure your Gemini API key. In the meantime, I can tell you that the average person's carbon footprint is about 4-8 tonnes CO2 per year. Reducing transport and food emissions usually has the biggest impact!",
      source: 'fallback'
    };
  }
  
  try {
    const contextInfo = Object.keys(context).length > 0 
      ? `\n\nUser's emission context (last 30 days): Total: ${context.total?.toFixed(2) || 0} kg CO2. Categories: ${JSON.stringify(context.byCategory || {})}`
      : '';

    const prompt = `You are a friendly and knowledgeable carbon footprint assistant. You help users understand their environmental impact and provide practical tips.

Be conversational, encouraging, and specific with advice. Keep responses concise (2-3 paragraphs max).
${contextInfo}

User message: ${message}`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const textResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (textResponse) {
      return {
        success: true,
        response: textResponse,
        source: 'ai'
      };
    } else {
      return {
        success: false,
        response: "I couldn't generate a response. Please try again.",
        source: 'error'
      };
    }
  } catch (error) {
    // Log the error for debugging
    console.log('Gemini API error:', error.response?.data?.error?.message || error.message);
    
    // Generate contextual fallback response based on user message
    const lowerMessage = message.toLowerCase();
    let fallbackResponse = "";
    
    if (lowerMessage.includes('transport') || lowerMessage.includes('car') || lowerMessage.includes('drive')) {
      fallbackResponse = "Great question about transportation! 🚗 Here are some tips: Try carpooling to cut emissions by 50%. For trips under 5km, walk or bike. If buying a new car, consider electric or hybrid. Public transit produces 10x less CO2 per passenger than driving alone.";
    } else if (lowerMessage.includes('energy') || lowerMessage.includes('electric') || lowerMessage.includes('power')) {
      fallbackResponse = "Let's talk about energy savings! 💡 Switch to LED bulbs (use 75% less energy). Unplug devices when not in use - phantom power accounts for 10% of home energy. Consider a smart thermostat to reduce heating/cooling by 10-15%. Air dry clothes instead of using the dryer when possible.";
    } else if (lowerMessage.includes('food') || lowerMessage.includes('diet') || lowerMessage.includes('eat') || lowerMessage.includes('meat')) {
      fallbackResponse = "Food choices matter for the planet! 🥗 Beef has the highest carbon footprint - 6kg CO2 per meal. Trying 'Meatless Mondays' can reduce your food emissions by 15%. Buy local and seasonal produce when possible. Reducing food waste is also huge - plan meals and compost scraps.";
    } else if (lowerMessage.includes('tips') || lowerMessage.includes('reduce') || lowerMessage.includes('help')) {
      fallbackResponse = "Here are my top carbon reduction tips! 🌱 1) Walk or bike for short trips (saves 0.5-2 kg CO2 per trip). 2) Switch to LED bulbs throughout your home. 3) Eat more plant-based meals - even 2-3 per week helps! 4) Reduce, reuse, recycle in that order. 5) Unplug electronics when not in use.";
    } else if (lowerMessage.includes('calculate') || lowerMessage.includes('footprint') || lowerMessage.includes('average')) {
      fallbackResponse = "The average person's carbon footprint is about 4-8 tonnes CO2 per year. 📊 In developed countries, it can be 12-16 tonnes! Transportation typically accounts for 30%, home energy 20%, food 15%, and goods/services 35%. Log your activities here to track your personal impact!";
    } else {
      fallbackResponse = "I'm here to help you reduce your carbon footprint! 🌍 Try asking me about: transportation tips, saving energy at home, food choices and their impact, or general ways to reduce your emissions. What area would you like to focus on?";
    }
    
    return {
      success: true,
      response: fallbackResponse,
      source: 'fallback'
    };
  }
}

module.exports = {
  generateRecommendations,
  generateFallbackRecommendations,
  chat
};
