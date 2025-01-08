import onboardingData from '../../public/onboarding-data.json';
import { parse } from 'csv-parse/browser/esm/sync';

export const createConversation = async () => {
  // Load and parse the CSV file using fetch
  const response = await fetch('/activities.csv');
  const csvText = await response.text();
  const activities = parse(csvText, {
    columns: true,
    skip_empty_lines: true
  });

  // Create activity history string
  const today = new Date();
  const activityHistory = activities
    .filter(row => {
      const rowDate = new Date(row.date);
      return rowDate < today && row.completed !== 'null';
    })
    .map(row => {
      const date = new Date(row.date).toLocaleDateString();
      const status = row.completed === 'true' ? 'Completed' : 'Not completed';
      return `- ${date}: ${status}`;
    })
    .join('\n');

  // Log the API key being used (first few characters for security)
  console.log('Using API key:', onboardingData.tavusApiKey?.substring(0, 8) + '...');
  
  try {
    const payload = {
      persona_id: "pdbd1e53d74f",
      custom_greeting: `Ready to verify ${onboardingData.name}'s progress!`,
      callback_url: onboardingData.callbackUrl,
      conversational_context: `Verification session for daily progress check on goal: ${onboardingData.primaryGoal} (Current date: ${today.toLocaleDateString()})
Previous activity history:
${activityHistory}`,
      properties: {
        enable_recording: true,
        enable_transcription: true,
        max_call_duration: 190
      }
    };

    console.log('Request payload:', payload);

    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": onboardingData.tavusApiKey,
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
    });

    // Log response details for debugging
    console.log('Response status:', response.status);
    
    if (!response?.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Validate the response data
    if (!data || !data.conversation_id) {
      throw new Error('Invalid response format: missing conversation_id');
    }

    console.log('Success response:', data);
    return data;

  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      apiKey: onboardingData.tavusApiKey ? 'Present' : 'Missing'
    });
    // Re-throw the error with a more specific message
    throw new Error(`Failed to create conversation: ${error.message}`);
  }
}; 