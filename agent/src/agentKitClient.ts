import {
    AgentKit,
    CdpWalletProvider, 
    CdpApiActionProvider,        
    WalletActionProvider,
    AcrossActionProvider,
    PythActionProvider,
    OpenseaActionProvider,
    MessariActionProvider,     
    DefiLlamaActionProvider,   
    // Erc20ActionProvider,     // If you need ERC20 balance/transfer for Base
  } from '@coinbase/agentkit';
  import { config as appConfig } from './config';
  import { baseSepolia } from 'viem/chains'; // Or base for mainnet
  
  let agentKitInstance: AgentKit | null = null;
  
  export interface AgentTool {
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: {
        type: "object";
        properties: Record<string, any>; 
        required?: string[];
      };
    };
  }
  
  let agentTools: AgentTool[] = [];
  
  export async function initializeAgentKit() {
    if (agentKitInstance) {
      return agentKitInstance;
    }
  
    console.log("Initializing AgentKit...");
  
    // 1. Configure WalletProvider (CDP for Base network)
    // AgentKit's CdpWalletProvider directly uses the networkId from its config.
    const walletProvider = await CdpWalletProvider.configureWithWallet({
      apiKeyName: appConfig.cdp.apiKeyName!,
      apiKeyPrivateKey: appConfig.cdp.apiKeyPrivateKey!,
      networkId: appConfig.cdp.baseNetworkId!, // e.g., "base-sepolia" or "base-mainnet"
                                              // This tells CDP which network to operate on.
    });
  
    // 2. Configure ActionProviders
    const actionProviders = [
      // Edu Hub (deployments via CDP on Base)
      new CdpApiActionProvider({ // If you need CDP API calls not tied to a wallet, like faucet for *other* testnets
        apiKeyName: appConfig.cdp.apiKeyName!,
        apiKeyPrivateKey: appConfig.cdp.apiKeyPrivateKey!,
      }),
      // CdpWalletActionProvider is implicitly used by AgentKit for CDP specific wallet actions
      // if you were to use its `deploy_token` etc. For general deployments,
      // you might need to handle contract compilation and use `ViemWalletProvider.sendTransaction` directly
      // For simplicity with CDP, let's assume AgentKit handles some deployments via its CDP integration.
      // If you want full control: use ViemWalletProvider and handle deployment logic yourself.
  
      // Info Hub
      new MessariActionProvider({ apiKey: process.env.MESSARI_API_KEY }), // Add your key if using
      new DefiLlamaActionProvider(),
  
      // Wallet Info (will operate on the configured Base network for the walletProvider)
      new WalletActionProvider(),
  
      // Bridging Operations (wallet on Base, can bridge to/from other chains)
      new AcrossActionProvider({ privateKey: process.env.YOUR_ACTUAL_PRIVATE_KEY_FOR_ACROSS_IF_NEEDED_SEPARATELY! }), // Across might need direct signer for its SDK
  
      // Realtime Price Fetching
      new PythActionProvider(),
  
      // NFT Marketplaces (fetching info on Base)
      new OpenseaActionProvider({
        apiKey: process.env.OPENSEA_API_KEY, // Add your key
        networkId: appConfig.cdp.baseNetworkId!, // e.g., "base-sepolia"
        privateKey: process.env.WALLET_PRIVATE_KEY!, // OpenSeaSDK often needs a direct signer for listings
      }),
    ];
  
    // 3. Create AgentKit instance
    agentKitInstance = await AgentKit.from({
      walletProvider,
      actionProviders,
    });
  
    console.log("AgentKit initialized successfully.");
    console.log("Wallet Address:", agentKitInstance.getActions()[0] && walletProvider.getAddress());
    console.log("Network:", agentKitInstance.getActions()[0] && walletProvider.getNetwork());
  
  
    // 4. Prepare tools for OpenAI
    // This is a simplified transformation. For production, you'd map Zod to JSON Schema more robustly.
    agentTools = agentKitInstance.getActions().map(action => {
      const properties: Record<string, any> = {};
      const required: string[] = [];
  
      // Attempt to derive properties from Zod schema
      if (action.schema && action.schema._def && (action.schema._def as any).shape) {
        const shape = (action.schema._def as any).shape();
        for (const key in shape) {
          properties[key] = { type: "string", description: `Parameter ${key}` }; // Simplification
          if (!shape[key].isOptional()) {
            required.push(key);
          }
        }
      }
  
  
      return {
        type: "function" as const,
        function: {
          name: action.name.replace(/ActionProvider_/g, '_'), // Make names more LLM-friendly
          description: action.description,
          parameters: {
            type: "object",
            properties: properties,
            ...(required.length > 0 && { required: required }),
          },
        },
      };
    });
    // Manually add a tool for when the agent doesn't know what to do or needs info
      agentTools.push({
          type: "function" as const,
          function: {
              name: "clarify_or_get_more_info",
              description: "Use this function if the user's query is ambiguous, you need more specific details to perform an action, or if no other tool seems appropriate. Ask a clarifying question back to the user.",
              parameters: {
                  type: "object",
                  properties: {
                      question_to_user: {
                          type: "string",
                          description: "The specific question to ask the user for clarification or more information."
                      }
                  },
                  required: ["question_to_user"]
              }
          }
      });
  
  
    console.log("AgentKit Tools prepared for OpenAI:", JSON.stringify(agentTools, null, 2));
    return agentKitInstance;
  }
  
  export function getAgentKitTools(): AgentTool[] {
    if (!agentTools.length) {
      console.warn("AgentKit tools requested before initialization or no tools available.");
    }
    return agentTools;
  }
  
  export function getAgentKitInstance(): AgentKit {
    if (!agentKitInstance) {
      throw new Error("AgentKit not initialized. Call initializeAgentKit() first.");
    }
    return agentKitInstance;
  }