const fs = require('fs');
const path = require('path');

const defaultOnboardingData = {
  tavusApiKey: "",
  geminiApiKey: "",
  callbackUrl: "",
  name: "",
  primaryGoal: "",
  frequency: "Daily",
  lastUpdated: new Date().toISOString()
};

const defaultActivities = "date,completed\n2025-01-01,false";

// Ensure the public directory exists
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create default onboarding-data.json
fs.writeFileSync(
  path.join(publicDir, 'onboarding-data.json'),
  JSON.stringify(defaultOnboardingData, null, 2)
);

// Create default activities.csv
fs.writeFileSync(
  path.join(publicDir, 'activities.csv'),
  defaultActivities
);

console.log('Initialization complete: Created default configuration files');