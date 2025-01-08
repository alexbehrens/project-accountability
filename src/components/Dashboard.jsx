import React, { useState } from 'react';
import Header from './Header';
import ProgressBar from './ProgressBar';
import ActivityCalendar from './ActivityCalendar';
import onboardingData from '../../public/onboarding-data.json';
import activitiesCSV from '../../public/activities.csv?raw';
import VideoVerification from './VideoVerification';
import { quantum } from 'ldrs';
import { Sparkles, TrendingUp, Activity, RotateCw, NotebookText } from 'lucide-react';
import { analyzeTranscriptWithGemini } from '../utils/geminiAnalyzer';

// Register the quantum loader
quantum.register();

const Dashboard = () => {
  const [showVideoVerification, setShowVideoVerification] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcriptData, setTranscriptData] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [geminiAnalysis, setGeminiAnalysis] = useState(null);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  
  // Calculate what day we're on in each period
  const dayOfWeek = now.getDay() + 1; // 1-7
  const dayOfMonth = now.getDate(); // 1-31
  const dayOfYear = Math.ceil((now - startOfYear) / (1000 * 60 * 60 * 24));
  
  // Calculate total days in each period
  const daysInWeek = 7;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysInYear = ((now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || now.getFullYear() % 400 === 0) ? 366 : 365;

  // Calculate time progress
  const timeProgress = {
    weekly: { 
      current: dayOfWeek,
      total: daysInWeek,
      percentage: (dayOfWeek / daysInWeek) * 100
    },
    monthly: { 
      current: dayOfMonth,
      total: daysInMonth,
      percentage: (dayOfMonth / daysInMonth) * 100
    },
    yearly: { 
      current: dayOfYear,
      total: daysInYear,
      percentage: (dayOfYear / daysInYear) * 100
    }
  };

  // Parse CSV data
  const parseCSV = (csv) => {
    const [header, ...rows] = csv.trim().split('\n');
    return rows.map(row => {
      const [date, completed] = row.split(',');
      const value = completed.trim();
      return { 
        date, 
        completed: value === 'true' ? true : 
                   value === 'false' ? false : 
                   null 
      };
    });
  };

  // Process activities data
  const activitiesData = parseCSV(activitiesCSV);
  const activities = {};
  activitiesData.forEach(row => {
    activities[row.date] = row.completed;
  });

  // Count completed activities for each time period
  const getCompletedInDateRange = (startDate, endDate) => {
    let count = 0;
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      if (activities[dateStr] === true) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const completedThisWeek = getCompletedInDateRange(startOfWeek, now);
  const completedThisMonth = getCompletedInDateRange(startOfMonth, now);
  const completedThisYear = getCompletedInDateRange(startOfYear, now);

  console.log('Debug completion counts:', {
    week: {
      completed: completedThisWeek,
      outOf: dayOfWeek,
      startDate: startOfWeek.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    },
    month: {
      completed: completedThisMonth,
      outOf: dayOfMonth,
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    },
    year: {
      completed: completedThisYear,
      outOf: dayOfYear,
      startDate: startOfYear.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    }
  });

  const progress = {
    weekly: { 
      timeProgress: timeProgress.weekly.percentage,
      completionProgress: (completedThisWeek / daysInWeek) * 100,
      timeCurrent: timeProgress.weekly.current,
      timeTotal: timeProgress.weekly.total,
      current: completedThisWeek,
      total: daysInWeek
    },
    monthly: { 
      timeProgress: timeProgress.monthly.percentage,
      completionProgress: (completedThisMonth / daysInMonth) * 100,
      timeCurrent: timeProgress.monthly.current,
      timeTotal: timeProgress.monthly.total,
      current: completedThisMonth,
      total: daysInMonth
    },
    yearly: { 
      timeProgress: timeProgress.yearly.percentage,
      completionProgress: (completedThisYear / daysInYear) * 100,
      timeCurrent: timeProgress.yearly.current,
      timeTotal: timeProgress.yearly.total,
      current: completedThisYear,
      total: daysInYear
    }
  };

  // Format current date
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(now);

  const handleVerificationEnd = (conversationId) => {
    setShowVideoVerification(false);
    setIsVerifying(true);
    if (conversationId) {
      console.log('Setting conversation ID:', conversationId);
      setCurrentConversationId(conversationId);
    }
    setTimeout(() => {
      setIsVerifying(false);
      setShowTranscript(true);
    }, 5000);
  };

  const checkWebhookTranscript = async () => {
    try {
      console.log('Checking webhook for conversation ID:', currentConversationId);
      
      // Extract token from webhook URL
      const tokenId = onboardingData.callbackUrl.split('/').pop();
      
      const response = await fetch(`/webhook-proxy/${tokenId}/requests?page=1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Webhook response data:', data);
      
      // Look for conversation in the requests
      if (data.data && Array.isArray(data.data)) {
        // Find request with matching conversation ID and transcript
        const transcriptRequest = data.data.find(req => {
          try {
            const content = JSON.parse(req.content);
            return content.conversation_id === currentConversationId && 
                   content.event_type === 'application.transcription_ready' &&
                   content.properties?.transcript;
          } catch (e) {
            return false;
          }
        });

        if (transcriptRequest) {
          console.log('Found transcript request:', transcriptRequest);
          const content = JSON.parse(transcriptRequest.content);
          
          // Filter out system messages and format the transcript
          const filteredTranscripts = content.properties.transcript.filter(
            msg => msg.role !== 'system'
          );
          
          setTranscriptData({
            conversation_id: content.conversation_id,
            transcripts: filteredTranscripts,
            timestamp: content.timestamp
          });
        } else {
          console.log('No transcript found yet for conversation ID:', currentConversationId);
          setTranscriptData({
            message: 'Transcript not found yet',
            note: 'Please wait a moment and try again',
            conversationId: currentConversationId
          });
        }
      }
      
      setShowTranscript(true);
      
    } catch (error) {
      console.error('Error checking webhook:', error);
      setTranscriptData({
        error: 'Failed to fetch transcript',
        details: `Error: ${error.message}\nSearching for conversation ID: ${currentConversationId}`
      });
      setShowTranscript(true);
    }
  };

  // Helper function to process webhook response
  const handleWebhookResponse = (data) => {
    console.log('Webhook response:', data);
    
    // Handle array of requests or single request
    const requests = Array.isArray(data.data) ? data.data : [data];
    
    // Find most recent request with transcript
    const latestRequest = requests.find(req => 
      req.content && 
      (typeof req.content === 'string' ? 
        req.content.includes('transcript') : 
        JSON.stringify(req.content).includes('transcript'))
    );

    if (latestRequest) {
      try {
        const content = typeof latestRequest.content === 'string' ? 
          JSON.parse(latestRequest.content) : 
          latestRequest.content;
        setTranscriptData(content);
      } catch (e) {
        setTranscriptData(latestRequest.content);
      }
    } else {
      setTranscriptData({
        message: 'No transcript found in recent requests',
        note: 'Please complete a verification call first'
      });
    }
    setShowTranscript(true);
  };

  const today = new Date().toISOString().split('T')[0];
  const completedToday = activities[today] === true;

  console.log('Debug completion status:', {
    today,
    activityValue: activities[today],
    isTrue: activities[today] === true,
    isFalse: activities[today] === false,
    isNull: activities[today] === null
  });

  const updateActivityStatus = async (status) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Parse current CSV data
      const activities = parseCSV(activitiesCSV);
      
      // Update today's status
      const updatedActivities = activities.map(row => {
        if (row.date === today) {
          return { ...row, completed: status };
        }
        return row;
      });
      
      // Convert back to CSV format
      const csvHeader = 'date,completed\n';
      const csvContent = updatedActivities
        .map(row => `${row.date},${row.completed}`)
        .join('\n');
      const updatedCSV = csvHeader + csvContent;
      
      // Save to activities.csv
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/csv',
        },
        body: updatedCSV,
      });
      
      if (!response.ok) {
        throw new Error('Failed to update activities');
      }

      // Only update the activities object for today
      activities[today] = status;
      
    } catch (error) {
      console.error('Error updating activities:', error);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Elements */}
      <div className="grid-background" />
      <div className="gradient-overlay" />
      
      {/* Content */}
      <div className="relative z-10">
        <Header activities={activities} />

        {/* Main Content */}
        <main className="px-8 py-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="space-y-8">
              {/* Main Title - Added card-like padding to match other sections */}
              <h1 className="text-5xl font-semibold text-white px-6">
                {activities[today] === true 
                  ? <>Hey {onboardingData.name}, <span className="text-emerald-400">Great Job Today!</span></>
                  : activities[today] === false 
                    ? <>Hey {onboardingData.name}, <span className="text-red-400">Let's Do Better.</span></>
                    : <>Hey {onboardingData.name}, <span className="text-slate-400">Let's Stay Accountable.</span></>}
              </h1>

              {/* Current Resolution */}
              <section className="card">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Current Resolution</h2>
                  <Sparkles className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-400/80 mt-3 font-mono">{formattedDate}</p>
                <p className="text-gray-400/80 mt-3">{onboardingData.primaryGoal}</p>
              </section>

              {/* Progress Grid */}
              <div className="grid grid-cols-2 gap-8">
                {/* Progress Section */}
                <section className="card">
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl font-semibold">Progress</h2>
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-10">
                    <div>
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-gray-400">Weekly Progress</span>
                        <span className="text-gray-400">{progress.weekly.completionProgress.toFixed(1)}%</span>
                      </div>
                      <ProgressBar 
                        label="This Week's Goals"
                        percentage={progress.weekly.timeProgress}
                        secondaryPercentage={progress.weekly.completionProgress}
                        color="var(--green)" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-gray-400">Monthly Progress</span>
                        <span className="text-gray-400">{progress.monthly.completionProgress.toFixed(1)}%</span>
                      </div>
                      <ProgressBar 
                        label="This Month's Goals"
                        percentage={progress.monthly.timeProgress}
                        secondaryPercentage={progress.monthly.completionProgress}
                        color="var(--blue)" 
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-gray-400">Yearly Progress</span>
                        <span className="text-gray-400">{progress.yearly.completionProgress.toFixed(1)}%</span>
                      </div>
                      <ProgressBar 
                        label="This Year's Goals"
                        percentage={progress.yearly.timeProgress}
                        secondaryPercentage={progress.yearly.completionProgress}
                        color="var(--purple)" 
                      />
                    </div>
                  </div>
                </section>

                {/* Activity Overview Section */}
                <section className="card">
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl font-semibold">Monthly Overview</h2>
                    <Activity className="w-5 h-5 text-gray-400" />
                  </div>
                  <ActivityCalendar />
                </section>
              </div>

              {/* Verification Button Section */}
              <div className="space-y-4">
                {showVideoVerification && (
                  <VideoVerification onClose={handleVerificationEnd} />
                )}

                {isVerifying ? (
                  <div className="w-full bg-purple-500/10 text-purple-400 py-4 px-6 rounded-2xl flex items-center justify-center gap-4 border border-purple-500/20 text-lg font-medium">
                    <l-quantum
                      size="35"
                      speed="1.75"
                      color="rgb(168 85 247)"
                    ></l-quantum>
                    <span>Processing verification...</span>
                  </div>
                ) : !showTranscript ? (
                  // Initial verification button
                  <button 
                    onClick={() => setShowVideoVerification(true)}
                    className="w-full bg-purple-500/10 text-purple-400 py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all border border-purple-500/20 relative overflow-hidden hover:shadow-[inset_0_0_60px_rgba(168,85,247,0.2)] hover:border-purple-500/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-emerald-500/10 to-purple-500/0 animate-shimmer"/>
                    <span className="relative z-10 mr-2">→</span>
                    <span className="relative z-10">Verify Today's Progress</span>
                  </button>
                ) : geminiAnalysis ? (
                  // Show Reverify button after successful Gemini analysis
                  <button 
                    onClick={() => {
                      setShowVideoVerification(true);
                      setGeminiAnalysis(null);
                      setTranscriptData(null);
                      setShowTranscript(false);
                    }}
                    className="w-full bg-purple-500/10 text-purple-400 py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all border border-purple-500/20 relative overflow-hidden hover:shadow-[inset_0_0_60px_rgba(168,85,247,0.2)] hover:border-purple-500/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-emerald-500/10 to-purple-500/0 animate-shimmer"/>
                    <RotateCw className="relative z-10 w-5 h-5 mr-2" />
                    <span className="relative z-10">Reverify Today's Progress</span>
                  </button>
                ) : transcriptData?.message === "Transcript not found yet" ? (
                  // Show Check Transcript button when transcript is not found yet
                  <button 
                    onClick={checkWebhookTranscript}
                    className="w-full bg-purple-500/10 text-purple-400 py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all border border-purple-500/20 relative overflow-hidden hover:shadow-[inset_0_0_60px_rgba(168,85,247,0.2)] hover:border-purple-500/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-emerald-500/10 to-purple-500/0 animate-shimmer"/>
                    <NotebookText className="relative z-10 w-5 h-5 mr-2" />
                    <span className="relative z-10">Check Transcript</span>
                  </button>
                ) : transcriptData && !transcriptData.error ? (
                  // Show Gemini button when valid transcript is available
                  <button 
                    onClick={async () => {
                      console.log('Starting Gemini verification...');
                      console.log('Transcript data:', transcriptData);
                      console.log('Primary goal:', onboardingData.primaryGoal);
                      
                      try {
                        const analysis = await analyzeTranscriptWithGemini(
                          transcriptData,
                          onboardingData.primaryGoal
                        );
                        console.log('Gemini analysis result:', analysis);
                        setGeminiAnalysis(analysis);
                        
                        // Update activities.csv based on the analysis result
                        if (analysis.achieved !== undefined) {
                          await updateActivityStatus(analysis.achieved);
                        }
                      } catch (error) {
                        console.error('Error during Gemini verification:', error);
                      }
                    }}
                    className="w-full bg-purple-500/10 text-purple-400 py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all border border-purple-500/20 relative overflow-hidden hover:shadow-[inset_0_0_60px_rgba(168,85,247,0.2)] hover:border-purple-500/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-emerald-500/10 to-purple-500/0 animate-shimmer"/>
                    <Sparkles className="relative z-10 w-5 h-5 mr-2" />
                    <span className="relative z-10">Verify with Gemini</span>
                  </button>
                ) : (
                  // Show Check Transcript button when no valid transcript yet
                  <button 
                    onClick={checkWebhookTranscript}
                    className="w-full bg-purple-500/10 text-purple-400 py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all border border-purple-500/20 relative overflow-hidden hover:shadow-[inset_0_0_60px_rgba(168,85,247,0.2)] hover:border-purple-500/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-emerald-500/10 to-purple-500/0 animate-shimmer"/>
                    <NotebookText className="relative z-10 w-5 h-5 mr-2" />
                    <span className="relative z-10">Check Transcript</span>
                  </button>
                )}

                {/* Analysis Display */}
                {showTranscript && (
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Verification Analysis</h3>
                    {transcriptData?.error ? (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                        <div className="font-medium">
                          <p>Failed to fetch transcript</p>
                          <p className="text-sm mt-2">Please ensure you have:</p>
                          <ol className="list-decimal ml-5 mt-1">
                            <li>Enabled CORS headers on webhook.site (Click "Edit" in top-right)</li>
                            <li>Completed a verification call</li>
                            <li>Used a valid webhook URL</li>
                          </ol>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Status Button based on Gemini Analysis */}
                        {geminiAnalysis?.achieved === true ? (
                          <button 
                            className="w-full p-4 rounded-xl border transition-all duration-200 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400"
                            disabled
                          >
                            ✓ Daily Goal Completed
                          </button>
                        ) : geminiAnalysis?.achieved === false ? (
                          <button 
                            className="w-full p-4 rounded-xl border transition-all duration-200 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400"
                            disabled
                          >
                            ✗ Daily Goal FAILED
                          </button>
                        ) : (
                          <button 
                            className="w-full p-4 rounded-xl border transition-all duration-200 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20 text-yellow-400"
                            disabled
                          >
                            ? Unclear
                          </button>
                        )}

                        {/* Gemini Analysis Output */}
                        {geminiAnalysis && (
                          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-gray-300">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-purple-400">Status:</span>
                                <span>{geminiAnalysis.achieved ? "Achieved" : "Not Achieved"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-purple-400">Confidence:</span>
                                <span>{geminiAnalysis.confidence}%</span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-purple-400">Reasoning:</span>
                                <p className="text-sm">{geminiAnalysis.reasoning}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Raw Transcript */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Raw Transcript:</h4>
                          <pre className="whitespace-pre-wrap text-sm text-gray-400 p-4 bg-gray-800/50 rounded-xl">
                            {typeof transcriptData === 'string' 
                              ? transcriptData 
                              : JSON.stringify(transcriptData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 