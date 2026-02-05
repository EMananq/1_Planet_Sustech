# AI Usage Report

## What AI does in this app

Two main things:

**1. Recommendations** - When you open the AI tab, it grabs your emission data from the last 30 days and sends it to Gemini. The API analyzes whats high (like if transport is 70% of your footprint) and gives specific tips. Not generic stuff.

**2. Chat** - You can ask questions like "how do i reduce food emissions" and itll answer based on YOUR data. So if youve been logging lots of beef meals, itll tell you about that specifically.

## How its implemented

Backend makes POST requests to Gemini 2.5 Flash API. I'm using the free tier so theres rate limits but it works fine for demo purposes.

The prompt includes the users emission breakdown:

```
total: 45.2 kg CO2
transport: 28 kg
food: 12 kg
energy: 5.2 kg
```

Then asks for personalized suggestions.

## Fallback

If API is down or quota exceeded, the app doesnt crash. Theres rule-based recommendations that kick in - not as smart but better than nothing.

## Limitations

- Free tier = limited requests per minute
- No memory between chat sessions
- Recommendations refresh on each page load

Thats about it for AI usage.
