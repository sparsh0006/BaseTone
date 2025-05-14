// frontend/src/app/arena/components/SpeechRecognition.tsx
import React from "react";

interface SpeechRecognitionUiProps {
  position: { x: number; y: number }; // No longer strictly needed for positioning here
  activeTile: number | null;
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  agentResponse: string | null;
}

const SpeechRecognitionUi: React.FC<SpeechRecognitionUiProps> = ({
  activeTile,
  isRecording,
  isProcessing,
  error,
  agentResponse,
}) => {
  let statusMessage = "";
  let statusBgColor = "bg-gray-900/80";
  let statusTextColor = "text-white";
  let showSpinner = false;

  if (isRecording) {
    statusMessage = "Listening...";
    statusBgColor = "bg-red-700/80"; // More vibrant for recording
    showSpinner = true; // Or a microphone icon
  } else if (isProcessing) {
    statusMessage = "Agent Thinking...";
    statusBgColor = "bg-blue-700/80";
    showSpinner = true;
  } else if (error) {
    statusMessage = error;
    statusBgColor = "bg-red-800/90"; // Darker red for errors
    statusTextColor = "text-red-300";
  } else if (agentResponse) {
    statusMessage = agentResponse;
    statusBgColor = "bg-indigo-800/90"; // Different color for agent response
    statusTextColor = "text-indigo-200";
  }

  // Only render if there's something to show (recording, processing, error, or agent response)
  // and an active tile (meaning player is near a stall and interaction is possible)
  if (!activeTile && !statusMessage) return null;
  if (!isRecording && !isProcessing && !error && !agentResponse) return null;


  return (
    <div
      className={`p-3 rounded-lg border shadow-xl transition-all duration-300 ease-in-out ${statusBgColor} ${statusTextColor} border-opacity-50 ${
        error ? 'border-red-500' : agentResponse ? 'border-indigo-500' : isProcessing ? 'border-blue-500' : 'border-gray-700'
      }`}
      style={{ minWidth: '200px', maxWidth: '300px' }} // Ensure it has some width
    >
      <div className="flex items-center">
        {showSpinner && (
          <div className={`w-4 h-4 border-2 ${isRecording ? 'border-red-400' : 'border-blue-400'} border-t-transparent rounded-full animate-spin mr-2`}></div>
        )}
        <span className="text-sm font-pixel leading-tight">{statusMessage}</span>
      </div>
    </div>
  );
};

export default SpeechRecognitionUi;