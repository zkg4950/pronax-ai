import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Maximize2,
  Minimize2,
  Users,
  Terminal,
  Send,
  Loader2,
  X,
  Volume2,
  VolumeX,
  MessageSquare,
  Sparkles,
  Bot,
  Coffee,
  Shield,
  FileText,
  Database,
  Cloud,
  Layers,
  Globe,
  Radio,
  Zap,
  ArrowLeft,
  Activity,
  UserCheck,
} from 'lucide-react';
import { AgentInfo } from '../types';
import { AGENT_AVATARS } from './agentAvatars';
import { AnimatedOfficeAgent } from './AnimatedOfficeAgent';
import { AgentRealWorkModal } from './AgentRealWorkModal';
import {
  playRadioChirp,
  playConfirmChime,
  speakAgentDialogue,
  subscribeLipSync,
  LipSyncData,
} from '../utils/audioEffects';

import stonicFrontalScene from '../assets/images/stonic_agents_scene_1792153736431.jpg';
import stonicIsometricScene from '../assets/images/stonic_agents_isometric_1792153752872.jpg';

interface AgentTown3DProps {
  onSelectAgent?: (agent: AgentInfo) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  externalTaskTrigger?: { agentId: string; task: string } | null;
}

// Authentic Saraiki & Urdu discussions focused on their REAL WORK
const SARAIKI_URDU_DISCUSSIONS: {
  topic: string;
  dialogue: {
    speakerId: 'alice' | 'bob' | 'carol' | 'dave';
    speakerName: string;
    targetId: string;
    saraikiText: string;
    englishSummary: string;
  }[];
}[] = [
  {
    topic: 'Sector-9 Satellite Telemetry Te Security (سیرائیکی / اردو)',
    dialogue: [
      {
        speakerId: 'alice',
        speakerName: 'Alice',
        targetId: 'bob',
        saraikiText: 'Ada Bob, Sector-9 satellite da encrypted firewall link verify thia hey?',
        englishSummary: 'Bob, did you verify the encrypted firewall link for the Sector-9 satellite?',
      },
      {
        speakerId: 'bob',
        speakerName: 'Bob',
        targetId: 'alice',
        saraikiText: 'Haan Alice Baji! Port 8080 te mTLS bilkul tight la ditta hey, zero packet loss hey.',
        englishSummary: 'Yes Alice! Port 8080 has mTLS enforced, zero packet drops recorded.',
      },
      {
        speakerId: 'bob',
        speakerName: 'Bob',
        targetId: 'carol',
        saraikiText: 'Carol behan, tuhada real-time Kafka streaming kiven chalda paya hey?',
        englishSummary: 'Carol, how is that real-time Kafka stream throughput holding up?',
      },
      {
        speakerId: 'carol',
        speakerName: 'Carol',
        targetId: 'bob',
        saraikiText: 'Ada Bob, pipeline 1.42 million events per second nal mast chaldi payi hey, latency sirf 8ms hey!',
        englishSummary: 'Bob, pipeline is clocking 1.42M events/sec with ultra-low 8ms latency!',
      },
      {
        speakerId: 'dave',
        speakerName: 'Dave',
        targetId: 'all',
        saraikiText: 'Jani Kubernetes de saray 16 pods green han, CPU sirf 35% te hey. System full chass karwa reha hey!',
        englishSummary: 'Team, all 16 Kubernetes pods are green with CPU at 35%. Rock solid!',
      },
      {
        speakerId: 'alice',
        speakerName: 'Alice',
        targetId: 'all',
        saraikiText: 'Zabardast team! Inventor Usman sahib wastey final briefing dossier save kardi payan.',
        englishSummary: 'Excellent team! Archiving the intelligence dossier for Inventor Usman now.',
      },
    ],
  },
  {
    topic: 'Cloud Node Scaling Te Karak Chai Break',
    dialogue: [
      {
        speakerId: 'carol',
        speakerName: 'Carol',
        targetId: 'dave',
        saraikiText: 'Dave bhai, ClickHouse node 02 te query surge aandi payi hey, do naway pods spin kar dyo?',
        englishSummary: 'Dave, seeing query surge on node 02, can you provision two more worker pods?',
      },
      {
        speakerId: 'dave',
        speakerName: 'Dave',
        targetId: 'carol',
        saraikiText: 'Huney kar ditta Carol behan! Do worker pods auto-scale te active han, latency check karo.',
        englishSummary: 'Done Carol! Two pods scaled out on our mesh, latency is normalizing.',
      },
      {
        speakerId: 'carol',
        speakerName: 'Carol',
        targetId: 'dave',
        saraikiText: 'Shukar hey, buffer utilization wapis 18% te aa gayi hey. Meharbani Dave bhai!',
        englishSummary: 'Confirmed, buffer utilization is back down to 18%. Thank you Dave!',
      },
      {
        speakerId: 'bob',
        speakerName: 'Bob',
        targetId: 'alice',
        saraikiText: 'Alice baji, maen espresso bar tu garama garam chai/qahwa le aawan, tuhaday wastey ve le aawan?',
        englishSummary: 'Alice, heading over to grab espresso from the bar, should I bring you a cup?',
      },
      {
        speakerId: 'alice',
        speakerName: 'Alice',
        targetId: 'bob',
        saraikiText: 'Ada Bob tussi boht changay ho! Thori chini ghatt rakhna, maen satellite telemetry analyze kar rahi aan.',
        englishSummary: 'You are so kind Bob! Less sugar please, analyzing satellite telemetry.',
      },
      {
        speakerId: 'dave',
        speakerName: 'Dave',
        targetId: 'bob',
        saraikiText: 'Ada Bob, meray wastey ve ik cup karak espresso le aana jani!',
        englishSummary: 'Bob, bring a cup of strong espresso for me too please!',
      },
      {
        speakerId: 'carol',
        speakerName: 'Carol',
        targetId: 'all',
        saraikiText: 'Te paani peena na bhulna saaray, continuous coding wastey hydration boht zaroori hey!',
        englishSummary: 'And do not forget to drink water everyone, hydration is essential for coding!',
      },
    ],
  },
  {
    topic: 'Perimeter Intrusion Test Te Hacker Defense',
    dialogue: [
      {
        speakerId: 'bob',
        speakerName: 'Bob',
        targetId: 'all',
        saraikiText: 'Saray bhra sun lo, subnet 192.168.1.0/24 te live intrusion scan shuru kar ditta hey.',
        englishSummary: 'Listen team, running live intrusion scan across subnet 192.168.1.0/24.',
      },
      {
        speakerId: 'alice',
        speakerName: 'Alice',
        targetId: 'bob',
        saraikiText: 'Ada Bob, diplomatic hotline bridge te TLS 1.3 lock rakhna, Usman sahib di call aani hey.',
        englishSummary: 'Bob, keep TLS 1.3 locked on the hotline bridge, Inventor Usman is connecting.',
      },
      {
        speakerId: 'bob',
        speakerName: 'Bob',
        targetId: 'alice',
        saraikiText: 'Fikar na karo Baji, TLS 1.3 Strict Mode on hey. 0 unauthorized packets detect thaye han.',
        englishSummary: 'No worries Alice, TLS 1.3 Strict Mode is active with zero anomalies.',
      },
      {
        speakerId: 'dave',
        speakerName: 'Dave',
        targetId: 'carol',
        saraikiText: 'Carol behan, ingress network load 380 Mbps te steady hey, sab khairiyat hey.',
        englishSummary: 'Carol, ingress traffic load is steady at 380 Mbps, everything running smooth.',
      },
    ],
  },
];

