import { GoogleGenerativeAI } from "@google/generative-ai";
import onboardingData from '../../public/onboarding-data.json';

export async function analyzeTranscriptWithGemini(transcriptData, primaryGoal) {
  console.log('Starting Gemini analysis with:', {
    transcriptData,
    primaryGoal,
    apiKey: onboardingData.geminiApiKey ? 'Present' : 'Missing'
  });
  
  try {
    const genAI = new GoogleGenerativeAI(onboardingData.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const transcriptText = typeof transcriptData === 'string' 
      ? transcriptData 
      : JSON.stringify(transcriptData, null, 2);

    console.log('Prepared transcript text:', transcriptText);

    const prompt = `
      You are an AI accountability partner. Analyze this conversation transcript 
      and determine if the person met their daily goal of: "${primaryGoal}"
      
      Respond with ONLY a JSON object (no markdown formatting, no backticks) containing:
      - achieved: boolean (true if they met their goal, false if not)
      - confidence: number (0-100 indicating how confident you are in this assessment)
      - reasoning: string (brief explanation of your decision)
      
      Transcript:
      ${transcriptText}
    `;

    console.log('Sending prompt to Gemini:', prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw Gemini response:', text);
    
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    console.log('Cleaned response text:', cleanText);
    
    return JSON.parse(cleanText);

  } catch (error) {
    console.error('Detailed Gemini analysis error:', error);
    return {
      achieved: false,
      confidence: 0,
      reasoning: `Error analyzing transcript: ${error.message}`,
      error: true
    };
  }
} 