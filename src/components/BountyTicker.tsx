import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface BountyItem {
  id: number;
  title: string;
  bounty: number;
}

interface BountyTickerProps {
  bounties: BountyItem[];
}

export const BountyTicker: React.FC<BountyTickerProps> = ({ bounties }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Create duplicated array for seamless loop
  const duplicatedBounties = [...bounties, ...bounties];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        if (prev >= 100) return 0;
        return prev + 0.5;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan py-3 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDAgTCAyMCAwIEwgMjAgMjAgTCAwIDIwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
      <div 
        className="flex gap-8 transition-transform duration-100 ease-linear"
        style={{ transform: `translateX(-${scrollPosition}%)` }}
      >
        {duplicatedBounties.map((bounty, index) => (
          <div 
            key={`${bounty.id}-${index}`}
            className="flex items-center gap-3 whitespace-nowrap bg-black/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/30"
          >
            <Sparkles className="w-4 h-4 text-neon-yellow animate-pulse" />
            <span className="text-white font-bold text-sm">
              {bounty.title}
            </span>
            <span className="text-neon-yellow font-black text-lg">
              ${bounty.bounty}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
