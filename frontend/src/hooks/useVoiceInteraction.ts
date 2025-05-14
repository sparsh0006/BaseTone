// frontend/src/hooks/useVoiceInteraction.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { sendCommandToAgent, proxyElevenLabsTTS, AgentCallPayload, AgentCallResponse } from '@/services/agentService';
import { StallConfig } from '@/lib/stallsData';
import SpeechRecognitionAPI, { SpeechRecognitionEvent } from '@/app/arena/types/speechRecognition'; // Assuming your types are here

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
    } catch (e: any) {
      console.error("TTS Playback error:", e);
      setError(`TTS Playback Error: ${e.message}`);
    }
  }, []);

  const handleRecognitionResult = useCallback(async (event: SpeechRecognitionEvent) => {
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
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
      } else {
        setError("SpeechRecognitionAPI is not available.");
      }
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsRecording(true);
      recognitionRef.current.onend = () => setIsRecording(false);
      recognitionRef.current.onerror = (event: any) => { // Use 'any' for simplicity, or find a more specific type
        setError(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
      };
      recognitionRef.current.onresult = handleRecognitionResult;

      audioRef.current = new Audio();
    } else {
      setError("Speech recognition not supported in this browser.");
    }

    return () => {
      recognitionRef.current?.stop();
      audioRef.current?.pause();
    };
  }, [handleRecognitionResult]);

  const startRecognition = (stallContext?: StallConfig) => {
    if (recognitionRef.current && !isRecording) {
      activeStallContextRef.current = stallContext || null;
      setError(null);
      setAgentResponseText(null);
      setAgentActionDetails(null);
      audioRef.current?.pause(); // Stop any ongoing TTS
      try {
        recognitionRef.current.start();
      } catch (e) {
         console.error("Error starting speech recognition:", e);
         setError("Failed to start microphone. Please check permissions.");
      }
    }
  };

  const stopRecognition = () => {
    if (recognitionRef.current && isRecording) {
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