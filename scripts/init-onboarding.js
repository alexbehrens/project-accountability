import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const defaultData = {
  tavusApiKey: '',
  geminiApiKey: '',
  callbackUrl: '',
  name: '',
  primaryGoal: '',
  frequency: 'Daily',
  lastUpdated: ''
};

const onboardingFile = join(process.cwd(), 'public', 'onboarding-data.json');

// Create the file if it doesn't exist
if (!fs.existsSync(onboardingFile)) {
  fs.writeFileSync(onboardingFile, JSON.stringify(defaultData, null, 2));
  console.log('Created onboarding-data.json with default values');
} 