import React, { useState } from 'react';
import VideoChat from './VideoChat';
import { createConversation } from '../utils/createConversation';
import { DailyProvider } from '@daily-co/daily-react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { quantum } from 'ldrs';

quantum.register();

const VideoVerification = ({ onClose }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [conversationUrl, setConversationUrl] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const handleStartVerification = async () => {
    try {
      setError(null);
      setIsVerifying(true);
      
      // Create a promise that resolves after minimum loading time
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 2000));
      
      // Run both promises in parallel
      const [conversation] = await Promise.all([
        createConversation(),
        minLoadingTime
      ]);
      
      console.log('Conversation created:', conversation);
      
      // Store both URL and ID
      setConversationUrl(conversation.conversation_url);
      setConversationId(conversation.conversation_id);
    } catch (err) {
      setError('Failed to start video verification. Please try again.');
      console.error('Error creating conversation:', err);
      setIsVerifying(false);
    }
  };

  // When the video chat is closed, pass the ID back
  const handleClose = () => {
    console.log('Closing video chat, conversation ID:', conversationId);
    onClose(conversationId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="card max-w-3xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Real-Time Accountability Session</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}
        
        {isVerifying ? (
          conversationUrl ? (
            <DailyProvider>
              <VideoChat 
                conversationUrl={conversationUrl}
                onClose={handleClose}
              />
            </DailyProvider>
          ) : (
            <div className="w-full max-w-3xl aspect-video relative bg-gray-900/50 rounded-xl overflow-hidden">
              <div className="flex h-full items-center justify-center">
                <l-quantum
                  size="45"
                  speed="1.75"
                  color="rgb(168 85 247)"
                ></l-quantum>
              </div>
              
              <div className="absolute bottom-8 right-1/2 z-10 flex translate-x-1/2 justify-center gap-4">
                <button
                  disabled
                  className="p-4 rounded-full transition-all duration-200 flex items-center justify-center border bg-white/10 text-white/50 border-white/20 opacity-50 cursor-not-allowed shadow-lg"
                >
                  <MicOff size={20} />
                </button>
                
                <button
                  disabled
                  className="p-4 rounded-full transition-all duration-200 flex items-center justify-center border bg-white/10 text-white/50 border-white/20 opacity-50 cursor-not-allowed shadow-lg"
                >
                  <Video size={20} />
                </button>
                
                <button
                  disabled
                  className="p-4 rounded-full bg-red-500/80 text-white/50 transition-all duration-200 flex items-center justify-center border border-red-500/30 opacity-50 cursor-not-allowed shadow-lg"
                >
                  <PhoneOff size={20} />
                </button>
              </div>
            </div>
          )
        ) : (
          <>
            <div className="aspect-video bg-gray-900/50 rounded-xl mb-6 overflow-hidden">
              <div className="w-full h-full flex flex-col gap-3 items-center justify-center text-gray-400">
                <div className="flex items-center gap-2">
                  <Video className="text-purple-400" size={24} />
                  <span>Click "Start Verification" to begin video chat with your coach.</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button 
                onClick={handleClose}
                className="px-6 py-2 rounded-xl border border-gray-500/20 hover:border-gray-500/30 text-gray-400"
              >
                Cancel
              </button>
              <button 
                onClick={handleStartVerification}
                className="px-6 py-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 relative overflow-hidden hover:shadow-[inset_0_0_60px_rgba(168,85,247,0.2)] hover:border-purple-500/40"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-emerald-500/10 to-purple-500/0 animate-shimmer"/>
                <span className="relative z-10">Start Verification</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoVerification; 