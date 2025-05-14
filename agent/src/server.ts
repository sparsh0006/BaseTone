import express from 'express';
import cors from 'cors';
import axios from 'axios'; // Keep the default import
// No need to import AxiosResponse separately if we type data property directly
import { config as appConfig } from './config';
import { initializeAgentKit } from './agentKitClient';
import { processVoiceCommand, resetConversation, StallContext } from './agent';
import type { Readable } from 'stream'; // Import Readable from stream for typing

const app = express();

app.use(cors());
app.use(express.json());

let agentKitReady = false;

initializeAgentKit()
  .then(() => {
    agentKitReady = true;
    console.log("AgentKit initialized. Backend ready to serve requests on Agent features.");
  })
  .catch(error => {
    console.error("FATAL: Failed to initialize AgentKit:", error);
    // process.exit(1);
  });

app.post('/voice-command', async (req, res) => {
  if (!agentKitReady) {
    return res.status(503).json({ error: 'AgentKit is not ready. Please try again shortly.' });
  }
  const {
    command,
    stallContext,
    walletAddress,
    networkId
  }: {
    command: string;
    stallContext?: StallContext;
    walletAddress?: string;
    networkId?: string;
  } = req.body;

  if (!command || typeof command !== 'string') {
    return res.status(400).json({ error: 'Command string is required.' });
  }
  console.log("Received command:", command);
  if (stallContext) console.log("Stall Context:", stallContext);
  if (walletAddress) console.log("User Wallet Address:", walletAddress);
  if (networkId) console.log("User Current Network ID:", networkId);

  try {
    const agentResponse = await processVoiceCommand(command, stallContext, walletAddress, networkId);
    res.json(agentResponse);
  } catch (error: any) {
    console.error("Error processing voice command in server route:", error);
    res.status(500).json({ error: 'Failed to process command on server.', details: error.message });
  }
});

app.post('/reset-conversation', (req, res) => {
  resetConversation();
  res.status(200).json({ message: "Agent conversation history reset successfully." });
});

app.post('/tts-proxy', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required for TTS.' });
  }
  if (!appConfig.elevenLabsApiKey || !appConfig.elevenLabsVoiceId) {
    console.error("ElevenLabs API Key or Voice ID is not configured on the backend.");
    return res.status(500).json({ error: 'TTS service not configured on backend.' });
  }

  const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${appConfig.elevenLabsVoiceId}/stream`;
  try {
    console.log(`Proxying TTS request to ElevenLabs for text: "${text}" (URL: ${ttsUrl})`);
    const ttsResponse = await axios.post<Readable>( // Use axios.post<Readable>
      ttsUrl,
      {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.5 },
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': appConfig.elevenLabsApiKey,
          // 'Accept-Encoding': 'identity' // Try uncommenting this if gzip issues persist
        },
        responseType: 'stream',
      }
    );

    res.setHeader('Content-Type', 'audio/mpeg');

    ttsResponse.data.on('data', (chunk) => {
        // console.log(`TTS Stream: Received ${chunk.length} bytes`);
    });

    ttsResponse.data.pipe(res);

    ttsResponse.data.on('end', () => {
      console.log('TTS stream from ElevenLabs finished.');
      // pipe automatically ends the response stream (res)
    });

    ttsResponse.data.on('error', (streamError: Error) => {
      console.error('Error during TTS stream piping from ElevenLabs:', streamError);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming TTS audio.', details: streamError.message });
      } else if (!res.writableEnded) {
        res.end();
      }
    });

    res.on('error', (clientError: Error) => {
        console.error('Error in client response stream:', clientError);
        if (ttsResponse.data && typeof ttsResponse.data.destroy === 'function') {
            ttsResponse.data.destroy();
        }
    });

  } catch (error: any) {
    let errorDetails = "Unknown TTS error";
    if (error.response) {
      if (error.response.data && typeof error.response.data.pipe === 'function') {
        let errorStreamData = '';
        const errorStream = error.response.data as Readable;
        try {
            for await (const chunk of errorStream) { // Asynchronously read the stream
                errorStreamData += chunk.toString();
            }
            console.error(`ElevenLabs Stream Error Data: ${errorStreamData}`);
            errorDetails = `ElevenLabs API responded with status ${error.response.status}. Detail: ${errorStreamData || 'No further detail.'}`;
        } catch (streamReadError) {
            console.error('Error reading error stream:', streamReadError);
            errorDetails = `ElevenLabs API responded with status ${error.response.status}, but error content stream could not be read.`;
        }
      } else if (error.response.data) {
        errorDetails = error.response.data.detail || JSON.stringify(error.response.data) || error.message;
      } else {
        errorDetails = error.message;
      }
      console.error("Error calling ElevenLabs API via proxy:", error.message, "Status:", error.response.status, "Details:", errorDetails);
    } else {
      errorDetails = error.message;
      console.error("Non-Axios error calling ElevenLabs API via proxy:", errorDetails);
    }

    if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate TTS from ElevenLabs via proxy.', details: errorDetails });
    } else {
        console.error("Headers already sent, cannot send JSON error response for TTS failure.");
        if(!res.writableEnded) res.end();
    }
  }
});

app.get('/', (req, res) => {
    res.send("Agent backend is running. AgentKit status: " + (agentKitReady ? "Ready" : "Initializing/Failed"));
});

app.listen(appConfig.port, () => {
  console.log(`Agent backend server listening on port ${appConfig.port}`);
});