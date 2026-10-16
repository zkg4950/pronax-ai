import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
  Coffee,
  Shield,
  FileText,
  Database,
  Cloud,
  Users,
  CheckCircle2,
  Sparkles,
  Terminal,
  Activity,
  Send,
  Loader2,
  X,
  Volume2,
} from 'lucide-react';
import { AgentInfo } from '../types';

interface AgentTown3DProps {
  onSelectAgent?: (agent: AgentInfo) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  externalTaskTrigger?: { agentId: string; task: string } | null;
}

export interface RealisticAgent {
  id: string;
  name: string;
  title: string;
  gender: 'female' | 'male';
  avatarColor: string;
  shirtColor: string;
  pantsColor: string;
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  lipColor: string;
  currentTask: string;
  taskTag: string;
  taskProgress: number; // 0 to 100
  state: 'sitting' | 'walking' | 'standing_work' | 'meeting' | 'break';
  pos: THREE.Vector3;
  targetPos: THREE.Vector3;
  deskPos: THREE.Vector3;
  chairPos: THREE.Vector3;
  rotationY: number;
  walkCycle: number;
  heldItem?: 'cup' | 'glass' | 'tablet' | 'folder';
  terminalLogs: string[];
}

// Procedural Photorealistic Human Facial Texture
function createFaceTexture(
  gender: 'female' | 'male',
  skinColor: string,
  eyeColor: string,
  lipColor: string,
  hairColor: string
) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Smooth base skin
  ctx.fillStyle = skinColor;
  ctx.fillRect(0, 0, 512, 512);

  // Soft cheek flush
  const cheek1 = ctx.createRadialGradient(140, 290, 10, 140, 290, 80);
  cheek1.addColorStop(0, 'rgba(239, 68, 68, 0.16)');
  cheek1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = cheek1;
  ctx.fillRect(0, 200, 256, 180);

  const cheek2 = ctx.createRadialGradient(372, 290, 10, 372, 290, 80);
  cheek2.addColorStop(0, 'rgba(239, 68, 68, 0.16)');
  cheek2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = cheek2;
  ctx.fillRect(256, 200, 256, 180);

  // Realistic Eyes
  const drawEye = (x: number, y: number) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x, y, 32, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 4, y - 4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(x, y - 2, 34, 20, 0, Math.PI, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = hairColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x - 36, y - 32);
    ctx.quadraticCurveTo(x, y - 44, x + 36, y - 32);
    ctx.stroke();
  };

  drawEye(170, 230);
  drawEye(342, 230);

  // Nose bridge
  ctx.strokeStyle = 'rgba(120, 53, 15, 0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(256, 230);
  ctx.lineTo(250, 300);
  ctx.lineTo(262, 300);
  ctx.stroke();

  // Natural Lips
  ctx.fillStyle = lipColor;
  ctx.beginPath();
  ctx.ellipse(256, 370, 36, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Overhead 3D Action Tag Billboard Sprite
function createActionTagSprite(initialText: string, borderColor = '#00f0ff') {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 70;
  const ctx = canvas.getContext('2d')!;

  const updateText = (text: string, border = borderColor) => {
    ctx.clearRect(0, 0, 300, 70);

    // Pill background with cyan neon glow
    ctx.fillStyle = 'rgba(2, 11, 20, 0.95)';
    ctx.strokeStyle = border;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(6, 6, 288, 58, 14);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 150, 35);
  };

  updateText(initialText, borderColor);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(2.4, 0.55, 1);
  sprite.renderOrder = 999;

  return { sprite, updateText, texture };
}

