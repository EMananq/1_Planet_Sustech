# AI Usage Report

## How I'm Using AI in This Project

### 1. Personalized Recommendations

The main AI feature is the recommendations system. When you log activities, the app sends your emission data to Google's Gemini API and asks for personalized tips.

**How it works:**

- User logs activities (driving, food, energy, etc.)
- Backend calculates total emissions by category
- This data goes to Gemini with a prompt asking for specific advice
- AI analyzes the user's patterns and suggests realistic changes

Example: If someone drives 40km daily, the AI might suggest carpooling or working from home 1 day/week - not just generic "drive less" advice.

### 2. Chat Assistant

There's also a chat feature where users can ask questions about reducing their footprint. The AI has context about the user's emission data so it can give relevant answers.

Like if you ask "how can I reduce my food emissions?" it knows if you eat a lot of beef and can suggest alternatives.

### 3. Fallback System

If the AI API is down or rate-limited, the app doesn't break. It falls back to rule-based recommendations that still work based on the user's data - just not as personalized.

## Technical Details

- **API:** Google Gemini 2.5 Flash
- **Integration:** Backend calls Gemini API, frontend just displays results
- **Rate limiting:** Using free tier, so there are limits on requests/minute

## What AI Does NOT Do

- It doesn't auto-log activities (user has to input)
- It doesn't access external data about the user
- It can't make changes to user accounts
- Chat history isn't stored - each conversation is fresh

## Why Gemini?

Tried a few options. Gemini's free tier is generous and the responses are pretty good for this use case. Plus it's easy to integrate with just REST API calls.
