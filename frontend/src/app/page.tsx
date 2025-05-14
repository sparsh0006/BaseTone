"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { WalletConnect } from "@/components/WalletConnect";

interface Firefly {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  direction: number;
  lifespan: number;
}

const BazaarEntrance = ({ isWalletConnected }: { isWalletConnected: boolean }) => {
  const router = useRouter();
  
  const joinArena = () => {
    if (isWalletConnected) {
      router.push("/arena");
    }
  };

  return (
    <>
      <button
        onClick={joinArena}
        disabled={!isWalletConnected}
        className={`group relative overflow-hidden px-8 py-4 rounded-lg text-xl font-bold transition-all ${
          isWalletConnected
            ? "bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-900 shadow-lg shadow-amber-500/30"
            : "bg-gray-800/50 backdrop-blur-sm text-gray-400 cursor-not-allowed border border-gray-700"
        }`}
      >
        <span className="relative z-10">
          {isWalletConnected ? "Enter Bharat Bazaar" : "Connect Wallet to Enter"}
        </span>
        
        {isWalletConnected && (
          <>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-yellow-300 to-red-400 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="absolute -inset-1 rounded-lg blur group-hover:bg-gradient-to-r from-yellow-500/30 to-red-500/30 opacity-0 group-hover:opacity-100 transition duration-300 -z-10"></div>
            <div className="absolute -right-2 -bottom-2 w-2/3 h-2/3 bg-red-500/10 blur-2xl rounded-full -z-10"></div>
          </>
        )}
      </button>
      
      {!isWalletConnected && (
        <p className="mt-4 text-yellow-300 text-sm animate-pulse">
          Please connect your wallet to access the Bharat Bazaar.
        </p>
      )}
    </>
  );
};

