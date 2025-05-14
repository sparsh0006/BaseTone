import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || '3005',
  openaiApiKey: process.env.OPENAI_API_KEY,
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID,
  cdp: {
    apiKeyName: process.env.CDP_API_KEY_NAME,
    apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
    baseRpcUrl: process.env.BASE_RPC_URL, 
    baseNetworkId: process.env.BASE_NETWORK_ID, 
  },

};

if (!config.openaiApiKey) throw new Error("Missing OPENAI_API_KEY");
if (!config.elevenLabsApiKey) throw new Error("Missing ELEVENLABS_API_KEY");
if (!config.elevenLabsVoiceId) throw new Error("Missing ELEVENLABS_VOICE_ID");
if (!config.cdp.apiKeyName || !config.cdp.apiKeyPrivateKey || !config.cdp.baseNetworkId) {
  throw new Error("Missing CDP configuration (API Key Name, Private Key, or Base Network ID)");
}