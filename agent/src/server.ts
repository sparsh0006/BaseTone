import express from 'express';
import cors from 'cors';
import { config as appConfig } from './config';
import { initializeAgentKit } from './agentKitClient';
import { processVoiceCommand, resetConversation } from './agent'; 

const app = express();
app.use(cors());
app.use(express.json());

initializeAgentKit()
  .then(() => {
    console.log("AgentKit ready to serve requests.");

    app.post('/voice-command', async (req, res) => {
      const { command } = req.body;
      if (!command || typeof command !== 'string') {
        return res.status(400).json({ error: 'Command string is required.' });
      }

      try {
        const agentResponse = await processVoiceCommand(command);
        res.json(agentResponse);
      } catch (error: any) {
        console.error("Error processing voice command:", error);
        res.status(500).json({ error: 'Failed to process command.', details: error.message });
      }
    });

    app.post('/reset-conversation', (req, res) => {
        resetConversation();
        res.status(200).json({ message: "Conversation reset successfully." });
    });


    app.listen(appConfig.port, () => {
      console.log(`Agent backend server listening on port ${appConfig.port}`);
    });
  })
  .catch(error => {
    console.error("Failed to initialize AgentKit:", error);
    process.exit(1); 
  });