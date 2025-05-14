// frontend/src/services/agentService.ts
import axios from 'axios';

const AGENT_BACKEND_URL = process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://localhost:3005'; // Use your agent port

export interface AgentCallPayload {
  command: string;
  stallContext?: { // Optional: send context about the active stall
    id: number;
    name: string;
    agentFeatureHint: string;
  };
  walletAddress?: string; // Send the user's wallet address for context
  networkId?: string; // Send the current network context
}

export interface AgentCallResponse {
  textResponse: string;
  actionTaken?: string;
  actionResult?: any;
  error?: string;
  audioUrl?: string; // If backend handles TTS and returns URL
}

export async function sendCommandToAgent(payload: AgentCallPayload): Promise<AgentCallResponse> {
  try {
    const response = await axios.post<AgentCallResponse>(`${AGENT_BACKEND_URL}/voice-command`, payload);
    return response.data;
  } catch (error: any) {
    console.error("Error calling agent backend:", error);
    const errorMessage = error.response?.data?.error || error.message || "Failed to communicate with agent.";
    return { textResponse: `Error: ${errorMessage}`, error: errorMessage };
  }
}

export async function proxyElevenLabsTTS(text: string): Promise<Blob | null> {
  try {
    // This endpoint needs to be created on one of your backends (agent or socket.io backend)
    // For simplicity, let's assume your agent backend will handle it at /tts-proxy
    const response = await axios.post(
      `${AGENT_BACKEND_URL}/tts-proxy`,
      { text },
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    console.error("Error proxying TTS request:", error);
    return null;
  }
}

export async function resetAgentConversationOnBackend(): Promise<void> {
  try {
    await axios.post(`${AGENT_BACKEND_URL}/reset-conversation`);
    console.log("Agent conversation reset successfully via backend.");
  } catch (error) {
    console.error("Error resetting agent conversation via backend:", error);
  }
}