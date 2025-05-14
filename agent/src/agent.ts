import { OpenAI } from 'openai';
import { config as appConfig } from './config';
import { getAgentKitInstance, getAgentKitTools, AgentTool } from './agentKitClient'; // Assuming AgentTool is exported

// Define types for OpenAI interaction if not already available or to be more specific
interface OpenAIChatCompletionMessageParam {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[];
  tool_call_id?: string;
}

export interface AgentResponse {
  textResponse: string;
  actionTaken?: string;
  actionResult?: any;
  error?: string;
}

export interface StallContext {
  id: number;
  name: string;
  agentFeatureHint: string;
}

const openai = new OpenAI({
  apiKey: appConfig.openaiApiKey,
});

// Keep track of the conversation
let conversationHistory: OpenAIChatCompletionMessageParam[] = [];

export async function processVoiceCommand(
  command: string,
  stallContext?: StallContext,
  walletAddress?: string, // Passed from frontend for context
  networkId?: string      // Passed from frontend for context
): Promise<AgentResponse> {
  const agentKit = getAgentKitInstance();
  const tools = getAgentKitTools() as OpenAI.Chat.Completions.ChatCompletionTool[]; // Cast for OpenAI SDK

  // Add user's command to conversation history
  conversationHistory.push({ role: "user", content: command });

  const agentKitAddress = agentKit['walletProvider']?.getAddress() || "Wallet address not fully initialized";
  const agentNetwork = agentKit['walletProvider']?.getNetwork();
  const agentBaseNetworkId = agentNetwork?.networkId || appConfig.cdp.baseNetworkId;


  let systemContext = `Your primary operational network is Base (specifically ${agentBaseNetworkId}). Your connected wallet address on Base is: ${agentKitAddress}.`;
  if (walletAddress && walletAddress.toLowerCase() !== agentKitAddress.toLowerCase()) {
    systemContext += ` The user's interacting wallet address appears to be ${walletAddress}.`;
  }
  if (networkId && networkId !== agentBaseNetworkId) {
     systemContext += ` The user seems to be viewing content on the ${networkId} network, but your actions are on ${agentBaseNetworkId}.`;
  }


  if (stallContext) {
    systemContext += `\n\nYou are currently interacting with the "${stallContext.name}" stall. This stall is related to: ${stallContext.agentFeatureHint}. Prioritize tools relevant to this context if applicable.`;
  }

  const systemPrompt = `You are a helpful Web3 voice assistant for the Taifei Bazaar.
${systemContext}
When a user asks for a price, use Pyth. When they ask for general crypto info, use Messari or DefiLlama.
Available tools:
${tools.map(tool => `- ${tool.function.name}: ${tool.function.description}`).join('\n')}
When you use a tool, provide all required parameters precisely as described.
After a tool executes, if it's an on-chain transaction, confirm success and provide the transaction hash.
If a tool returns data, summarize it clearly and concisely for the user.
If you are unsure, if the command is ambiguous, or if the user's request doesn't match any specific tool for the current stall, use the "clarify_or_get_more_info" tool to ask the user for more details or guide them. Do not try to guess or make up actions.
If an action fails, inform the user clearly about the error.`;

  try {
    const messages: OpenAIChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory
    ];

    console.log("Sending to OpenAI - Messages:", JSON.stringify(messages, null, 2));
    console.log("Sending to OpenAI - Tools:", JSON.stringify(tools, null, 2));

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[], // Cast for SDK
      tools: tools,
      tool_choice: "auto",
    });

    const responseMessage = response.choices[0].message;
    conversationHistory.push(responseMessage as OpenAIChatCompletionMessageParam);

    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      console.log("OpenAI wants to call tools:", responseMessage.tool_calls);
      // For simplicity, handling one tool call. Loop if multiple are possible.
      const toolCall = responseMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      let functionArgs = {};
      try {
        functionArgs = JSON.parse(toolCall.function.arguments);
      } catch (parseError) {
        console.error("Error parsing tool arguments:", parseError, "\nArguments string:", toolCall.function.arguments);
        conversationHistory.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: JSON.stringify({ error: "Invalid arguments format from LLM." }),
        });
        return { textResponse: "Sorry, there was an issue understanding the parameters for that action. Could you try rephrasing?", error: "Argument parsing error." };
      }


      if (functionName === "clarify_or_get_more_info") {
        conversationHistory.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: JSON.stringify({ clarification_sent_to_user: true, question: (functionArgs as any).question_to_user })
        });
        return { textResponse: (functionArgs as any).question_to_user };
      }

      const actionToExecute = agentKit.getActions().find(a => a.name.replace(/ActionProvider_/g, '_') === functionName);

      if (actionToExecute) {
        console.log(`Executing AgentKit action: ${actionToExecute.name} with args:`, functionArgs);
        let result;
        try {
          // Validate arguments with Zod schema before invoking
          const validatedArgs = actionToExecute.schema.parse(functionArgs);
          result = await actionToExecute.invoke(validatedArgs);
          console.log(`AgentKit action ${actionToExecute.name} result:`, result);

          conversationHistory.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: typeof result === 'string' ? result : JSON.stringify(result),
          });

          const finalMessages: OpenAIChatCompletionMessageParam[] = [
             { role: "system", content: systemPrompt },
             ...conversationHistory
          ];
          const finalResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: finalMessages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
          });
          const aiFinalText = finalResponse.choices[0].message.content || "Action performed successfully.";
          conversationHistory.push(finalResponse.choices[0].message as OpenAIChatCompletionMessageParam);

          return {
            textResponse: aiFinalText,
            actionTaken: functionName,
            actionResult: result,
          };
        } catch (e: any) {
          console.error(`Error during AgentKit action ${actionToExecute.name} (invocation or Zod parsing):`, e);
          let errorContent = `Error during action ${functionName}: `;
          if (e instanceof Error) {
            errorContent += e.message;
          } else if (typeof e === 'string') {
            errorContent += e;
          } else {
            errorContent += "An unknown error occurred.";
          }
          if (e.issues) { // ZodError
            errorContent += ` Validation issues: ${JSON.stringify(e.issues)}`;
          }

          conversationHistory.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: JSON.stringify({ error: errorContent }),
          });
           // Ask OpenAI to summarize the error
           const errorSummaryMessages: OpenAIChatCompletionMessageParam[] = [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: `The previous tool call for '${functionName}' failed with the error: ${errorContent}. Please inform the user about this error in a simple way.` }
          ];
          const errorSummaryResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: errorSummaryMessages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
          });
          const errorSummaryText = errorSummaryResponse.choices[0].message.content || `An error occurred with the action: ${functionName}.`;
          conversationHistory.push(errorSummaryResponse.choices[0].message as OpenAIChatCompletionMessageParam);
          return { textResponse: errorSummaryText, error: errorContent };
        }
      } else {
        console.error(`AgentKit action/tool not found: ${functionName}`);
        conversationHistory.push({
            tool_call_id: toolCall.id, // Still need tool_call_id even if tool is unknown
            role: "tool",
            content: JSON.stringify({ error: `Tool ${functionName} is not recognized or implemented.` }),
        });
        return { textResponse: `Sorry, I'm not equipped to handle the command '${functionName}'. Could you try something else or rephrase?`, error: `Tool ${functionName} not mapped.` };
      }
    } else if (responseMessage.content) {
      console.log("OpenAI direct response (no tool call):", responseMessage.content);
      return { textResponse: responseMessage.content };
    } else {
      console.log("OpenAI response was empty or unexpected.");
      return { textResponse: "I received an unusual response. Could you try that again?", error: "No content or tool_calls in OpenAI response." };
    }

  } catch (error: any) {
    console.error("Critical error in processVoiceCommand:", error);
    // Attempt to salvage conversation history if possible, but this is a more severe error
    // conversationHistory.push({ role: "assistant", content: `A system error occurred: ${error.message}`}); // Or just log it
    return { textResponse: "Sorry, a critical error occurred while processing your command.", error: error.message };
  }
}

export function resetConversation() {
    conversationHistory = [];
    console.log("Agent conversation history has been reset.");
}