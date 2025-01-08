# Project Accountability 2025 🎯

A modern, AI-powered accountability tracker that helps you stay on top of your 2025 goals through daily video check-ins and intelligent progress analysis.

![Project Screenshot](screenshot.png)

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/yourusername/project-accountability-2025)

## Features

- 🎥 **Daily Video Check-ins**: Record short video updates about your progress using Tavus AI
- 🤖 **AI Analysis**: Automated verification of goal completion using Google's Gemini AI
- 📊 **Progress Tracking**: Visual tracking of daily, weekly, monthly, and yearly progress
- 📅 **Activity Calendar**: Interactive calendar showing your completion history
- ⚡ **Real-time Updates**: Instant feedback on your daily achievements

## Tech Stack

- React + Vite
- TypeScript
- Tailwind CSS
- Google Gemini AI
- Daily for WebRTC
- Tavus AI for video processing
- Webhook.site for callback handling

## Prerequisites

Before you begin, ensure you have:

1. A Tavus API key (get one at [tavus.io](https://tavus.io))
2. A Google Gemini API key (get one at [ai.google.dev](https://ai.google.dev))
3. A Webhook.site URL for callbacks

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/project-accountability-2025.git
cd project-accountability-2025
```

2. Install dependencies:
```bash
npm install
```

3. Create your onboarding configuration:
- A default `onboarding-data.json` will be created in the `public` folder
- Update it with your API keys and preferences

4. Start the development server:
```bash
npm run dev
```

## Configuration

The project uses two main configuration files:

1. `public/onboarding-data.json`:
```json
{
  "tavusApiKey": "your-tavus-api-key",
  "geminiApiKey": "your-gemini-api-key",
  "callbackUrl": "your-webhook-url",
  "name": "Your Name",
  "primaryGoal": "Your Main Goal",
  "frequency": "Daily",
  "lastUpdated": ""
}
```

2. `public/activities.csv`:
```csv
date,completed
2025-01-01,true
2025-01-02,false
```

## Implementation Details

### Core Storage Files
- `public/onboarding-data.json`: Stores user configuration and API integrations
- `public/activities.csv`: Tracks daily goal completion status in a simple date,completed format

### Service Integration

#### Tavus AI Video Processing
`src/utils/createConversation.js`:
- Creates personalized video sessions using user's name and goal
- Loads activity history for conversation context
- Configures webhook callbacks for transcription processing
- Manages video recording properties and duration limits

#### Gemini AI Analysis
`src/utils/geminiAnalyzer.js`:
- Processes video transcripts against stated goals
- Provides structured completion assessment
- Determines daily goal achievement status

### Data Management

#### Configuration Handler
`src/utils/storage.ts`:
```typescript
interface OnboardingData {
  tavusApiKey: string;
  geminiApiKey: string;
  name: string;
  primaryGoal: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  lastUpdated: string;
}
```
- Manages API key storage and verification
- Handles onboarding state persistence
- Provides type-safe configuration access

#### Activity Tracking
`src/utils/csvHandler.ts`:
```typescript
interface ActivityData {
  date: string;
  completed: boolean;
}
```
- Handles CSV parsing and serialization
- Manages activity completion status
- Tracks completion streaks

### File Operations
`vite.config.ts` provides two main endpoints:
- `PUT /onboarding-data.json`: Updates user configuration
- `POST /api/activities`: Updates activity completion status

### Data Flow
1. User records check-in via `VideoVerification.jsx`
2. Tavus processes video and returns transcript
3. Gemini analyzes transcript via `geminiAnalyzer.js`
4. Results saved to `activities.csv` via `csvHandler.ts`

### Security Note
Current implementation stores API keys in `onboarding-data.json` for development.
For production, implement:


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Tavus AI](https://tavus.io) for video processing
- [Google Gemini](https://ai.google.dev) for AI analysis
- [Webhook.site](https://webhook.site) for webhook testing

## Support

If you find this project helpful, please give it a ⭐️ on GitHub!
