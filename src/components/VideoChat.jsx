import React, { useCallback, useEffect, useState } from 'react';
import {
  DailyAudio,
  useDaily,
  useLocalSessionId,
  useParticipantIds,
  useVideoTrack,
  useAudioTrack,
} from '@daily-co/daily-react';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import VideoComponent from './Video';
import { quantum } from 'ldrs';

// Register the quantum loader
quantum.register();

const VideoChat = ({ onClose, conversationUrl }) => {
  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const isCameraEnabled = !localVideo.isOff;
  const isMicEnabled = !localAudio.isOff;
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });
  const [start, setStart] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Join call when URL is available
  useEffect(() => {
    if (conversationUrl && daily) {
      daily.join({
        url: conversationUrl,
        startVideoOff: false,
        startAudioOff: true,
      }).then(() => {
        daily.setLocalAudio(false);
      });
    }
  }, [conversationUrl, daily]);

  // Handle remote participant joining with delayed video show
  useEffect(() => {
    if (remoteParticipantIds.length && !start) {
      setStart(true);
      
      // Delay showing video to allow for proper loading
      setTimeout(() => {
        setShowVideo(true);
        // Further delay audio start to ensure everything is loaded
        setTimeout(() => {
          if (daily) {
            daily.setLocalAudio(true);
          }
        }, 2000); // 2 second delay for audio after video shows
      }, 3000); // 3 second initial delay before showing video
    }
  }, [remoteParticipantIds, start, daily]);

  const toggleVideo = useCallback(() => {
    daily?.setLocalVideo(!isCameraEnabled);
  }, [daily, isCameraEnabled]);

  const toggleAudio = useCallback(() => {
    daily?.setLocalAudio(!isMicEnabled);
  }, [daily, isMicEnabled]);

  const handleEndCall = useCallback(() => {
    if (daily) {
      daily.leave();
      daily.destroy();
    }
    onClose();
  }, [daily, onClose]);

  return (
    <div className="w-full max-w-3xl aspect-video relative bg-gray-900/50 rounded-xl overflow-hidden">
      {showVideo && remoteParticipantIds?.length > 0 ? (
        <VideoComponent
          id={remoteParticipantIds[0]}
          className="size-full"
          tileClassName="!object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <l-quantum
            size="45"
            speed="1.75"
            color="rgb(168 85 247)"
          ></l-quantum>
        </div>
      )}

      {/* Local Video */}
      {localSessionId && showVideo && (
        <VideoComponent
          id={localSessionId}
          tileClassName="!object-cover"
          className="absolute bottom-20 right-4 aspect-video h-40 w-24 overflow-hidden rounded-lg border-2 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.3)] sm:bottom-12 lg:h-auto lg:w-52"
        />
      )}

      {/* Controls */}
      <div className="absolute bottom-8 right-1/2 z-10 flex translate-x-1/2 justify-center gap-4">
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full transition-all duration-200 flex items-center justify-center border ${
            isMicEnabled 
              ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' 
              : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30'
          } shadow-lg`}
        >
          {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-all duration-200 flex items-center justify-center border ${
            isCameraEnabled 
              ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' 
              : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30'
          } shadow-lg`}
        >
          {isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        
        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-500/80 hover:bg-red-600/80 text-white transition-all duration-200 flex items-center justify-center border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
        >
          <PhoneOff size={20} />
        </button>
      </div>

      <DailyAudio />
    </div>
  );
};

export default VideoChat; 