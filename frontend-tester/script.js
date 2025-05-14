const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const resetConversationButton = document.getElementById('resetConversationButton');
const transcribedTextElement = document.getElementById('transcribedText');
const agentResponseTextElement = document.getElementById('agentResponseText');
const agentActionDetailsElement = document.getElementById('agentActionDetails');
const statusElement = document.getElementById('status');

const AGENT_BACKEND_URL = 'http://localhost:3005/voice-command'; // Match your agent's port
const RESET_CONVERSATION_URL = 'http://localhost:3005/reset-conversation';

let recognition;
let isRecording = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognitionAPI();
    recognition.continuous = false; // Stop after first utterance
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isRecording = true;
        statusElement.textContent = 'Listening... Speak your command.';
        startButton.disabled = true;
        stopButton.disabled = false;
        transcribedTextElement.textContent = '-';
        agentResponseTextElement.textContent = '-';
        agentActionDetailsElement.textContent = '-';
    };

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        transcribedTextElement.textContent = transcript;
        statusElement.textContent = 'Processing your command...';
        await sendToAgent(transcript);
    };

    recognition.onerror = (event) => {
        statusElement.textContent = `Error in speech recognition: ${event.error}`;
        console.error('Speech recognition error', event);
        stopRecording();
    };

    recognition.onend = () => {
        if (isRecording) { // If it ended prematurely, stop officially
            stopRecording();
        }
    };

} else {
    statusElement.textContent = 'Speech recognition not supported by your browser. Please use Chrome or Safari.';
    startButton.disabled = true;
    stopButton.disabled = true;
}

function startRecording() {
    if (recognition && !isRecording) {
        try {
            recognition.start();
        } catch (e) {
            statusElement.textContent = 'Could not start recording. Microphone permission?';
            console.error("Error starting recognition:", e);
        }
    }
}

function stopRecording() {
    if (recognition && isRecording) {
        recognition.stop();
    }
    isRecording = false;
    startButton.disabled = false;
    stopButton.disabled = true;
    if (statusElement.textContent === 'Listening... Speak your command.') {
        statusElement.textContent = 'Stopped. Press "Start Listening".';
    }
}

async function sendToAgent(command) {
    try {
        const response = await fetch(AGENT_BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        agentResponseTextElement.textContent = data.textResponse || 'No text response from agent.';
        if (data.actionTaken || data.actionResult) {
            agentActionDetailsElement.textContent = JSON.stringify({
                action: data.actionTaken,
                result: data.actionResult,
            }, null, 2);
        } else if (data.error) {
             agentActionDetailsElement.textContent = `Agent Error: ${data.error}`;
        } else {
            agentActionDetailsElement.textContent = '-';
        }

        if (data.textResponse) {
            await playTTS(data.textResponse);
        }
        statusElement.textContent = 'Agent responded. Press "Start Listening" for new command.';

    } catch (error) {
        console.error('Error sending command to agent:', error);
        statusElement.textContent = `Error: ${error.message}`;
        agentResponseTextElement.textContent = 'Error communicating with agent.';
    } finally {
        stopRecording(); // Ensure recording stops even if there's an error
    }
}

async function playTTS(text) {
    // This is where you would get the API key from your agent's .env, but for frontend it's tricky.
    // For a real app, the backend should proxy this request or the TTS should be handled by the backend sending audio.
    // For this basic tester, we'll assume the API key is hardcoded or globally available (NOT recommended for production).
    const ELEVENLABS_API_KEY = prompt("Enter ElevenLabs API Key for TTS (or leave blank to skip):"); // Ask user for simplicity
    const ELEVENLABS_VOICE_ID = prompt("Enter ElevenLabs Voice ID (or leave blank for default/skip):", "21m00Tcm4TlvDq8ikWAM"); // Default voice

    if (!ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
        console.warn("ElevenLabs API Key or Voice ID not provided. Skipping TTS.");
        return;
    }

    const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`;
    try {
        statusElement.textContent = 'Fetching audio from ElevenLabs...';
        const response = await fetch(ttsUrl, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY,
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_monolingual_v1', // Or your preferred model
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`ElevenLabs TTS error: ${errorData.detail ? errorData.detail[0].msg : response.statusText}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        statusElement.textContent = 'Playing agent response...';
        audio.play();
        audio.onended = () => {
            statusElement.textContent = 'Agent response played. Press "Start Listening".';
        };
    } catch (error) {
        console.error('Error playing TTS:', error);
        statusElement.textContent = `TTS Error: ${error.message}. Check console.`;
    }
}

async function resetAgentConversation() {
    try {
        statusElement.textContent = 'Resetting conversation...';
        const response = await fetch(RESET_CONVERSATION_URL, { method: 'POST' });
        if (!response.ok) {
            throw new Error(`Failed to reset conversation: ${response.statusText}`);
        }
        const data = await response.json();
        statusElement.textContent = data.message || 'Conversation reset. Press "Start Listening".';
        transcribedTextElement.textContent = '-';
        agentResponseTextElement.textContent = '-';
        agentActionDetailsElement.textContent = '-';
    } catch (error) {
        console.error('Error resetting conversation:', error);
        statusElement.textContent = `Error resetting: ${error.message}`;
    }
}


startButton.addEventListener('click', startRecording);
stopButton.addEventListener('click', stopRecording);
resetConversationButton.addEventListener('click', resetAgentConversation);

// Initial state
stopButton.disabled = true;