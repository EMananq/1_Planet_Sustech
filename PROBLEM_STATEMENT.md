# Problem Statement

## Background

Most individuals lack visibility into their daily carbon emissions. Everyday activities like commuting, food choices, and energy consumption contribute to environmental impact, but there's no simple way for people to track and understand this data.

## Solution

I built a web application that allows users to log their daily activities and visualize their carbon footprint with actual CO2 numbers. The app calculates emissions using established scientific formulas and presents the data through an intuitive dashboard.

## Key Features

**Activity Tracking** - Users can log activities across four categories: transportation, food consumption, energy usage, and waste. Each entry is converted to kg of CO2 using verified emission factors.

**Visual Dashboard** - The dashboard displays total emissions, category breakdowns via pie charts, and trend analysis over time. This helps users identify which areas of their lifestyle have the highest environmental impact.

**AI-Powered Recommendations** - The application integrates with Google's Gemini API to analyze user-specific emission patterns and provide personalized reduction suggestions. Unlike generic advice, these recommendations are based on the user's actual logged data.

**Interactive Chat Assistant** - Users can ask questions about reducing their carbon footprint and receive contextual answers that reference their personal emission data.

## Technical Implementation

- **Frontend:** React with Vite for fast development
- **Backend:** Node.js with Express for API handling
- **Database:** Firebase Firestore for real-time data storage
- **Authentication:** JWT-based authentication with secure password hashing
- **AI Integration:** Google Gemini 2.5 Flash API for personalized insights

## Target Users

Environmentally-conscious individuals who want to understand and reduce their personal carbon footprint without spending significant time on research or complex calculations.
