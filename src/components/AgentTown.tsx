import React from 'react';
import { AgentInfo } from '../types';
import { AgentOffice3D } from './admin/AgentOffice3D';

interface AgentTownProps {
  onSelectAgent?: (agent: AgentInfo) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  externalTaskTrigger?: { agentId: string; task: string } | null;
  onBackToDashboard?: () => void;
  onOpenCryptoMarket?: () => void;
  onOpenCryptoMarketing?: () => void;
  userEmotion?: any;
}

export const AgentTown: React.FC<AgentTownProps> = ({
  onSelectAgent,
  isExpanded = false,
  onToggleExpand,
  externalTaskTrigger,
  onBackToDashboard,
  onOpenCryptoMarket,
  onOpenCryptoMarketing,
  userEmotion,
}) => {
  return (
    <div
      className={`relative rounded-xl border border-[#00f0ff]/30 bg-[#04121d]/95 backdrop-blur-md overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,240,255,0.06)] min-h-0 ${
        isExpanded ? 'h-full' : 'flex-1'
      }`}
    >
      <AgentOffice3D
        onSelectAgent={(agentId) => {
          if (onSelectAgent) {
            onSelectAgent({
              id: agentId,
              name: agentId.toUpperCase(),
              role: 'Agent',
              status: 'active',
              task: 'Executing Stonic task',
            });
          }
        }}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        externalTaskTrigger={externalTaskTrigger}
        onBackToDashboard={onBackToDashboard}
        onOpenCryptoMarket={onOpenCryptoMarket}
        onOpenCryptoMarketing={onOpenCryptoMarketing}
        userEmotion={userEmotion}
      />
    </div>
  );
};