export const AgentTown3D: React.FC<AgentTown3DProps> = ({
  onSelectAgent,
  isExpanded = false,
  onToggleExpand,
  externalTaskTrigger,
}) => {
  // Main view state: 'overview' shows all 4 agents in command room; 'agent_focus' shows close-up workstation
  const [viewMode, setViewMode] = useState<'overview' | 'agent_focus'>('overview');
  const [viewPerspective, setViewPerspective] = useState<'frontal' | 'isometric'>('frontal');
  const [selectedAgentId, setSelectedAgentId] = useState<'alice' | 'bob' | 'carol' | 'dave'>('alice');
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isChatFeedOpen, setIsChatFeedOpen] = useState<boolean>(false);
  const [taskInput, setTaskInput] = useState<string>('');
  const [isExecutingTask, setIsExecutingTask] = useState<boolean>(false);

  // Real Working Modal for Alice, Bob, Carol, Dave
  const [activeWorkModal, setActiveWorkModal] = useState<'alice' | 'bob' | 'carol' | 'dave' | null>(null);

  // Audio & Voice options
  const [agentSoundEnabled, setAgentSoundEnabled] = useState<boolean>(true);
  const [voiceMode, setVoiceMode] = useState<'native_urdu_hindi' | 'english_clear'>('native_urdu_hindi');
  const [autonomousChat, setAutonomousChat] = useState<boolean>(true);

  // Real-time lip-sync for focused close-up view
  const [focusedLipSync, setFocusedLipSync] = useState<LipSyncData>({
    isOpen: false,
    openRatio: 0,
    mouthWidth: 1.0,
    jawOffset: 0,
    phoneme: 'rest',
  });

  // Track each agent's current activity (sitting, walking, talking, meeting)
  const [agentActivities, setAgentActivities] = useState<
    Record<'alice' | 'bob' | 'carol' | 'dave', 'working_at_desk' | 'talking' | 'walking' | 'meeting' | 'drinking_water'>
  >({
    alice: 'working_at_desk',
    bob: 'working_at_desk',
    carol: 'working_at_desk',
    dave: 'working_at_desk',
  });

  // Walking target coordinates for agents on the office floor
  const [walkingTargets, setWalkingTargets] = useState<
    Record<'alice' | 'bob' | 'carol' | 'dave', { left: string; top: string } | null>
  >({
    alice: null,
    bob: null,
    carol: null,
    dave: null,
  });

  // Active Speech Bubble
  const [activeBubble, setActiveBubble] = useState<{
    agentId: 'alice' | 'bob' | 'carol' | 'dave';
    speakerName: string;
    saraikiText: string;
    englishSummary: string;
    targetName?: string;
  } | null>(null);

  const [conversationHistory, setConversationHistory] = useState<
    {
      id: string;
      speakerId: 'alice' | 'bob' | 'carol' | 'dave';
      speakerName: string;
      saraikiText: string;
      englishSummary: string;
      timestamp: string;
    }[]
  >([
    {
      id: 'init-1',
      speakerId: 'alice',
      speakerName: 'Alice',
      saraikiText: 'Salam Ada Bob! Sector-9 satellite da telemetry feed bilkul lock thia hey.',
      englishSummary: 'Sector-9 satellite telemetry uplink verified and locked.',
      timestamp: '09:42 AM',
    },
    {
      id: 'init-2',
      speakerId: 'bob',
      speakerName: 'Bob',
      saraikiText: 'Walaikum Assalam Baji Alice! Ingress firewall full tight hey, hacker da baap ve nai aa sakda.',
      englishSummary: 'Firewall is fortified with mTLS, perimeter is fully protected.',
      timestamp: '09:43 AM',
    },
    {
      id: 'init-3',
      speakerId: 'carol',
      speakerName: 'Carol',
      saraikiText: 'Kafka consumer streams 1.4 million events te tezi nal chalday payen!',
      englishSummary: 'Kafka streaming queues processing 1.42M events/sec with 8.4ms latency.',
      timestamp: '09:44 AM',
    },
    {
      id: 'init-4',
      speakerId: 'dave',
      speakerName: 'Dave',
      saraikiText: 'Saray Kubernetes pods mast chalday payen, cluster full chass karwa reha hey!',
      englishSummary: 'All 16 Kubernetes pods reporting healthy, cluster is optimal.',
      timestamp: '09:45 AM',
    },
  ]);

  // Subscribe to lip sync in focused view
  useEffect(() => {
    const unsub = subscribeLipSync((speakerId, data) => {
      if (speakerId === selectedAgentId) {
        setFocusedLipSync(data);
      }
    });
    return unsub;
  }, [selectedAgentId]);

  // Agent profiles with real operational telemetry & photorealistic portraits
  const agents = {
    alice: {
      id: 'alice' as const,
      name: 'Alice',
      title: 'Lead Intelligence Analyst',
      taskTag: 'Drafting Intel',
      avatarColor: '#f472b6',
      badgeBorder: 'border-pink-400',
      glowShadow: 'shadow-[0_0_25px_rgba(244,114,182,0.4)]',
      currentTask: 'Sector-9 Satellite Telemetry & Global Dossier Compilation',
      metricLabel: 'SAT LINK',
      metricValue: '99.8% Locked',
      telemetryChip: '🛰 Sector-9 Sat Elevation 42.1°',
      terminalLogs: [
        '[ALICE-CORE] Satellite orbital link locked on Sector 9 (Elevation 42.1°)',
        '[ALICE-CORE] Ingesting 14 global diplomatic telemetry streams',
        '[ALICE-CORE] Threat assessment score: 4.2 / DEFCON 3 Normal Readiness',
        '[ALICE-CORE] Intelligence dossier prepared for Inventor Usman',
      ],
      frontalPos: { left: '18%', top: '56%' },
      isometricPos: { left: '24%', top: '60%' },
    },
    bob: {
      id: 'bob' as const,
      name: 'Bob',
      title: 'Senior Cyber Security Engineer',
      taskTag: 'Firewall Audit',
      avatarColor: '#38bdf8',
      badgeBorder: 'border-sky-400',
      glowShadow: 'shadow-[0_0_25px_rgba(56,189,248,0.4)]',
      currentTask: 'Subnet 192.168.1.0/24 Port Hardening & Intrusion Mitigation',
      metricLabel: 'FIREWALL',
      metricValue: 'TLS 1.3 Active',
      telemetryChip: '🔒 Port 443 / 8080 mTLS Fortified',
      terminalLogs: [
        '[BOB-SEC] Scanning external subnet 192.168.1.0/24',
        '[BOB-SEC] Port 443 TLS 1.3 strict transport active',
        '[BOB-SEC] Port 8080 mTLS authorization token verified',
        '[BOB-SEC] Snort IDS active; 0 unauthorized intrusion attempts',
      ],
      frontalPos: { left: '38%', top: '48%' },
      isometricPos: { left: '44%', top: '38%' },
    },
    carol: {
      id: 'carol' as const,
      name: 'Carol',
      title: 'Data Pipeline Specialist',
      taskTag: 'Data Pipelines',
      avatarColor: '#10b981',
      badgeBorder: 'border-emerald-400',
      glowShadow: 'shadow-[0_0_25px_rgba(16,185,129,0.4)]',
      currentTask: 'Ingesting 1.42M events/sec via Kafka & ClickHouse Stream Engine',
      metricLabel: 'STREAM ETL',
      metricValue: '1.42M ev/s',
      telemetryChip: '⚡ Kafka Queues Latency 8.4ms',
      terminalLogs: [
        '[CAROL-ETL] Kafka topic telemetry.sensor_stream healthy',
        '[CAROL-ETL] Ingestion rate: 1.42M events/sec (latency 8.4ms)',
        '[CAROL-ETL] ClickHouse real-time database partitions synchronized',
        '[CAROL-ETL] Hydration check: team hydration break logged',
      ],
      frontalPos: { left: '58%', top: '48%' },
      isometricPos: { left: '72%', top: '42%' },
    },
    dave: {
      id: 'dave' as const,
      name: 'Dave',
      title: 'Cloud DevOps Architect',
      taskTag: 'Server Audit',
      avatarColor: '#fbbf24',
      badgeBorder: 'border-amber-400',
      glowShadow: 'shadow-[0_0_25px_rgba(251,191,36,0.4)]',
      currentTask: 'Auditing 16 Kubernetes Pods across Cilium eBPF Mesh',
      metricLabel: 'K8S PODS',
      metricValue: '16/16 Healthy',
      telemetryChip: '☁ 16 Nodes CPU 34% Optimal',
      terminalLogs: [
        '[DAVE-OPS] Kubernetes cluster stonic-prod-us nodes: READY',
        '[DAVE-OPS] Envoy proxy sidecars running across 16 pods',
        '[DAVE-OPS] Cluster autoscaler configured; 0 memory pressure',
        '[DAVE-OPS] Node 01 & 02 compute health verified at 34% CPU',
      ],
      frontalPos: { left: '82%', top: '56%' },
      isometricPos: { left: '82%', top: '60%' },
    },
  };

  const selectedAgent = agents[selectedAgentId];

  // Speech Trigger with automatic Lip-Sync and Activity Management
  const triggerAgentSpeech = useCallback(
    (
      speakerId: 'alice' | 'bob' | 'carol' | 'dave',
      saraikiText: string,
      englishSummary: string,
      targetId?: string
    ) => {
      const agent = agents[speakerId];
      if (!agent) return;

      const speakerName = agent.name;
      const targetAgent = targetId && (agents as any)[targetId];
      const targetName = targetAgent ? targetAgent.name : targetId === 'all' ? 'Team' : undefined;

      // Update speaker status to talking
      setAgentActivities((prev) => ({
        ...prev,
        [speakerId]: 'talking',
      }));

      setActiveBubble({
        agentId: speakerId,
        speakerName,
        saraikiText,
        englishSummary,
        targetName,
      });

      if (agentSoundEnabled) {
        const textToSpeak = voiceMode === 'native_urdu_hindi' ? saraikiText : englishSummary;
        speakAgentDialogue(textToSpeak, speakerId, voiceMode);
      }

      setConversationHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          speakerId,
          speakerName,
          saraikiText,
          englishSummary,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      setSelectedAgentId(speakerId);

      // Return to working at desk after finished speaking
      setTimeout(() => {
        setAgentActivities((prev) => {
          if (prev[speakerId] === 'talking') {
            return { ...prev, [speakerId]: 'working_at_desk' };
          }
          return prev;
        });
      }, Math.max(3500, saraikiText.length * 70));
    },
    [agentSoundEnabled, voiceMode]
  );

  // Walk Agent Across Floor to Colleague Desk or Meeting
  const walkAgentTo = (
    agentId: 'alice' | 'bob' | 'carol' | 'dave',
    targetPos: { left: string; top: string },
    speechSaraiki: string,
    speechEn: string,
    targetColleague?: string
  ) => {
    setAgentActivities((prev) => ({ ...prev, [agentId]: 'walking' }));
    setWalkingTargets((prev) => ({ ...prev, [agentId]: targetPos }));
    setActiveNotification(`${agents[agentId].name} is walking to ${targetColleague || 'destination'}...`);

    // Arrives after 3.2 seconds
    setTimeout(() => {
      setAgentActivities((prev) => ({ ...prev, [agentId]: 'talking' }));
      triggerAgentSpeech(agentId, speechSaraiki, speechEn, targetColleague);

      // Returns to computer desk chair after conversation
      setTimeout(() => {
        setAgentActivities((prev) => ({ ...prev, [agentId]: 'walking' }));
        setWalkingTargets((prev) => ({ ...prev, [agentId]: null }));
        setTimeout(() => {
          setAgentActivities((prev) => ({ ...prev, [agentId]: 'working_at_desk' }));
          setActiveNotification(`${agents[agentId].name} resumed work at computer chair.`);
        }, 3200);
      }, 5000);
    }, 3200);
  };

  // Discussion Sequence Runner
  const discussionQueueRef = useRef<
    {
      speakerId: 'alice' | 'bob' | 'carol' | 'dave';
      speakerName: string;
      targetId: string;
      saraikiText: string;
      englishSummary: string;
    }[]
  >([]);
  const isPlayingDiscussionRef = useRef<boolean>(false);

  const startDiscussionSequence = useCallback(
    (
      dialogueItems: {
        speakerId: 'alice' | 'bob' | 'carol' | 'dave';
        speakerName: string;
        targetId: string;
        saraikiText: string;
        englishSummary: string;
      }[]
    ) => {
      if (isPlayingDiscussionRef.current || dialogueItems.length === 0) return;
      isPlayingDiscussionRef.current = true;
      discussionQueueRef.current = [...dialogueItems];

      const playNext = () => {
        if (discussionQueueRef.current.length === 0) {
          isPlayingDiscussionRef.current = false;
          setTimeout(() => setActiveBubble(null), 4500);
          return;
        }

        const nextItem = discussionQueueRef.current.shift()!;
        triggerAgentSpeech(
          nextItem.speakerId,
          nextItem.saraikiText,
          nextItem.englishSummary,
          nextItem.targetId
        );

        const duration = Math.max(3800, nextItem.saraikiText.length * 75);
        setTimeout(playNext, duration);
      };

      playNext();
    },
    [triggerAgentSpeech]
  );

  // Autonomous Colleague Banter Loop (every 22s)
  useEffect(() => {
    if (!autonomousChat) return;

    const interval = setInterval(() => {
      if (isPlayingDiscussionRef.current) return;
      const randomDisc =
        SARAIKI_URDU_DISCUSSIONS[Math.floor(Math.random() * SARAIKI_URDU_DISCUSSIONS.length)];
      startDiscussionSequence(randomDisc.dialogue);
    }, 24000);

    return () => clearInterval(interval);
  }, [autonomousChat, startDiscussionSequence]);

  // Handle external task trigger
  useEffect(() => {
    if (externalTaskTrigger) {
      const { agentId, task } = externalTaskTrigger;
      if (agentId in agents) {
        setSelectedAgentId(agentId as any);
        triggerAgentSpeech(
          agentId as any,
          `Hukum janab! "${task}" te kam shuru ho chuka hey. Telemetry live chaldi payi hey.`,
          `Acknowledged directive: "${task}". Work initiated.`
        );
      }
    }
  }, [externalTaskTrigger, triggerAgentSpeech]);

  // Dispatch custom directive
  const handleExecuteAgentTask = async () => {
    const instruction = taskInput.trim();
    if (!instruction || isExecutingTask) return;

    setIsExecutingTask(true);
    playConfirmChime();

    triggerAgentSpeech(
      selectedAgentId,
      `Hukum janab! "${instruction}" te foran kam shuru kar ditta hey.`,
      `Directive acknowledged: "${instruction}". Executing immediately.`
    );

    try {
      const res = await fetch('/api/admin/agent-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          instruction,
          context: { currentTask: selectedAgent.currentTask, officeState: 'operational' },
        }),
      });

      const data = await res.json();
      if (data && data.output) {
        triggerAgentSpeech(
          selectedAgentId,
          `Kam mukammal ho ghya Sir, telemetry verify ho gayi hey!`,
          `Task completed with optimal parameters, Sir.`
        );
      }
    } catch (err) {
      console.warn('Agent task error:', err);
    } finally {
      setIsExecutingTask(false);
      setTaskInput('');
    }
  };

  const currentBgImage =
    viewPerspective === 'isometric' ? stonicIsometricScene : stonicFrontalScene;

  return (
    <div className="relative w-full h-full flex flex-col bg-[#020b14] overflow-hidden select-none border border-cyan-500/30 rounded-xl shadow-[0_0_35px_rgba(0,240,255,0.08)]">
      {/* ================= TOP RIBBON (MATCHING REFERENCE IMAGE 1 & 2 EXACTLY) ================= */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#031320]/95 border-b border-cyan-500/25 shrink-0 z-30">
        {/* Agent Buttons Chips with Real Portraits */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          {Object.values(agents).map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => {
                  setSelectedAgentId(agent.id);
                  setViewMode('agent_focus');
                  triggerAgentSpeech(
                    agent.id,
                    `Ji Sir, ${agent.name} hazir hey! Real task te kam chal reha hey.`,
                    `Agent ${agent.name} ready and monitoring systems.`
                  );
                }}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono-tech transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/25 border-2 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(0,240,255,0.5)] font-bold'
                    : 'bg-[#051c2c]/80 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60'
                }`}
              >
                <div className="relative w-5 h-5 rounded-full overflow-hidden border border-cyan-400 shrink-0">
                  <img
                    src={AGENT_AVATARS[agent.id]}
                    alt={agent.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-white">{agent.name}</span>
                <span className="text-[10px] text-cyan-300/80">({agent.taskTag})</span>
              </button>
            );
          })}
        </div>

        {/* Right Controls: Perspective Switcher, Terminal, Audio, Voice Mode */}
        <div className="flex items-center gap-1.5 text-xs font-mono-tech shrink-0">
          {/* View Mode Toggle: Overview vs Focused Workstation */}
          <button
            onClick={() => {
              const next = viewMode === 'overview' ? 'agent_focus' : 'overview';
              setViewMode(next);
              setActiveNotification(
                next === 'agent_focus'
                  ? `Focusing on ${selectedAgent.name}'s Workstation`
                  : 'Returned to Stonic Command Center'
              );
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-bold hover:bg-cyan-500/40 cursor-pointer shadow-[0_0_10px_rgba(0,240,255,0.3)]"
            title="Toggle between Command Center Overview and Focused Agent Workstation"
          >
            {viewMode === 'overview' ? (
              <>
                <Zap className="w-3.5 h-3.5 text-cyan-300" />
                <span>FOCUS AGENT</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-cyan-300" />
                <span>ALL AGENTS</span>
              </>
            )}
          </button>

          {/* Perspective View Switcher (Only in Overview mode) */}
          {viewMode === 'overview' && (
            <button
              onClick={() => {
                const next = viewPerspective === 'frontal' ? 'isometric' : 'frontal';
                setViewPerspective(next);
                setActiveNotification(
                  next === 'frontal' ? 'Frontal Office View (Image 1)' : 'Isometric Office View (Image 2)'
                );
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#041c2c] border border-cyan-400/50 text-cyan-200 hover:bg-cyan-900/60 cursor-pointer font-bold"
              title="Toggle between Image 1 Front View and Image 2 Isometric View"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">
                {viewPerspective === 'frontal' ? 'FRONT VIEW' : 'ISOMETRIC'}
              </span>
            </button>
          )}

          {/* Voice Mode Switcher (Urdu/Saraiki vs Clear English Comms) */}
          <button
            onClick={() => {
              const next = voiceMode === 'native_urdu_hindi' ? 'english_clear' : 'native_urdu_hindi';
              setVoiceMode(next);
              setActiveNotification(
                next === 'native_urdu_hindi'
                  ? 'Voice: Native Saraiki / Urdu'
                  : 'Voice: Clear Sci-Fi English'
              );
            }}
            className="flex items-center gap-1 px-2 py-1 rounded border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 cursor-pointer text-[11px]"
            title="Switch speech synthesis pronunciation engine"
          >
            <Radio className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">
              {voiceMode === 'native_urdu_hindi' ? 'VOICE: URDU' : 'VOICE: EN'}
            </span>
          </button>

          {/* Terminal Toggle */}
          <button
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs transition-all cursor-pointer ${
              isTerminalOpen
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 shadow-[0_0_12px_#00f0ff]'
                : 'bg-cyan-950/60 border-cyan-400/50 text-cyan-200 hover:bg-cyan-900/60'
            }`}
          >
            <span className="text-cyan-400">&gt;_</span>
            <span className="font-bold tracking-wider hidden sm:inline">TERMINAL</span>
          </button>

          {/* Chat Feed Drawer Toggle */}
          <button
            onClick={() => setIsChatFeedOpen(!isChatFeedOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-all cursor-pointer ${
              isChatFeedOpen
                ? 'bg-pink-500/30 border-pink-400 text-pink-100 shadow-[0_0_10px_#ec4899]'
                : 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40'
            }`}
            title="Open Live Inter-Agent Discussion Feed"
          >
            <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline text-[11px]">CHAT LOG</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setAgentSoundEnabled(!agentSoundEnabled)}
            className={`p-1.5 rounded border cursor-pointer transition-colors ${
              agentSoundEnabled
                ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                : 'bg-slate-800/60 border-slate-700 text-slate-500'
            }`}
            title={agentSoundEnabled ? 'Agent Voice Audio ON' : 'Agent Voice Audio Muted'}
          >
            {agentSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Maximize Button */}
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 text-cyan-400 hover:text-cyan-200 transition-colors cursor-pointer"
              title={isExpanded ? 'Restore View' : 'Maximize View'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* ================= MAIN INTERACTIVE VIEWPORT ================= */}
      {viewMode === 'overview' ? (
        /* ================= OVERVIEW: STONIC COMMAND CENTER WITH 4 REALISTIC ANIMATED AGENTS ================= */
        <div className="relative flex-1 w-full h-full min-h-0 overflow-hidden bg-slate-950 flex items-center justify-center">
          {/* Main Photorealistic Scene Image */}
          <img
            src={currentBgImage}
            alt="Stonic AI Intelligence Office"
            className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
          />

          {/* Animated Cybernetic Ambient Overlay Layers */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#020b14]/70 via-transparent to-[#020b14]/30" />

          {/* Central Rotating Holographic Earth Coordinate Rings Pulse */}
          <div
            style={{
              left: viewPerspective === 'frontal' ? '56.5%' : '59.5%',
              top: viewPerspective === 'frontal' ? '37%' : '44%',
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border border-cyan-400/30 animate-spin-slow pointer-events-none shadow-[0_0_50px_rgba(0,240,255,0.25)]"
          />

          {/* Real-time Notification Banner */}
          {activeNotification && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-[#031525]/95 border border-cyan-400 text-cyan-100 text-xs font-mono-tech flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] pointer-events-none animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>{activeNotification}</span>
            </div>
          )}

          {/* ================= 4 REALISTIC AGENTS WITH REAL COMPUTER CHAIRS, DUAL MONITORS & LIP-SYNC ================= */}
          {Object.values(agents).map((agent) => {
            const pos =
              viewPerspective === 'isometric' ? agent.isometricPos : agent.frontalPos;
            const isSpeaking = activeBubble?.agentId === agent.id;

            return (
              <AnimatedOfficeAgent
                key={agent.id}
                id={agent.id}
                name={agent.name}
                title={agent.title}
                taskTag={agent.taskTag}
                avatarImage={AGENT_AVATARS[agent.id]}
                accentColor={agent.avatarColor}
                status={agentActivities[agent.id]}
                currentTask={agent.currentTask}
                telemetrySnippet={agent.telemetryChip}
                isSpeaking={isSpeaking}
                activeSpeechText={isSpeaking ? activeBubble?.saraikiText : undefined}
                activeEnglishSummary={isSpeaking ? activeBubble?.englishSummary : undefined}
                targetColleague={isSpeaking ? activeBubble?.targetName : undefined}
                position={pos}
                walkingTargetPos={walkingTargets[agent.id]}
                onSelect={() => {
                  setSelectedAgentId(agent.id);
                  setViewMode('agent_focus');
                  triggerAgentSpeech(
                    agent.id,
                    `Salam Sir, ${agent.name} hazir hey! Workstation te real kam chal reha hey.`,
                    `Agent ${agent.name} operational.`
                  );
                }}
                onOpenWorkModal={() => setActiveWorkModal(agent.id)}
              />
            );
          })}

          {/* Autonomous Discussion Progress Indicator */}
          {isPlayingDiscussionRef.current && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#021320]/95 border border-emerald-400/70 text-emerald-300 text-xs font-mono-tech shadow-[0_0_18px_rgba(16,185,129,0.4)]">
              <Bot className="w-4 h-4 animate-spin text-emerald-400" />
              <span>SARAIKI COMMS & LIP-SYNC ACTIVE</span>
            </div>
          )}
        </div>
      ) : (
        /* ================= FOCUSED WORKSTATION: REAL PHOTOREALISTIC AGENT LIVE WORKING WITH LIP-SYNC ================= */
        <div className="relative flex-1 w-full h-full min-h-0 overflow-y-auto bg-[#020c16] flex flex-col md:flex-row items-stretch p-3 md:p-5 gap-4">
          {/* Left Column: Full-Height Photorealistic Agent Character Display with Dynamic Lip-Sync */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-[#031525]/90 to-[#020b14]/95 border-2 border-cyan-500/40 relative shadow-[0_0_40px_rgba(0,240,255,0.15)] overflow-hidden">
            {/* Ambient Background Glow */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 40%, ${selectedAgent.avatarColor} 0%, transparent 70%)`,
              }}
            />

            {/* Back to All Agents Button */}
            <button
              onClick={() => setViewMode('overview')}
              className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#021320]/90 border border-cyan-400 text-cyan-200 text-xs font-mono-tech hover:bg-cyan-500/20 cursor-pointer shadow-[0_0_12px_rgba(0,240,255,0.3)] z-10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN TO OVERVIEW</span>
            </button>

            {/* Agent Live Status Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-mono-tech z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SITTING AT DESK // OPERATIONAL</span>
            </div>

            {/* Large Photorealistic Agent Image Card with Real Lip-Sync Mouth Overlay */}
            <div className="relative w-64 h-72 md:w-76 md:h-84 rounded-3xl overflow-hidden border-2 border-cyan-400/70 shadow-[0_0_35px_rgba(0,240,255,0.35)] mt-6 shrink-0 bg-slate-900">
              <img
                src={AGENT_AVATARS[selectedAgent.id]}
                alt={selectedAgent.name}
                className="w-full h-full object-cover object-top filter brightness-105 contrast-105"
              />

              {/* Sci-Fi HUD Corner Brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-300 pointer-events-none" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-300 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-300 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-300 pointer-events-none" />

              {/* Real Lip-Sync Mouth Overlay on Close-Up Image */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: selectedAgent.id === 'alice' ? '78%' : '76%',
                  width: '24%',
                  transform: `translate(-50%, -50%) scaleX(${focusedLipSync.mouthWidth}) translateY(${focusedLipSync.jawOffset * 0.5}px)`,
                  transition: 'transform 0.05s ease-out',
                }}
                className="pointer-events-none flex flex-col items-center justify-center"
              >
                {activeBubble?.agentId === selectedAgent.id && focusedLipSync.isOpen ? (
                  <div
                    style={{
                      height: `${Math.max(4, Math.round(focusedLipSync.openRatio * 18))}px`,
                      width: `${Math.round(focusedLipSync.mouthWidth * 100)}%`,
                      borderRadius: focusedLipSync.phoneme === 'O' ? '50%' : '35% / 60%',
                    }}
                    className="bg-[#240a0c] border border-[#a83244] shadow-inner flex flex-col items-center justify-between overflow-hidden relative"
                  >
                    <div className="w-4/5 h-[2px] bg-slate-100/95 rounded-b-xs" />
                    <div className="w-3/5 h-[3px] bg-[#c74d5e] rounded-t-sm" />
                  </div>
                ) : (
                  <div className="w-full h-[2px] bg-[#883a3a]/80 rounded-full" />
                )}
              </div>

              {/* Active Speaking Indicator Overlay */}
              {activeBubble?.agentId === selectedAgent.id && (
                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/85 border border-emerald-400 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold font-mono">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>LIP-SYNC SPEAKING (سیرائیکی)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-emerald-400 animate-pulse rounded-full" />
                    <span className="w-1 h-5 bg-emerald-300 animate-bounce rounded-full" />
                    <span className="w-1 h-2.5 bg-emerald-400 animate-pulse rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Agent Identity Details */}
            <div className="text-center mt-3 z-10">
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide flex items-center justify-center gap-2">
                <span>{selectedAgent.name}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full border"
                  style={{
                    borderColor: selectedAgent.avatarColor,
                    color: selectedAgent.avatarColor,
                    backgroundColor: `${selectedAgent.avatarColor}22`,
                  }}
                >
                  {selectedAgent.taskTag}
                </span>
              </h2>
              <p className="text-xs text-cyan-300/80 font-mono mt-0.5">{selectedAgent.title}</p>
              <p className="text-xs text-slate-300 font-sans mt-1 max-w-sm">
                "{selectedAgent.currentTask}"
              </p>
            </div>

            {/* Interactive Speech Bubble under Character */}
            {activeBubble?.agentId === selectedAgent.id && (
              <div className="mt-3 w-full max-w-md p-3 rounded-xl bg-[#03182b] border-2 border-emerald-400 text-emerald-100 text-xs shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                  <span className="font-bold">LIVE SARAIKI TRANSMISSION</span>
                  {activeBubble.targetName && <span>→ {activeBubble.targetName}</span>}
                </div>
                <p className="text-sm font-sans font-bold text-white leading-relaxed">
                  "{activeBubble.saraikiText}"
                </p>
                <p className="text-[10px] font-mono text-cyan-300/90 italic pt-1 border-t border-cyan-500/20 mt-1">
                  [Summary]: {activeBubble.englishSummary}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Real-Time Workstation Console & Directive Controls */}
          <div className="w-full md:w-1/2 flex flex-col gap-3 font-mono-tech">
            {/* Top Telemetry Bar */}
            <div className="p-3 rounded-xl bg-[#031525] border border-cyan-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-cyan-200">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="font-bold">{selectedAgent.telemetryChip}</span>
              </div>
              <button
                onClick={() => setActiveWorkModal(selectedAgent.id)}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/25 border border-emerald-400 text-emerald-300 font-bold hover:bg-emerald-500/40 cursor-pointer text-xs shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>OPEN FULL WORK MODULE</span>
              </button>
            </div>

            {/* Live Terminal & Logs */}
            <div className="flex-1 min-h-[180px] p-3 rounded-xl bg-[#010810] border border-cyan-500/40 flex flex-col overflow-hidden shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/30 text-[11px] text-cyan-300">
                <span className="flex items-center gap-1.5 font-bold">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedAgent.name.toUpperCase()} // LIVE SYSTEM LOGS</span>
                </span>
                <span className="text-emerald-400">● 0 PACKET LOSS</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 text-xs text-cyan-200/90 font-mono">
                {selectedAgent.terminalLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span className="text-cyan-500">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
                {isExecutingTask && (
                  <div className="flex items-center gap-2 text-emerald-300 font-bold animate-pulse pt-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Processing directive through Stonic AI Neural Mesh...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Directive Dispatcher Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteAgentTask();
              }}
              className="p-3 rounded-xl bg-[#031525] border border-cyan-500/30 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between text-[11px] text-cyan-300">
                <span className="font-bold">ASSIGN DIRECTIVE TO {selectedAgent.name.toUpperCase()}</span>
                <span className="text-[10px] text-slate-400">Type in Urdu or English</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder={`e.g. "Run port 8080 security check", "Compile satellite dossier"...`}
                  disabled={isExecutingTask}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#010a14] border border-cyan-500/40 text-cyan-100 text-xs focus:outline-none focus:border-cyan-300"
                />
                <button
                  type="submit"
                  disabled={isExecutingTask || !taskInput.trim()}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 cursor-pointer disabled:opacity-40 text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>DISPATCH</span>
                </button>
              </div>
            </form>

            {/* Action Buttons for this Agent */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  triggerAgentSpeech(
                    selectedAgent.id,
                    `Ji Sir, maen apna live kam check kar reha aan, system full safe te operational hey!`,
                    `Checking live telemetry. All parameters operational.`
                  );
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 hover:bg-cyan-500/30 font-bold cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-cyan-300" />
                <span>TALK (LIP-SYNC URDU)</span>
              </button>

              <button
                onClick={() => {
                  const disc = SARAIKI_URDU_DISCUSSIONS[Math.floor(Math.random() * SARAIKI_URDU_DISCUSSIONS.length)];
                  startDiscussionSequence(disc.dialogue);
                }}
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 hover:bg-emerald-500/30 font-bold cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>TEAM DISCUSSION</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BOTTOM BAR (WITH REAL WALKING & CHAIR CONTROLS) ================= */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-[#031320]/95 border-t border-cyan-500/25 shrink-0 z-30 gap-2">
        {/* Left Side: Agents Focus Buttons */}
        <div className="flex items-center gap-1 bg-[#020e18] border border-cyan-500/30 rounded-lg p-0.5 text-xs font-mono-tech">
          <button
            onClick={() => {
              setViewMode('overview');
              setViewPerspective('frontal');
              setActiveNotification('Command Center Overview Active');
            }}
            className={`px-3 py-1 rounded transition-all cursor-pointer font-bold uppercase ${
              viewMode === 'overview'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_#00f0ff]'
                : 'text-cyan-400 hover:text-cyan-200'
            }`}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => {
              setSelectedAgentId('alice');
              setViewMode('agent_focus');
              triggerAgentSpeech(
                'alice',
                'Salam Sir, Alice hazir hey! Sector-9 satellite dossier ready hey.',
                'Agent Alice ready. Monitoring Sector-9 satellite reconnaissance.'
              );
            }}
            className={`px-2.5 py-1 rounded cursor-pointer font-bold ${
              viewMode === 'agent_focus' && selectedAgentId === 'alice'
                ? 'bg-pink-500 text-slate-950 shadow-[0_0_10px_#f472b6]'
                : 'text-pink-300 hover:text-white'
            }`}
          >
            ALICE
          </button>
          <button
            onClick={() => {
              setSelectedAgentId('bob');
              setViewMode('agent_focus');
              triggerAgentSpeech(
                'bob',
                'Salam Sir, Bob hazir hey! Firewall ports scan ho chukay han.',
                'Agent Bob ready. Perimeter firewall ports audited and secured.'
              );
            }}
            className={`px-2.5 py-1 rounded cursor-pointer font-bold ${
              viewMode === 'agent_focus' && selectedAgentId === 'bob'
                ? 'bg-sky-500 text-slate-950 shadow-[0_0_10px_#38bdf8]'
                : 'text-sky-300 hover:text-white'
            }`}
          >
            BOB
          </button>
          <button
            onClick={() => {
              setSelectedAgentId('carol');
              setViewMode('agent_focus');
              triggerAgentSpeech(
                'carol',
                'Salam Sir, Carol hazir hey! Kafka data pipelines ingest kar rahay han.',
                'Agent Carol ready. Kafka streaming pipelines processing 1.42M events/sec.'
              );
            }}
            className={`px-2.5 py-1 rounded cursor-pointer font-bold ${
              viewMode === 'agent_focus' && selectedAgentId === 'carol'
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_#10b981]'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            CAROL
          </button>
          <button
            onClick={() => {
              setSelectedAgentId('dave');
              setViewMode('agent_focus');
              triggerAgentSpeech(
                'dave',
                'Salam Sir, Dave hazir hey! Kubernetes pods te cloud orchestrator green han.',
                'Agent Dave ready. All 16 Kubernetes cloud pods reporting healthy.'
              );
            }}
            className={`px-2.5 py-1 rounded cursor-pointer font-bold ${
              viewMode === 'agent_focus' && selectedAgentId === 'dave'
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_#fbbf24]'
                : 'text-amber-300 hover:text-white'
            }`}
          >
            DAVE
          </button>
          <button
            onClick={() => {
              setViewMode('overview');
              // Trigger all 4 agents walking to central meeting table
              walkAgentTo('alice', { left: '42%', top: '50%' }, 'All-hands emergency meeting engaged!', 'Assembling at meeting table.', 'Team');
              walkAgentTo('bob', { left: '48%', top: '44%' }, 'Firewall logs table te share kar dittey!', 'Bringing firewall logs to table.', 'Alice');
              walkAgentTo('carol', { left: '60%', top: '44%' }, 'Kafka throughput charts ready han!', 'Kafka throughput reports ready.', 'Dave');
              walkAgentTo('dave', { left: '66%', top: '50%' }, 'K8s pods 100% green han meeting wastey!', 'Cloud cluster ready for sync.', 'Team');
              setActiveNotification('All 4 Agents walking to central glass conference table.');
            }}
            className="px-2.5 py-1 rounded text-amber-300 hover:text-amber-100 cursor-pointer font-bold"
          >
            MEETING
          </button>
        </div>

        {/* Right Side: Quick Action Buttons (CAROL WATER, BOB WALKS, DAVE CLOUD, ALICE INTEL) */}
        <div className="flex items-center gap-1.5 text-xs font-mono-tech">
          {/* Carol Walks to Water Cooler */}
          <button
            onClick={() => {
              setViewMode('overview');
              walkAgentTo(
                'carol',
                { left: '14%', top: '68%' },
                'Water cooler te hydration break chal rahi hey, team hydration zaroori hey!',
                'Taking a hydration break at the water cooler. Hydration is essential!',
                'Water Cooler'
              );
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#02182b] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 cursor-pointer"
            title="Carol gets up from computer chair and walks to water cooler"
          >
            <Coffee className="w-3.5 h-3.5 text-emerald-400" />
            <span>CAROL WATER</span>
          </button>

          {/* Bob Walks to Alice's Desk */}
          <button
            onClick={() => {
              setViewMode('overview');
              walkAgentTo(
                'bob',
                { left: '26%', top: '58%' },
                'Alice Baji! Satellite link da firewall status check kar lo, bilkul zero anomalies han!',
                'Alice, firewall status on the satellite uplink is 100% clean and secured!',
                'Alice'
              );
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#02182b] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 cursor-pointer"
            title="Bob stands up and walks to Alice's desk"
          >
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>BOB WALKS TO ALICE</span>
          </button>

          {/* Dave Walks to Carol's Desk */}
          <button
            onClick={() => {
              setViewMode('overview');
              walkAgentTo(
                'dave',
                { left: '68%', top: '52%' },
                'Carol behan, tuhaday Kafka pods wastey 2 naway Kubernetes worker nodes spin kar dittey han!',
                'Carol, provisioned 2 additional Kubernetes worker nodes for your Kafka stream!',
                'Carol'
              );
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#02182b] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 cursor-pointer"
            title="Dave walks to Carol's desk"
          >
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span>DAVE WALKS TO CAROL</span>
          </button>

          {/* Alice Reviews Satellite Intel */}
          <button
            onClick={() => {
              setSelectedAgentId('alice');
              triggerAgentSpeech(
                'alice',
                'Sector-9 global satellite telemetry compile ho chuki hey!',
                'Sector-9 satellite telemetry compiled and secured.'
              );
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-pink-950/70 border border-pink-400/50 text-pink-200 hover:bg-pink-900/60 font-bold cursor-pointer"
            title="Alice reviews global satellite telemetry"
          >
            <FileText className="w-3.5 h-3.5 text-pink-300" />
            <span>ALICE INTEL</span>
          </button>

          {/* Trigger Immediate Discussion Button */}
          <button
            onClick={() => {
              const disc = SARAIKI_URDU_DISCUSSIONS[Math.floor(Math.random() * SARAIKI_URDU_DISCUSSIONS.length)];
              startDiscussionSequence(disc.dialogue);
            }}
            className="flex items-center gap-1 px-3.5 py-1 rounded bg-emerald-500/25 border border-emerald-400 text-emerald-200 hover:bg-emerald-500/40 font-bold cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            title="Trigger Instant Colleague Discussion with Moving Lips"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>DISCUSS NOW</span>
          </button>
        </div>
      </div>

      {/* ================= INTER-AGENT LIVE DISCUSSION LOG DRAWER ================= */}
      {isChatFeedOpen && (
        <div className="absolute right-2 top-12 bottom-12 w-84 max-w-[92vw] z-40 bg-[#020f1b]/98 border border-pink-400/70 rounded-xl flex flex-col overflow-hidden shadow-[0_0_35px_rgba(236,72,153,0.25)] font-mono-tech backdrop-blur-md">
          <div className="flex items-center justify-between px-3 py-2 bg-[#031c2e] border-b border-pink-500/30">
            <div className="flex items-center gap-2 text-xs text-pink-200 font-bold">
              <MessageSquare className="w-4 h-4 text-pink-400" />
              <span>INTER-AGENT COMMS (سیرائیکی / اردو)</span>
            </div>
            <button
              onClick={() => setIsChatFeedOpen(false)}
              className="text-pink-300 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-3 py-1.5 bg-[#021524] border-b border-pink-500/20 flex items-center justify-between text-[11px]">
            <span className="text-pink-300/80">TOPICS:</span>
            <div className="flex items-center gap-1">
              {SARAIKI_URDU_DISCUSSIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => startDiscussionSequence(item.dialogue)}
                  className="px-2 py-0.5 rounded bg-pink-500/20 hover:bg-pink-500/40 text-pink-100 text-[10px] cursor-pointer"
                >
                  Topic {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {conversationHistory.map((msg) => (
              <div
                key={msg.id}
                className="p-2.5 rounded-lg bg-[#041a2c]/80 border border-cyan-500/20 space-y-1"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full overflow-hidden border border-cyan-400">
                      <img
                        src={AGENT_AVATARS[msg.speakerId]}
                        alt={msg.speakerName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-bold text-white">{msg.speakerName}</span>
                  </div>
                  <span className="text-slate-400 text-[9px]">{msg.timestamp}</span>
                </div>
                <p className="font-sans text-cyan-100 font-bold text-xs leading-relaxed">
                  "{msg.saraikiText}"
                </p>
                <p className="text-[10px] text-cyan-400/80 italic">[{msg.englishSummary}]</p>
              </div>
            ))}
          </div>

          <div className="p-2 bg-[#021422] border-t border-pink-500/30 flex items-center justify-between text-[11px]">
            <span className="text-cyan-300">Autonomous Banter</span>
            <button
              onClick={() => setAutonomousChat(!autonomousChat)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                autonomousChat
                  ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {autonomousChat ? 'ENABLED' : 'PAUSED'}
            </button>
          </div>
        </div>
      )}

      {/* ================= INTERACTIVE WORKSTATION TERMINAL ================= */}
      {isTerminalOpen && (
        <div className="absolute inset-x-2 bottom-12 max-h-[50%] z-40 bg-[#030d17]/98 border border-cyan-400/80 rounded-xl flex flex-col overflow-hidden shadow-[0_0_35px_rgba(0,240,255,0.3)] font-mono-tech">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#021524] border-b border-cyan-500/30">
            <div className="flex items-center gap-2 text-xs text-cyan-200 font-bold">
              <div className="w-4 h-4 rounded-full overflow-hidden border border-cyan-400">
                <img
                  src={AGENT_AVATARS[selectedAgentId]}
                  alt={selectedAgent.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span>{selectedAgent.name.toUpperCase()} // LIVE WORKSTATION TERMINAL</span>
              <span className="text-[10px] text-emerald-400 ml-2">● ONLINE</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveWorkModal(selectedAgentId)}
                className="px-2.5 py-0.5 rounded bg-emerald-500/25 border border-emerald-400 text-emerald-300 text-[10px] font-bold cursor-pointer hover:bg-emerald-500/40"
              >
                OPEN REAL WORK MODULE
              </button>
              <button
                onClick={() => setIsTerminalOpen(false)}
                className="text-cyan-400 hover:text-cyan-200 p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-1 text-xs leading-relaxed bg-[#020b12]">
            {selectedAgent.terminalLogs.map((log, i) => (
              <div key={i} className="text-cyan-200/90 font-mono">
                {log.startsWith('[') ? (
                  <span className="text-cyan-400 font-bold">{log.slice(0, log.indexOf(']') + 1)}</span>
                ) : null}
                <span className="ml-1">{log.startsWith('[') ? log.slice(log.indexOf(']') + 1) : log}</span>
              </div>
            ))}
            {isExecutingTask && (
              <div className="flex items-center gap-2 text-cyan-300 font-bold animate-pulse pt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Executing directive via Stonic Neural Engine...</span>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteAgentTask();
            }}
            className="flex items-center gap-2 p-2 bg-[#021524] border-t border-cyan-500/30"
          >
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder={`Assign directive to ${selectedAgent.name} (e.g. "Scan port 443", "Compile satellite dossier")...`}
              disabled={isExecutingTask}
              className="flex-1 px-3 py-1.5 rounded bg-[#010810] border border-cyan-500/40 text-cyan-100 text-xs focus:outline-none focus:border-cyan-300"
            />
            <button
              type="submit"
              disabled={isExecutingTask || !taskInput.trim()}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-cyan-500/30 border border-cyan-400 text-cyan-100 text-xs font-bold hover:bg-cyan-500/50 cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>DISPATCH</span>
            </button>
          </form>
        </div>
      )}

      {/* ================= REAL WORKING TASK MODAL FOR ALICE, BOB, CAROL, DAVE ================= */}
      <AgentRealWorkModal
        agentId={activeWorkModal}
        onClose={() => setActiveWorkModal(null)}
        onSendFeedback={(msg) => setActiveNotification(msg)}
      />
    </div>
  );
};
