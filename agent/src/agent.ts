import { OpenAI } from 'openai';
import { config as appConfig } from './config';
import { getAgentKitInstance, getAgentKitTools } from './agentKitClient';

const openai = new OpenAI({
  apiKey: appConfig.openaiApiKey,
});

interface AgentResponse {
  textResponse: string;
  actionTaken?: string;
  actionResult?: any;
  error?: string;
}

// Keep track of the conversation
let conversationHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

export async function processVoiceCommand(command: string): Promise<AgentResponse> {
  const agentKit = getAgentKitInstance(); // Ensure AgentKit is initialized
  const tools = getAgentKitTools();

  // Add user's command to conversation history
  conversationHistory.push({ role: "user", content: command });

  // System Prompt - CRUCIAL for guiding the LLM
  const agentKitAddress = agentKit['walletProvider']?.getAddress() || "Wallet not fully initialized";
  const systemPrompt = `You are a helpful Web3 voice assistant.
Your primary operational network is Base (specifically ${appConfig.cdp.baseNetworkId}). All on-chain actions like deployments, balance checks for your connected wallet, and NFT interactions via OpenSea should target this Base network unless explicitly told otherwise for a specific tool (like bridging).
When a user asks for a price, use Pyth. When they ask for general crypto info, use Messari or DefiLlama.
Available tools:
${tools.map(tool => `- ${tool.function.name}: ${tool.function.description}`).join('\n')}
When you use a tool, provide all required parameters.
After a tool executes, if it's an on-chain transaction, confirm success and provide the transaction hash.
If a tool returns data, summarize it clearly for the user.
If you are unsure or a command is ambiguous, use the "clarify_or_get_more_info" tool to ask the user for more details. Do not try to guess.
Your connected wallet address on Base is: ${agentKitAddress}.`;

  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory
    ];

    console.log("Sending to OpenAI:", JSON.stringify(messages, null, 2));
    console.log("With tools:", JSON.stringify(tools, null, 2));

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Or your preferred model
      messages: messages,
      tools: tools,
      tool_choice: "auto",
    });

    const responseMessage = response.choices[0].message;
    conversationHistory.push(responseMessage); // Add AI's response to history

    if (responseMessage.tool_calls) {
      console.log("OpenAI wants to call tools:", responseMessage.tool_calls);
      const toolCall = responseMessage.tool_calls[0]; // Assuming one tool call for simplicity
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      if (functionName === "clarify_or_get_more_info") {
        conversationHistory.push({
            tool_call_id: toolCall.id,
            role: "tool",
            // 'name' property is not part of ChatCompletionToolMessageParam
            content: JSON.stringify({ clarification_sent_to_user: true })
        });
        return { textResponse: functionArgs.question_to_user };
      }

      const actionToExecute = agentKit.getActions().find(a => a.name.replace(/ActionProvider_/g, '_') === functionName);

      if (actionToExecute) {
        console.log(`Executing AgentKit action: ${actionToExecute.name} with args:`, functionArgs);
        try {
          const result = await actionToExecute.invoke(functionArgs);
          console.log(`AgentKit action ${actionToExecute.name} result:`, result);
          conversationHistory.push({
            tool_call_id: toolCall.id,
            role: "tool",
            // 'name' property is not part of ChatCompletionToolMessageParam
            content: typeof result === 'string' ? result : JSON.stringify(result),
          });

          // Get final response from OpenAI after tool execution
          const finalMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
             { role: "system", content: systemPrompt },
             ...conversationHistory
          ];
          const finalResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: finalMessages,
          });
          const aiFinalText = finalResponse.choices[0].message.content || "Action performed.";
          conversationHistory.push(finalResponse.choices[0].message); // Add final AI response

          return {
            textResponse: aiFinalText,
            actionTaken: functionName,
            actionResult: result,
          };
        } catch (e: any) {
          console.error(`Error executing AgentKit action ${actionToExecute.name}:`, e);
          conversationHistory.push({
            tool_call_id: toolCall.id,
            role: "tool",
            // 'name' property is not part of ChatCompletionToolMessageParam
            content: JSON.stringify({ error: e.message || "Unknown error during action execution" }),
          });
          return { textResponse: `Error performing action ${functionName}: ${e.message}`, error: e.message };
        }
      } else {
        console.error(`AgentKit action not found for tool: ${functionName}`);
        // If the tool isn't an agentkit action (e.g. clarify_or_get_more_info handled above, or others you might add)
        // this path might be taken. For now, assume it's an error if not caught earlier.
         conversationHistory.push({
            tool_call_id: toolCall.id,
            role: "tool",
            // 'name' property is not part of ChatCompletionToolMessageParam
            content: JSON.stringify({ error: `Tool ${functionName} not found or not an AgentKit action.` }),
          });
        return { textResponse: `Sorry, I don't know how to do '${functionName}'.`, error: `Tool ${functionName} not mapped to AgentKit action.` };
      }
    } else if (responseMessage.content) {
      console.log("OpenAI response (no tool call):", responseMessage.content);
      return { textResponse: responseMessage.content };
    } else {
      return { textResponse: "I'm not sure how to respond to that.", error: "No content or tool_calls in OpenAI response." };
    }

  } catch (error: any) {
    console.error("Error in processVoiceCommand:", error);
    return { textResponse: "Sorry, I encountered an error.", error: error.message };
  }
}

export function resetConversation() {
    conversationHistory = [];
    console.log("Conversation history reset.");
}