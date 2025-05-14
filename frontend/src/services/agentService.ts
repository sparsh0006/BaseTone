import axios from 'axios';

const AGENT_BACKEND_URL = process.env.NEXT_PUBLIC_AGENT_BACKEND_URL || 'http://localhost:3005';

export interface AgentCallPayload {
  command: string;
  stallContext?: {
    id: number;
    name: string;
    agentFeatureHint: string;
  };
  walletAddress?: string;
  networkId?: string;
}

export interface AgentCallResponse {
  textResponse: string;
  actionTaken?: string;
  actionResult?: unknown; 
  error?: string;
  audioUrl?: string;
}

export async function sendCommandToAgent(payload: AgentCallPayload): Promise<AgentCallResponse> {
  try {
    const response = await axios.post<AgentCallResponse>(`${AGENT_BACKEND_URL}/voice-command`, payload);
    return response.data;
  } catch (error: unknown) { 
    console.error("Error calling agent backend:", error);
    let errorMessage = "Failed to communicate with agent.";
    if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { textResponse: `Error: ${errorMessage}`, error: errorMessage };
  }
}

export async function proxyElevenLabsTTS(text: string): Promise<Blob | null> {
  try {
    const response = await axios.post(
      `${AGENT_BACKEND_URL}/tts-proxy`,
      { text },
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error: unknown) { 
    console.error("Error proxying TTS request:", error);
    return null;
  }
}

export async function resetAgentConversationOnBackend(): Promise<void> {
  try {
    await axios.post(`${AGENT_BACKEND_URL}/reset-conversation`);
    console.log("Agent conversation reset successfully via backend.");
  } catch (error: unknown) { // Changed from any
    console.error("Error resetting agent conversation via backend:", error);
  }
}