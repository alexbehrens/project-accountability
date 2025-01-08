const fs = require('fs');
const path = require('path');

const defaultData = {
  tavusApiKey: '',
  geminiApiKey: '',
  callbackUrl: '',
  name: '',
  primaryGoal: '',
  frequency: 'Daily',
  lastUpdated: ''
};

const onboardingFile = path.join(process.cwd(), 'public', 'onboarding-data.json');

// Create the file if it doesn't exist
if (!fs.existsSync(onboardingFile)) {
  fs.writeFileSync(onboardingFile, JSON.stringify(defaultData, null, 2));
  console.log('Created onboarding-data.json with default values');
} 