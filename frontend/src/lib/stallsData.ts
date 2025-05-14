export interface StallConfig {
  id: number;
  name: string;
  agentFeatureHint: string; 
  agentTargetFunctionality: string;
  x: number; 
  y: number;
  width: number;
  height: number;
  bgColor: string;
  borderColor: string;
  roofColor: string;
  icon: string;
  description: string; 
  initialPromptSuggestion?: string; 
  decorations?: string[];
  isExpansion?: boolean;
  accentColor?: string;
  darkColor?: string; 
  counterColor?: string; 
  area?: number
}

export const stalls: StallConfig[] = [
  {
    id: 1,
    name: "Edu Hub (Base)",
    agentFeatureHint: "This stall is for educational purposes, like deploying smart contracts (ERC20, NFTs) or learning about blockchain concepts on the Base network.",
    agentTargetFunctionality: "smart_contract_deployment_base",
    x: 0.2, y: 0.3, width: 180, height: 120, // Use percentages for responsiveness
    bgColor: "bg-sky-700", borderColor: "border-sky-800", roofColor: "bg-sky-600",
    icon: "🎓", description: "Deploy contracts & learn on Base.",
    initialPromptSuggestion: "Deploy a simple ERC20 token on Base named..."
  },
  {
    id: 2,
    name: "Info Kiosk",
    agentFeatureHint: "Ask general crypto questions here. I can fetch data from Messari and DefiLlama.",
    agentTargetFunctionality: "crypto_information",
    x: 0.5, y: 0.2, width: 180, height: 120,
    bgColor: "bg-blue-700", borderColor: "border-blue-800", roofColor: "bg-blue-600",
    icon: "ℹ️", description: "Get crypto news & protocol data.",
    initialPromptSuggestion: "What's the latest news about EigenLayer?"
  },
  {
    id: 3,
    name: "Wallet Check (Base)",
    agentFeatureHint: "Check your connected wallet's balance and details on the Base network.",
    agentTargetFunctionality: "wallet_info_base",
    x: 0.8, y: 0.3, width: 180, height: 120,
    bgColor: "bg-green-700", borderColor: "border-green-800", roofColor: "bg-green-600",
    icon: "💰", description: "View your Base wallet balance.",
    initialPromptSuggestion: "What are my wallet details on Base?"
  },
  {
    id: 4,
    name: "Interchain Bridge (Base)",
    agentFeatureHint: "This stall helps bridge tokens to or from the Base network using Across Protocol.",
    agentTargetFunctionality: "token_bridging_base_across",
    x: 0.2, y: 0.65, width: 180, height: 120,
    bgColor: "bg-purple-700", borderColor: "border-purple-800", roofColor: "bg-purple-600",
    icon: "🌉", description: "Bridge tokens across chains from Base.",
    initialPromptSuggestion: "I want to bridge 0.05 ETH from Base Sepolia to Ethereum Sepolia."
  },
  {
    id: 5,
    name: "Pyth Price Oracle",
    agentFeatureHint: "Get real-time asset prices from the Pyth Network oracle.",
    agentTargetFunctionality: "price_feed_pyth",
    x: 0.5, y: 0.7, width: 180, height: 120,
    bgColor: "bg-pink-700", borderColor: "border-pink-800", roofColor: "bg-pink-600",
    icon: "📊", description: "Fetch live token prices via Pyth.",
    initialPromptSuggestion: "What's the Pyth price for BTC?"
  },
  {
    id: 6,
    name: "NFT Info Booth (Base)",
    agentFeatureHint: "Find information about NFTs on the Base network using OpenSea data.",
    agentTargetFunctionality: "nft_info_opensea_base",
    x: 0.8, y: 0.65, width: 180, height: 120,
    bgColor: "bg-teal-700", borderColor: "border-teal-800", roofColor: "bg-teal-600",
    icon: "🖼️", description: "Get NFT info on Base from OpenSea.",
    initialPromptSuggestion: "Show me the NFTs in my Base wallet."
  },
  // ... any other stalls like "Add Your Stall" can remain if desired
];