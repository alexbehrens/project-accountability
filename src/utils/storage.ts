interface OnboardingData {
  tavusApiKey: string;
  geminiApiKey: string;
  name: string;
  primaryGoal: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  lastUpdated: string;
}

export const saveOnboardingData = async (data: OnboardingData) => {
  try {
    const dataToSave = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('Saving data:', dataToSave); // Debug log
    
    const response = await fetch('/onboarding-data.json', {
      method: 'PUT',
      body: JSON.stringify(dataToSave, null, 2),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Server responded with:', response.status, response.statusText);
      throw new Error('Failed to save data');
    }

    // Verify the file was updated
    const verifyResponse = await fetch('/onboarding-data.json');
    const savedData = await verifyResponse.json();
    console.log('Verified saved data:', savedData); // Debug log

    return true;
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return false;
  }
};

export const checkOnboardingData = async (): Promise<boolean> => {
  try {
    const response = await fetch('/onboarding-data.json');
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return !!data.tavusApiKey && !!data.geminiApiKey;
  } catch (error) {
    console.error('Error checking onboarding data:', error);
    return false;
  }
};

export const getOnboardingData = async (): Promise<OnboardingData | null> => {
  try {
    const response = await fetch('/onboarding-data.json');
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting onboarding data:', error);
    return null;
  }
}; 