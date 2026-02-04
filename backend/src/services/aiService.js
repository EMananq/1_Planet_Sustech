const axios = require('axios');

/**
 * AI Service for generating personalized carbon footprint recommendations
 * Uses Google Gemini API for intelligent suggestions
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

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
    // Return helpful fallback response
    return {
      success: true,
      response: "I can help you reduce your carbon footprint! Here are some quick tips: Walk or bike for short trips, switch to LED bulbs, eat more plant-based meals, and reduce single-use plastics. Would you like more specific advice?",
      source: 'fallback'
    };
  }
}

module.exports = {
  generateRecommendations,
  generateFallbackRecommendations,
  chat
};
