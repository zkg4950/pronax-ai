import React, { useState } from 'react';
import { AgentOffice3D } from './AgentOffice3D';
import { Box, MessageSquare, Bot, Sparkles } from 'lucide-react';

interface AdminChatProps {
  externalTaskTrigger?: { agentId: string; task: string } | null;
  onSendMessage?: (content: string) => void;
  isLoading?: boolean;
}

export const AdminChat: React.FC<AdminChatProps> = ({
  externalTaskTrigger,
  onSendMessage,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'office3d' | 'chat'>('office3d');

  return (
    <div className="relative w-full h-full flex flex-col bg-[#02070e] overflow-hidden">
      {/* Top Admin Switcher if needed */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#030d17] border-b border-cyan-500/30 text-xs font-mono-tech shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
          <span className="text-cyan-200 font-bold">STONIC ADMIN COMMAND INTERFACE</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('office3d')}
            className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold cursor-pointer transition-all ${
              activeTab === 'office3d'
                ? 'bg-cyan-500/30 text-cyan-100 border border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                : 'text-cyan-400/70 hover:text-cyan-200'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-cyan-300" />
            <span>AGENTS 3D STAGE</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full h-full min-h-0 overflow-hidden relative">
        <AgentOffice3D
          externalTaskTrigger={externalTaskTrigger}
          onSelectAgent={(agentId) => {
            if (onSendMessage) {
              onSendMessage(`Status inquiry dispatched for Agent ${agentId.toUpperCase()}`);
            }
          }}
        />
      </div>
    </div>
  );
};

export default AdminChat;
