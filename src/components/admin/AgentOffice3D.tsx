import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Maximize2,
  Minimize2,
  Terminal,
  Send,
  Loader2,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  Coffee,
  Shield,
  FileText,
  Database,
  Cloud,
  Zap,
  Activity,
  Bot,
  Play,
  Layers,
  ChevronDown,
  ChevronUp,
  Camera,
} from 'lucide-react';
import {
  speakAgentDialogue,
  subscribeLipSync,
  playRadioChirp,
  playConfirmChime,
  LipSyncData,
} from '../../utils/audioEffects';
import { HumanoidAgentRig, AgentState } from './HumanoidRig';
import { MultiAgentMissionModal, SubtaskExecution } from './MultiAgentMissionModal';
import { AgentInspectorDrawer } from './AgentInspectorDrawer';

interface AgentOffice3DProps {
  onSelectAgent?: (agentId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  externalTaskTrigger?: { agentId: string; task: string } | null;
  onBackToDashboard?: () => void;
  onOpenCryptoMarket?: () => void;
  onOpenCryptoMarketing?: () => void;
  onOpenScreenMonitor?: () => void;
  userEmotion?: any;
}

type CameraPreset = 'OVERVIEW' | 'ALICE' | 'BOB' | 'CAROL' | 'DAVE' | 'CONFERENCE' | 'ZEN';

interface AgentMetadata {
  id: 'alice' | 'bob' | 'carol' | 'dave';
  name: string;
  role: string;
  statusTag: string;
  dotColor: string;
  currentTask: string;
  telemetry: string;
  deskPos: [number, number, number];
  conferencePos: [number, number, number];
}

const AGENTS_META: Record<'alice' | 'bob' | 'carol' | 'dave', AgentMetadata> = {
  alice: {
    id: 'alice',
    name: 'Alice',
    role: 'Lead Intelligence & Strategy Analyst',
    statusTag: 'Strategic Intel',
    dotColor: '#f472b6',
    currentTask: 'Compiling Sector-9 satellite reconnaissance dossier',
    telemetry: 'SAT-LINK 99.8% Locked | Elevation 42.1°',
    deskPos: [-3.8, 0, 1.7],
    conferencePos: [-1.4, 0, 0.6],
  },
  bob: {
    id: 'bob',
    name: 'Bob',
    role: 'Senior Cyber Security & Firewall Sentinel',
    statusTag: 'Firewall Audit',
    dotColor: '#38bdf8',
    currentTask: 'Subnet 192.168.1.0/24 Port Hardening & Intrusion Mitigation',
    telemetry: 'TLS 1.3 Active | 0 Unauthorized Drops',
    deskPos: [-3.8, 0, -3.3],
    conferencePos: [-1.4, 0, -0.6],
  },
  carol: {
    id: 'carol',
    name: 'Carol',
    role: 'Data Pipelines & Real-Time ETL Specialist',
    statusTag: 'Stream Ingestion',
    dotColor: '#34d399',
    currentTask: 'Ingesting 1.42M events/sec via Kafka & ClickHouse Stream',
    telemetry: 'ETL Velocity 1.42M ev/s | Latency 8.2ms',
    deskPos: [3.8, 0, -3.3],
    conferencePos: [1.4, 0, -0.6],
  },
  dave: {
    id: 'dave',
    name: 'Dave',
    role: 'Cloud DevOps & Kubernetes Architect',
    statusTag: 'K8s Cluster',
    dotColor: '#fbbf24',
    currentTask: 'Auditing 16 Kubernetes Pods across Cilium eBPF Mesh',
    telemetry: 'K8s 16/16 Healthy | CPU 34% Nominal',
    deskPos: [3.8, 0, 1.7],
    conferencePos: [1.4, 0, 0.6],
  },
};

const CAMERA_TARGETS: Record<
  CameraPreset,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  OVERVIEW: { pos: [0, 4.8, 8.8], target: [0, 1.1, 0] },
  ALICE: { pos: [-2.2, 2.1, 3.4], target: [-3.8, 1.2, 1.7] },
  BOB: { pos: [-2.2, 2.1, -1.8], target: [-3.8, 1.2, -3.3] },
  CAROL: { pos: [2.2, 2.1, -1.8], target: [3.8, 1.2, -3.3] },
  DAVE: { pos: [2.2, 2.1, 3.4], target: [3.8, 1.2, 1.7] },
  CONFERENCE: { pos: [0, 3.4, 3.6], target: [0, 1.3, 0] },
  ZEN: { pos: [0, 6.2, 11.0], target: [0, 0.9, 0] },
};

// Procedural Textures
function createWoodFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#16110d';
  ctx.fillRect(0, 0, 1024, 1024);

  const plankHeight = 32;
  const plankWidth = 128;
  for (let y = 0; y < 1024; y += plankHeight) {
    const shift = (Math.floor(y / plankHeight) % 2) * (plankWidth / 2);
    for (let x = -plankWidth; x < 1024 + plankWidth; x += plankWidth) {
      const variance = (Math.sin(x * 12.3 + y * 45.6) + 1) * 0.5;
      const r = Math.floor(26 + variance * 16);
      const g = Math.floor(18 + variance * 12);
      const b = Math.floor(12 + variance * 8);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x + shift, y, plankWidth - 2, plankHeight - 2);

      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.fillRect(x + shift, y + 8, plankWidth - 2, 1);
      ctx.fillRect(x + shift, y + 18, plankWidth - 2, 1);
    }
  }

  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, 'rgba(0, 240, 255, 0.05)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, 'rgba(16, 185, 129, 0.04)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

function createCityBackdropTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const skyGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  skyGrad.addColorStop(0, '#02050b');
  skyGrad.addColorStop(0.5, '#061324');
  skyGrad.addColorStop(0.85, '#0c223a');
  skyGrad.addColorStop(1, '#163b5c');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 400; i++) {
    const sx = Math.random() * 2048;
    const sy = Math.random() * 520;
    const r = Math.random() * 1.5;
    ctx.globalAlpha = 0.25 + Math.random() * 0.75;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  const colors = ['#00f0ff', '#38bdf8', '#818cf8', '#ec4899', '#f59e0b', '#10b981'];
  for (let i = 0; i < 75; i++) {
    const bx = (i / 75) * 2048 + (Math.random() * 20 - 10);
    const bw = 24 + Math.random() * 45;
    const bh = 220 + Math.random() * 450;
    const by = 1024 - bh;

    const bGrad = ctx.createLinearGradient(bx, by, bx, 1024);
    bGrad.addColorStop(0, '#0b1929');
    bGrad.addColorStop(1, '#020711');
    ctx.fillStyle = bGrad;
    ctx.fillRect(bx, by, bw, bh);

    const winColor = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillStyle = winColor;
    for (let wy = by + 12; wy < 1000; wy += 9) {
      for (let wx = bx + 4; wx < bx + bw - 4; wx += 6) {
        if (Math.random() > 0.42) {
          ctx.globalAlpha = 0.25 + Math.random() * 0.75;
          ctx.fillRect(wx, wy, 3, 4);
        }
      }
    }

    ctx.fillStyle = '#ff3366';
    ctx.globalAlpha = 0.9;
    ctx.fillRect(bx + bw / 2 - 1, by - 16, 2, 16);
    ctx.beginPath();
    ctx.arc(bx + bw / 2, by - 16, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createTerminalScreenTexture(
  title: string,
  accentColor: string,
  mode: 'matrix' | 'analytics' | 'code' | 'pods'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#020b14';
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = '#041c2c';
  ctx.fillRect(0, 0, 512, 32);
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`● [STONIC] // ${title}`, 12, 22);

  if (mode === 'matrix' || mode === 'code') {
    ctx.fillStyle = accentColor;
    ctx.font = '11px monospace';
    ctx.globalAlpha = 0.9;
    const lines = [
      '> INGESTING TELEMETRY STREAM #09',
      '>> mTLS HANDSHAKE VERIFIED [200 OK]',
      '>> ORBITAL SATELLITE LINK LOCKED 42.1°',
      '>> PARSING DOSSIER SCHEMA...',
      '>> DECRYPTED CIPHER: SHA-256 AES-GCM',
      '>> 0 ANOMALIES DETECTED / READY',
    ];
    lines.forEach((l, i) => {
      ctx.fillText(l, 14, 56 + i * 22);
    });
  } else if (mode === 'analytics') {
    ctx.fillStyle = accentColor;
    for (let i = 0; i < 20; i++) {
      const h = 20 + Math.sin(i * 0.8) * 45 + 30;
      ctx.fillRect(20 + i * 23, 210 - h, 16, h);
    }
    ctx.font = 'bold 12px monospace';
    ctx.fillText('RATE: 1.42M events/sec | BUFFER: 18%', 20, 238);
  } else if (mode === 'pods') {
    ctx.font = '11px monospace';
    ctx.fillStyle = '#10b981';
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(24 + col * 115, 48 + row * 45, 100, 36);
        ctx.fillStyle = '#10b981';
        ctx.fillText(`pod-${row * 4 + col + 1}`, 32 + col * 115, 66 + row * 45);
        ctx.fillText('RUNNING', 32 + col * 115, 78 + row * 45);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export const AgentOffice3D: React.FC<AgentOffice3DProps> = ({
  onSelectAgent,
  isExpanded = false,
  onToggleExpand,
  externalTaskTrigger,
  onBackToDashboard,
  onOpenCryptoMarket,
  onOpenCryptoMarketing,
  onOpenScreenMonitor,
  userEmotion,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // States
  const [currentPreset, setCurrentPreset] = useState<CameraPreset>('OVERVIEW');
  const [selectedAgentId, setSelectedAgentId] = useState<'alice' | 'bob' | 'carol' | 'dave'>('alice');
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);
  const [speakingAgentId, setSpeakingAgentId] = useState<string | null>(null);
  const speakingAgentIdRef = useRef<string | null>(null);
  useEffect(() => {
    speakingAgentIdRef.current = speakingAgentId;
  }, [speakingAgentId]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceMode, setVoiceMode] = useState<'native_urdu_hindi' | 'english_clear'>('native_urdu_hindi');
  const [notification, setNotification] = useState<string | null>(null);

  // Modals & Drawers
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [isExecutingTask, setIsExecutingTask] = useState(false);
  const [lastOutputs, setLastOutputs] = useState<Record<string, string>>({});
  const [isBottomDockCollapsed, setIsBottomDockCollapsed] = useState(false);

  // Autonomous chat toggle
  const [autonomousChat, setAutonomousChat] = useState(true);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Humanoid Rig References
  const agentRigsRef = useRef<Record<string, HumanoidAgentRig>>({});
  const earthGlobeRef = useRef<THREE.Group | null>(null);
  const orbitRing1Ref = useRef<THREE.Mesh | null>(null);
  const orbitRing2Ref = useRef<THREE.Mesh | null>(null);

  // Lip Sync
  const currentLipSyncRef = useRef<LipSyncData>({
    isOpen: false,
    openRatio: 0,
    mouthWidth: 1.0,
    jawOffset: 0,
    phoneme: 'rest',
  });

  // Camera lerp targets
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(...CAMERA_TARGETS.OVERVIEW.pos));
  const targetCamLook = useRef<THREE.Vector3>(new THREE.Vector3(...CAMERA_TARGETS.OVERVIEW.target));

  // Change Camera Preset
  const setCameraPreset = useCallback((preset: CameraPreset) => {
    setCurrentPreset(preset);
    const cfg = CAMERA_TARGETS[preset];
    targetCamPos.current.set(...cfg.pos);
    targetCamLook.current.set(...cfg.target);

    if (preset === 'ALICE') setSelectedAgentId('alice');
    else if (preset === 'BOB') setSelectedAgentId('bob');
    else if (preset === 'CAROL') setSelectedAgentId('carol');
    else if (preset === 'DAVE') setSelectedAgentId('dave');

    if (controlsRef.current) {
      controlsRef.current.target.set(...cfg.target);
    }
  }, []);

  // Trigger agent speech with lip sync and visual speech bubble
  const triggerAgentSpeech = useCallback(
    (agentId: 'alice' | 'bob' | 'carol' | 'dave', saraikiText: string, englishSummary: string) => {
      setSpeakingAgentId(agentId);
      setActiveSpeechText(saraikiText);

      if (soundEnabled) {
        const text = voiceMode === 'native_urdu_hindi' ? saraikiText : englishSummary;
        speakAgentDialogue(text, agentId, voiceMode);
      }

      setNotification(`${AGENTS_META[agentId].name} is speaking...`);

      const duration = Math.max(3500, saraikiText.length * 75);
      setTimeout(() => {
        setSpeakingAgentId((cur) => (cur === agentId ? null : cur));
        setActiveSpeechText(null);
      }, duration);
    },
    [soundEnabled, voiceMode]
  );

  // Subscribe to lip sync
  useEffect(() => {
    const unsub = subscribeLipSync((_speakerId, data) => {
      currentLipSyncRef.current = data;
    });
    return unsub;
  }, []);

  // Handle external tasks from parent
  useEffect(() => {
    if (externalTaskTrigger && externalTaskTrigger.agentId in AGENTS_META) {
      const aid = externalTaskTrigger.agentId as keyof typeof AGENTS_META;
      setSelectedAgentId(aid);
      setCameraPreset(aid.toUpperCase() as CameraPreset);

      const rig = agentRigsRef.current[aid];
      if (rig) {
        rig.updateBadge('DIRECTIVE ACTIVE', '#00f0ff');
      }

      triggerAgentSpeech(
        aid,
        `Ji Janab! Directive "${externalTaskTrigger.task}" receive thaye te kaam shuru ho chuka hey.`,
        `Directive acknowledged: "${externalTaskTrigger.task}". Executing.`
      );
    }
  }, [externalTaskTrigger, setCameraPreset, triggerAgentSpeech]);

  // Dispatch Mission to 3D Office (Agents walk, sit, and start working)
  const handleDispatchMissionTo3D = useCallback(
    (subtasks: SubtaskExecution[], managerBriefing: string) => {
      setNotification('Multi-Agent Mission Active: Agents navigating to workstations');
      playConfirmChime();

      if (managerBriefing) {
        triggerAgentSpeech('alice', managerBriefing, 'Dispatching autonomous mission subtasks to crew.');
      }

      // Command each agent to walk to their desk and sit
      subtasks.forEach((st) => {
        const rig = agentRigsRef.current[st.agentId];
        if (rig) {
          rig.updateBadge(st.actionTitle.slice(0, 14), '#38bdf8');
          // Walk from conference table to desk
          rig.walkTo(rig.deskPos, st.agentId === 'alice' || st.agentId === 'dave' ? Math.PI / 4 : -Math.PI / 4, () => {
            rig.state = 'WORKING_TYPING';
            rig.updateBadge('WORKING // ACTIVE', '#00f0ff');
          });
        }
      });
    },
    [triggerAgentSpeech]
  );

  // Execute directive for single agent via backend
  const handleDispatchDirective = async (instruction: string) => {
    setIsExecutingTask(true);
    playConfirmChime();

    triggerAgentSpeech(
      selectedAgentId,
      `Hukum janab! "${instruction}" te foran action shuru kar ditta hey.`,
      `Directive acknowledged: "${instruction}". Executing.`
    );

    const rig = agentRigsRef.current[selectedAgentId];
    if (rig) {
      rig.updateBadge('COMPUTING', '#f59e0b');
    }

    try {
      const res = await fetch('/api/admin/agent-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          instruction,
          context: { currentTask: AGENTS_META[selectedAgentId].currentTask },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastOutputs((prev) => ({
          ...prev,
          [selectedAgentId]: data.output || 'Task completed.',
        }));

        if (rig) {
          rig.state = 'CELEBRATING';
          rig.updateBadge('SUCCESS // DONE', '#10b981');
          setTimeout(() => {
            rig.state = 'WORKING_TYPING';
            rig.updateBadge('MONITORING', AGENTS_META[selectedAgentId].dotColor);
          }, 4000);
        }

        triggerAgentSpeech(
          selectedAgentId,
          `Jani kaam bilkul mukammal ho gaya hey, terminal te report check karo!`,
          `Task completed successfully. Output logged.`
        );
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setIsExecutingTask(false);
    }
  };

  // Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#02060f');
    scene.fog = new THREE.FogExp2('#030c18', 0.022);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(...CAMERA_TARGETS.OVERVIEW.pos);
    cameraRef.current = camera;

    // 3. Renderer with PBR settings
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent going below floor
    controls.minDistance = 2.0;
    controls.maxDistance = 18.0;
    controls.target.set(0, 1.1, 0);
    controlsRef.current = controls;

    // 5. Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#38bdf8', '#08121d', 0.65);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#e0f2fe', 1.6);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.camera.left = -8;
    dirLight.shadow.camera.right = 8;
    dirLight.shadow.camera.top = 8;
    dirLight.shadow.camera.bottom = -8;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // Ambient soft blue floor light
    const floorGlowLight = new THREE.PointLight('#00f0ff', 1.2, 12, 1.2);
    floorGlowLight.position.set(0, 0.4, 0);
    scene.add(floorGlowLight);

    // 6. Hardwood Parquet Floor
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      map: createWoodFloorTexture(),
      roughness: 0.35,
      metalness: 0.25,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Subtle radial contact shadow plane
    const contactShadowGeo = new THREE.PlaneGeometry(16, 16);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      color: '#000000',
      transparent: true,
      opacity: 0.35,
    });
    const contactPlane = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.y = 0.002;
    scene.add(contactPlane);

    // 7. Panoramic Skyline Glass Windows
    const backdropGeo = new THREE.CylinderGeometry(14, 14, 8, 32, 1, true, -Math.PI / 1.5, Math.PI * 1.33);
    const backdropMat = new THREE.MeshBasicMaterial({
      map: createCityBackdropTexture(),
      side: THREE.BackSide,
    });
    const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
    backdrop.position.set(0, 3.8, 0);
    scene.add(backdrop);

    // Window Mullions (vertical & horizontal bars)
    for (let i = -3; i <= 3; i++) {
      const mullion = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 6.5, 0.08),
        new THREE.MeshStandardMaterial({ color: '#091522', metalness: 0.9 })
      );
      mullion.position.set(i * 3.5, 3.25, -11.2);
      scene.add(mullion);
    }

    // 8. Central Conference Table & 3D Holographic Globe
    const tableGroup = new THREE.Group();
    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.1, 0.08, 48),
      new THREE.MeshPhysicalMaterial({
        color: '#071826',
        transmission: 0.85,
        opacity: 0.95,
        transparent: true,
        roughness: 0.1,
        ior: 1.5,
      })
    );
    tableTop.position.y = 0.98;
    tableTop.receiveShadow = true;
    tableTop.castShadow = true;
    tableGroup.add(tableTop);

    // Glowing Cyan Trim Ring
    const tableRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.025, 16, 64),
      new THREE.MeshBasicMaterial({ color: '#00f0ff' })
    );
    tableRing.rotation.x = Math.PI / 2;
    tableRing.position.y = 0.98;
    tableGroup.add(tableRing);

    // Base Chrome Pedestal
    const basePedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.85, 0.98, 32),
      new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.95, roughness: 0.1 })
    );
    basePedestal.position.y = 0.49;
    basePedestal.castShadow = true;
    tableGroup.add(basePedestal);
    scene.add(tableGroup);

    // Floating 3D Holographic Globe
    const holoGlobe = new THREE.Group();
    holoGlobe.position.set(0, 1.8, 0);

    const wireGlobe = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 24, 16),
      new THREE.MeshBasicMaterial({ color: '#00f0ff', wireframe: true, transparent: true, opacity: 0.75 })
    );
    holoGlobe.add(wireGlobe);

    // Inner glowing particle cloud
    const pCount = 350;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 0.48;
      pPos[i] = r * Math.sin(phi) * Math.cos(theta);
      pPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i + 2] = r * Math.cos(phi);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: '#38bdf8', size: 0.025, transparent: true, opacity: 0.85 });
    holoGlobe.add(new THREE.Points(pGeo, pMat));

    // Orbital Rings
    const ring1 = new THREE.Mesh(
      new THREE.RingGeometry(0.68, 0.71, 48),
      new THREE.MeshBasicMaterial({ color: '#00f0ff', side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
    );
    ring1.rotation.x = Math.PI / 3;
    holoGlobe.add(ring1);
    orbitRing1Ref.current = ring1;

    const ring2 = new THREE.Mesh(
      new THREE.RingGeometry(0.82, 0.85, 48),
      new THREE.MeshBasicMaterial({ color: '#10b981', side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
    );
    ring2.rotation.y = Math.PI / 4;
    holoGlobe.add(ring2);
    orbitRing2Ref.current = ring2;

    earthGlobeRef.current = holoGlobe;
    scene.add(holoGlobe);

    // 9. Workstation Construction Helper
    const createWorkstation = (
      agentKey: 'alice' | 'bob' | 'carol' | 'dave',
      x: number,
      z: number,
      rotY: number
    ) => {
      const station = new THREE.Group();
      station.position.set(x, 0, z);
      station.rotation.y = rotY;

      // Tempered Curved Dark Glass Desk
      const deskMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.08, 1.1),
        new THREE.MeshPhysicalMaterial({ color: '#081726', transmission: 0.6, roughness: 0.15, transparent: true })
      );
      deskMesh.position.y = 0.94;
      deskMesh.castShadow = true;
      deskMesh.receiveShadow = true;
      station.add(deskMesh);

      // Matte Black Metal Legs
      const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.94);
      const legMat = new THREE.MeshStandardMaterial({ color: '#0b1320', metalness: 0.85 });
      [
        [-1.05, 0.47, -0.45],
        [1.05, 0.47, -0.45],
        [-1.05, 0.47, 0.45],
        [1.05, 0.47, 0.45],
      ].forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        station.add(leg);
      });

      // Dual Curved Ultrawide Holographic Monitors
      const monGeo = new THREE.BoxGeometry(0.85, 0.48, 0.03);

      const monLeftMat = new THREE.MeshBasicMaterial({
        map: createTerminalScreenTexture(
          agentKey === 'alice' ? 'SATELLITE INTEL' : agentKey === 'bob' ? 'FIREWALL MATRIX' : 'STREAM ETL',
          AGENTS_META[agentKey].dotColor,
          agentKey === 'alice' ? 'matrix' : agentKey === 'bob' ? 'code' : 'analytics'
        ),
      });
      const monLeft = new THREE.Mesh(monGeo, monLeftMat);
      monLeft.position.set(-0.46, 1.34, -0.18);
      monLeft.rotation.y = 0.22;
      station.add(monLeft);

      const monRightMat = new THREE.MeshBasicMaterial({
        map: createTerminalScreenTexture(
          agentKey === 'dave' ? 'K8S POD MESH' : 'DIAGNOSTICS',
          AGENTS_META[agentKey].dotColor,
          agentKey === 'dave' ? 'pods' : 'analytics'
        ),
      });
      const monRight = new THREE.Mesh(monGeo, monRightMat);
      monRight.position.set(0.46, 1.34, -0.18);
      monRight.rotation.y = -0.22;
      station.add(monRight);

      // Laptop open on desk
      const laptopBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.015, 0.26),
        new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.85 })
      );
      laptopBase.position.set(0, 0.99, -0.05);
      station.add(laptopBase);

      const laptopScreen = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.24, 0.01),
        new THREE.MeshStandardMaterial({ color: '#00f0ff', emissive: '#00f0ff', emissiveIntensity: 0.35 })
      );
      laptopScreen.position.set(0, 1.12, -0.18);
      laptopScreen.rotation.x = -0.18;
      station.add(laptopScreen);

      // Mechanical RGB Keyboard with underglow
      const kb = new THREE.Mesh(
        new THREE.BoxGeometry(0.44, 0.02, 0.14),
        new THREE.MeshStandardMaterial({ color: '#090f1a', metalness: 0.4 })
      );
      kb.position.set(0, 0.99, 0.22);
      station.add(kb);

      // Optical Mouse
      const mouse = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.02, 0.10),
        new THREE.MeshStandardMaterial({ color: '#0f172a' })
      );
      mouse.position.set(0.32, 0.99, 0.22);
      station.add(mouse);

      // Stonic AI Coffee Mug
      const mug = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.10, 16),
        new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.2 })
      );
      mug.position.set(-0.75, 1.03, 0.15);
      station.add(mug);

      // Ergonomic Mesh Office Chair with Swivel Pedestal
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0, 0, 0.52);

      const seatMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.58, 0.08, 0.54),
        new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.65 })
      );
      seatMesh.position.y = 0.52;
      chairGroup.add(seatMesh);

      const backMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.54, 0.68, 0.05),
        new THREE.MeshStandardMaterial({ color: '#0b111e', roughness: 0.7 })
      );
      backMesh.position.set(0, 0.88, 0.26);
      chairGroup.add(backMesh);

      // Chair Stem & Wheels
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.48),
        new THREE.MeshStandardMaterial({ color: '#030712', metalness: 0.9 })
      );
      stem.position.y = 0.24;
      chairGroup.add(stem);

      station.add(chairGroup);
      scene.add(station);
    };

    createWorkstation('alice', -3.8, 1.2, Math.PI / 4);
    createWorkstation('bob', -3.8, -3.8, Math.PI / 3);
    createWorkstation('carol', 3.8, -3.8, -Math.PI / 3);
    createWorkstation('dave', 3.8, 1.2, -Math.PI / 4);

    // 10. Water Cooler & Refreshment Station
    const coolerGroup = new THREE.Group();
    coolerGroup.position.set(5.2, 0, -2.5);
    const coolerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 1.2, 0.5),
      new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.3 })
    );
    coolerBody.position.y = 0.6;
    coolerGroup.add(coolerBody);

    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.5, 24),
      new THREE.MeshPhysicalMaterial({ color: '#38bdf8', transmission: 0.9, transparent: true })
    );
    bottle.position.y = 1.45;
    coolerGroup.add(bottle);
    scene.add(coolerGroup);

    // 11. Server Cluster Racks in Corner
    const rackGroup = new THREE.Group();
    rackGroup.position.set(-5.4, 0, -5.4);
    const rackBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 2.6, 0.8),
      new THREE.MeshStandardMaterial({ color: '#020610', metalness: 0.8, roughness: 0.3 })
    );
    rackBody.position.y = 1.3;
    rackGroup.add(rackBody);
    scene.add(rackGroup);

    // 12. Create Anatomical Articulated Humanoid Agent Rigs
    const aliceRig = new HumanoidAgentRig({
      id: 'alice',
      name: 'Alice',
      suitColor: '#0f172a',
      pantsColor: '#1e293b',
      skinColor: '#fed7aa',
      hairColor: '#171717',
      hairStyle: 'sleek_bob',
      badgeColor: '#f472b6',
      deskPos: AGENTS_META.alice.deskPos,
      conferencePos: AGENTS_META.alice.conferencePos,
    });
    scene.add(aliceRig.group);
    aliceRig.group.rotation.y = Math.PI / 4;
    agentRigsRef.current['alice'] = aliceRig;

    const bobRig = new HumanoidAgentRig({
      id: 'bob',
      name: 'Bob',
      suitColor: '#111e30',
      pantsColor: '#0f172a',
      skinColor: '#fcd34d',
      hairColor: '#292524',
      hairStyle: 'tactical_short',
      badgeColor: '#38bdf8',
      visorColor: '#00f0ff',
      deskPos: AGENTS_META.bob.deskPos,
      conferencePos: AGENTS_META.bob.conferencePos,
    });
    scene.add(bobRig.group);
    bobRig.group.rotation.y = Math.PI / 3;
    agentRigsRef.current['bob'] = bobRig;

    const carolRig = new HumanoidAgentRig({
      id: 'carol',
      name: 'Carol',
      suitColor: '#3f1f14',
      pantsColor: '#1c1917',
      skinColor: '#fde68a',
      hairColor: '#9a3412',
      hairStyle: 'auburn_waves',
      badgeColor: '#34d399',
      deskPos: AGENTS_META.carol.deskPos,
      conferencePos: AGENTS_META.carol.conferencePos,
    });
    scene.add(carolRig.group);
    carolRig.group.rotation.y = -Math.PI / 3;
    agentRigsRef.current['carol'] = carolRig;

    const daveRig = new HumanoidAgentRig({
      id: 'dave',
      name: 'Dave',
      suitColor: '#1e3a8a',
      pantsColor: '#0f172a',
      skinColor: '#fed7aa',
      hairColor: '#451a03',
      hairStyle: 'modern_sidepart',
      badgeColor: '#fbbf24',
      deskPos: AGENTS_META.dave.deskPos,
      conferencePos: AGENTS_META.dave.conferencePos,
    });
    scene.add(daveRig.group);
    daveRig.group.rotation.y = -Math.PI / 4;
    agentRigsRef.current['dave'] = daveRig;

    // 13. Render Loop (60 FPS)
    let clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Camera lerp
      camera.position.lerp(targetCamPos.current, 0.04);
      controls.target.lerp(targetCamLook.current, 0.04);
      controls.update();

      // Holographic Globe Rotation
      if (earthGlobeRef.current) {
        earthGlobeRef.current.rotation.y = time * 0.45;
        earthGlobeRef.current.position.y = 1.8 + Math.sin(time * 1.5) * 0.04;
      }
      if (orbitRing1Ref.current) orbitRing1Ref.current.rotation.z = time * 0.55;
      if (orbitRing2Ref.current) orbitRing2Ref.current.rotation.z = -time * 0.45;

      // Animate Articulated Humanoid Agent Rigs
      Object.entries(agentRigsRef.current).forEach(([key, rig]) => {
        const isSpeaking = speakingAgentIdRef.current === key;
        const lip = currentLipSyncRef.current;
        rig.update(time, delta, isSpeaking, lip, camera.position);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Autonomous Colleague Banter
  useEffect(() => {
    if (!autonomousChat) return;
    const timer = setInterval(() => {
      if (speakingAgentId) return;
      const agentsList: ('alice' | 'bob' | 'carol' | 'dave')[] = ['alice', 'bob', 'carol', 'dave'];
      const chosen = agentsList[Math.floor(Math.random() * agentsList.length)];
      const phrases = [
        {
          aid: 'alice' as const,
          urdu: 'Sector-9 satellite telemetry uplink 100% synchronized hey, dossier tayyar hey.',
          en: 'Sector-9 satellite telemetry uplink synchronized. Intel dossier prepared.',
        },
        {
          aid: 'bob' as const,
          urdu: 'Subnet 192.168.1.0/24 ports audit ho chukay han, perimeter tight hey.',
          en: 'Subnet ports audited. Perimeter security locked and active.',
        },
        {
          aid: 'carol' as const,
          urdu: 'Kafka stream 1.42 million events per second nal mast ingest kar rahi hey.',
          en: 'Kafka stream ingesting 1.42M events/sec with 8.2ms latency.',
        },
        {
          aid: 'dave' as const,
          urdu: 'Kubernetes de saray 16 pods green han, cluster optimal load te hey.',
          en: 'All 16 Kubernetes pods green. Cluster running at optimal compute load.',
        },
      ];
      const p = phrases.find((x) => x.aid === chosen) || phrases[0];
      triggerAgentSpeech(p.aid, p.urdu, p.en);
    }, 24000);
    return () => clearInterval(timer);
  }, [autonomousChat, speakingAgentId, triggerAgentSpeech]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#02070e] text-[#dcf4fb] overflow-hidden select-none font-sans">
      {/* ================= 1. TOP TACTICAL NAVIGATION BAR ================= */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#031320]/95 border-b border-cyan-500/30 shrink-0 z-30 font-mono-tech text-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 hover:bg-cyan-900 cursor-pointer mr-1 font-bold"
              title="Return to 3-Column Split Dashboard"
            >
              <span>← DASHBOARD</span>
            </button>
          )}

          <span className="px-2.5 py-1 text-cyan-400/80 hidden lg:inline">SAT-LINK</span>
          <span className="px-2.5 py-1 text-cyan-400/80 hidden lg:inline">NEURAL CORE</span>
          <span className="px-3 py-1 rounded-md bg-cyan-500/25 border-2 border-cyan-300 text-cyan-100 font-bold shadow-[0_0_12px_#00f0ff]">
            AGENTS 3D
          </span>
          <span className="px-2.5 py-1 text-cyan-400/80 hidden lg:inline">VOICE</span>

          <div className="h-4 w-px bg-cyan-500/30 mx-1 hidden sm:inline" />

          {/* ⚡ MULTI-AGENT MISSION ORCHESTRATOR BUTTON */}
          <button
            onClick={() => setIsMissionModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/30 via-emerald-500/30 to-amber-500/30 border-2 border-cyan-300 text-white font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:brightness-125 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>⚡ MULTI-AGENT MISSION</span>
          </button>

          {/* 📷 OPTICAL EYE (CAMERA & SCREEN MONITOR) */}
          {onOpenScreenMonitor && (
            <button
              onClick={onOpenScreenMonitor}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-200 font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)] hover:bg-cyan-900/60 cursor-pointer"
              title="Activate Stonic Optical Vision (Webcam Eye & Desktop Screen Monitor)"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>OPTICAL EYE (CAM/SCREEN)</span>
            </button>
          )}

          {/* Agent Status Pills */}
          {Object.values(AGENTS_META).map((agent) => {
            const isSpeaking = speakingAgentId === agent.id;
            const isSelected = selectedAgentId === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => {
                  setSelectedAgentId(agent.id);
                  setCameraPreset(agent.id.toUpperCase() as CameraPreset);
                  setIsInspectorOpen(true);
                  if (onSelectAgent) onSelectAgent(agent.id);
                  triggerAgentSpeech(
                    agent.id,
                    `Ji Sir, ${agent.name} operational hey!`,
                    `Agent ${agent.name} ready.`
                  );
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-300 text-white font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                    : 'bg-[#041422] border-cyan-500/30 text-cyan-300 hover:border-cyan-400/60'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isSpeaking ? 'animate-ping' : 'animate-pulse'}`}
                  style={{ backgroundColor: agent.dotColor }}
                />
                <span className="text-white font-bold">{agent.name}</span>
                <span className="text-[10px] text-cyan-300/80 hidden md:inline">({agent.statusTag})</span>
              </button>
            );
          })}
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all cursor-pointer font-bold ${
              isTerminalOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_#00f0ff]'
                : 'bg-cyan-950/70 border-cyan-400/50 text-cyan-200 hover:bg-cyan-900/60'
            }`}
          >
            <span>&gt;_</span>
            <span>TERMINAL</span>
          </button>

          <button
            onClick={() => {
              const next = voiceMode === 'native_urdu_hindi' ? 'english_clear' : 'native_urdu_hindi';
              setVoiceMode(next);
              setNotification(next === 'native_urdu_hindi' ? 'Voice: Native Saraiki / Urdu' : 'Voice: Clear English');
            }}
            className="px-2 py-1 rounded bg-[#041422] border border-cyan-500/30 text-cyan-300 text-[11px] cursor-pointer"
            title="Toggle speech language"
          >
            {voiceMode === 'native_urdu_hindi' ? 'URDU' : 'EN'}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded border cursor-pointer ${
              soundEnabled ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300' : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={soundEnabled ? 'Audio ON' : 'Audio Muted'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 rounded border border-cyan-500/40 text-cyan-300 hover:text-white cursor-pointer"
              title={isExpanded ? 'Restore View' : 'Fullscreen'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* ================= 2. 3D VIRTUAL STAGE CANVAS VIEWPORT ================= */}
      <div className="relative flex-1 w-full h-full min-h-0 overflow-hidden">
        {/* Three.js Canvas Mount */}
        <div ref={mountRef} className="w-full h-full" />

        {/* Top Glow Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#02070e] via-transparent to-[#02070e]/40" />

        {/* Live Motion Test Bar for Selected Agent */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-[#02111d]/90 border border-cyan-400/50 shadow-[0_0_25px_rgba(0,240,255,0.3)] backdrop-blur-md font-mono-tech text-[11px] max-w-[96vw] overflow-x-auto">
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 font-bold border border-cyan-400/40 uppercase whitespace-nowrap">
            TEST {AGENTS_META[selectedAgentId].name.toUpperCase()} (HUMAN RIG):
          </span>
          <button
            onClick={() => {
              const rig = agentRigsRef.current[selectedAgentId];
              if (rig) rig.testWalkLoop();
              setNotification(`${AGENTS_META[selectedAgentId].name} walking patrol loop & returning to desk!`);
              playRadioChirp();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#032035] border border-cyan-400 text-cyan-100 hover:bg-cyan-500 hover:text-slate-950 font-bold transition-all cursor-pointer whitespace-nowrap"
            title="Agent stands, walks to meeting table, pauses, walks back to desk and sits down!"
          >
            <span>🚶 WALK &amp; SIT LOOP</span>
          </button>

          <button
            onClick={() => {
              const rig = agentRigsRef.current[selectedAgentId];
              if (rig) {
                rig.setPoseSittingTyping();
                rig.updateBadge('SEATED // DESK', '#00f0ff');
              }
              setNotification(`${AGENTS_META[selectedAgentId].name} seated in chair with legs bent 90°`);
              playConfirmChime();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#032035] border border-cyan-500/40 text-cyan-200 hover:bg-cyan-900/60 font-bold cursor-pointer whitespace-nowrap"
            title="Sit in chair with thighs horizontal and knees bent"
          >
            <span>🪑 SIT IN CHAIR</span>
          </button>

          <button
            onClick={() => {
              const rig = agentRigsRef.current[selectedAgentId];
              if (rig) {
                rig.state = 'WORKING_TYPING';
                rig.isSeated = true;
                rig.updateBadge('TYPING // CODE', '#10b981');
              }
              setNotification(`${AGENTS_META[selectedAgentId].name} typing at mechanical keyboard on computer`);
              playConfirmChime();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#032035] border border-cyan-500/40 text-emerald-300 hover:bg-emerald-950 font-bold cursor-pointer whitespace-nowrap"
            title="Type rapidly on keyboard with monitors updating"
          >
            <span>⌨️ TYPE ON PC</span>
          </button>

          <button
            onClick={() => {
              const rig = agentRigsRef.current[selectedAgentId];
              if (rig) {
                rig.setPoseStandingIdle();
                rig.updateBadge('STANDING // IDLE', '#38bdf8');
              }
              setNotification(`${AGENTS_META[selectedAgentId].name} standing upright, breathing & looking around`);
              playConfirmChime();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#032035] border border-cyan-500/40 text-sky-300 hover:bg-sky-950 font-bold cursor-pointer whitespace-nowrap"
            title="Stand up and breathe with subtle weight shift"
          >
            <span>🧍 STAND IDLE</span>
          </button>

          <button
            onClick={() => {
              const rig = agentRigsRef.current[selectedAgentId];
              if (rig) {
                rig.state = 'CELEBRATING';
                rig.updateBadge('TASK VICTORY', '#10b981');
              }
              setNotification(`${AGENTS_META[selectedAgentId].name} celebration: arms raised & badge emerald green!`);
              playConfirmChime();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#032035] border border-emerald-500/40 text-emerald-200 hover:bg-emerald-950 font-bold cursor-pointer whitespace-nowrap"
            title="Victory pose with arms raised"
          >
            <span>🎉 CELEBRATE</span>
          </button>
        </div>

        {/* Real-time Notification Banner */}
        {notification && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-[#031525]/95 border border-cyan-400 text-cyan-100 text-xs font-mono-tech flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>{notification}</span>
          </div>
        )}

        {/* Live Speech Bubble when Agent is Speaking */}
        {speakingAgentId && activeSpeechText && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-96 max-w-[90vw] p-3.5 rounded-2xl bg-[#03182b]/95 border-2 border-emerald-400 text-emerald-100 text-xs shadow-[0_0_35px_rgba(16,185,129,0.7)] backdrop-blur-md z-30 font-sans animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-emerald-500/30 text-[10px] font-mono text-emerald-400">
              <span className="font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>{AGENTS_META[speakingAgentId as keyof typeof AGENTS_META]?.name.toUpperCase()} // LIVE COMMS</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/40">
                SPEAKING
              </span>
            </div>
            <p className="text-sm font-bold text-white leading-relaxed">
              "{activeSpeechText}"
            </p>
          </div>
        )}

        {/* Side Agent Inspector Drawer */}
        <AgentInspectorDrawer
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          agentId={selectedAgentId}
          agentMeta={AGENTS_META[selectedAgentId]}
          onDispatchDirective={handleDispatchDirective}
          onTriggerVoice={(urduText, englishText) =>
            triggerAgentSpeech(selectedAgentId, urduText, englishText)
          }
          onFlyToAgent={() => setCameraPreset(selectedAgentId.toUpperCase() as CameraPreset)}
          isExecuting={isExecutingTask}
          lastExecutionOutput={lastOutputs[selectedAgentId]}
        />
      </div>

      {/* ================= 3. COLLAPSIBLE BOTTOM PRESET BAR & DOCK ================= */}
      <div className="relative shrink-0 z-30 font-mono-tech text-xs bg-[#031320]/95 border-t border-cyan-500/30">
        {/* Toggle Collapse Header */}
        <div className="flex items-center justify-between px-3 py-1 bg-[#020b14] border-b border-cyan-500/20 text-[10px] text-cyan-400/80">
          <div className="flex items-center gap-2">
            <span className="font-bold text-cyan-300 uppercase">3D STONIC VIRTUAL OFFICE CONTROLS</span>
            <span className="hidden sm:inline text-slate-500">| Left-Click Drag: Rotate | Scroll: Zoom | Right-Click: Pan</span>
          </div>
          <button
            onClick={() => setIsBottomDockCollapsed(!isBottomDockCollapsed)}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-cyan-900/40 text-cyan-300 cursor-pointer"
          >
            {isBottomDockCollapsed ? (
              <>
                <span>SHOW CONTROLS</span>
                <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>HIDE CONTROLS</span>
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        </div>

        {!isBottomDockCollapsed && (
          <div className="flex flex-wrap items-center justify-between px-3 py-1.5 gap-2">
            {/* Left Side: Camera Presets */}
            <div className="flex items-center gap-1 bg-[#020e18] border border-cyan-500/30 rounded-lg p-0.5">
              {(['OVERVIEW', 'ALICE', 'BOB', 'CAROL', 'DAVE', 'CONFERENCE', 'ZEN'] as CameraPreset[]).map((preset) => {
                const isActive = currentPreset === preset;
                return (
                  <button
                    key={preset}
                    onClick={() => setCameraPreset(preset)}
                    className={`px-3 py-1 rounded transition-all cursor-pointer font-bold ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_#00f0ff]'
                        : 'text-cyan-400/80 hover:text-cyan-100 hover:bg-cyan-950/40'
                    }`}
                  >
                    [{preset}]
                  </button>
                );
              })}
            </div>

            {/* Right Side: Quick Action Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Carol Water */}
              <button
                onClick={() => {
                  setCameraPreset('CAROL');
                  triggerAgentSpeech(
                    'carol',
                    'Water cooler te hydration break chal rahi hey, stream health 100% hey!',
                    'Taking hydration break. Kafka stream velocity is nominal.'
                  );
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#02182b] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 cursor-pointer font-bold"
              >
                <Coffee className="w-3.5 h-3.5 text-emerald-400" />
                <span>[CAROL WATER]</span>
              </button>

              {/* Bob Servers */}
              <button
                onClick={() => {
                  setCameraPreset('BOB');
                  triggerAgentSpeech(
                    'bob',
                    'Server rack cluster te diagnostic probes scan ho chukay han, 0 anomalies!',
                    'Server diagnostics verified. Ingress perimeter fully secured.'
                  );
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#02182b] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 cursor-pointer font-bold"
              >
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span>[BOB SERVERS]</span>
              </button>

              {/* Dave Cloud */}
              <button
                onClick={() => {
                  setCameraPreset('DAVE');
                  triggerAgentSpeech(
                    'dave',
                    'Kubernetes cloud cluster auto-scale pods green han, CPU 34% optimal!',
                    'Kubernetes cluster verified. 16 worker nodes reporting healthy.'
                  );
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#02182b] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 cursor-pointer font-bold"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-400" />
                <span>[DAVE CLOUD]</span>
              </button>

              {/* Alice Intel */}
              <button
                onClick={() => {
                  setCameraPreset('ALICE');
                  triggerAgentSpeech(
                    'alice',
                    'Sector-9 satellite orbital telemetry compile ho chuki hey, dossier ready!',
                    'Sector-9 reconnaissance telemetry compiled into executive dossier.'
                  );
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-pink-950/60 border border-pink-400/50 text-pink-200 hover:bg-pink-900/50 cursor-pointer font-bold"
              >
                <FileText className="w-3.5 h-3.5 text-pink-300" />
                <span>[ALICE INTEL]</span>
              </button>

              {/* Instant Colleague Discussion */}
              <button
                onClick={() => {
                  triggerAgentSpeech(
                    'alice',
                    'Ada Bob, Sector-9 satellite da encrypted firewall link verify thia hey?',
                    'Bob, did you verify the satellite encryption link?'
                  );
                  setTimeout(() => {
                    triggerAgentSpeech(
                      'bob',
                      'Haan Alice Baji! Port 8080 te mTLS bilkul tight hey, zero packet loss hey.',
                      'Yes Alice! Port 8080 mTLS is enforced with zero packet loss.'
                    );
                  }, 4000);
                }}
                className="flex items-center gap-1 px-3 py-1 rounded bg-emerald-500/25 border border-emerald-400 text-emerald-200 hover:bg-emerald-500/40 cursor-pointer font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>DISCUSS NOW</span>
              </button>

              {/* Crypto Hubs */}
              {onOpenCryptoMarket && (
                <button
                  onClick={onOpenCryptoMarket}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-400/60 text-emerald-200 hover:bg-emerald-900/80 cursor-pointer font-bold shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>[📈 CRYPTO MARKET]</span>
                </button>
              )}

              {onOpenCryptoMarketing && (
                <button
                  onClick={onOpenCryptoMarketing}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-950/70 border border-amber-400/60 text-amber-200 hover:bg-amber-900/80 cursor-pointer font-bold shadow-[0_0_10px_rgba(245,158,11,0.25)]"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>[🚀 CRYPTO MARKETING]</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= 4. SLIDE-OVER TERMINAL DRAWER ================= */}
      {isTerminalOpen && (
        <div className="absolute inset-x-2 bottom-12 max-h-[50%] z-40 bg-[#020d18]/98 border border-cyan-400/80 rounded-xl flex flex-col overflow-hidden shadow-[0_0_35px_rgba(0,240,255,0.35)] font-mono-tech backdrop-blur-md">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#031c2e] border-b border-cyan-500/30">
            <div className="flex items-center gap-2 text-xs text-cyan-200 font-bold">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: AGENTS_META[selectedAgentId].dotColor }}
              />
              <span>{AGENTS_META[selectedAgentId].name.toUpperCase()} // LIVE AGENT TERMINAL</span>
              <span className="text-[10px] text-emerald-400 ml-2">● ONLINE</span>
            </div>
            <button
              onClick={() => setIsTerminalOpen(false)}
              className="text-cyan-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-1 text-xs leading-relaxed bg-[#010a12]">
            <p className="text-cyan-400 font-bold">[SYSTEM] Stonic 3D Agent Office Stage Initialized</p>
            <p className="text-slate-300">&gt; Target Agent: {AGENTS_META[selectedAgentId].name} ({AGENTS_META[selectedAgentId].role})</p>
            <p className="text-cyan-300">&gt; Telemetry: {AGENTS_META[selectedAgentId].telemetry}</p>
            <p className="text-slate-400">&gt; Current Directive: "{AGENTS_META[selectedAgentId].currentTask}"</p>
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
              if (terminalInput.trim()) {
                handleDispatchDirective(terminalInput.trim());
                setTerminalInput('');
              }
            }}
            className="flex items-center gap-2 p-2 bg-[#021524] border-t border-cyan-500/30"
          >
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder={`Assign directive to ${AGENTS_META[selectedAgentId].name}...`}
              disabled={isExecutingTask}
              className="flex-1 px-3 py-1.5 rounded bg-[#010810] border border-cyan-500/40 text-cyan-100 text-xs focus:outline-none focus:border-cyan-300"
            />
            <button
              type="submit"
              disabled={isExecutingTask || !terminalInput.trim()}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-cyan-500/30 border border-cyan-400 text-cyan-100 text-xs font-bold hover:bg-cyan-500/50 cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>DISPATCH</span>
            </button>
          </form>
        </div>
      )}

      {/* ================= 5. MULTI-AGENT MISSION MODAL ================= */}
      <MultiAgentMissionModal
        isOpen={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        onDispatchMissionTo3D={handleDispatchMissionTo3D}
        onSpeakText={(text, aid) => triggerAgentSpeech(aid, text, 'Executive briefing in progress.')}
      />

      {/* ================= 6. AGENT INSPECTOR DRAWER ================= */}
      <AgentInspectorDrawer
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        agentId={selectedAgentId}
        agentMeta={AGENTS_META[selectedAgentId]}
        onDispatchDirective={handleDispatchDirective}
        onTriggerVoice={(u, e) => triggerAgentSpeech(selectedAgentId, u, e)}
        onFlyToAgent={() => setCameraPreset(selectedAgentId.toUpperCase() as CameraPreset)}
        isExecuting={isExecutingTask}
        lastExecutionOutput={lastOutputs[selectedAgentId]}
      />
    </div>
  );
};
