# AI Usage Report: Carbon Footprint Calculator

## Overview

The Carbon Footprint Calculator leverages Artificial Intelligence (AI) to transform raw user data into personalized, actionable environmental advice. This report documents the integration of **Google Gemini API** to power the recommendation engine and intelligent chatbot features.

## AI Tools Used

- **Model**: Google Gemini Pro / Gemini 1.5 Flash
- **Integration Method**: REST API via `Google Generative Language API`
- **Library**: `axios` for HTTP requests (Node.js backend)

## Features Powered by AI

### 1. Personalized Recommendations Engine

- **Functionality**: Analyzes the user's aggregated emission data (last 30 days) to identify the largest contributors to their carbon footprint.
- **Implementation**:
  - The backend aggregates emissions by category (Transport, Energy, Food, etc.).
  - A structured prompt is sent to Gemini containing this JSON data.
  - Gemini identifies "hotspots" and generates 3 specific, high-impact reduction tips.
- **Prompt Engineering**:
  > "You are an expert environmental consultant. Analyze this carbon footprint data... Provide: 1. Top 3 areas for improvement... 2. Specific actionable tips... 3. Estimated CO2 savings."

### 2. Interactive Environmental Chatbot

- **Functionality**: Allows users to ask free-form questions about sustainability and their specific emission data.
- **Implementation**:
  - User messages are augmented with their recent emission stats as context.
  - The AI acts as a "friendly and knowledgeable carbon footprint assistant."
- **Prompt Engineering**:
  > "You are a friendly and knowledgeable carbon footprint assistant... User's emission context: [JSON data]... User message: [Message]"

## Benefits of AI Integration

1.  **Personalization**: unlike static tips, the AI adapts to the user's actual behavior (e.g., suggesting public transport to a user with high car emissions, but meat reduction to a user with high food emissions).
2.  **Engagement**: The chatbot provides an interactive way to learn, increasing user retention.
3.  **Scalability**: The system can analyze complex data patterns and provide expert-level advice without human intervention.

## Ethical Considerations & Accuracy

- **Transparency**: All AI-generated advice is labeled as such in the UI.
- **Fallback Mechanism**: A robust rule-based system provides standard recommendations if the AI service fails or is unreachable, ensuring continuous app functionality.
