// frontend/src/hooks/useVoiceInteraction.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { sendCommandToAgent, proxyElevenLabsTTS, AgentCallPayload } from '@/services/agentService';
import { StallConfig } from '@/lib/stallsData';
// Ensure SpeechRecognitionEvent is exported from your types file
import SpeechRecognitionAPI, { SpeechRecognitionEvent } from '@/app/arena/types/speechRecognition';

export interface UseVoiceInteractionReturn {
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  agentResponseText: string | null;
  agentActionDetails: string | null;
  startRecognition: (stallContext?: StallConfig) => void;
  stopRecognition: () => void;
  clearAgentResponse: () => void;
}

interface Props {
  walletAddress?: string;
  currentNetworkId?: string;
}

// Define a more specific type for SpeechRecognitionError if not in your types file
interface SpeechRecognitionErrorEvent extends Event {
    error: string; // Standard DOMError types for speech recognition are 'no-speech', 'audio-capture', 'network', etc.
    message?: string; // Some implementations might provide a message
  }

export function useVoiceInteraction({ walletAddress, currentNetworkId }: Props): UseVoiceInteractionReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentResponseText, setAgentResponseText] = useState<string | null>(null);
  const [agentActionDetails, setAgentActionDetails] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionAPI | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeStallContextRef = useRef<StallConfig | null>(null);

  const playAgentAudio = useCallback(async (text: string) => {
    setError(null);
    try {
      const audioBlob = await proxyElevenLabsTTS(text);
      if (audioBlob && audioRef.current) {
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.pause();
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      } else if (!audioBlob) {
        console.warn("TTS proxy returned no audio blob.");
      }
    } catch (e: unknown) {
      console.error("TTS Playback error:", e);
      setError(`TTS Playback Error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);

  const handleRecognitionResult = useCallback(async (event: SpeechRecognitionEvent) => {
    if (!event.results || event.results.length === 0 || !event.results[0][0]) {
        console.error("Speech recognition event does not contain valid results.", event);
        setError("No speech detected or result format unexpected.");
        setIsProcessing(false);
        return;
    }
    const transcript = event.results[0][0].transcript;
    console.log("Transcribed:", transcript);
    setIsProcessing(true);
    setError(null);
    setAgentResponseText(null);
    setAgentActionDetails(null);

    const payload: AgentCallPayload = {
      command: transcript,
      walletAddress: walletAddress || undefined,
      networkId: currentNetworkId || undefined,
    };
    if (activeStallContextRef.current) {
      payload.stallContext = {
        id: activeStallContextRef.current.id,
        name: activeStallContextRef.current.name,
        agentFeatureHint: activeStallContextRef.current.agentFeatureHint,
      };
    }

    const result = await sendCommandToAgent(payload);
    setIsProcessing(false);

    if (result.error) {
      setError(result.error);
      setAgentResponseText(`Error: ${result.error}`);
    } else {
      setAgentResponseText(result.textResponse);
      if (result.actionTaken || result.actionResult) {
        setAgentActionDetails(JSON.stringify({ action: result.actionTaken, result: result.actionResult }, null, 2));
      }
      if (result.textResponse) {
        await playAgentAudio(result.textResponse);
      }
    }
  }, [walletAddress, currentNetworkId, playAgentAudio]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPIImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPIImpl) {
        const instance = new SpeechRecognitionAPIImpl();
        instance.continuous = false;
        instance.interimResults = false;
        instance.lang = 'en-US';

        instance.onstart = () => setIsRecording(true);
        instance.onend = () => setIsRecording(false);
        // Use SpeechRecognitionEvent for onerror if it's correctly defined to include an 'error' property.
        // Otherwise, use a more generic Event or SpeechRecognitionErrorEvent as defined above.
        instance.onerror = (event: Event | SpeechRecognitionEvent | SpeechRecognitionErrorEvent ) => {
          const errorProperty = (event as SpeechRecognitionEvent).error || (event as SpeechRecognitionErrorEvent).error || 'unknown-error';
          setError(`Speech recognition error: ${errorProperty}`);
          setIsRecording(false);
        };
         // Cast is necessary if handleRecognitionResult expects SpeechRecognitionEvent
         // and onresult provides a more generic Event. Ensure your types align.
        instance.onresult = (event: Event) => handleRecognitionResult(event as SpeechRecognitionEvent);

        recognitionRef.current = instance;
      } else {
        setError("SpeechRecognitionAPI constructor is not available.");
      }
      audioRef.current = new Audio();
    } else {
      setError("Speech recognition not supported in this browser.");
    }

    return () => {
      recognitionRef.current?.stop();
      audioRef.current?.pause();
    };
  }, [handleRecognitionResult]); // handleRecognitionResult is memoized by useCallback

  const startRecognition = (stallContext?: StallConfig) => {
    if (recognitionRef.current && !isRecording) {
      activeStallContextRef.current = stallContext || null;
      setError(null);
      setAgentResponseText(null);
      setAgentActionDetails(null);
      if (audioRef.current) {
        audioRef.current.pause(); // Ensure audioRef.current is checked
      }
      try {
        recognitionRef.current.start();
      } catch (e: unknown) {
         console.error("Error starting speech recognition:", e);
         setError(`Failed to start microphone. Please check permissions. Error: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  };

  const stopRecognition = () => {
    if (recognitionRef.current && isRecording) { // Check recognitionRef.current
      recognitionRef.current.stop();
    }
  };

  const clearAgentResponse = () => {
    setAgentResponseText(null);
    setAgentActionDetails(null);
    setError(null);
  };

  return { isRecording, isProcessing, error, agentResponseText, agentActionDetails, startRecognition, stopRecognition, clearAgentResponse };
}