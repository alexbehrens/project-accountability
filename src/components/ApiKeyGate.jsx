import React, { useState, useEffect } from 'react';
import { questions } from '../config/questions';
import { saveOnboardingData, checkOnboardingData } from '../utils/storage';
import { 
  KeyRound, 
  Bot, 
  Globe, 
  User, 
  Target, 
  Calendar,
  ArrowRight,
  ArrowLeft,
  Video,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';

const ApiKeyGate = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    tavusApiKey: '',
    geminiApiKey: '',
    callbackUrl: '',
    name: '',
    primaryGoal: '',
    frequency: 'Daily',
  });
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkData = async () => {
      try {
        const hasData = await checkOnboardingData();
        setIsOnboarded(hasData);
      } catch (error) {
        console.error('Error checking onboarding data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const currentQuestion = questions[currentStep];
    const fields = currentQuestion.fields;
    
    // Validate current step
    const isValid = fields.every(field => {
      if (field.required) {
        return formData[field.name]?.trim().length > 0;
      }
      return true;
    });

    if (!isValid) {
      setError('Please fill in all required fields');
      return;
    }

    if (currentStep === questions.length - 1) {
      try {
        const success = await saveOnboardingData(formData);
        if (success) {
          setIsOnboarded(true);
        } else {
          setError('Failed to save onboarding data');
        }
      } catch (error) {
        console.error('Error saving data:', error);
        setError('Failed to save onboarding data');
      }
    } else {
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (isOnboarded) {
    return children;
  }

  const currentQuestion = questions[currentStep];

  // Helper function to get icon for field type
  const getFieldIcon = (fieldName) => {
    switch (fieldName) {
      case 'tavusApiKey': return <Video className="w-5 h-5 text-pink-400" />;
      case 'geminiApiKey': return <Sparkles className="w-5 h-5 text-[#3B82F6]" />;
      case 'callbackUrl': return <Globe className="w-5 h-5 text-emerald-400" />;
      case 'name': return <User className="w-5 h-5 text-gray-400" />;
      case 'primaryGoal': return <Target className="w-5 h-5 text-red-400" />;
      case 'frequency': return <Calendar className="w-5 h-5 text-yellow-400" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="grid-background" />
      <div className="gradient-overlay" />
      
      <main className="px-8 py-12">
        <div className="max-w-[800px] mx-auto">
          <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-3">
              <h1 className="text-5xl font-bold text-white">
                Project Accountability 2025
              </h1>
              <p className="text-xl text-gray-400">
                AI-Powered Personal Goal Tracking & Verification System
              </p>
            </div>

            {/* Main Card */}
            <div className="card bg-[#1a1a1a] bg-opacity-95 p-8 rounded-2xl border border-white/10 backdrop-blur-xl">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                    <KeyRound className="w-6 h-6 text-white" />
                    {currentQuestion.question}
                  </h2>
                  {currentQuestion.description && (
                    <p className="text-gray-400">
                      {currentQuestion.description}
                    </p>
                  )}
                </div>

                {currentQuestion.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-white font-medium flex items-center gap-2">
                        {getFieldIcon(field.name)}
                        {field.label}
                        {field.required && <span className="text-purple-400 ml-1">*</span>}
                      </label>
                      {field.name === 'tavusApiKey' && (
                        <a 
                          href="https://tavus.io/signup" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-1"
                        >
                          Sign up for Tavus
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      )}
                      {field.name === 'geminiApiKey' && (
                        <a 
                          href="https://makersuite.google.com/app/apikey" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-1"
                        >
                          Get Gemini API key
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <input
                      type={field.type}
                      value={formData[field.name]}
                      onChange={(e) => setFormData({
                        ...formData,
                        [field.name]: e.target.value
                      })}
                      placeholder={field.placeholder}
                      className="w-full bg-white/5 text-white border border-white/10 rounded-xl p-4 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                    />
                    {field.hint && (
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {field.hint}
                      </p>
                    )}
                  </div>
                ))}

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex-1 bg-white/5 text-white py-4 px-6 rounded-xl border border-white/10 transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-[inset_0_0_60px_rgba(255,255,255,0.1)] hover:border-white/20"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-purple-500/10 text-purple-400 py-4 px-6 rounded-xl border border-purple-500/20 transition-all duration-200 relative overflow-hidden hover:shadow-[inset_0_0_60px_rgba(168,85,247,0.2)] hover:border-purple-500/40 flex items-center justify-center gap-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-emerald-500/10 to-purple-500/0 animate-shimmer"/>
                    <span className="relative z-10">
                      {currentStep === questions.length - 1 ? 'Complete Setup' : 'Continue'}
                    </span>
                    <ArrowRight className="w-5 h-5 relative z-10" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApiKeyGate; 