import { Question } from '../types/onboarding';

export const questions = [
  {
    step: 1,
    title: "Let's get started",
    question: "Enter your API Keys and Callback URL",
    fields: [
      {
        name: 'tavusApiKey',
        label: 'Tavus API Key',
        type: 'password',
        placeholder: 'Enter your Tavus API key',
        required: true
      },
      {
        name: 'geminiApiKey',
        label: 'Gemini API Key',
        type: 'password',
        placeholder: 'Enter your Gemini API key',
        required: true
      },
      {
        name: 'callbackUrl',
        label: 'Callback URL',
        type: 'text',
        placeholder: 'Enter your webhook callback URL',
        required: true
      }
    ]
  },
  {
    step: 2,
    title: 'Tell us about yourself',
    question: "What's your name?",
    fields: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        placeholder: 'Enter your full name',
        required: true
      }
    ]
  },
  {
    step: 3,
    title: 'Set Your Goals',
    question: 'What are your main goals for 2025?',
    fields: [
      {
        name: 'primaryGoal',
        label: 'Primary Goal',
        type: 'textarea',
        placeholder: 'Describe your main goal...',
        required: true
      }
    ]
  },
  {
    step: 4,
    title: 'Almost there!',
    question: 'How often would you like to track your progress?',
    fields: [
      {
        name: 'frequency',
        label: 'Tracking Frequency',
        type: 'select',
        options: ['Daily', 'Weekly', 'Monthly'],
        required: true
      }
    ]
  }
]; 