export default function Home() {
  const [fireflies, setFireflies] = useState<Firefly[]>([]);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() < 0.05) {
        const newFirefly: Firefly = {
          id: Date.now(),
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 4 + 3,
          opacity: Math.random() * 0.5 + 0.3,
          speed: Math.random() * 2 + 1,
          direction: Math.random() * 2 * Math.PI,
          lifespan: Math.random() * 5000 + 2000
        };
        setFireflies(prev => [...prev.slice(-15), newFirefly]);
        setTimeout(() => {
          setFireflies(prev => prev.filter(fly => fly.id !== newFirefly.id));
        }, newFirefly.lifespan);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  useEffect(() => {
    if (fireflies.length === 0) return;
    const animateFireflies = () => {
      setFireflies(prev => 
        prev.map(fly => {
          const newX = fly.x + Math.cos(fly.direction) * fly.speed + (Math.random() - 0.5) * 2;
          const newY = fly.y + Math.sin(fly.direction) * fly.speed + (Math.random() - 0.5) * 2;
          const newDirection = Math.random() < 0.05 
            ? fly.direction + (Math.random() - 0.5) * Math.PI / 2 
            : fly.direction;
          return {
            ...fly,
            x: newX,
            y: newY,
            direction: newDirection,
            opacity: fly.opacity * (Math.random() < 0.5 ? 0.98 : 1.02)
          };
        })
      );
    };
    const animationFrame = requestAnimationFrame(animateFireflies);
    return () => cancelAnimationFrame(animationFrame);
  }, [fireflies]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-blue-950 via-indigo-950 to-black text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-blue-950/60 mix-blend-multiply z-0"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-black/30 z-0">
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none" className="w-full h-full opacity-40">
            <path d="M0,200 L0,140 L40,140 L40,120 L60,120 L60,100 L80,100 L80,120 L100,120 L100,80 L120,80 L120,100 L140,100 L140,60 L160,60 L160,100 L180,100 L180,120 L200,120 L200,140 L220,140 L220,100 L240,100 L240,80 L260,80 L260,120 L280,120 L280,140 L300,140 L300,80 L320,80 L320,40 L340,40 L340,60 L360,60 L360,100 L380,100 L380,60 L400,60 L400,80 L420,80 L420,100 L440,100 L440,60 L460,60 L460,40 L480,40 L480,20 L500,20 L500,0 L520,0 L520,20 L540,20 L540,40 L560,40 L560,60 L580,60 L580,40 L600,40 L600,60 L620,60 L620,100 L640,100 L640,120 L660,120 L660,80 L680,80 L680,100 L700,100 L700,120 L720,120 L720,100 L740,100 L740,120 L760,120 L760,140 L780,140 L780,120 L800,120 L800,100 L820,100 L820,60 L840,60 L840,40 L860,40 L860,20 L880,20 L880,60 L900,60 L900,80 L920,80 L920,100 L940,100 L940,120 L960,120 L960,140 L980,140 L980,120 L1000,120 L1000,100 L1020,100 L1020,80 L1040,80 L1040,60 L1060,60 L1060,80 L1080,80 L1080,100 L1100,100 L1100,120 L1120,120 L1120,140 L1140,140 L1140,120 L1160,120 L1160,140 L1180,140 L1180,160 L1200,160 L1200,200 Z" fill="#000"/>
          </svg>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-80 opacity-30">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-80 bg-gradient-to-t from-emerald-900 to-transparent"></div>
            <div className="absolute bottom-40 left-1/2 -translate-x-1/2 w-20 h-10 bg-emerald-900"></div>
            <div className="absolute bottom-50 left-1/2 -translate-x-1/2 w-14 h-30 bg-emerald-900"></div>
            <div className="absolute bottom-80 left-1/2 -translate-x-1/2 w-8 h-8 bg-emerald-900"></div>
          </div>
        </div>
        <div className="absolute bottom-5 left-10 w-40 h-32 border-2 border-amber-500/20 rounded-md transform skew-x-12 bg-amber-800/5"></div>
        <div className="absolute bottom-8 left-40 w-36 h-28 border-2 border-rose-500/20 rounded-md transform -skew-x-12 bg-rose-800/5"></div>
        <div className="absolute bottom-12 right-20 w-44 h-36 border-2 border-blue-500/20 rounded-md transform skew-x-12 bg-blue-800/5"></div>
        <div className="absolute bottom-6 right-60 w-40 h-30 border-2 border-purple-500/20 rounded-md transform -skew-x-12 bg-purple-800/5"></div>
        
        {/* Decorative Hindi characters */}
        <div className="absolute top-40 left-20 text-6xl text-red-600/10 font-bold font-sans">अ</div>
        <div className="absolute top-60 right-40 text-7xl text-amber-500/10 font-bold font-sans">ब</div>
        <div className="absolute bottom-80 left-1/4 text-8xl text-blue-500/10 font-bold font-sans">क</div>
        <div className="absolute top-1/4 right-1/3 text-7xl text-emerald-500/10 font-bold font-sans">द</div>
        
        {Array.from({ length: 50 }).map((_, idx) => (
          <div 
            key={`particle-${idx}`} 
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1
            }}
          ></div>
        ))}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400/30 via-amber-500/0 to-amber-400/30"></div>
        {Array.from({ length: 20 }).map((_, idx) => (
          <div 
            key={`light-${idx}`} 
            className={`absolute top-0 rounded-full ${idx % 3 === 0 ? 'bg-red-400' : idx % 3 === 1 ? 'bg-amber-300' : 'bg-green-300'}`}
            style={{
              width: '4px',
              height: '4px',
              left: `${(idx / 20) * 100}%`,
              boxShadow: `0 0 8px 2px ${idx % 3 === 0 ? 'rgba(248, 113, 113, 0.6)' : idx % 3 === 1 ? 'rgba(252, 211, 77, 0.6)' : 'rgba(110, 231, 183, 0.6)'}`
            }}
          ></div>
        ))}
        {fireflies.map(fly => (
          <div
            key={fly.id}
            className="fixed rounded-full pointer-events-none z-40"
            style={{
              left: `${fly.x}px`,
              top: `${fly.y}px`,
              width: `${fly.size}px`,
              height: `${fly.size}px`,
              backgroundColor: '#fffbeb',
              opacity: fly.opacity,
              boxShadow: `0 0 ${fly.size * 2}px ${fly.size}px rgba(253, 224, 71, 0.7), 0 0 ${fly.size}px ${fly.size/2}px rgba(253, 224, 71, 0.5)`,
              transition: 'box-shadow 0.2s ease-out'
            }}
          />
        ))}
      </div>
      
      <div className="w-full bg-gray-900 bg-opacity-70 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-amber-800/30 shadow-lg z-10 relative">
        <div className="text-2xl font-bold text-yellow-300 font-sans tracking-tight group relative">
          <span className="text-red-500 animate-pulse" style={{ textShadow: "0 0 5px #ff0000, 0 0 10px #ff0000" }}>भा</span>
          <span className="text-yellow-300" style={{ textShadow: "0 0 5px #FFD700, 0 0 10px #FFD700" }}>र</span>
          <span className="text-red-500 animate-pulse" style={{ textShadow: "0 0 5px #ff0000, 0 0 10px #ff0000", animationDelay: "0.5s" }}>त</span>
          <span className="text-yellow-300" style={{ textShadow: "0 0 5px #FFD700, 0 0 10px #FFD700" }}> </span>
          <span className="text-red-500 animate-pulse" style={{ textShadow: "0 0 5px #ff0000, 0 0 10px #ff0000", animationDelay: "1s" }}>बा</span>
          <span className="text-yellow-300" style={{ textShadow: "0 0 5px #FFD700, 0 0 10px #FFD700" }}>ज़ा</span>
          <span className="text-red-500 animate-pulse" style={{ textShadow: "0 0 5px #ff0000, 0 0 10px #ff0000", animationDelay: "1.5s" }}>र</span>
          <span className="ml-2 text-white text-opacity-90 text-xl font-['Press_Start_2P',_monospace]">Bharat Bazaar</span>
          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 via-yellow-300 to-red-500 group-hover:w-full transition-all duration-500 shadow-glow"></div>
        </div>
        
        <div className="hidden md:flex items-center space-x-2">
          <a 
            href="#features" 
            onClick={(e) => { e.preventDefault(); scrollToFeatures(); }} 
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-800/50 hover:bg-amber-900/30 text-amber-200/70 hover:text-amber-200 transition-all duration-300 border border-transparent hover:border-amber-500/30 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Features
            </span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-amber-600/0 via-amber-600/10 to-amber-600/0 transition-opacity duration-300"></div>
          </a>
          <a 
            href="#protocols" 
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-800/50 hover:bg-purple-900/30 text-purple-200/70 hover:text-purple-200 transition-all duration-300 border border-transparent hover:border-purple-500/30 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              Integrations
            </span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-purple-600/0 transition-opacity duration-300"></div>
          </a>
          <a 
            href="#about" 
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-800/50 hover:bg-blue-900/30 text-blue-200/70 hover:text-blue-200 transition-all duration-300 border border-transparent hover:border-blue-500/30 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About
            </span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 transition-opacity duration-300"></div>
          </a>
          <a 
            href="#team" 
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-800/50 hover:bg-pink-900/30 text-pink-200/70 hover:text-pink-200 transition-all duration-300 border border-transparent hover:border-pink-500/30 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Team
            </span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-pink-600/0 via-pink-600/10 to-pink-600/0 transition-opacity duration-300"></div>
          </a>
          <a 
            href="https://github.com/sparsh0006/basetone" 
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-800/50 hover:bg-emerald-900/30 text-emerald-200/70 hover:text-emerald-200 transition-all duration-300 border border-transparent hover:border-emerald-500/30 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 opacity-70 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-emerald-600/0 via-emerald-600/10 to-emerald-600/0 transition-opacity duration-300"></div>
          </a>
        </div>
        <WalletConnect onConnectionChange={setIsWalletConnected} />
      </div>

      <div className="relative flex flex-col items-center justify-center max-w-5xl mx-auto px-4 py-20 text-center z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 -z-10"></div>
        <h1 className="text-5xl md:text-6xl font-bold mb-10 relative group perspective-1000">
          <div className="absolute -left-8 -top-8 w-10 h-14 bg-red-600 rounded-full opacity-90 shadow-lg shadow-red-500/50 animate-float-lantern-slow"></div>
          <div className="absolute -right-8 -top-10 w-8 h-12 bg-amber-500 rounded-full opacity-90 shadow-lg shadow-amber-500/50 animate-float-lantern-slow" style={{animationDelay: '1s'}}></div>
          <div className="relative inline-block transform transition-all duration-700 group-hover:scale-105 group-hover:rotate-1">
            <span className="text-yellow-300 font-sans tracking-tight inline-block animate-float-subtle relative">
              <span className="relative z-10 inline-block">भा</span>
              <span className="relative z-10 inline-block">र</span>
              <span className="relative z-10 inline-block">त</span>
              <span className="relative z-10 inline-block"> </span>
              <span className="relative z-10 inline-block">बा</span>
              <span className="relative z-10 inline-block">ज़ा</span>
              <span className="relative z-10 inline-block">र</span>
              <span className="absolute inset-0 filter blur-md text-red-500 z-0 animate-pulse-glow" style={{animationDelay: '0s'}}>भा</span>
              <span className="absolute inset-0 filter blur-md text-yellow-400 z-0 animate-pulse-glow" style={{animationDelay: '0.2s'}}>र</span>
              <span className="absolute inset-0 filter blur-md text-red-500 z-0 animate-pulse-glow" style={{animationDelay: '0.4s'}}>त</span>
              <span className="absolute inset-0 filter blur-md text-yellow-400 z-0 animate-pulse-glow" style={{animationDelay: '0.8s'}}> </span>
              <span className="absolute inset-0 filter blur-md text-red-500 z-0 animate-pulse-glow" style={{animationDelay: '1s'}}>बा</span>
              <span className="absolute inset-0 filter blur-md text-yellow-400 z-0 animate-pulse-glow" style={{animationDelay: '1.2s'}}>ज़ा</span>
              <span className="absolute inset-0 filter blur-md text-red-500 z-0 animate-pulse-glow" style={{animationDelay: '1.4s'}}>र</span>
            </span>
            <div className="absolute -inset-3 rounded-lg bg-gradient-to-r from-red-500/0 via-yellow-300/10 to-red-500/0 -z-10 blur-xl animate-pulse-slow"></div>
          </div>
        </h1>
        <h2 className="text-4xl md:text-6xl font-bold mb-12 relative perspective transform transition-all font-['Press_Start_2P',_monospace]">
          <div className="relative inline-block transform hover:rotate-y-12 transition-transform duration-700">
            <span className="absolute -left-1 -top-1 bg-clip-text text-transparent bg-gradient-to-br from-red-700/50 to-amber-900/50 select-none">Bharat Bazaar</span>
            <span className="absolute -left-0.5 -top-0.5 bg-clip-text text-transparent bg-gradient-to-br from-red-600/70 to-amber-800/70 select-none">Bharat Bazaar</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 animate-text-shimmer relative z-10">Bharat Bazaar</span>
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div 
                  key={`spark-${i}`}
                  className="absolute bg-white w-[1px] h-[10px] opacity-0 animate-electric-spark" 
                  style={{ 
                    left: `${20 + i * 20}%`, 
                    top: '50%',
                    animationDelay: `${i * 1.5}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-2 bg-gradient-to-r from-yellow-500/0 via-yellow-500/50 to-yellow-500/0 blur-md"></div>
        </h2>
        <p className="text-xl mb-8 max-w-3xl text-amber-50 leading-relaxed relative">
          <span className="bg-gradient-to-r from-transparent via-black/10 to-transparent p-4 rounded-lg block backdrop-blur-sm border border-white/10">
            Experience a gamified DeFi journey through a vibrant Indian bazaar. Interact with AI agents representing various DeFi protocols, deploy contracts, bridge assets, fetch prices, and explore NFTs - all in an immersive pixel-art world.
          </span>
        </p>
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <div className="bg-gray-900/30 backdrop-blur-sm px-6 py-3 rounded-lg border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-400">6+</div>
            <div className="text-xs text-yellow-200/70">Core Features</div>
          </div>
          <div className="bg-gray-900/30 backdrop-blur-sm px-6 py-3 rounded-lg border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-400">Voice</div>
            <div className="text-xs text-blue-200/70">Interactions</div>
          </div>
          <div className="bg-gray-900/30 backdrop-blur-sm px-6 py-3 rounded-lg border border-green-500/20">
            <div className="text-2xl font-bold text-green-400">Base</div>
            <div className="text-xs text-green-200/70">Network Focus</div>
          </div>
        </div>
        <BazaarEntrance isWalletConnected={isWalletConnected} />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce mt-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
      
      <div className="w-full py-24 bg-gradient-to-b from-blue-950/50 to-indigo-950/50 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-yellow-300">Explore the Digital Bazaar</h2>
              <p className="text-lg mb-6 text-gray-300">Navigate our immersive pixel-art bazaar. Each stall connects you to powerful Web3 functionalities, guided by AI.</p>
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-5 border border-amber-500/20">
                <h3 className="text-xl font-bold mb-3 text-amber-400">🌟 Interactive Stalls</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                    Move with Arrow Keys
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                    Interact with Stalls via Voice (Spacebar)
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                    Express with Emotes (X key)
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                    Multiplayer enabled via Room Codes
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:w-1/2 overflow-hidden rounded-lg border-4 border-gray-800 shadow-2xl">
              <div className="w-full h-72 bg-blue-950 relative">
                <div className="absolute inset-0 bg-blue-950 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900">
                    <div className="h-full flex items-center justify-center text-white font-bold font-sans">
                      <span className="text-red-500 animate-pulse px-2">भारत</span>
                      <span className="text-yellow-300 px-2">बाज़ार</span>
                    </div>
                  </div>
                  <div className="absolute left-1/4 top-1/3 w-32 h-24 bg-sky-700 rounded-sm border border-sky-800"><div className="text-center pt-2 text-white/50 text-4xl">🎓</div></div>
                  <div className="absolute right-1/4 top-1/3 w-32 h-24 bg-purple-700 rounded-sm border border-purple-800"><div className="text-center pt-2 text-white/50 text-4xl">🌉</div></div>
                  <div className="absolute left-1/2 bottom-1/4 w-32 h-24 bg-pink-700 rounded-sm border border-pink-800"><div className="text-center pt-2 text-white/50 text-4xl">📊</div></div>
                  <div className="absolute left-1/2 top-1/2 w-6 h-8 bg-red-600 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-full h-1/3 bg-[#F5D7B5]"></div>
                  </div>
                </div>
                <div className="absolute inset-0 backdrop-blur-[1px] flex items-center justify-center">
                  <button className="px-5 py-2 bg-yellow-500 text-gray-900 rounded-lg font-bold hover:bg-yellow-400 transition-colors shadow-lg">
                    Enter to Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div id="features" ref={featuresRef} className="w-full py-24 relative z-10 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-20 right-20 w-72 h-72 bg-red-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-40 left-1/4 text-9xl text-yellow-500/10 font-bold rotate-12 font-sans">ए</div>
          <div className="absolute top-20 right-1/4 text-9xl text-red-500/10 font-bold -rotate-6 font-sans">ई</div>
        </div>
        <div className="max-w-6xl mx-auto px-4 relative">
          <h2 className="text-4xl font-bold text-center mb-16 text-yellow-300">
            <span className="relative inline-block">
              Key Features
              <div className="absolute -bottom-3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
              <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 opacity-70 hidden md:block"></div>
              <div className="absolute -right-10 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 opacity-70 hidden md:block"></div>
            </span>
          </h2>
          <div className="absolute -top-10 left-1/4 w-16 h-20 opacity-40 pointer-events-none">
            <div className="w-full h-3/4 bg-red-600 rounded-t-full flex items-center justify-center text-yellow-300 text-lg">शुभ</div>
            <div className="w-px h-5 bg-yellow-900 mx-auto"></div>
          </div>
          <div className="absolute -top-8 right-1/3 w-12 h-16 opacity-40 pointer-events-none">
            <div className="w-full h-3/4 bg-yellow-500 rounded-t-full flex items-center justify-center text-red-700 text-lg">लाभ</div>
            <div className="w-px h-4 bg-yellow-900 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-900/70 to-sky-950/30 backdrop-blur-md rounded-xl p-6 border border-sky-500/20 hover:border-sky-500/40 transition-all duration-300 group hover:shadow-lg hover:shadow-sky-600/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="text-4xl mb-6 bg-sky-500/20 rounded-full w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative"><span className="relative z-10">🎓</span><div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-500/20 to-cyan-600/20 blur-sm"></div></div>
              <h3 className="text-xl font-bold mb-3 text-sky-300 group-hover:text-sky-200 transition-colors">Edu Hub (Base)</h3>
              <p className="text-gray-300">Deploy smart contracts (ERC20, NFTs) and learn blockchain fundamentals directly on the Base network through voice commands.</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div className="bg-gradient-to-br from-gray-900/70 to-blue-950/30 backdrop-blur-md rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-600/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="text-4xl mb-6 bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative"><span className="relative z-10">📚</span><div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/20 blur-sm"></div></div>
              <h3 className="text-xl font-bold mb-3 text-blue-300 group-hover:text-blue-200 transition-colors">Info Hub</h3>
              <p className="text-gray-300">Ask general crypto questions. Get up-to-date information from Messari and DefiLlama about protocols and market trends.</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div className="bg-gradient-to-br from-gray-900/70 to-green-950/30 backdrop-blur-md rounded-xl p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group hover:shadow-lg hover:shadow-green-600/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="text-4xl mb-6 bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative"><span className="relative z-10">💼</span><div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 blur-sm"></div></div>
              <h3 className="text-xl font-bold mb-3 text-green-300 group-hover:text-green-200 transition-colors">Wallet Info (Base)</h3>
              <p className="text-gray-300">Instantly check your connected wallet balance, address, and current network details, specifically for the Base network.</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div className="bg-gradient-to-br from-gray-900/70 to-purple-950/30 backdrop-blur-md rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group hover:shadow-lg hover:shadow-purple-600/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="text-4xl mb-6 bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative"><span className="relative z-10">🌉</span><div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-600/20 blur-sm"></div></div>
              <h3 className="text-xl font-bold mb-3 text-purple-300 group-hover:text-purple-200 transition-colors">Bridging Operations (Base)</h3>
              <p className="text-gray-300">Seamlessly bridge your tokens to or from the Base network using the integrated Across Protocol functionality.</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div className="bg-gradient-to-br from-gray-900/70 to-pink-950/30 backdrop-blur-md rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 group hover:shadow-lg hover:shadow-pink-600/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="text-4xl mb-6 bg-pink-500/20 rounded-full w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative"><span className="relative z-10">📈</span><div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-600/20 blur-sm"></div></div>
              <h3 className="text-xl font-bold mb-3 text-pink-300 group-hover:text-pink-200 transition-colors">Realtime Price Feeds</h3>
              <p className="text-gray-300">Get live, reliable asset prices from the Pyth Network, ensuring you have the latest market data for your decisions.</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <div className="bg-gradient-to-br from-gray-900/70 to-teal-950/30 backdrop-blur-md rounded-xl p-6 border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 group hover:shadow-lg hover:shadow-teal-600/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="text-4xl mb-6 bg-teal-500/20 rounded-full w-16 h-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative"><span className="relative z-10">🖼️</span><div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-600/20 blur-sm"></div></div>
              <h3 className="text-xl font-bold mb-3 text-teal-300 group-hover:text-teal-200 transition-colors">NFT Info (Base)</h3>
              <p className="text-gray-300">Discover and fetch information about NFTs on the Base network through OpenSea integration.</p>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
          <div className="flex justify-center mt-16">
            <div className="relative w-40 h-10 opacity-30">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
              <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-yellow-500 to-transparent"></div>
              <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-yellow-500 to-transparent"></div>
              <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-yellow-500 rounded-full"></div>
              <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-yellow-500 rounded-full"></div>
              <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-yellow-500 rounded-full"></div>
              <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div id="protocols" className="w-full py-24 bg-gradient-to-b from-indigo-950/50 to-blue-950/50 backdrop-blur-sm relative z-10 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute bottom-40 right-1/4 text-9xl text-violet-500/10 font-bold rotate-12 font-sans">से</div>
          <div className="absolute top-20 left-1/4 text-9xl text-blue-500/10 font-bold -rotate-6 font-sans">वा</div>
          <div className="absolute inset-0 w-full h-px bg-indigo-500/20 top-10"></div>
          <div className="absolute inset-0 w-full h-px bg-indigo-500/20 bottom-10 transform rotate-3"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 relative">
          <h2 className="text-4xl font-bold text-center mb-4 text-yellow-300">
            <span className="relative inline-block">
              Core Technologies & Integrations
              <div className="absolute -bottom-3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
              <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 opacity-70 hidden md:block"></div>
              <div className="absolute -right-10 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 opacity-70 hidden md:block"></div>
            </span>
          </h2>
          <p className="text-center mb-16 text-gray-300 max-w-3xl mx-auto">Bharat Bazaar leverages powerful SDKs and APIs to bring you a seamless Web3 experience. Our AI agent interacts with these services to perform actions on your behalf.</p>
          <div className="relative w-full h-8 mb-12">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-center">
              <div className="px-10 py-1 bg-indigo-900/30 rounded-full border border-indigo-500/30 text-indigo-300 text-sm font-semibold animate-pulse-light inline-block">
                <span className="text-purple-300">●</span> POWERED BY <span className="text-blue-300">●</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-900/80 to-sky-950/20 backdrop-blur-sm rounded-xl overflow-hidden border border-sky-500/30 group hover:border-sky-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-sky-600/20 relative">
              <div className="w-full h-3 bg-sky-700 relative overflow-hidden"><div className="absolute inset-0 bg-pattern-roof opacity-20"></div></div>
              <div className="p-6 pt-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center"><div className="text-3xl mr-3 relative"><span className="relative z-10">🛠️</span><div className="absolute inset-0 rounded-full bg-sky-500/20 filter blur-sm transform scale-125"></div></div><h3 className="text-lg font-bold text-sky-300 group-hover:text-sky-200 transition-colors">AgentKit & CDP</h3></div>
                  <div className="px-2 py-1 rounded-full bg-sky-900/30 border border-sky-500/20 text-sky-400 text-xs">Core</div>
                </div>
                <p className="text-gray-300 text-sm mb-4">Utilizing AgentKit with Coinbase Developer Platform for secure on-chain wallet operations and actions on the Base network.</p>
                <div className="flex justify-between items-center"><div className="flex items-center text-xs text-sky-200/60"><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>Active</div><div className="text-sky-400/80 text-sm">Base Network</div></div>
                <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-900/80 to-lime-950/20 backdrop-blur-md rounded-xl overflow-hidden border border-lime-500/30 group hover:border-lime-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-lime-600/20 relative">
              <div className="w-full h-3 bg-lime-700 relative overflow-hidden"><div className="absolute inset-0 bg-pattern-roof opacity-20"></div></div>
              <div className="p-6 pt-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center"><div className="text-3xl mr-3 relative"><span className="relative z-10">🧠</span><div className="absolute inset-0 rounded-full bg-lime-500/20 filter blur-sm transform scale-125"></div></div><h3 className="text-lg font-bold text-lime-300 group-hover:text-lime-200 transition-colors">OpenAI LLM</h3></div>
                  <div className="px-2 py-1 rounded-full bg-lime-900/30 border border-lime-500/20 text-lime-400 text-xs">NLU</div>
                </div>
                <p className="text-gray-300 text-sm mb-4">Intelligent understanding of your voice commands and natural language response generation powered by OpenAI advanced models.</p>
                <div className="flex justify-between items-center"><div className="flex items-center text-xs text-lime-200/60"><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>Active</div><div className="text-lime-400/80 text-sm">GPT-4o Mini</div></div>
                <div className="absolute inset-0 bg-lime-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </div>
             <div className="bg-gradient-to-br from-gray-900/80 to-pink-950/20 backdrop-blur-md rounded-xl overflow-hidden border border-pink-500/30 group hover:border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-600/20 relative">
              <div className="w-full h-3 bg-pink-700 relative overflow-hidden"><div className="absolute inset-0 bg-pattern-roof opacity-20"></div></div>
              <div className="p-6 pt-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center"><div className="text-3xl mr-3 relative"><span className="relative z-10">📊</span><div className="absolute inset-0 rounded-full bg-pink-500/20 filter blur-sm transform scale-125"></div></div><h3 className="text-lg font-bold text-pink-300 group-hover:text-pink-200 transition-colors">Pyth Network</h3></div>
                  <div className="px-2 py-1 rounded-full bg-pink-900/30 border border-pink-500/20 text-pink-400 text-xs">Oracles</div>
                </div>
                <p className="text-gray-300 text-sm mb-4">Access real-time, high-fidelity price data from Pyth decentralized oracle network for accurate market information.</p>
                <div className="flex justify-between items-center"><div className="flex items-center text-xs text-pink-200/60"><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>Active</div><div className="text-pink-400/80 text-sm">Live Prices</div></div>
                <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-900/80 to-cyan-950/20 backdrop-blur-md rounded-xl overflow-hidden border border-cyan-500/30 group hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-600/20 relative">
              <div className="w-full h-3 bg-cyan-700 relative overflow-hidden"><div className="absolute inset-0 bg-pattern-roof opacity-20"></div></div>
              <div className="p-6 pt-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center"><div className="text-3xl mr-3 relative"><span className="relative z-10">🖼️</span><div className="absolute inset-0 rounded-full bg-cyan-500/20 filter blur-sm transform scale-125"></div></div><h3 className="text-lg font-bold text-cyan-300 group-hover:text-cyan-200 transition-colors">OpenSea API</h3></div>
                  <div className="px-2 py-1 rounded-full bg-cyan-900/30 border border-cyan-500/20 text-cyan-400 text-xs">NFT Data</div>
                </div>
                <p className="text-gray-300 text-sm mb-4">Fetch NFT data and marketplace information for collections on the Base network directly from OpenSea.</p>
                <div className="flex justify-between items-center"><div className="flex items-center text-xs text-cyan-200/60"><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>Active</div><div className="text-cyan-400/80 text-sm">Base NFTs</div></div>
                <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-900/80 to-purple-950/20 backdrop-blur-md rounded-xl overflow-hidden border border-purple-500/30 group hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/20 relative">
              <div className="w-full h-3 bg-purple-700 relative overflow-hidden"><div className="absolute inset-0 bg-pattern-roof opacity-20"></div></div>
              <div className="p-6 pt-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center"><div className="text-3xl mr-3 relative"><span className="relative z-10">🌉</span><div className="absolute inset-0 rounded-full bg-purple-500/20 filter blur-sm transform scale-125"></div></div><h3 className="text-lg font-bold text-purple-300 group-hover:text-purple-200 transition-colors">Across Protocol</h3></div>
                  <div className="px-2 py-1 rounded-full bg-purple-900/30 border border-purple-500/20 text-purple-400 text-xs">Bridging</div>
                </div>
                <p className="text-gray-300 text-sm mb-4">Enable fast and secure cross-chain token transfers to and from the Base network using Across Protocol.</p>
                <div className="flex justify-between items-center"><div className="flex items-center text-xs text-purple-200/60"><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>Active</div><div className="text-purple-400/80 text-sm">Cross-Chain</div></div>
                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-900/80 to-blue-950/20 backdrop-blur-md rounded-xl overflow-hidden border border-blue-500/30 group hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/20 relative">
              <div className="w-full h-3 bg-blue-700 relative overflow-hidden"><div className="absolute inset-0 bg-pattern-roof opacity-20"></div></div>
              <div className="p-6 pt-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center"><div className="text-3xl mr-3 relative"><span className="relative z-10">💡</span><div className="absolute inset-0 rounded-full bg-blue-500/20 filter blur-sm transform scale-125"></div></div><h3 className="text-lg font-bold text-blue-300 group-hover:text-blue-200 transition-colors">Data APIs</h3></div>
                  <div className="px-2 py-1 rounded-full bg-blue-900/30 border border-blue-500/20 text-blue-400 text-xs">Insights</div>
                </div>
                <p className="text-gray-300 text-sm mb-4">Leverage comprehensive crypto market insights and detailed protocol data from Messari & DefiLlama.</p>
                <div className="flex justify-between items-center"><div className="flex items-center text-xs text-blue-200/60"><span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>Active</div><div className="text-blue-400/80 text-sm">Market Data</div></div>
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
            </div>
          </div>
          <div className="mt-16 flex justify-center">
            <div className="flex space-x-10 opacity-30">
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-indigo-500 to-transparent"></div>
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-purple-500 to-transparent"></div>
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-indigo-500 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div id="about" className="w-full py-24 relative z-10 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-red-500 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-yellow-500 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 text-9xl text-amber-500/10 font-bold font-sans">र</div>
          <div className="absolute bottom-1/3 left-1/4 text-9xl text-red-500/10 font-bold font-sans">त</div>
        </div>
        <div className="max-w-5xl mx-auto px-4 relative">
          <h2 className="text-4xl font-bold text-center mb-16 text-yellow-300">
            <span className="relative inline-block">
              About Bharat Bazaar
              <div className="absolute -bottom-3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
            </span>
          </h2>
          <div className="bg-gradient-to-br from-gray-900/70 to-indigo-950/50 backdrop-blur-md rounded-xl p-8 border border-yellow-500/20 shadow-lg shadow-amber-900/10 mb-12 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-red-600/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl"></div>
            <h3 className="text-2xl font-bold mb-6 text-yellow-300 text-center relative">
              <span className="relative inline-block px-8">
                The Night Market Experience
                <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
                <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 opacity-70"></div>
                <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 opacity-70"></div>
              </span>
            </h3>
            <div className="bg-gray-900/40 backdrop-blur-sm rounded-lg p-6 border border-gray-800/50 mb-8 hover:border-yellow-500/30 transition-all duration-300">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-1/4 flex justify-center">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-red-600/20 to-yellow-500/20 flex items-center justify-center border border-yellow-500/20">
                    <span className="text-5xl">🏮</span>
                  </div>
                </div>
                <div className="md:w-3/4">
                  <p className="text-gray-300">Bharat Bazaar draws inspiration from the vibrant night markets of India, known for their diverse offerings, lively atmosphere, and unique cultural experiences. Just as visitors explore traditional markets to discover treasures and delicacies, users navigate our digital market to explore the world of decentralized finance.</p>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-6 text-yellow-300 text-center relative">
              <span className="relative inline-block px-8">
                Our Mission
                <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
                <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 opacity-70"></div>
                <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 opacity-70"></div>
              </span>
            </h3>
            <div className="bg-gray-900/40 backdrop-blur-sm rounded-lg p-6 border border-gray-800/50 hover:border-yellow-500/30 transition-all duration-300">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-1/4 flex justify-center order-1 md:order-2">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-500/20 flex items-center justify-center border border-blue-500/20">
                    <span className="text-5xl">🌉</span>
                  </div>
                </div>
                <div className="md:w-3/4 order-2 md:order-1">
                  <p className="text-gray-300">We are building a bridge between the complex world of DeFi and everyday users by creating an intuitive, engaging interface that makes blockchain interactions fun and accessible. By gamifying the experience, we remove the intimidation factor while maintaining all the powerful functionality of the underlying protocols.</p>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold mt-10 mb-6 text-yellow-300 text-center relative">
              <span className="relative inline-block px-8">
                Our Vision
                <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
                <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 opacity-70"></div>
                <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 opacity-70"></div>
              </span>
            </h3>
            <div className="bg-gray-900/40 backdrop-blur-sm rounded-lg p-6 border border-gray-800/50 hover:border-yellow-500/30 transition-all duration-300">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-1/4 flex justify-center">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-600/20 to-cyan-500/20 flex items-center justify-center border border-green-500/20">
                    <span className="text-5xl">🚀</span>
                  </div>
                </div>
                <div className="md:w-3/4">
                  <p className="text-gray-300">We envision a future where decentralized finance is as intuitive and accessible as traditional markets. Bharat Bazaar represents our first step toward creating experiences that combine the rich cultural heritage of traditional marketplaces with the innovative potential of blockchain technology.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center my-10">
              <div className="flex space-x-4">
                <div className="w-3 h-3 bg-red-500 rounded-full opacity-70"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full opacity-70"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full opacity-70"></div>
              </div>
            </div>
            <div className="text-center px-4 py-6 italic text-gray-300 relative">
              <div className="absolute left-0 top-0 text-4xl text-yellow-500/30">“</div>
              <p className="text-lg">Connecting tradition with innovation, Bharat Bazaar bridges the gap between cultural experiences and technological advancement.</p>
              <div className="absolute right-0 bottom-0 text-4xl text-yellow-500/30">”</div>
            </div>
          </div>
        </div>
      </div>
      
      <div id="team" className="w-full py-24 bg-gradient-to-b from-blue-950/30 via-indigo-950/50 to-purple-950/30 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-yellow-300">
            <span className="relative">
              Our Team
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
            </span>
          </h2>
          <p className="text-center mb-16 text-gray-300 max-w-3xl mx-auto">Meet the talented developers behind Bharat Bazaar who brought this vision to life.</p>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            <div className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 max-w-md group">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pink-900/70"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-pink-300 mb-1 group-hover:text-pink-200 transition-colors">Sparsh</h3>
                  <p className="text-gray-400 text-sm mb-3">Builder</p>
                  <p className="text-gray-300 mb-4 text-sm">Ex intern at ISRO and DRDO</p>
                  <div className="flex gap-3">
                    <a href="https://github.com/sparsh0006/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-300 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                    <a href="https://x.com/sparshtwt" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-300 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 9.99 9.99 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/60 backdrop-blur-md rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 max-w-md group">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/70"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-blue-300 mb-1 group-hover:text-blue-200 transition-colors">Deepak Anand</h3>
                  <p className="text-gray-400 text-sm mb-3">Builder</p>
                  <p className="text-gray-300 mb-4 text-sm">AI Lead @ DappLooker (<a href="https://x.com/dapplooker" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@dapplooker</a>)</p>
                  <div className="flex gap-3">
                    <a href="https://github.com/d1anand" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-300 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                    <a href="https://x.com/anandtwtss" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-300 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 9.99 9.99 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full py-20 bg-gradient-to-r from-yellow-900/20 via-amber-800/20 to-yellow-900/20 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-yellow-300">Ready to Explore the Bazaar?</h2>
          <p className="text-xl mb-10 text-gray-300">Connect your wallet and start your DeFi journey through our interactive night market experience.</p>
          <BazaarEntrance isWalletConnected={isWalletConnected} />
        </div>
      </div>
      
      <footer className="w-full py-12 bg-gray-900 border-t border-amber-900/30 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <h3 className="text-2xl font-bold text-yellow-300 font-sans tracking-tight">
                  <span className="text-red-500">भा</span>
                  <span className="text-yellow-300">र</span>
                  <span className="text-red-500">त</span>
                  <span className="text-yellow-300"> </span>
                  <span className="text-red-500">बा</span>
                  <span className="text-yellow-300">ज़ा</span>
                  <span className="text-red-500">र</span>
                </h3>
              </div>
              <p className="text-gray-400 max-w-md">A gamified DeFi experience set in a vibrant Indian bazaar environment.</p>
            </div>
            <div className="flex gap-12">
              <div>
                <h4 className="font-bold text-white mb-4">Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#features" className="hover:text-yellow-300 transition-colors">Features</a></li>
                  <li><a href="#protocols" className="hover:text-yellow-300 transition-colors">Integrations</a></li>
                  <li><a href="#about" className="hover:text-yellow-300 transition-colors">About</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-4">Resources</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-yellow-300 transition-colors">Documentation</a></li>
                  <li><a href="https://github.com/sparsh0006/basetone" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">GitHub</a></li>
                  <li><a href="#" className="hover:text-yellow-300 transition-colors">Support</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>© 2025 Bharat Bazaar. All rights reserved.</p>
            <p className="mt-2">Built with ❤️ at Base Batch India 2025</p>
          </div>
        </div>
      </footer>
      
      <style jsx global>{`
        @font-face {
          font-family: 'Press_Start_2P'; /* Ensure this matches the font name used in styles */
          src: url('/fonts/PressStart2P-Regular.ttf') format('truetype'); /* Adjust path if needed */
          font-weight: normal;
          font-style: normal;
        }
        .font-pixel-display { /* For titles if Press_Start_2P is used */
            font-family: 'Press_Start_2P', monospace;
        }
        @keyframes float-slow {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-subtle {
          0% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-5px) rotate(1deg); }
          100% { transform: translateY(0px) rotate(-1deg); }
        }
        @keyframes pulse-slow {
          0% { opacity: 0.3; }
          50% { opacity: 0.5; }
          100% { opacity: 0.3; }
        }
        @keyframes pulse-light {
          0% { opacity: 0.4; box-shadow: 0 0 4px 1px currentColor; }
          50% { opacity: 0.8; box-shadow: 0 0 8px 2px currentColor; }
          100% { opacity: 0.4; box-shadow: 0 0 4px 1px currentColor; }
        }
        @keyframes twinkle {
          0% { opacity: 0.1; }
          50% { opacity: 0.7; }
          100% { opacity: 0.1; }
        }
        @keyframes text-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
        .animate-float-subtle { animation: float-subtle 8s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-pulse-light { animation: pulse-light 5s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 8s ease-in-out infinite; }
        .animate-text-shimmer {
          background-size: 200% auto;
          animation: text-shimmer 6s linear infinite;
        }
        .shadow-glow { box-shadow: 0 0 10px 0 rgba(253, 224, 71, 0.5); }
        @keyframes electric-spark {
          0% { opacity: 0; transform: translateY(10px) translateX(-5px); }
          5% { opacity: 0.9; transform: translateY(-15px) translateX(5px); height: 15px; }
          10% { opacity: 0; transform: translateY(-25px) translateX(-5px); height: 5px; }
          100% { opacity: 0; }
        }
        @keyframes float-lantern-slow {
          0% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0% { opacity: 0.4; filter: blur(4px); }
          50% { opacity: 0.8; filter: blur(6px); }
          100% { opacity: 0.4; filter: blur(4px); }
        }
        @keyframes rotate-y-12 {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(12deg); }
        }
        .perspective-1000 { perspective: 1000px; }
        .animate-float-lantern-slow { animation: float-lantern-slow 4s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-electric-spark { animation: electric-spark 10s ease-out infinite; }
        .rotate-y-12 { transform: rotateY(12deg); }
        .bg-pattern-roof {
          background-image: repeating-linear-gradient(
            to right,
            rgba(255, 255, 255, 0.1) 0px,
            rgba(255, 255, 255, 0.1) 2px,
            transparent 2px,
            transparent 6px
          );
        }
      `}</style>
    </main>
  );
}