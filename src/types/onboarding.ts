export interface OnboardingData {
  tavusApiKey: string;
  geminiApiKey: string;
  callbackUrl: string;
  name: string;
  primaryGoal: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  lastUpdated: string;
}

export interface Question {
  step: number;
  field: keyof OnboardingData;
  question: string;
  placeholder: string;
} 