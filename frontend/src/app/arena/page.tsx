"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useSocket, PlayerData } from "../../contexts/SocketContext";
import { useAccount } from "wagmi";

// Import components
import Background from "./components/Background";
import StallComponent from "./components/Stall";
import Character from "./components/Character";
import ControlsUI from "./components/ControlsUI";
import EmoteMenu from "./components/EmoteMenu";
import UsernameInput from "./components/UsernameInput";
import TeamModals from "./components/TeamModals";
import SpeechRecognitionUi from "./components/SpeechRecognition";
import HeaderUI from "./components/HeaderUI";
import TeamButtons from "./components/TeamButtons";
import ArenaStyles from "./components/ArenaStyles";

import { useVoiceInteraction } from "@/hooks/useVoiceInteraction";
import { stalls as stallConfigurations, StallConfig } from "@/lib/stallsData";
import { resetAgentConversationOnBackend } from "@/services/agentService";


export default function Arena() {
  const [position, setPosition] = useState({ x: 600, y: 300 });
  const [showControls, setShowControls] = useState(true);
  const [activeStall, setActiveStall] = useState<StallConfig | null>(null);
  const [showEmoteMenu, setShowEmoteMenu] = useState(false);
  const [currentEmote, setCurrentEmote] = useState<string | null>(null);
  const [username, setUsername] = useState("Guest");
  const [showNameInput, setShowNameInput] = useState(true);
  const [viewportSize, setViewportSize] = useState({ width: 1200, height: 600 });

  const router = useRouter();
  const { user, authenticated, ready } = usePrivy();
  const { chain } = useAccount();
  const currentNetworkId = chain?.id.toString();

  const {
    socket,
    isConnected,
    createRoom,
    joinRoom,
    leaveRoom,
    roomCode,
    players,
    error: socketError,
  } = useSocket();

  const {
    isRecording,
    isProcessing,
    error: voiceError,
    agentResponseText,
    agentActionDetails,
    startRecognition,
    stopRecognition,
    clearAgentResponse
  } = useVoiceInteraction({ walletAddress: user?.wallet?.address, currentNetworkId });


  const walletAddress = user?.wallet?.address || "";
  const formattedAddress = walletAddress
    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
    : "";

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [authenticated, ready, router]);

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);


  const step = 10;
  const characterSize = { width: 32, height: 48 }; // This is used in the keydown effect

  const toggleControlsVisibility = () => setShowControls(!showControls);

  const checkNearbyStalls = useCallback((pos: { x: number; y: number }) => {
    const dynamicStalls = stallConfigurations.map(stall => ({
      ...stall,
      x: stall.x * viewportSize.width,
      y: stall.y * viewportSize.height
    }));

    const nearbyStall = dynamicStalls.find(
      (stall) =>
        Math.abs(pos.x + characterSize.width / 2 - (stall.x + stall.width / 2)) < 80 &&
        Math.abs(pos.y + characterSize.height / 2 - (stall.y + stall.height / 2)) < 80
    );
    setActiveStall(nearbyStall || null);
  }, [viewportSize.width, viewportSize.height, characterSize.width, characterSize.height]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showEmoteMenu || showNameInput || isProcessing || isRecording) return;

      if (event.key === "x") {
        setShowEmoteMenu((prev) => !prev);
        return;
      }

      if (event.code === "Space" && activeStall) {
        event.preventDefault();
        console.log("Space pressed near stall:", activeStall.name);
        clearAgentResponse();
        startRecognition(activeStall);
        return;
      }

      setPosition((prevPosition) => {
        let newX = prevPosition.x;
        let newY = prevPosition.y;
        switch (event.key) {
          case "ArrowUp": newY = Math.max(0, prevPosition.y - step); break;
          case "ArrowDown": newY = Math.min(viewportSize.height - characterSize.height, prevPosition.y + step); break; // Used characterSize
          case "ArrowLeft": newX = Math.max(0, prevPosition.x - step); break;
          case "ArrowRight": newX = Math.min(viewportSize.width - characterSize.width, prevPosition.x + step); break; // Used characterSize
          default: return prevPosition;
        }
        checkNearbyStalls({ x: newX, y: newY });
        if (currentEmote) setCurrentEmote(null);
        return { x: newX, y: newY };
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space" && isRecording && activeStall) {
        stopRecognition();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    checkNearbyStalls(position);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    position, activeStall, showEmoteMenu, currentEmote, showNameInput,
    viewportSize, isRecording, isProcessing, startRecognition, stopRecognition,
    checkNearbyStalls, clearAgentResponse,
    characterSize.width, characterSize.height // <<< ADDED MISSING DEPENDENCIES HERE
  ]);

  const handleEmoteSelect = (emote: string) => {
    setCurrentEmote(emote);
    setShowEmoteMenu(false);
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNameInput(false);
    if (socket && isConnected && roomCode && username) {
      socket.emit("player_name", { roomCode, username });
    }
  };

  const returnToHome = () => router.push("/");

  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isJoiningTeam, setIsJoiningTeam] = useState(false);
  const [joinTeamInputValue, setJoinTeamInputValue] = useState("");

  const handleCreateTeam = () => {
    setIsCreatingTeam(true);
    setIsJoiningTeam(false);
    createRoom();
  };
  const handleJoinTeam = () => {
    setIsJoiningTeam(true);
    setIsCreatingTeam(false);
  };
  const handleJoinTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    joinRoom(joinTeamInputValue);
    setIsJoiningTeam(false);
  };
  const closeTeamModals = () => {
    setIsCreatingTeam(false);
    setIsJoiningTeam(false);
  };
  const handleLeaveRoom = () => {
    if (roomCode) leaveRoom(roomCode);
    setJoinTeamInputValue("");
  };

  const dynamicStalls = stallConfigurations.map(stall => ({
    ...stall,
    x: stall.x * viewportSize.width,
    y: stall.y * viewportSize.height,
    roofColor: stall.roofColor || "#000", 
    roofAltColor: stall.roofColor || "#000",
    accentColor: stall.accentColor || "#000",  
    darkColor: stall.darkColor || "#000",    
    counterColor: stall.counterColor || "#000", 
    area: stall.area?.toString() || "0",
  }));

  useEffect(() => {
    if (socket && isConnected && roomCode) {
      socket.emit("player_move", { roomCode, position });
    }
  }, [position, socket, isConnected, roomCode]);

  useEffect(() => {
    if (socket && isConnected && roomCode && currentEmote) {
      socket.emit("player_emote", { roomCode, emote: currentEmote });
    }
  }, [currentEmote, socket, isConnected, roomCode]);

  const emotes = ["👋", "👍", "❤️", "😂", "🎉", "🤔", "👀", "🙏"];

  return (
    <main className="relative w-full h-screen overflow-hidden bg-blue-950 font-pixel">
      <ArenaStyles />
      <HeaderUI
        formattedAddress={formattedAddress}
        returnToHome={returnToHome}
        roomCode={roomCode}
        handleLeaveRoom={handleLeaveRoom}
      />

      {!roomCode && (
        <TeamButtons
          roomCode={roomCode}
          isConnected={isConnected}
          socketError={socketError}
          handleCreateTeam={handleCreateTeam}
          handleJoinTeam={handleJoinTeam}
        />
      )}

      <TeamModals
        isCreatingTeam={isCreatingTeam}
        isJoiningTeam={isJoiningTeam}
        roomCode={roomCode}
        joinTeamInput={joinTeamInputValue}
        setJoinTeamInput={setJoinTeamInputValue}
        closeTeamModals={closeTeamModals}
        handleJoinTeamSubmit={handleJoinTeamSubmit}
        socketError={socketError}
      />

      <Background
        viewportSize={viewportSize}
        tileSize={32}
        lanterns={[]}
        streetFoodItems={[]}
      />

      {dynamicStalls.map((stall) => (
        <StallComponent key={stall.id} stall={stall} activeTile={activeStall?.id || null} />
      ))}

      <Character
        position={position}
        username={username}
        currentEmote={currentEmote}
        characterSize={characterSize}
      />

      {roomCode &&
        Object.values(players).map((player: PlayerData) => {
          if (socket && player.id === socket.id) return null;
          return (
            <Character
              key={player.id}
              position={player.position}
              username={player.username}
              currentEmote={player.emote}
              characterSize={characterSize}
              isOtherPlayer={true}
            />
          );
        })}


      {showEmoteMenu && (
        <EmoteMenu
          position={position}
          emotes={emotes}
          handleEmoteSelect={handleEmoteSelect}
        />
      )}

      {showNameInput && (
        <UsernameInput
          username={username}
          setUsername={setUsername}
          handleUsernameSubmit={handleUsernameSubmit}
        />
      )}

      <div
        className="absolute transition-all duration-300 ease-out"
        style={{
          left: `${position.x + characterSize.width / 2}px`,
          top: `${position.y + characterSize.height + 10}px`,
          transform: 'translateX(-50%)',
          minWidth: '200px',
          maxWidth: '300px',
          zIndex: 50,
        }}
      >
        <SpeechRecognitionUi
          position={position}
          activeTile={activeStall?.id || null}
          isRecording={isRecording}
          isProcessing={isProcessing}
          error={voiceError}
          agentResponse={agentResponseText}
        />
        {agentActionDetails && (
          <div className="mt-2 p-2 bg-gray-800 bg-opacity-80 text-xs text-gray-300 rounded-md border border-gray-700 overflow-auto max-h-40">
            <pre>{agentActionDetails}</pre>
          </div>
        )}
      </div>


      <ControlsUI
        showControls={showControls}
        toggleControlsVisibility={toggleControlsVisibility}
        setShowNameInput={setShowNameInput}
      />
       <button
        onClick={() => {
          if (window.confirm("Are you sure you want to reset the agent's conversation history?")) {
            resetAgentConversationOnBackend();
            clearAgentResponse();
          }
        }}
        className="fixed bottom-16 right-4 px-3 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md text-sm font-pixel z-50"
      >
        Reset Agent
      </button>
    </main>
  );
}