export const AgentTown3D: React.FC<AgentTown3DProps> = ({
  onSelectAgent,
  isExpanded = false,
  onToggleExpand,
  externalTaskTrigger,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('alice');
  const [cameraPreset, setCameraPreset] = useState<'overview' | 'alice' | 'bob' | 'carol' | 'dave' | 'meeting' | 'breakroom'>('overview');
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [taskInput, setTaskInput] = useState<string>('');
  const [isExecutingTask, setIsExecutingTask] = useState<boolean>(false);

  // Corporate Office Waypoints
  const WAYPOINTS = {
    aliceDesk: new THREE.Vector3(-4.2, 0, -2.0),
    bobDesk: new THREE.Vector3(1.5, 0, -2.0),
    carolDesk: new THREE.Vector3(-4.2, 0, 3.2),
    daveDesk: new THREE.Vector3(1.5, 0, 3.2),
    coffeeStation: new THREE.Vector3(6.5, 0, -4.5),
    waterDispenser: new THREE.Vector3(6.5, 0, -1.8),
    serverBay: new THREE.Vector3(6.5, 0, 3.8),
    whiteboard: new THREE.Vector3(-7.0, 0, 0.5),
    conferenceTable: new THREE.Vector3(-1.2, 0, 0.5),
  };

  // 4 Photorealistic Human Agents with Real Operational Telemetry
  const [agents, setAgents] = useState<{ [key: string]: RealisticAgent }>({
    alice: {
      id: 'alice',
      name: 'Alice',
      title: 'Lead Intelligence Analyst',
      gender: 'female',
      avatarColor: '#f472b6',
      shirtColor: '#0369a1', // Tailored Navy Blazer
      pantsColor: '#0f172a',
      hairColor: '#18181b', // Sleek dark hair
      skinColor: '#fed7aa',
      eyeColor: '#0284c7', // Bright blue
      lipColor: '#f43f5e',
      currentTask: 'Drafting US-China Summit Military Telemetry',
      taskTag: 'Drafting Intel',
      taskProgress: 84,
      state: 'sitting',
      pos: new THREE.Vector3(-4.2, 0, -1.3),
      targetPos: new THREE.Vector3(-4.2, 0, -1.3),
      deskPos: new THREE.Vector3(-4.2, 0, -2.0),
      chairPos: new THREE.Vector3(-4.2, 0, -1.3),
      rotationY: 0,
      walkCycle: 0,
      heldItem: 'folder',
      terminalLogs: [
        '[ALICE-CORE] Satellite orbital link locked on Sector 9',
        '[ALICE-CORE] Ingesting 14 global diplomatic feeds',
        '[ALICE-CORE] Threat assessment score: 4.2 / Normal Readiness',
      ],
    },
    bob: {
      id: 'bob',
      name: 'Bob',
      title: 'Senior Cyber Security Engineer',
      gender: 'male',
      avatarColor: '#38bdf8',
      shirtColor: '#1e293b', // Modern Charcoal Blazer
      pantsColor: '#090d16',
      hairColor: '#451a03', // Auburn brown
      skinColor: '#fcd34d',
      eyeColor: '#15803d', // Green eyes
      lipColor: '#be123c',
      currentTask: 'Perimeter Intrusion Detection & Firewall Audit',
      taskTag: 'Firewall Audit',
      taskProgress: 92,
      state: 'sitting',
      pos: new THREE.Vector3(1.5, 0, -1.3),
      targetPos: new THREE.Vector3(1.5, 0, -1.3),
      deskPos: new THREE.Vector3(1.5, 0, -2.0),
      chairPos: new THREE.Vector3(1.5, 0, -1.3),
      rotationY: 0,
      walkCycle: 0,
      heldItem: 'cup',
      terminalLogs: [
        '[BOB-SEC] Scanning external subnet 192.168.1.0/24',
        '[BOB-SEC] Port 443 TLS 1.3 strict transport active',
        '[BOB-SEC] Snort IDS active; 0 unauthorized intrusion attempts',
      ],
    },
    carol: {
      id: 'carol',
      name: 'Carol',
      title: 'Data Pipeline Specialist',
      gender: 'female',
      avatarColor: '#34d399',
      shirtColor: '#047857', // Emerald Green Blazer
      pantsColor: '#1e1e24',
      hairColor: '#d97706', // Natural Auburn
      skinColor: '#fed7aa',
      eyeColor: '#9333ea', // Hazel Violet
      lipColor: '#e11d48',
      currentTask: 'Ingesting Real-time Satellite Telemetry Streams',
      taskTag: 'Data Pipelines',
      taskProgress: 76,
      state: 'sitting',
      pos: new THREE.Vector3(-4.2, 0, 2.5),
      targetPos: new THREE.Vector3(-4.2, 0, 2.5),
      deskPos: new THREE.Vector3(-4.2, 0, 3.2),
      chairPos: new THREE.Vector3(-4.2, 0, 2.5),
      rotationY: Math.PI,
      walkCycle: 0,
      heldItem: 'glass',
      terminalLogs: [
        '[CAROL-ETL] Kafka topic telemetry.sensor_stream healthy',
        '[CAROL-ETL] Ingestion rate: 1.42M events/sec (latency 8.4ms)',
        '[CAROL-ETL] ClickHouse partitions synchronized',
      ],
    },
    dave: {
      id: 'dave',
      name: 'Dave',
      title: 'Cloud DevOps Architect',
      gender: 'male',
      avatarColor: '#fbbf24',
      shirtColor: '#b45309', // Warm Amber Knit Sweater & Slacks
      pantsColor: '#1e293b',
      hairColor: '#1f2937', // Jet black
      skinColor: '#fde047',
      eyeColor: '#0284c7', // Steel blue
      lipColor: '#b91c1c',
      currentTask: 'Auditing High-Density Server Racks',
      taskTag: 'Server Audit',
      taskProgress: 68,
      state: 'sitting',
      pos: new THREE.Vector3(1.5, 0, 2.5),
      targetPos: new THREE.Vector3(1.5, 0, 2.5),
      deskPos: new THREE.Vector3(1.5, 0, 3.2),
      chairPos: new THREE.Vector3(1.5, 0, 2.5),
      rotationY: Math.PI,
      walkCycle: 0,
      heldItem: 'tablet',
      terminalLogs: [
        '[DAVE-OPS] Kubernetes cluster stonic-prod-us nodes: READY',
        '[DAVE-OPS] Envoy proxy sidecars running across 16 pods',
        '[DAVE-OPS] Cluster autoscaler configured; 0 memory pressure',
      ],
    },
  });

  const agentsRef = useRef(agents);
  agentsRef.current = agents;

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const characterGroupsRef = useRef<{ [key: string]: THREE.Group }>({});
  const boneRigRef = useRef<{ [key: string]: any }>({});
  const actionTagSpritesRef = useRef<{ [key: string]: { sprite: THREE.Sprite; updateText: (t: string, b?: string) => void; texture: THREE.Texture } }>({});
  const targetCamPos = useRef(new THREE.Vector3(0, 9.5, 13));
  const targetLookAt = useRef(new THREE.Vector3(-0.5, 1.2, 0.5));

  // Voice narration helper using Web Speech API
  const speakText = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      // SpeechSynthesis may be suppressed in some browser policies
    }
  };

  // Change camera perspective smoothly
  const focusCameraOn = (preset: typeof cameraPreset) => {
    setCameraPreset(preset);
    if (preset === 'overview') {
      targetCamPos.current.set(0, 9.5, 13);
      targetLookAt.current.set(-0.5, 1.2, 0.5);
    } else if (preset === 'alice') {
      targetCamPos.current.set(-4.2, 3.2, 2.0);
      targetLookAt.current.set(-4.2, 1.8, -1.8);
      setSelectedAgentId('alice');
    } else if (preset === 'bob') {
      targetCamPos.current.set(1.5, 3.2, 2.0);
      targetLookAt.current.set(1.5, 1.8, -1.8);
      setSelectedAgentId('bob');
    } else if (preset === 'carol') {
      targetCamPos.current.set(-4.2, 3.2, -0.2);
      targetLookAt.current.set(-4.2, 1.8, 3.2);
      setSelectedAgentId('carol');
    } else if (preset === 'dave') {
      targetCamPos.current.set(1.5, 3.2, -0.2);
      targetLookAt.current.set(1.5, 1.8, 3.2);
      setSelectedAgentId('dave');
    } else if (preset === 'meeting') {
      targetCamPos.current.set(-1.2, 4.5, 4.8);
      targetLookAt.current.set(-1.2, 1.4, 0.5);
    } else if (preset === 'breakroom') {
      targetCamPos.current.set(6.5, 3.5, 1.5);
      targetLookAt.current.set(6.5, 1.5, -3.0);
    }
  };

  // PHYSICAL BEHAVIOR 1: Carol walks to water dispenser, fills cup, and drinks
  const triggerCarolWater = () => {
    setAgents((prev) => {
      const carol = { ...prev.carol };
      carol.state = 'walking';
      carol.targetPos = WAYPOINTS.waterDispenser.clone();
      carol.taskTag = 'Getting Water';
      carol.currentTask = 'Walking to water cooler for hydration';
      carol.heldItem = 'glass';
      carol.terminalLogs = [
        ...carol.terminalLogs,
        `[${new Date().toLocaleTimeString()}] Halting stream ingestion for scheduled hydration break`,
      ];
      if (actionTagSpritesRef.current['carol']) {
        actionTagSpritesRef.current['carol'].updateText('Getting Water', '#00f0ff');
        actionTagSpritesRef.current['carol'].texture.needsUpdate = true;
      }
      return { ...prev, carol };
    });

    setActiveNotification('Carol is walking to the water dispenser to rehydrate.');
    speakText('Agent Carol is heading to the water dispenser for hydration.');
    setTimeout(() => {
      setAgents((prev) => {
        const carol = { ...prev.carol };
        carol.state = 'standing_work';
        carol.taskTag = 'Hydrating';
        carol.currentTask = 'Filling cup & reviewing data buffers';
        carol.terminalLogs = [
          ...carol.terminalLogs,
          `[${new Date().toLocaleTimeString()}] Water level optimal. Buffer health: 100%`,
        ];
        if (actionTagSpritesRef.current['carol']) {
          actionTagSpritesRef.current['carol'].updateText('Hydrating', '#38bdf8');
          actionTagSpritesRef.current['carol'].texture.needsUpdate = true;
        }
        return { ...prev, carol };
      });
      speakText('Carol has refilled her glass at the water cooler.');
    }, 4500);

    // Return to desk after 10s
    setTimeout(() => {
      setAgents((prev) => {
        const carol = { ...prev.carol };
        carol.state = 'walking';
        carol.targetPos = carol.chairPos.clone();
        carol.taskTag = 'Returning';
        if (actionTagSpritesRef.current['carol']) {
          actionTagSpritesRef.current['carol'].updateText('Returning', '#34d399');
          actionTagSpritesRef.current['carol'].texture.needsUpdate = true;
        }
        return { ...prev, carol };
      });
      setTimeout(() => {
        setAgents((prev) => {
          const carol = { ...prev.carol };
          carol.state = 'sitting';
          carol.taskTag = 'Data Pipelines';
          carol.currentTask = 'Ingesting Real-time Satellite Telemetry Streams';
          if (actionTagSpritesRef.current['carol']) {
            actionTagSpritesRef.current['carol'].updateText('Data Pipelines', '#10b981');
            actionTagSpritesRef.current['carol'].texture.needsUpdate = true;
          }
          return { ...prev, carol };
        });
      }, 4500);
    }, 9500);
  };

  // PHYSICAL BEHAVIOR 2: Bob audits firewall at server bay & gets coffee
  const triggerBobFirewall = () => {
    setAgents((prev) => {
      const bob = { ...prev.bob };
      bob.state = 'walking';
      bob.targetPos = WAYPOINTS.serverBay.clone();
      bob.taskTag = 'Auditing Servers';
      bob.currentTask = 'Inspecting server bay firewall racks';
      bob.heldItem = 'tablet';
      bob.terminalLogs = [
        ...bob.terminalLogs,
        `[${new Date().toLocaleTimeString()}] Walking to hardware cluster for port scan`,
      ];
      if (actionTagSpritesRef.current['bob']) {
        actionTagSpritesRef.current['bob'].updateText('Auditing Servers', '#38bdf8');
        actionTagSpritesRef.current['bob'].texture.needsUpdate = true;
      }
      return { ...prev, bob };
    });

    setActiveNotification('Bob is walking to the server rack to audit firewalls.');
    speakText('Agent Bob is walking to the server bay for security audit.');
    setTimeout(() => {
      setAgents((prev) => {
        const bob = { ...prev.bob };
        bob.state = 'standing_work';
        bob.taskTag = 'Hardening Ports';
        bob.currentTask = 'Injecting iptables rate-limits at cluster switch';
        bob.terminalLogs = [
          ...bob.terminalLogs,
          `[${new Date().toLocaleTimeString()}] Applied zero-trust policy on port 8080`,
        ];
        if (actionTagSpritesRef.current['bob']) {
          actionTagSpritesRef.current['bob'].updateText('Hardening Ports', '#10b981');
          actionTagSpritesRef.current['bob'].texture.needsUpdate = true;
        }
        return { ...prev, bob };
      });
      speakText('Bob has hardened network perimeter at the server cluster.');
    }, 4500);

    setTimeout(() => {
      setAgents((prev) => {
        const bob = { ...prev.bob };
        bob.state = 'walking';
        bob.targetPos = bob.chairPos.clone();
        bob.taskTag = 'Returning';
        if (actionTagSpritesRef.current['bob']) {
          actionTagSpritesRef.current['bob'].updateText('Returning', '#38bdf8');
          actionTagSpritesRef.current['bob'].texture.needsUpdate = true;
        }
        return { ...prev, bob };
      });
      setTimeout(() => {
        setAgents((prev) => {
          const bob = { ...prev.bob };
          bob.state = 'sitting';
          bob.taskTag = 'Firewall Audit';
          bob.currentTask = 'Perimeter Intrusion Detection & Firewall Audit';
          if (actionTagSpritesRef.current['bob']) {
            actionTagSpritesRef.current['bob'].updateText('Firewall Audit', '#10b981');
            actionTagSpritesRef.current['bob'].texture.needsUpdate = true;
          }
          return { ...prev, bob };
        });
      }, 4500);
    }, 10000);
  };

  // PHYSICAL BEHAVIOR 3: Dave inspects servers with tactical tablet
  const triggerDaveServers = () => {
    setAgents((prev) => {
      const dave = { ...prev.dave };
      dave.state = 'walking';
      dave.targetPos = new THREE.Vector3(5.2, 0, 3.8);
      dave.taskTag = 'Cluster Diagnostic';
      dave.currentTask = 'Checking blade servers and container health';
      dave.heldItem = 'tablet';
      dave.terminalLogs = [
        ...dave.terminalLogs,
        `[${new Date().toLocaleTimeString()}] Diagnostics initiated across Kubernetes nodes`,
      ];
      if (actionTagSpritesRef.current['dave']) {
        actionTagSpritesRef.current['dave'].updateText('Cluster Diagnostic', '#fbbf24');
        actionTagSpritesRef.current['dave'].texture.needsUpdate = true;
      }
      return { ...prev, dave };
    });

    setActiveNotification('Dave is inspecting server blades with his diagnostic tablet.');
    speakText('Agent Dave has deployed to the server bay with his diagnostics tablet.');
    setTimeout(() => {
      setAgents((prev) => {
        const dave = { ...prev.dave };
        dave.state = 'standing_work';
        dave.taskTag = 'Nodes Green';
        dave.currentTask = 'All container pods reporting optimal latency';
        if (actionTagSpritesRef.current['dave']) {
          actionTagSpritesRef.current['dave'].updateText('Nodes Green', '#10b981');
          actionTagSpritesRef.current['dave'].texture.needsUpdate = true;
        }
        return { ...prev, dave };
      });
    }, 4500);

    setTimeout(() => {
      setAgents((prev) => {
        const dave = { ...prev.dave };
        dave.state = 'walking';
        dave.targetPos = dave.chairPos.clone();
        dave.taskTag = 'Returning';
        if (actionTagSpritesRef.current['dave']) {
          actionTagSpritesRef.current['dave'].updateText('Returning', '#fbbf24');
          actionTagSpritesRef.current['dave'].texture.needsUpdate = true;
        }
        return { ...prev, dave };
      });
      setTimeout(() => {
        setAgents((prev) => {
          const dave = { ...prev.dave };
          dave.state = 'sitting';
          dave.taskTag = 'Server Audit';
          dave.currentTask = 'Auditing High-Density Server Racks';
          if (actionTagSpritesRef.current['dave']) {
            actionTagSpritesRef.current['dave'].updateText('Server Audit', '#10b981');
            actionTagSpritesRef.current['dave'].texture.needsUpdate = true;
          }
          return { ...prev, dave };
        });
      }, 4500);
    }, 10000);
  };

  // PHYSICAL BEHAVIOR 4: Alice reviews intelligence at central holographic table
  const triggerAliceBriefing = () => {
    setAgents((prev) => {
      const alice = { ...prev.alice };
      alice.state = 'walking';
      alice.targetPos = new THREE.Vector3(-1.2, 0, -1.0);
      alice.taskTag = 'Holo Briefing';
      alice.currentTask = 'Reviewing holographic globe dossier';
      alice.heldItem = 'folder';
      alice.terminalLogs = [
        ...alice.terminalLogs,
        `[${new Date().toLocaleTimeString()}] Convening at holographic table to analyze geopolitical coordinates`,
      ];
      if (actionTagSpritesRef.current['alice']) {
        actionTagSpritesRef.current['alice'].updateText('Holo Briefing', '#f472b6');
        actionTagSpritesRef.current['alice'].texture.needsUpdate = true;
      }
      return { ...prev, alice };
    });

    setActiveNotification('Alice is reviewing global intelligence at the central holographic table.');
    speakText('Agent Alice is reviewing tactical intelligence at the holographic display.');
    setTimeout(() => {
      setAgents((prev) => {
        const alice = { ...prev.alice };
        alice.state = 'standing_work';
        alice.taskTag = 'Intel Ready';
        alice.currentTask = 'Strategic dossier updated with latest satellite reconnaissance';
        if (actionTagSpritesRef.current['alice']) {
          actionTagSpritesRef.current['alice'].updateText('Intel Ready', '#10b981');
          actionTagSpritesRef.current['alice'].texture.needsUpdate = true;
        }
        return { ...prev, alice };
      });
    }, 4500);

    setTimeout(() => {
      setAgents((prev) => {
        const alice = { ...prev.alice };
        alice.state = 'walking';
        alice.targetPos = alice.chairPos.clone();
        alice.taskTag = 'Returning';
        if (actionTagSpritesRef.current['alice']) {
          actionTagSpritesRef.current['alice'].updateText('Returning', '#f472b6');
          actionTagSpritesRef.current['alice'].texture.needsUpdate = true;
        }
        return { ...prev, alice };
      });
      setTimeout(() => {
        setAgents((prev) => {
          const alice = { ...prev.alice };
          alice.state = 'sitting';
          alice.taskTag = 'Drafting Intel';
          alice.currentTask = 'Drafting US-China Summit Military Telemetry';
          if (actionTagSpritesRef.current['alice']) {
            actionTagSpritesRef.current['alice'].updateText('Drafting Intel', '#10b981');
            actionTagSpritesRef.current['alice'].texture.needsUpdate = true;
          }
          return { ...prev, alice };
        });
      }, 4500);
    }, 10000);
  };

  // PHYSICAL BEHAVIOR 5: All-Hands Conference Meeting (All 4 agents convene at central glass table)
  const callAllHandsMeeting = () => {
    const tableSeats = {
      alice: new THREE.Vector3(-2.8, 0, 0.5),
      bob: new THREE.Vector3(0.4, 0, 0.5),
      carol: new THREE.Vector3(-1.2, 0, 1.8),
      dave: new THREE.Vector3(-1.2, 0, -0.8),
    };

    setAgents((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = {
          ...updated[id],
          state: 'walking',
          targetPos: tableSeats[id as keyof typeof tableSeats].clone(),
          taskTag: 'In Meeting',
          currentTask: 'All-Hands Emergency Strategy Briefing at Conference Table',
          taskProgress: 10,
          terminalLogs: [
            ...updated[id].terminalLogs,
            `[${new Date().toLocaleTimeString()}] Convening at executive table for All-Hands Briefing`,
          ],
        };
        if (actionTagSpritesRef.current[id]) {
          actionTagSpritesRef.current[id].updateText('In Meeting', '#f59e0b');
          actionTagSpritesRef.current[id].texture.needsUpdate = true;
        }
      });
      return updated;
    });

    setActiveNotification('ALL-HANDS MEETING: Alice, Bob, Carol, and Dave are convening at the glass conference table.');
    speakText('All-Hands Meeting engaged, Sir. Alice, Bob, Carol, and Dave are convening at the executive conference table.');
    setCameraPreset('meeting');
    targetCamPos.current.set(-1.2, 4.2, 4.5);
    targetLookAt.current.set(-1.2, 1.4, 0.5);

    setTimeout(() => {
      setAgents((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((id) => {
          updated[id] = {
            ...updated[id],
            state: 'meeting',
            taskTag: 'Briefing Live',
            taskProgress: 45,
          };
          if (actionTagSpritesRef.current[id]) {
            actionTagSpritesRef.current[id].updateText('Briefing Live', '#10b981');
            actionTagSpritesRef.current[id].texture.needsUpdate = true;
          }
        });
        return updated;
      });
      speakText('All agents are assembled. Mission agenda synchronized.');
    }, 4500);
  };

  // Return all agents back to their executive workstations
  const returnAllToDesks = () => {
    setAgents((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = {
          ...updated[id],
          state: 'walking',
          targetPos: updated[id].chairPos.clone(),
          taskTag: 'Returning',
        };
        if (actionTagSpritesRef.current[id]) {
          actionTagSpritesRef.current[id].updateText('Returning', '#38bdf8');
          actionTagSpritesRef.current[id].texture.needsUpdate = true;
        }
      });
      return updated;
    });

    setTimeout(() => {
      setAgents((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((id) => {
          updated[id] = {
            ...updated[id],
            state: 'sitting',
            taskTag: id === 'alice' ? 'Drafting Intel' : id === 'bob' ? 'Firewall Audit' : id === 'carol' ? 'Data Pipelines' : 'Server Audit',
            taskProgress: 88,
          };
          if (actionTagSpritesRef.current[id]) {
            actionTagSpritesRef.current[id].updateText(updated[id].taskTag, '#10b981');
            actionTagSpritesRef.current[id].texture.needsUpdate = true;
          }
        });
        return updated;
      });
    }, 4500);

    setActiveNotification('All agents returning to their executive workstations.');
    speakText('All agents returning to their executive workstations.');
    setCameraPreset('overview');
    targetCamPos.current.set(0, 9.5, 13);
    targetLookAt.current.set(-0.5, 1.2, 0.5);
  };

  // Direct Execution of Real Agent Task via Backend Gemini API
  const handleExecuteAgentTask = async (customInstruction?: string) => {
    const instruction = customInstruction || taskInput.trim();
    if (!instruction || isExecutingTask) return;

    setIsExecutingTask(true);
    const agent = agents[selectedAgentId];

    // Trigger physical movement based on agent
    if (selectedAgentId === 'bob') triggerBobFirewall();
    else if (selectedAgentId === 'carol') triggerCarolWater();
    else if (selectedAgentId === 'dave') triggerDaveServers();
    else triggerAliceBriefing();

    speakText(`Agent ${agent.name} received directive: ${instruction}. Executing now.`);

    try {
      const res = await fetch('/api/admin/agent-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          instruction,
          context: {
            currentTask: agent.currentTask,
            officeState: 'operational',
          },
        }),
      });

      const data = await res.json();
      if (data && data.output) {
        setAgents((prev) => {
          const target = { ...prev[selectedAgentId] };
          target.currentTask = instruction;
          target.taskTag = 'Task Complete';
          target.terminalLogs = [
            ...target.terminalLogs,
            `[${new Date().toLocaleTimeString()}] EXECUTED: ${instruction}`,
            ...data.output.split('\n').filter((l: string) => l.trim().length > 0).slice(0, 5),
          ];
          return { ...prev, [selectedAgentId]: target };
        });

        speakText(`Agent ${agent.name} has completed the task successfully.`);
      }
    } catch (err) {
      console.warn('Agent task error:', err);
    } finally {
      setIsExecutingTask(false);
      setTaskInput('');
    }
  };

  // External task trigger from chat or voice commands
  useEffect(() => {
    if (!externalTaskTrigger) return;
    const { agentId, task } = externalTaskTrigger;
    const lower = task.toLowerCase();

    if (agentId === 'all' || lower.includes('meeting') || lower.includes('sab') || lower.includes('conference')) {
      callAllHandsMeeting();
    } else if (agentId === 'carol' || lower.includes('water') || lower.includes('paani')) {
      triggerCarolWater();
    } else if (agentId === 'bob' || lower.includes('coffee') || lower.includes('firewall') || lower.includes('security')) {
      triggerBobFirewall();
    } else if (agentId === 'dave' || lower.includes('server') || lower.includes('cloud')) {
      triggerDaveServers();
    } else if (agentId === 'alice' || lower.includes('briefing') || lower.includes('summit') || lower.includes('intel')) {
      triggerAliceBriefing();
    }
  }, [externalTaskTrigger]);

  // Periodic Task Progress Increment
  useEffect(() => {
    const timer = setInterval(() => {
      setAgents((prev) => {
        let hasChanges = false;
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          const a = next[id];
          if (a.taskProgress < 100) {
            a.taskProgress = Math.min(100, a.taskProgress + 2);
            hasChanges = true;
          }
        });
        return hasChanges ? next : prev;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // Main Three.js Scene: CORPORATE PENTHOUSE OFFICE & REAL ARTICULATED 3D HUMANS
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    scene.background = new THREE.Color('#081624');
    scene.fog = new THREE.FogExp2('#081624', 0.015);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 140);
    camera.position.set(0, 9.5, 13);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 3;
    controls.maxDistance = 28;
    controls.target.set(-0.5, 1.2, 0.5);
    controlsRef.current = controls;

    // Studio Lighting Rig (Warm Key + Ambient + Sunlight)
    const ambientLight = new THREE.AmbientLight('#e0f2fe', 1.4);
    scene.add(ambientLight);

    const ceilingKeyLight = new THREE.DirectionalLight('#ffffff', 2.3);
    ceilingKeyLight.position.set(2, 18, 6);
    ceilingKeyLight.castShadow = true;
    ceilingKeyLight.shadow.mapSize.width = 1024;
    ceilingKeyLight.shadow.mapSize.height = 1024;
    ceilingKeyLight.shadow.bias = -0.0003;
    scene.add(ceilingKeyLight);

    const windowSunLight = new THREE.DirectionalLight('#fed7aa', 1.9);
    windowSunLight.position.set(12, 12, -8);
    scene.add(windowSunLight);

    // ================= 1. POLISHED REFLECTIVE MARBLE & OAK FLOOR =================
    const floorGeo = new THREE.PlaneGeometry(26, 22);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#13283b', // Polished executive slate-marble
      roughness: 0.18,  // High specular sheen
      metalness: 0.32,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Clean geometric guide grid on marble floor
    const floorGrid = new THREE.GridHelper(24, 24, '#00f0ff', 'rgba(0, 240, 255, 0.15)');
    floorGrid.position.y = 0.015;
    scene.add(floorGrid);

    // Conference Area Executive Rug
    const rugMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.85 });
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 5.4), rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(-1.2, 0.02, 0.5);
    rug.receiveShadow = true;
    scene.add(rug);

    // ================= 2. PANORAMIC GLASS WINDOWS & FUTURISTIC CITY SKYLINE =================
    const wallMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.55 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(26, 6.5, 0.2), wallMat);
    backWall.position.set(0, 3.25, -9.5);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Panoramic Window Frame
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: '#090d16', metalness: 0.85, roughness: 0.2 });
    for (let i = -10; i <= 10; i += 5) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.18, 5.8, 0.25), windowFrameMat);
      mullion.position.set(i, 3.4, -9.38);
      scene.add(mullion);
    }

    // 3D City Skyline Background visible through windows
    const skylineGroup = new THREE.Group();
    skylineGroup.position.set(0, 0, -18);

    const bldgColors = ['#0c1e33', '#112946', '#17365c', '#081728'];
    for (let b = 0; b < 28; b++) {
      const bx = -22 + b * 1.6 + (Math.sin(b * 3.7) * 0.4);
      const bHeight = 8 + (Math.sin(b * 2.3) + 1) * 6;
      const bWidth = 1.2 + Math.random() * 0.8;
      const bDepth = 1.2 + Math.random() * 0.8;

      const bldg = new THREE.Mesh(
        new THREE.BoxGeometry(bWidth, bHeight, bDepth),
        new THREE.MeshStandardMaterial({
          color: bldgColors[b % bldgColors.length],
          roughness: 0.35,
          metalness: 0.7,
        })
      );
      bldg.position.set(bx, bHeight / 2 - 2, 0);
      skylineGroup.add(bldg);

      // Neon cyan / gold office window streaks
      if (b % 2 === 0) {
        const glowWin = new THREE.Mesh(
          new THREE.BoxGeometry(bWidth * 0.75, bHeight * 0.6, 0.05),
          new THREE.MeshBasicMaterial({ color: b % 4 === 0 ? '#00f0ff' : '#f59e0b' })
        );
        glowWin.position.set(bx, bHeight * 0.5, bDepth / 2 + 0.05);
        skylineGroup.add(glowWin);
      }
    }
    scene.add(skylineGroup);

    // ================= 3. FOUR EXECUTIVE WORKSTATIONS =================
    const deskTopMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.35 }); // Executive warm oak
    const legMat = new THREE.MeshStandardMaterial({ color: '#090d16', metalness: 0.8 });
    const screenBezelMat = new THREE.MeshStandardMaterial({ color: '#090d16', metalness: 0.9 });
    const screenGlowMat = new THREE.MeshBasicMaterial({ color: '#00f0ff' });

    const createExecutiveWorkstation = (x: number, z: number, deskId: string, rotY = 0) => {
      const ws = new THREE.Group();
      ws.position.set(x, 0, z);
      ws.rotation.y = rotY;

      // Executive Desk Surface
      const top = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.1, 1.3), deskTopMat);
      top.position.y = 1.35;
      top.castShadow = true;
      top.receiveShadow = true;
      ws.add(top);

      // Desk Legs
      [
        [-1.3, 0.67, -0.55],
        [1.3, 0.67, -0.55],
        [-1.3, 0.67, 0.55],
        [1.3, 0.67, 0.55],
      ].forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.34, 0.08), legMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        ws.add(leg);
      });

      // Dual Curved Telemetry Screens
      const scrL = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.65, 0.04), screenBezelMat);
      scrL.position.set(-0.6, 1.85, -0.32);
      scrL.rotation.y = 0.22;
      ws.add(scrL);

      const scrR = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.65, 0.04), screenBezelMat);
      scrR.position.set(0.6, 1.85, -0.32);
      scrR.rotation.y = -0.22;
      ws.add(scrR);

      // Keyboard & Optical Mouse
      const kb = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.02, 0.24),
        new THREE.MeshStandardMaterial({ color: '#27272a' })
      );
      kb.position.set(0, 1.4, 0.1);
      ws.add(kb);

      const mouse = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.02, 0.12),
        new THREE.MeshStandardMaterial({ color: '#18181b' })
      );
      mouse.position.set(0.55, 1.4, 0.1);
      ws.add(mouse);

      // Ergonomic Office Mesh Chair
      const chairMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.6 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.65), chairMat);
      seat.position.set(0, 0.95, 0.7);
      ws.add(seat);

      const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.75, 0.06), chairMat);
      chairBack.position.set(0, 1.4, 0.98);
      ws.add(chairBack);

      const chairStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.85, 8), legMat);
      chairStem.position.set(0, 0.45, 0.7);
      ws.add(chairStem);

      scene.add(ws);
    };

    createExecutiveWorkstation(-4.2, -2.0, 'aliceDesk', 0);
    createExecutiveWorkstation(1.5, -2.0, 'bobDesk', 0);
    createExecutiveWorkstation(-4.2, 3.2, 'carolDesk', Math.PI);
    createExecutiveWorkstation(1.5, 3.2, 'daveDesk', Math.PI);

    // ================= 4. CONFERENCE TABLE & BREAKROOM =================
    // Central Executive Glass Conference Table
    const confGroup = new THREE.Group();
    confGroup.position.set(-1.2, 0, 0.5);

    const confTableTop = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.08, 2.1),
      new THREE.MeshPhysicalMaterial({
        color: '#bae6fd',
        transmission: 0.85,
        roughness: 0.08,
        thickness: 0.4,
      })
    );
    confTableTop.position.y = 1.35;
    confTableTop.castShadow = true;
    confGroup.add(confTableTop);

    const confLegMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.7 });
    [
      [-2.0, 0.67, -0.9],
      [2.0, 0.67, -0.9],
      [-2.0, 0.67, 0.9],
      [2.0, 0.67, 0.9],
    ].forEach(([cx, cy, cz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.34, 0.08), confLegMat);
      leg.position.set(cx, cy, cz);
      confGroup.add(leg);
    });

    // Floating 3D Holographic Earth Globe in Center of Table
    const holoGlobeGeo = new THREE.SphereGeometry(0.42, 16, 16);
    const holoGlobeMat = new THREE.MeshBasicMaterial({
      color: '#00f0ff',
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const holoGlobe = new THREE.Mesh(holoGlobeGeo, holoGlobeMat);
    holoGlobe.position.set(0, 1.95, 0);
    confGroup.add(holoGlobe);

    scene.add(confGroup);

    // Breakroom Espresso Bar Counter
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.6, 1.2),
      new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.3 })
    );
    counter.position.set(6.5, 0.8, -4.5);
    counter.castShadow = true;
    scene.add(counter);

    const coffeeMaker = new THREE.Mesh(
      new THREE.BoxGeometry(0.75, 0.75, 0.65),
      new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.9, roughness: 0.15 })
    );
    coffeeMaker.position.set(6.5, 1.95, -4.5);
    scene.add(coffeeMaker);

    // Water Dispenser Cooler
    const cooler = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 1.8, 0.85),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3 })
    );
    cooler.position.set(6.5, 0.9, -1.8);
    cooler.castShadow = true;
    scene.add(cooler);

    const waterBottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 1.1, 16),
      new THREE.MeshPhysicalMaterial({ color: '#38bdf8', transmission: 0.9, roughness: 0.08 })
    );
    waterBottle.position.set(6.5, 2.25, -1.8);
    scene.add(waterBottle);

    // High-Density Server Cluster Racks in Bay
    const serverRack = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 5.6, 1.4),
      new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.85, roughness: 0.25 })
    );
    serverRack.position.set(6.5, 2.8, 3.8);
    scene.add(serverRack);

    const ledMat = new THREE.MeshBasicMaterial({ color: '#10b981' });
    for (let k = 0; k < 8; k++) {
      const led = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.02), ledMat);
      led.position.set(6.5, 0.9 + k * 0.55, 4.51);
      scene.add(led);
    }

    // Potted Office Plants
    const createPlant = (px: number, pz: number) => {
      const p = new THREE.Group();
      p.position.set(px, 0, pz);
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.32, 0.95, 16),
        new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2 })
      );
      pot.position.y = 0.48;
      p.add(pot);

      const leaves = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 16, 16),
        new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.7 })
      );
      leaves.position.y = 1.55;
      leaves.scale.set(1, 1.4, 1);
      p.add(leaves);
      scene.add(p);
    };

    createPlant(-7.5, -7.5);
    createPlant(5.5, -7.5);
    createPlant(-7.5, 7.0);

    // ================= 5. TRUE ARTICULATED 3D HUMANOID SKELETON RIG =================
    const createArticulatedHuman = (a: RealisticAgent) => {
      const root = new THREE.Group();
      root.name = a.id;

      const hairMat = new THREE.MeshStandardMaterial({ color: a.hairColor, roughness: 0.8 });
      const blazerMat = new THREE.MeshStandardMaterial({ color: a.shirtColor, roughness: 0.45 });
      const pantsMat = new THREE.MeshStandardMaterial({ color: a.pantsColor, roughness: 0.55 });
      const shoeMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.3 });
      const skinMat = new THREE.MeshStandardMaterial({ color: a.skinColor, roughness: 0.5 });
      const beltMat = new THREE.MeshStandardMaterial({ color: '#090d16', roughness: 0.3 });
      const buckleMat = new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.8 });

      // Pelvis Root (interpolates between standing y=0.95 and sitting y=0.48)
      const pelvis = new THREE.Group();
      pelvis.position.y = 0.95;
      root.add(pelvis);

      // Torso Group
      const torsoGroup = new THREE.Group();
      torsoGroup.position.y = 0.35;
      pelvis.add(torsoGroup);

      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 0.85, 16), blazerMat);
      torso.castShadow = true;
      torsoGroup.add(torso);

      // Belt
      const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 16), beltMat);
      belt.position.y = -0.38;
      torsoGroup.add(belt);

      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.04), buckleMat);
      buckle.position.set(0, -0.38, 0.26);
      torsoGroup.add(buckle);

      // Head Group
      const headGroup = new THREE.Group();
      headGroup.position.y = 0.75;
      torsoGroup.add(headGroup);

      const faceTexture = createFaceTexture(a.gender, a.skinColor, a.eyeColor, a.lipColor, a.hairColor);
      const faceMat = new THREE.MeshStandardMaterial({
        map: faceTexture,
        roughness: 0.48,
        metalness: 0.05,
      });

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 20), faceMat);
      head.scale.set(1, 1.15, 1.05);
      head.rotation.y = -Math.PI / 2;
      head.castShadow = true;
      headGroup.add(head);

      // Natural Hair Volume
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), hairMat);
      hair.position.set(0, 0.08, -0.04);
      headGroup.add(hair);

      if (a.gender === 'female') {
        const ponytail = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), hairMat);
        ponytail.position.set(0, 0.05, -0.3);
        ponytail.scale.set(1, 1.5, 1);
        headGroup.add(ponytail);
      }

      // Glasses for Bob
      if (a.id === 'bob') {
        const glasses = new THREE.Mesh(
          new THREE.BoxGeometry(0.42, 0.09, 0.05),
          new THREE.MeshStandardMaterial({ color: '#00f0ff', metalness: 0.8 })
        );
        glasses.position.set(0, 0.05, 0.28);
        headGroup.add(glasses);
      }

      // Tactical Headset for Alice
      if (a.id === 'alice') {
        const headset = new THREE.Mesh(
          new THREE.TorusGeometry(0.3, 0.025, 8, 20, Math.PI),
          new THREE.MeshStandardMaterial({ color: '#00f0ff', metalness: 0.85 })
        );
        headset.rotation.x = Math.PI / 2;
        headGroup.add(headset);
      }

      // Left Arm Joint Hierarchy (Shoulder -> UpperArm -> Elbow -> Forearm -> Hand)
      const leftShoulder = new THREE.Group();
      leftShoulder.position.set(-0.38, 0.35, 0);
      torsoGroup.add(leftShoulder);

      const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.44, 12), blazerMat);
      leftUpperArm.position.y = -0.22;
      leftShoulder.add(leftUpperArm);

      const leftElbow = new THREE.Group();
      leftElbow.position.y = -0.44;
      leftShoulder.add(leftElbow);

      const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.4, 12), blazerMat);
      leftForearm.position.y = -0.2;
      leftElbow.add(leftForearm);

      const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), skinMat);
      leftHand.position.y = -0.42;
      leftElbow.add(leftHand);

      // Right Arm Joint Hierarchy
      const rightShoulder = new THREE.Group();
      rightShoulder.position.set(0.38, 0.35, 0);
      torsoGroup.add(rightShoulder);

      const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.44, 12), blazerMat);
      rightUpperArm.position.y = -0.22;
      rightShoulder.add(rightUpperArm);

      const rightElbow = new THREE.Group();
      rightElbow.position.y = -0.44;
      rightShoulder.add(rightElbow);

      const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.4, 12), blazerMat);
      rightForearm.position.y = -0.2;
      rightElbow.add(rightForearm);

      const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), skinMat);
      rightHand.position.y = -0.42;
      rightElbow.add(rightHand);

      // Props attached to hands
      const propsGroup = new THREE.Group();
      rightHand.add(propsGroup);

      if (a.heldItem === 'glass') {
        const glass = new THREE.Mesh(
          new THREE.CylinderGeometry(0.06, 0.04, 0.15, 12),
          new THREE.MeshPhysicalMaterial({ color: '#bae6fd', transmission: 0.92, roughness: 0.1 })
        );
        glass.position.set(0, -0.08, 0.1);
        propsGroup.add(glass);
      } else if (a.heldItem === 'tablet') {
        const tablet = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, 0.22, 0.02),
          new THREE.MeshStandardMaterial({ color: '#0f172a', emissive: '#00f0ff', emissiveIntensity: 0.85 })
        );
        tablet.position.set(0, -0.06, 0.12);
        propsGroup.add(tablet);
      }

      // Left Leg Hierarchy (Hip -> Thigh -> Knee -> Calf -> Foot)
      const leftHip = new THREE.Group();
      leftHip.position.set(-0.16, 0, 0);
      pelvis.add(leftHip);

      const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.52, 12), pantsMat);
      leftThigh.position.y = -0.26;
      leftHip.add(leftThigh);

      const leftKnee = new THREE.Group();
      leftKnee.position.y = -0.52;
      leftHip.add(leftKnee);

      const leftCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.5, 12), pantsMat);
      leftCalf.position.y = -0.25;
      leftKnee.add(leftCalf);

      const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.26), shoeMat);
      leftFoot.position.set(0, -0.52, 0.06);
      leftKnee.add(leftFoot);

      // Right Leg Hierarchy
      const rightHip = new THREE.Group();
      rightHip.position.set(0.16, 0, 0);
      pelvis.add(rightHip);

      const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.52, 12), pantsMat);
      rightThigh.position.y = -0.26;
      rightHip.add(rightThigh);

      const rightKnee = new THREE.Group();
      rightKnee.position.y = -0.52;
      rightHip.add(rightKnee);

      const rightCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.5, 12), pantsMat);
      rightCalf.position.y = -0.25;
      rightKnee.add(rightCalf);

      const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.26), shoeMat);
      rightFoot.position.set(0, -0.52, 0.06);
      rightKnee.add(rightFoot);

      // Soft contact shadow on ground
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 1.2),
        new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.45 })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.02;
      root.add(shadow);

      // Overhead 3D Action Tag Billboard Sprite
      const { sprite, updateText, texture } = createActionTagSprite(
        a.taskTag,
        a.id === 'carol' ? '#00f0ff' : a.id === 'bob' ? '#38bdf8' : a.id === 'alice' ? '#f472b6' : '#fbbf24'
      );
      sprite.position.set(0, 3.4, 0);
      root.add(sprite);

      actionTagSpritesRef.current[a.id] = { sprite, updateText, texture };

      boneRigRef.current[a.id] = {
        pelvis,
        torsoGroup,
        headGroup,
        leftShoulder,
        leftElbow,
        rightShoulder,
        rightElbow,
        leftHip,
        leftKnee,
        rightHip,
        rightKnee,
        leftFoot,
        rightFoot,
      };

      return root;
    };

    // Add all 4 characters to scene
    Object.keys(agentsRef.current).forEach((id) => {
      const a = agentsRef.current[id];
      const char = createArticulatedHuman(a);
      char.position.copy(a.pos);
      char.rotation.y = a.rotationY;
      scene.add(char);
      characterGroupsRef.current[id] = char;
    });

    // Kinematics Render Loop with Smooth Procedural Walking & Sitting Interpolation
    let raf = 0;
    const clock = new THREE.Clock();

    const render = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Rotate central holographic globe
      holoGlobe.rotation.y = elapsed * 0.4;

      Object.keys(agentsRef.current).forEach((id) => {
        const a = agentsRef.current[id];
        const group = characterGroupsRef.current[id];
        const rig = boneRigRef.current[id];
        if (!group || !rig) return;

        const dist = a.pos.distanceTo(a.targetPos);

        if (dist > 0.15) {
          // ================= WALKING TO TARGET WAYPOINT =================
          const dir = new THREE.Vector3().subVectors(a.targetPos, a.pos).normalize();
          a.pos.addScaledVector(dir, 2.2 * delta);

          const targetRot = Math.atan2(dir.x, dir.z);
          a.rotationY = THREE.MathUtils.lerp(a.rotationY, targetRot, 0.16);

          a.walkCycle += delta * 9.5;
          const legSwing = Math.sin(a.walkCycle) * 0.55;

          // Full Standing Height
          rig.pelvis.position.y = 0.95;

          // Leg Kinematics with Knee Flexion
          rig.leftHip.rotation.x = legSwing;
          rig.rightHip.rotation.x = -legSwing;
          rig.leftKnee.rotation.x = Math.max(0, -legSwing * 0.85);
          rig.rightKnee.rotation.x = Math.max(0, legSwing * 0.85);

          // Arm Swing in Opposition to Legs
          rig.leftShoulder.rotation.x = -legSwing * 0.45;
          rig.rightShoulder.rotation.x = legSwing * 0.45;
          rig.leftElbow.rotation.x = 0.2;
          rig.rightElbow.rotation.x = 0.2;

          // Natural human gait vertical bounce
          const bounce = Math.abs(Math.sin(a.walkCycle)) * 0.055;
          group.position.set(a.pos.x, bounce, a.pos.z);
          group.rotation.y = a.rotationY;
        } else {
          // ================= ARRIVED AT DESTINATION =================
          if (a.state === 'sitting' || a.state === 'meeting') {
            // Seated at Workstation or Conference Table
            group.position.copy(a.state === 'meeting' ? a.targetPos : a.chairPos);
            group.rotation.y = id === 'carol' || id === 'dave' ? Math.PI : 0;

            // Lower pelvis into chair
            rig.pelvis.position.y = 0.48;

            // Thighs 90 degrees forward, Calves 90 degrees down to floor
            rig.leftHip.rotation.x = Math.PI / 2;
            rig.rightHip.rotation.x = Math.PI / 2;
            rig.leftKnee.rotation.x = -Math.PI / 2;
            rig.rightKnee.rotation.x = -Math.PI / 2;

            // Arms raised typing on desk keyboard with realistic micro-variations
            const typeTick = Math.sin(elapsed * 8.0);
            rig.leftShoulder.rotation.x = 0.65 + typeTick * 0.04;
            rig.rightShoulder.rotation.x = 0.65 - typeTick * 0.04;
            rig.leftElbow.rotation.x = 0.55;
            rig.rightElbow.rotation.x = 0.55;

            // Head looking naturally between dual screens
            rig.headGroup.rotation.y = Math.sin(elapsed * 1.4) * 0.14;
          } else {
            // Standing at Work Station (Water Cooler / Server Rack / Coffee Counter)
            group.position.copy(a.pos);
            rig.pelvis.position.y = 0.95;

            // Standing legs straight
            rig.leftHip.rotation.x = 0;
            rig.rightHip.rotation.x = 0;
            rig.leftKnee.rotation.x = 0;
            rig.rightKnee.rotation.x = 0;

            // Action gestures:
            if (a.heldItem === 'glass') {
              // Carol drinking water
              rig.rightShoulder.rotation.x = 1.2;
              rig.rightElbow.rotation.x = 1.0;
              rig.headGroup.rotation.x = -0.15; // tilting head back
            } else if (a.heldItem === 'tablet') {
              // Bob or Dave typing on tactical tablet
              rig.rightShoulder.rotation.x = 0.8;
              rig.rightElbow.rotation.x = 0.7;
              rig.leftShoulder.rotation.x = 0.7;
              rig.leftElbow.rotation.x = 0.6;
              rig.headGroup.rotation.x = 0.15; // looking down at screen
            } else {
              rig.rightShoulder.rotation.x = 0.1;
              rig.rightElbow.rotation.x = 0.1;
              rig.leftShoulder.rotation.x = 0.1;
              rig.leftElbow.rotation.x = 0.1;
            }
          }
        }
      });

      // Camera Smooth Interpolation
      camera.position.lerp(targetCamPos.current, 0.05);
      controls.target.lerp(targetLookAt.current, 0.05);
      controls.update();

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 700;
      const h = container.clientHeight || 300;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  const selectedAgent = agents[selectedAgentId];

  return (
    <div className="relative w-full h-full flex flex-col bg-[#020b14] overflow-hidden select-none border border-cyan-500/30 rounded-xl shadow-[0_0_35px_rgba(0,240,255,0.08)]">
      {/* ================= TOP AGENT SELECTION CHIPS & QUICK ACTIONS ================= */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#031320]/90 border-b border-cyan-500/25 shrink-0 z-20">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          {Object.values(agents).map((agent) => {
            const isSelected = selectedAgentId === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => {
                  setSelectedAgentId(agent.id);
                  focusCameraOn(agent.id as any);
                  if (onSelectAgent) {
                    onSelectAgent({
                      id: agent.id,
                      name: agent.name,
                      role: agent.title,
                      task: agent.currentTask,
                      status: 'active',
                      avatarColor: agent.avatarColor,
                    });
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-tech transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'bg-[#051c2c]/80 text-cyan-400/80 border border-cyan-500/20 hover:border-cyan-400/50'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: agent.avatarColor }}
                />
                <span className="font-bold">{agent.name}</span>
                <span className="text-[10px] text-cyan-300/70 hidden sm:inline">({agent.taskTag})</span>
              </button>
            );
          })}
        </div>

        {/* Global Action Triggers */}
        <div className="flex items-center gap-1.5 text-xs font-mono-tech text-cyan-300 shrink-0">
          <button
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              isTerminalOpen
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 shadow-[0_0_10px_#10b981]'
                : 'bg-cyan-500/20 border-cyan-400/40 hover:bg-cyan-500/30'
            }`}
            title="Open Live Agent Terminal & Task Dispatcher"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AGENT TERMINAL</span>
          </button>

          <button
            onClick={callAllHandsMeeting}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 border border-amber-400/50 hover:bg-amber-500/30 text-amber-200 transition-colors cursor-pointer"
            title="Convene All-Hands Emergency Meeting"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden md:inline">MEETING</span>
          </button>

          <button
            onClick={returnAllToDesks}
            className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 transition-colors cursor-pointer"
            title="Return All Agents to Desks"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1 text-cyan-400 hover:text-cyan-200 transition-colors cursor-pointer"
              title={isExpanded ? 'Restore View' : 'Maximize 3D Town'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* ================= 3D WEBGL OFFICE VIEWPORT ================= */}
      <div
        ref={mountRef}
        className="relative flex-1 w-full h-full min-h-0 overflow-hidden cursor-grab active:cursor-grabbing"
      >
        {/* Real-time Status Overlay Banner */}
        {activeNotification && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-100 text-[11px] font-mono-tech flex items-center gap-2 shadow-[0_0_18px_rgba(0,240,255,0.4)] pointer-events-none animate-bounce">
            <Sparkles className="w-3 h-3 text-cyan-300" />
            <span>{activeNotification}</span>
          </div>
        )}

        {/* Camera Views Quick Switcher */}
        <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 bg-[#020e18]/85 border border-cyan-500/30 rounded-lg p-1 text-[10px] font-mono-tech">
          {(['overview', 'alice', 'bob', 'carol', 'dave', 'meeting'] as const).map((cam) => (
            <button
              key={cam}
              onClick={() => focusCameraOn(cam)}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer uppercase ${
                cameraPreset === cam
                  ? 'bg-cyan-500/40 text-cyan-100 border border-cyan-400'
                  : 'text-cyan-500 hover:text-cyan-300'
              }`}
            >
              {cam}
            </button>
          ))}
        </div>

        {/* Quick Physical Behavior Action Buttons */}
        <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1.5 bg-[#020e18]/85 border border-cyan-500/30 rounded-lg p-1 text-[10px] font-mono-tech">
          <button
            onClick={triggerCarolWater}
            className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 hover:bg-cyan-500/40 cursor-pointer"
            title="Carol walks to water cooler"
          >
            <span>CAROL WATER</span>
          </button>
          <button
            onClick={triggerBobFirewall}
            className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 hover:bg-cyan-500/40 cursor-pointer"
            title="Bob walks to server bay"
          >
            <span>BOB SERVERS</span>
          </button>
          <button
            onClick={triggerDaveServers}
            className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 text-amber-200 border border-amber-400/40 hover:bg-amber-500/40 cursor-pointer"
            title="Dave audits cloud nodes"
          >
            <span>DAVE CLOUD</span>
          </button>
          <button
            onClick={triggerAliceBriefing}
            className="flex items-center gap-1 px-2 py-1 rounded bg-pink-500/20 text-pink-200 border border-pink-400/40 hover:bg-pink-500/40 cursor-pointer"
            title="Alice reviews holographic map"
          >
            <span>ALICE INTEL</span>
          </button>
        </div>
      </div>

      {/* ================= INTERACTIVE LIVE AGENT WORKSTATION TERMINAL (NO MOCK DATA) ================= */}
      {isTerminalOpen && (
        <div className="absolute inset-x-2 bottom-2 max-h-[55%] z-40 bg-[#030d17]/95 border border-cyan-400/70 rounded-xl flex flex-col overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.25)] font-mono-tech">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#021524] border-b border-cyan-500/30">
            <div className="flex items-center gap-2 text-xs text-cyan-200 font-bold">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: selectedAgent.avatarColor }}
              />
              <span>{selectedAgent.name.toUpperCase()} // LIVE WORKSTATION TERMINAL</span>
              <span className="text-[10px] text-emerald-400 ml-2">● ONLINE (GEMINI POWERED)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyan-400/80">CPU: 24% | RAM: 3.4GB</span>
              <button
                onClick={() => setIsTerminalOpen(false)}
                className="text-cyan-400 hover:text-cyan-200 p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Domain Actions */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#04192b]/80 border-b border-cyan-500/20 overflow-x-auto text-[10px]">
            <span className="text-cyan-400/70 shrink-0 font-bold">QUICK TASKS:</span>
            {selectedAgentId === 'bob' && (
              <>
                <button
                  onClick={() => handleExecuteAgentTask('Audit firewall port 8080 and enforce iptables drop rules')}
                  className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 hover:bg-cyan-500/40 text-cyan-200 cursor-pointer shrink-0"
                >
                  Firewall Port Scan
                </button>
                <button
                  onClick={() => handleExecuteAgentTask('Mitigate high-volume SYN flood attack on perimeter')}
                  className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 hover:bg-cyan-500/40 text-cyan-200 cursor-pointer shrink-0"
                >
                  DDoS Mitigation
                </button>
              </>
            )}
            {selectedAgentId === 'alice' && (
              <>
                <button
                  onClick={() => handleExecuteAgentTask('Compile global satellite reconnaissance report for Sector 9')}
                  className="px-2 py-0.5 rounded bg-pink-500/20 border border-pink-400/40 hover:bg-pink-500/40 text-pink-200 cursor-pointer shrink-0"
                >
                  Sector 9 Briefing
                </button>
                <button
                  onClick={() => handleExecuteAgentTask('Analyze US-China summit military telemetry')}
                  className="px-2 py-0.5 rounded bg-pink-500/20 border border-pink-400/40 hover:bg-pink-500/40 text-pink-200 cursor-pointer shrink-0"
                >
                  Summit Telemetry
                </button>
              </>
            )}
            {selectedAgentId === 'carol' && (
              <>
                <button
                  onClick={() => handleExecuteAgentTask('Run SQL validation and optimize ClickHouse sensor ingestion query')}
                  className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 hover:bg-emerald-500/40 text-emerald-200 cursor-pointer shrink-0"
                >
                  Optimize SQL ETL
                </button>
                <button
                  onClick={() => handleExecuteAgentTask('Check Kafka streaming buffer and reduce consumer lag')}
                  className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 hover:bg-emerald-500/40 text-emerald-200 cursor-pointer shrink-0"
                >
                  Buffer Health
                </button>
              </>
            )}
            {selectedAgentId === 'dave' && (
              <>
                <button
                  onClick={() => handleExecuteAgentTask('Deploy Kubernetes ingress proxy with Cilium eBPF mesh')}
                  className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 hover:bg-amber-500/40 text-amber-200 cursor-pointer shrink-0"
                >
                  Deploy K8s Proxy
                </button>
                <button
                  onClick={() => handleExecuteAgentTask('Check Docker container health and restart failing pods')}
                  className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 hover:bg-amber-500/40 text-amber-200 cursor-pointer shrink-0"
                >
                  Pod Health Check
                </button>
              </>
            )}
          </div>

          {/* Real Live Console Logs */}
          <div className="flex-1 p-3 overflow-y-auto space-y-1 text-[11px] leading-relaxed bg-[#020b12]">
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

          {/* Directive Input Form */}
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
              placeholder={`Assign custom task to ${selectedAgent.name} (e.g. "Scan port 443", "Compile report")...`}
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
    </div>
  );
};
