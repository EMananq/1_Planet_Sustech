# AI Usage Report

## Overview

This application integrates Google's Gemini AI to provide personalized carbon reduction recommendations and an interactive chat assistant. The AI features enhance the core tracking functionality by offering actionable, user-specific advice.

## AI Features

### 1. Personalized Recommendations

When users access the AI Recommendations tab, the application retrieves their emission data from the past 30 days and sends it to the Gemini API. The AI analyzes the emission breakdown by category and generates specific, actionable tips.

**How it works:**

- Backend fetches user's activity history from Firestore
- Emission totals are calculated and categorized (transport, food, energy, waste)
- This data is sent to Gemini with a prompt requesting personalized advice
- The AI returns recommendations tailored to the user's highest-impact areas

**Example:** If a user's data shows that transportation accounts for 70% of their emissions, the AI will prioritize suggestions for reducing commute-related carbon output rather than providing generic advice.

### 2. Chat Assistant

The chat feature allows users to ask specific questions about reducing their carbon footprint. The assistant has context about the user's emission data, so responses are relevant to their actual situation.

**Example use cases:**

- "How can I reduce my food-related emissions?"
- "What's the impact of switching to an electric car?"
- "Which of my activities has the highest carbon footprint?"

## Technical Implementation

**API:** Google Gemini 2.5 Flash  
**Integration Method:** RESTful API calls from the Node.js backend  
**Rate Limiting:** Using the free tier, which has per-minute request limits

**Prompt Engineering:**
The prompts include the user's emission summary in JSON format, allowing the AI to reference specific numbers when generating advice.

## Fallback System

If the Gemini API is unavailable (due to rate limits or service issues), the application falls back to a rule-based recommendation system. This ensures users always receive useful suggestions, even without AI assistance.

## Limitations

- **API Quota:** Free tier has limited requests per minute
- **No Conversation Memory:** Each chat session starts fresh; previous messages are not retained between sessions
- **Recommendations Refresh:** New recommendations are generated on each page load

## Privacy Considerations

- User data is only sent to the AI API when the user explicitly requests recommendations or uses the chat feature
- No personal identifying information is included in API requests
- Only aggregated emission data is shared with the AI service
