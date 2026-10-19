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
  MessageSquare,
  Sparkles,
  Radio,
  Coffee,
  Shield,
  FileText,
  Database,
  Cloud,
  Layers,
  Globe,
  Zap,
  RotateCcw,
  Activity,
  Bot,
  Play,
  Pause,
} from 'lucide-react';
import {
  speakAgentDialogue,
  subscribeLipSync,
  playRadioChirp,
  playConfirmChime,
  LipSyncData,
} from '../../utils/audioEffects';

interface AgentOffice3DProps {
  onSelectAgent?: (agentId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  externalTaskTrigger?: { agentId: string; task: string } | null;
  onBackToDashboard?: () => void;
  onOpenCryptoMarket?: () => void;
  onOpenCryptoMarketing?: () => void;
  userEmotion?: any;
}

type CameraPreset = 'OVERVIEW' | 'ALICE' | 'BOB' | 'CAROL' | 'DAVE' | 'MEETING';

interface AgentMetadata {
  id: 'alice' | 'bob' | 'carol' | 'dave';
  name: string;
  role: string;
  statusTag: string;
  dotColor: string;
  currentTask: string;
  telemetry: string;
  deskPos: [number, number, number];
}

const AGENTS_META: Record<'alice' | 'bob' | 'carol' | 'dave', AgentMetadata> = {
  alice: {
    id: 'alice',
    name: 'Alice',
    role: 'Intel & Content Specialist',
    statusTag: 'Drafting Intel',
    dotColor: '#00f0ff',
    currentTask: 'Compiling Sector-9 satellite reconnaissance dossier',
    telemetry: 'SAT-LINK 99.8% Locked | Elevation 42.1°',
    deskPos: [-3.8, 0, 1.2],
  },
  bob: {
    id: 'bob',
    name: 'Bob',
    role: 'Security & Firewall Sentinel',
    statusTag: 'Firewall Audit',
    dotColor: '#38bdf8',
    currentTask: 'Subnet 192.168.1.0/24 Port Hardening & Intrusion Mitigation',
    telemetry: 'TLS 1.3 Active | 0 Unauthorized Drops',
    deskPos: [-3.8, 0, -3.8],
  },
  carol: {
    id: 'carol',
    name: 'Carol',
    role: 'Data & R2 Pipelines Engineer',
    statusTag: 'Data Pipelines',
    dotColor: '#10b981',
    currentTask: 'Ingesting 1.42M events/sec via Kafka & ClickHouse Stream',
    telemetry: 'ETL Velocity 1.42M ev/s | Latency 8.2ms',
    deskPos: [3.8, 0, -3.8],
  },
  dave: {
    id: 'dave',
    name: 'Dave',
    role: 'Infrastructure & Server Auditor',
    statusTag: 'Server Audit',
    dotColor: '#fbbf24',
    currentTask: 'Auditing 16 Kubernetes Pods across Cilium eBPF Mesh',
    telemetry: 'K8s 16/16 Healthy | CPU 34% Nominal',
    deskPos: [3.8, 0, 1.2],
  },
};

const CAMERA_TARGETS: Record<
  CameraPreset,
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  OVERVIEW: { pos: [0, 4.6, 9.2], target: [0, 1.2, 0] },
  ALICE: { pos: [-2.2, 2.2, 3.2], target: [-3.8, 1.3, 1.2] },
  BOB: { pos: [-2.4, 2.6, -1.8], target: [-3.8, 1.8, -3.8] },
  CAROL: { pos: [2.2, 2.4, -1.8], target: [3.8, 1.6, -3.8] },
  DAVE: { pos: [2.2, 2.2, 3.2], target: [3.8, 1.3, 1.2] },
  MEETING: { pos: [0, 3.2, 3.8], target: [0, 1.4, 0] },
};

// Procedural Canvas Texture Generators
function createWoodFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Warm rich walnut background
  ctx.fillStyle = '#1c1511';
  ctx.fillRect(0, 0, 1024, 1024);

  // Parquet plank stripes
  const plankHeight = 32;
  const plankWidth = 128;
  for (let y = 0; y < 1024; y += plankHeight) {
    const shift = (Math.floor(y / plankHeight) % 2) * (plankWidth / 2);
    for (let x = -plankWidth; x < 1024 + plankWidth; x += plankWidth) {
      const variance = (Math.sin(x * 12.3 + y * 45.6) + 1) * 0.5;
      const r = Math.floor(28 + variance * 16);
      const g = Math.floor(20 + variance * 12);
      const b = Math.floor(14 + variance * 8);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x + shift, y, plankWidth - 2, plankHeight - 2);

      // Fine wood grain lines
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(x + shift, y + 8, plankWidth - 2, 1);
      ctx.fillRect(x + shift, y + 18, plankWidth - 2, 1);
    }
  }

  // Soft ambient specular highlight
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, 'rgba(0, 240, 255, 0.04)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, 'rgba(16, 185, 129, 0.03)');
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

  // Deep night sky gradient with cyber glow
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  skyGrad.addColorStop(0, '#02050b');
  skyGrad.addColorStop(0.5, '#061324');
  skyGrad.addColorStop(0.85, '#0c223a');
  skyGrad.addColorStop(1, '#163b5c');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Stars
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 350; i++) {
    const sx = Math.random() * 2048;
    const sy = Math.random() * 500;
    const r = Math.random() * 1.5;
    ctx.globalAlpha = 0.3 + Math.random() * 0.7;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // Distant glowing city skyscrapers
  const colors = ['#00f0ff', '#38bdf8', '#818cf8', '#ec4899', '#f59e0b', '#10b981'];
  for (let i = 0; i < 70; i++) {
    const bx = (i / 70) * 2048 + (Math.random() * 20 - 10);
    const bw = 24 + Math.random() * 45;
    const bh = 220 + Math.random() * 420;
    const by = 1024 - bh;

    // Building silhouette
    const bGrad = ctx.createLinearGradient(bx, by, bx, 1024);
    bGrad.addColorStop(0, '#0a1726');
    bGrad.addColorStop(1, '#030811');
    ctx.fillStyle = bGrad;
    ctx.fillRect(bx, by, bw, bh);

    // Glowing window grid
    const winColor = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillStyle = winColor;
    for (let wy = by + 12; wy < 1000; wy += 9) {
      for (let wx = bx + 4; wx < bx + bw - 4; wx += 6) {
        if (Math.random() > 0.45) {
          ctx.globalAlpha = 0.25 + Math.random() * 0.7;
          ctx.fillRect(wx, wy, 3, 4);
        }
      }
    }

    // Rooftop antenna with blinking beacon
    ctx.fillStyle = '#ff3366';
    ctx.globalAlpha = 0.9;
    ctx.fillRect(bx + bw / 2 - 1, by - 16, 2, 16);
    ctx.beginPath();
    ctx.arc(bx + bw / 2, by - 16, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  // Elevated traffic light ribbons
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(0, 960);
  ctx.bezierCurveTo(600, 940, 1400, 980, 2048, 950);
  ctx.stroke();

  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 975);
  ctx.bezierCurveTo(700, 990, 1300, 950, 2048, 970);
  ctx.stroke();
  ctx.globalAlpha = 1.0;

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

  // Header bar
  ctx.fillStyle = '#041c2c';
  ctx.fillRect(0, 0, 512, 32);
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 14px monospace';
  ctx.fillText(`● [STONIC] // ${title}`, 12, 22);

  if (mode === 'matrix' || mode === 'code') {
    ctx.fillStyle = accentColor;
    ctx.font = '11px monospace';
    ctx.globalAlpha = 0.85;
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
    // Throughput bars
    ctx.fillStyle = accentColor;
    for (let i = 0; i < 20; i++) {
      const h = 20 + Math.sin(i * 0.8) * 45 + 30;
      ctx.fillRect(20 + i * 23, 210 - h, 16, h);
    }
    ctx.font = 'bold 12px monospace';
    ctx.fillText('RATE: 1.42M events/sec | BUFFER: 18%', 20, 238);
  } else if (mode === 'pods') {
    // K8s grid
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
  userEmotion,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Active View & Camera State
  const [currentPreset, setCurrentPreset] = useState<CameraPreset>('OVERVIEW');
  const [selectedAgentId, setSelectedAgentId] = useState<'alice' | 'bob' | 'carol' | 'dave'>('alice');
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);
  const [speakingAgentId, setSpeakingAgentId] = useState<string | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceMode, setVoiceMode] = useState<'native_urdu_hindi' | 'english_clear'>('native_urdu_hindi');
  const [terminalInput, setTerminalInput] = useState('');
  const [isExecutingTask, setIsExecutingTask] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Autonomous Banter Toggle
  const [autonomousChat, setAutonomousChat] = useState(true);

  // References for Three.js animations
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Animated Objects
  const earthGlobeRef = useRef<THREE.Group | null>(null);
  const orbitRing1Ref = useRef<THREE.Line | null>(null);
  const orbitRing2Ref = useRef<THREE.Line | null>(null);
  const agentRigsRef = useRef<Record<string, {
    group: THREE.Group;
    head: THREE.Group;
    leftArm: THREE.Object3D;
    rightArm: THREE.Object3D;
    jaw?: THREE.Mesh;
    badgeMesh?: THREE.Sprite;
    basePos: [number, number, number];
    state: 'typing' | 'standing' | 'walking' | 'speaking';
    walkProgress?: number;
  }>>({});

  // Real-time lip-sync state
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

  // Switch camera preset
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

  // Trigger agent dialogue with lip-sync and camera turn
  const triggerAgentSpeech = useCallback(
    (agentId: 'alice' | 'bob' | 'carol' | 'dave', saraikiText: string, englishSummary: string) => {
      setSpeakingAgentId(agentId);
      setActiveSpeechText(saraikiText);

      // Play chime & voice
      if (soundEnabled) {
        const text = voiceMode === 'native_urdu_hindi' ? saraikiText : englishSummary;
        speakAgentDialogue(text, agentId, voiceMode);
      }

      setNotification(`${AGENTS_META[agentId].name} is speaking...`);

      // Reset after speech duration
      const duration = Math.max(3500, saraikiText.length * 75);
      setTimeout(() => {
        setSpeakingAgentId((cur) => (cur === agentId ? null : cur));
        setActiveSpeechText(null);
      }, duration);
    },
    [soundEnabled, voiceMode]
  );

  // Subscribe to lip-sync
  useEffect(() => {
    const unsub = subscribeLipSync((speakerId, data) => {
      currentLipSyncRef.current = data;
    });
    return unsub;
  }, []);

  // Handle external tasks
  useEffect(() => {
    if (externalTaskTrigger && externalTaskTrigger.agentId in AGENTS_META) {
      const aid = externalTaskTrigger.agentId as any;
      setSelectedAgentId(aid);
      setCameraPreset(aid.toUpperCase() as CameraPreset);
      triggerAgentSpeech(
        aid,
        `Ji Janab! Directive "${externalTaskTrigger.task}" receive thaye te kaam shuru ho chuka hey.`,
        `Directive acknowledged: "${externalTaskTrigger.task}". Executing.`
      );
    }
  }, [externalTaskTrigger, setCameraPreset, triggerAgentSpeech]);

  // Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#02060f');
    scene.fog = new THREE.FogExp2('#030c18', 0.025);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      150
    );
    camera.position.set(...CAMERA_TARGETS.OVERVIEW.pos);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't dip below floor
    controls.minDistance = 2.0;
    controls.maxDistance = 25.0;
    controls.target.set(0, 1.2, 0);
    controlsRef.current = controls;

    // 5. Lighting Rig
    const ambientLight = new THREE.AmbientLight('#162b45', 1.8);
    scene.add(ambientLight);

    // Main central warm/cyan ceiling light
    const ceilingSpot = new THREE.SpotLight('#00f0ff', 4.5, 25, Math.PI / 3, 0.4, 1.2);
    ceilingSpot.position.set(0, 8, 0);
    ceilingSpot.target.position.set(0, 0, 0);
    ceilingSpot.castShadow = true;
    ceilingSpot.shadow.mapSize.width = 1024;
    ceilingSpot.shadow.mapSize.height = 1024;
    scene.add(ceilingSpot);
    scene.add(ceilingSpot.target);

    // Warm desk wash lights
    const warmLight = new THREE.PointLight('#fed7aa', 1.5, 12);
    warmLight.position.set(0, 4, 3);
    scene.add(warmLight);

    // Cyberpunk window backlight
    const windowRimLight = new THREE.DirectionalLight('#38bdf8', 2.0);
    windowRimLight.position.set(0, 5, -15);
    scene.add(windowRimLight);

    // 6. Architecture & Room Geometry
    // 6.1 Wooden Parquet Floor
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      map: createWoodFloorTexture(),
      roughness: 0.35,
      metalness: 0.25,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 6.2 Ceiling with Glowing Linear LED Panels
    const ceilingGeo = new THREE.PlaneGeometry(24, 24);
    const ceilingMat = new THREE.MeshStandardMaterial({ color: '#050c18', roughness: 0.8 });
    const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceilingMesh.position.y = 6.0;
    ceilingMesh.rotation.x = Math.PI / 2;
    scene.add(ceilingMesh);

    // Recessed LED Bars on ceiling
    for (let x = -6; x <= 6; x += 4) {
      const ledGeo = new THREE.BoxGeometry(0.3, 0.05, 14);
      const ledMat = new THREE.MeshBasicMaterial({ color: '#cffafe' });
      const ledMesh = new THREE.Mesh(ledGeo, ledMat);
      ledMesh.position.set(x, 5.95, 0);
      scene.add(ledMesh);
    }

    // 6.3 Panoramic Glass Window Wall & City Backdrop (Z = -11)
    const backdropGeo = new THREE.PlaneGeometry(36, 16);
    const backdropMat = new THREE.MeshBasicMaterial({
      map: createCityBackdropTexture(),
    });
    const backdropMesh = new THREE.Mesh(backdropGeo, backdropMat);
    backdropMesh.position.set(0, 5, -12);
    scene.add(backdropMesh);

    // Panoramic Window Frames (Mullions)
    const mullionMat = new THREE.MeshStandardMaterial({ color: '#09131f', metalness: 0.8, roughness: 0.2 });
    for (let x = -10; x <= 10; x += 4) {
      const vertMullion = new THREE.Mesh(new THREE.BoxGeometry(0.18, 6.2, 0.2), mullionMat);
      vertMullion.position.set(x, 3, -11.5);
      scene.add(vertMullion);
    }
    const horizMullion = new THREE.Mesh(new THREE.BoxGeometry(24, 0.18, 0.2), mullionMat);
    horizMullion.position.set(0, 3, -11.5);
    scene.add(horizMullion);

    // 7. Central Holographic Conference Table
    const tableGroup = new THREE.Group();
    // Glass Table Top
    const tableTopGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.08, 48);
    const tableTopMat = new THREE.MeshPhysicalMaterial({
      color: '#081a28',
      transmission: 0.85,
      opacity: 0.9,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
      reflectivity: 0.9,
    });
    const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
    tableTop.position.y = 1.0;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    tableGroup.add(tableTop);

    // Table Bevel Ring
    const tableRingGeo = new THREE.TorusGeometry(2.2, 0.03, 16, 64);
    const tableRingMat = new THREE.MeshStandardMaterial({ color: '#00f0ff', emissive: '#00f0ff', emissiveIntensity: 0.6 });
    const tableRing = new THREE.Mesh(tableRingGeo, tableRingMat);
    tableRing.rotation.x = Math.PI / 2;
    tableRing.position.y = 1.0;
    tableGroup.add(tableRing);

    // Chrome Base Pedestal
    const baseGeo = new THREE.CylinderGeometry(0.5, 0.9, 1.0, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.9, roughness: 0.1 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.5;
    baseMesh.castShadow = true;
    tableGroup.add(baseMesh);

    scene.add(tableGroup);

    // 8. Holographic Centerpiece (Floating Earth Globe)
    const holoGroup = new THREE.Group();
    holoGroup.position.set(0, 1.8, 0);

    // Wireframe Globe
    const globeGeo = new THREE.SphereGeometry(0.55, 24, 16);
    const globeWireMat = new THREE.MeshBasicMaterial({
      color: '#00f0ff',
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeWireMat);
    holoGroup.add(globeMesh);

    // Particle Cloud Inside Globe
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 0.52;
      particlePos[i] = r * Math.sin(phi) * Math.cos(theta);
      particlePos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePos[i + 2] = r * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: '#38bdf8',
      size: 0.025,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    holoGroup.add(particles);

    // Rotating Orbital Ring 1
    const ring1Geo = new THREE.RingGeometry(0.72, 0.75, 48);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: '#00f0ff',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    holoGroup.add(ring1);
    orbitRing1Ref.current = ring1 as any;

    // Rotating Orbital Ring 2
    const ring2Geo = new THREE.RingGeometry(0.85, 0.87, 48);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: '#10b981',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    holoGroup.add(ring2);
    orbitRing2Ref.current = ring2 as any;

    earthGlobeRef.current = holoGroup;
    scene.add(holoGroup);

    // 9. Workstations Construction Helper
    const createWorkstation = (
      agentKey: 'alice' | 'bob' | 'carol' | 'dave',
      x: number,
      z: number,
      rotationY: number
    ) => {
      const station = new THREE.Group();
      station.position.set(x, 0, z);
      station.rotation.y = rotationY;

      // Tempered Glass Curved Desk
      const deskGeo = new THREE.BoxGeometry(2.4, 0.08, 1.1);
      const deskMat = new THREE.MeshPhysicalMaterial({
        color: '#0a1d2e',
        transmission: 0.6,
        transparent: true,
        roughness: 0.1,
      });
      const deskMesh = new THREE.Mesh(deskGeo, deskMat);
      deskMesh.position.y = 0.95;
      deskMesh.castShadow = true;
      deskMesh.receiveShadow = true;
      station.add(deskMesh);

      // Matte Black Metal Legs
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.95);
      const legMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.8 });
      [
        [-1.1, 0.47, -0.45],
        [1.1, 0.47, -0.45],
        [-1.1, 0.47, 0.45],
        [1.1, 0.47, 0.45],
      ].forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        station.add(leg);
      });

      // Dual Curved Holographic Ultrawide Monitors
      const monGeo = new THREE.BoxGeometry(0.9, 0.5, 0.04);

      // Monitor 1 (Left)
      const mon1Mat = new THREE.MeshBasicMaterial({
        map: createTerminalScreenTexture(
          agentKey === 'alice' ? 'SATELLITE INTEL' : agentKey === 'bob' ? 'FIREWALL MATRIX' : 'STREAM ETL',
          AGENTS_META[agentKey].dotColor,
          agentKey === 'alice' ? 'matrix' : agentKey === 'bob' ? 'code' : 'analytics'
        ),
      });
      const mon1 = new THREE.Mesh(monGeo, mon1Mat);
      mon1.position.set(-0.48, 1.35, -0.2);
      mon1.rotation.y = 0.2;
      station.add(mon1);

      // Monitor 2 (Right)
      const mon2Mat = new THREE.MeshBasicMaterial({
        map: createTerminalScreenTexture(
          agentKey === 'dave' ? 'K8S POD MESH' : 'DIAGNOSTICS',
          AGENTS_META[agentKey].dotColor,
          agentKey === 'dave' ? 'pods' : 'analytics'
        ),
      });
      const mon2 = new THREE.Mesh(monGeo, mon2Mat);
      mon2.position.set(0.48, 1.35, -0.2);
      mon2.rotation.y = -0.2;
      station.add(mon2);

      // Ergonomic Mesh Office Chair
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0, 0, 0.55);

      const seatGeo = new THREE.BoxGeometry(0.65, 0.08, 0.6);
      const chairMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.7 });
      const seat = new THREE.Mesh(seatGeo, chairMat);
      seat.position.y = 0.58;
      chairGroup.add(seat);

      const backGeo = new THREE.BoxGeometry(0.6, 0.75, 0.06);
      const back = new THREE.Mesh(backGeo, chairMat);
      back.position.set(0, 0.95, 0.28);
      chairGroup.add(back);

      station.add(chairGroup);
      scene.add(station);
    };

    createWorkstation('alice', -3.8, 1.2, Math.PI / 4);
    createWorkstation('bob', -3.8, -3.8, Math.PI / 3);
    createWorkstation('carol', 3.8, -3.8, -Math.PI / 3);
    createWorkstation('dave', 3.8, 1.2, -Math.PI / 4);

    // 10. Water Cooler Dispenser (near Carol's station)
    const coolerGroup = new THREE.Group();
    coolerGroup.position.set(5.2, 0, -2.5);
    const coolerBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 1.2, 0.5),
      new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.3 })
    );
    coolerBody.position.y = 0.6;
    coolerGroup.add(coolerBody);

    const bottleGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 24);
    const bottleMat = new THREE.MeshPhysicalMaterial({ color: '#38bdf8', transmission: 0.9, transparent: true });
    const bottle = new THREE.Mesh(bottleGeo, bottleMat);
    bottle.position.y = 1.45;
    coolerGroup.add(bottle);
    scene.add(coolerGroup);

    // 11. Living 3D Procedural Character Avatars
    const createCharacterAvatar = (agentKey: 'alice' | 'bob' | 'carol' | 'dave') => {
      const charGroup = new THREE.Group();
      const meta = AGENTS_META[agentKey];

      // Body skin & attire materials
      const skinMat = new THREE.MeshStandardMaterial({ color: '#fed7aa', roughness: 0.6 });
      const suitMat = new THREE.MeshStandardMaterial({
        color: agentKey === 'alice' ? '#0f172a' : agentKey === 'bob' ? '#1e293b' : agentKey === 'carol' ? '#7c2d12' : '#1e3a8a',
        roughness: 0.5,
      });

      // Torso / Chest
      const torsoGeo = new THREE.BoxGeometry(0.42, 0.52, 0.24);
      const torso = new THREE.Mesh(torsoGeo, suitMat);
      torso.position.y = 1.0;
      charGroup.add(torso);

      // Neck & Head
      const headGroup = new THREE.Group();
      headGroup.position.y = 1.42;

      const headGeo = new THREE.BoxGeometry(0.26, 0.3, 0.26);
      const head = new THREE.Mesh(headGeo, skinMat);
      headGroup.add(head);

      // Hair
      const hairMat = new THREE.MeshStandardMaterial({
        color: agentKey === 'alice' ? '#171717' : agentKey === 'bob' ? '#292524' : agentKey === 'carol' ? '#9a3412' : '#451a03',
      });
      const hairGeo = new THREE.BoxGeometry(0.28, 0.12, 0.28);
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.y = 0.16;
      headGroup.add(hair);

      // Jaw/Mouth (animates open/close with real speech)
      const jawGeo = new THREE.BoxGeometry(0.12, 0.04, 0.05);
      const jawMat = new THREE.MeshStandardMaterial({ color: '#991b1b' });
      const jaw = new THREE.Mesh(jawGeo, jawMat);
      jaw.position.set(0, -0.09, 0.13);
      headGroup.add(jaw);

      charGroup.add(headGroup);

      // Arms (Left & Right)
      const armGeo = new THREE.BoxGeometry(0.11, 0.45, 0.11);
      const leftArm = new THREE.Mesh(armGeo, suitMat);
      leftArm.position.set(-0.28, 0.95, 0);
      charGroup.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, suitMat);
      rightArm.position.set(0.28, 0.95, 0);
      charGroup.add(rightArm);

      // Floating Nameplate Canvas Badge above Agent
      const badgeCanvas = document.createElement('canvas');
      badgeCanvas.width = 256;
      badgeCanvas.height = 80;
      const bctx = badgeCanvas.getContext('2d')!;
      bctx.fillStyle = '#021320';
      bctx.fillRect(0, 0, 256, 80);
      bctx.strokeStyle = meta.dotColor;
      bctx.lineWidth = 4;
      bctx.strokeRect(2, 2, 252, 76);
      bctx.fillStyle = '#ffffff';
      bctx.font = 'bold 24px monospace';
      bctx.fillText(meta.name.toUpperCase(), 16, 36);
      bctx.fillStyle = meta.dotColor;
      bctx.font = '16px monospace';
      bctx.fillText(meta.statusTag, 16, 62);

      const badgeTex = new THREE.CanvasTexture(badgeCanvas);
      const badgeSpriteMat = new THREE.SpriteMaterial({ map: badgeTex, transparent: true });
      const badgeSprite = new THREE.Sprite(badgeSpriteMat);
      badgeSprite.scale.set(1.2, 0.4, 1);
      badgeSprite.position.set(0, 1.95, 0);
      charGroup.add(badgeSprite);

      // Position character in their specific scenario
      let state: 'typing' | 'standing' | 'walking' | 'speaking' = 'typing';
      if (agentKey === 'alice') {
        charGroup.position.set(-3.8, 0, 1.7);
        charGroup.rotation.y = Math.PI / 4;
        state = 'typing';
      } else if (agentKey === 'bob') {
        charGroup.position.set(-4.5, 0, -3.2);
        charGroup.rotation.y = Math.PI / 2.5;
        state = 'standing';
      } else if (agentKey === 'carol') {
        charGroup.position.set(2.8, 0, -2.5);
        charGroup.rotation.y = -Math.PI / 2;
        state = 'walking';
      } else if (agentKey === 'dave') {
        charGroup.position.set(3.8, 0, 1.7);
        charGroup.rotation.y = -Math.PI / 4;
        state = 'typing';
      }

      scene.add(charGroup);

      agentRigsRef.current[agentKey] = {
        group: charGroup,
        head: headGroup,
        leftArm,
        rightArm,
        jaw,
        badgeMesh: badgeSprite,
        basePos: [charGroup.position.x, charGroup.position.y, charGroup.position.z],
        state,
        walkProgress: 0,
      };
    };

    createCharacterAvatar('alice');
    createCharacterAvatar('bob');
    createCharacterAvatar('carol');
    createCharacterAvatar('dave');

    // 12. Animation Loop (60 FPS Performance)
    let clock = new THREE.Clock();
    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Smooth Camera Lerp
      camera.position.lerp(targetCamPos.current, 0.04);
      controls.target.lerp(targetCamLook.current, 0.04);
      controls.update();

      // Rotate Hologram Earth & Orbit Rings
      if (earthGlobeRef.current) {
        earthGlobeRef.current.rotation.y = time * 0.45;
        earthGlobeRef.current.position.y = 1.8 + Math.sin(time * 1.5) * 0.05;
      }
      if (orbitRing1Ref.current) orbitRing1Ref.current.rotation.z = time * 0.6;
      if (orbitRing2Ref.current) orbitRing2Ref.current.rotation.z = -time * 0.5;

      // Animate Living 3D Agent Avatars
      Object.entries(agentRigsRef.current).forEach(([key, rig]) => {
        const isSpeaking = speakingAgentId === key;
        const lip = currentLipSyncRef.current;

        // Subtle breathing for all agents
        rig.group.position.y = Math.sin(time * 2.0 + (key.charCodeAt(0) % 5)) * 0.015;

        // Speaking Reaction (Turn head toward user camera + mouth jaw motion)
        if (isSpeaking) {
          rig.head.rotation.y = Math.sin(time * 3.0) * 0.15;
          rig.head.rotation.x = Math.sin(time * 4.0) * 0.08;

          // Mouth jaw drops in sync with audio phonemes
          if (rig.jaw) {
            rig.jaw.position.y = -0.09 - (lip.isOpen ? lip.openRatio * 0.06 : 0);
          }

          // Hand gestures while speaking
          rig.rightArm.rotation.x = -0.6 + Math.sin(time * 6.0) * 0.25;
          return;
        }

        // Default Character Action Loops
        if (key === 'alice') {
          // Alice: Typing at mechanical keyboard, head nodding to monitor data
          rig.head.rotation.y = Math.sin(time * 0.8) * 0.12;
          rig.head.rotation.x = -0.1 + Math.sin(time * 1.6) * 0.04;
          rig.leftArm.rotation.x = -0.8 + Math.sin(time * 12.0) * 0.08;
          rig.rightArm.rotation.x = -0.8 + Math.cos(time * 12.0) * 0.08;
        } else if (key === 'bob') {
          // Bob: Standing with tablet, checking tablet, looking out window
          const lookWindow = Math.sin(time * 0.4) > 0.3;
          rig.head.rotation.y = lookWindow ? -0.4 : 0.1;
          rig.head.rotation.x = lookWindow ? 0.0 : -0.25;
          // Left arm holds tablet
          rig.leftArm.rotation.x = -0.9;
          rig.rightArm.rotation.x = -0.6 + Math.sin(time * 1.5) * 0.1;
        } else if (key === 'carol') {
          // Carol: Patrol loop walking smoothly between meeting table and workstation
          const walkCycle = Math.sin(time * 0.6);
          const px = THREE.MathUtils.lerp(1.2, 3.8, (walkCycle + 1) * 0.5);
          const pz = THREE.MathUtils.lerp(-0.8, -3.2, (walkCycle + 1) * 0.5);
          rig.group.position.set(px, 0, pz);
          rig.group.rotation.y = walkCycle > 0 ? -Math.PI / 3 : (2 * Math.PI) / 3;

          // Striding arms
          rig.leftArm.rotation.x = Math.sin(time * 4.0) * 0.4;
          rig.rightArm.rotation.x = -Math.sin(time * 4.0) * 0.4;
        } else if (key === 'dave') {
          // Dave: Fast typing and mouse scrolling between two curved screens
          rig.head.rotation.y = Math.sin(time * 1.2) * 0.25;
          rig.leftArm.rotation.x = -0.85 + Math.sin(time * 14.0) * 0.06;
          rig.rightArm.rotation.x = -0.75 + Math.sin(time * 3.0) * 0.05;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 13. Window Resize Handler
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
    }, 20000);
    return () => clearInterval(timer);
  }, [autonomousChat, speakingAgentId, triggerAgentSpeech]);

  // Execute terminal directive
  const handleDispatchTask = async () => {
    const text = terminalInput.trim();
    if (!text || isExecutingTask) return;

    setIsExecutingTask(true);
    playConfirmChime();

    triggerAgentSpeech(
      selectedAgentId,
      `Hukum janab! "${text}" te foran action shuru kar ditta hey.`,
      `Directive acknowledged: "${text}". Action in progress.`
    );

    try {
      const res = await fetch('/api/admin/agent-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgentId,
          instruction: text,
          context: { currentTask: AGENTS_META[selectedAgentId].currentTask },
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
      console.warn(err);
    } finally {
      setIsExecutingTask(false);
      setTerminalInput('');
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#02070e] text-[#dcf4fb] overflow-hidden select-none font-sans">
      {/* ================= 1. TOP TACTICAL NAVIGATION BAR (EXACT REFERENCE DESIGN) ================= */}
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

          {/* Stonic Navigation Tabs */}
          <span className="px-2.5 py-1 text-cyan-400/80 hidden lg:inline">SAT-LINK</span>
          <span className="px-2.5 py-1 text-cyan-400/80 hidden lg:inline">NEURAL CORE</span>
          <span className="px-3 py-1 rounded-md bg-cyan-500/25 border-2 border-cyan-300 text-cyan-100 font-bold shadow-[0_0_12px_#00f0ff]">
            AGENTS 3D
          </span>
          <span className="px-2.5 py-1 text-cyan-400/80 hidden lg:inline">VOICE</span>

          <div className="h-4 w-px bg-cyan-500/30 mx-1 hidden sm:inline" />

          {/* Agent Status Pills */}
          {Object.values(AGENTS_META).map((agent) => {
            const isSpeaking = speakingAgentId === agent.id;
            const isSelected = selectedAgentId === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => {
                  setCameraPreset(agent.id.toUpperCase() as CameraPreset);
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

        {/* Right Tools: Terminal Drawer Toggle, Audio, Fullscreen */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Agent Terminal Drawer Button */}
          <button
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all cursor-pointer font-bold ${
              isTerminalOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_#00f0ff]'
                : 'bg-cyan-950/70 border-cyan-400/50 text-cyan-200 hover:bg-cyan-900/60'
            }`}
          >
            <span>&gt;_</span>
            <span>AGENT TERMINAL</span>
          </button>

          {/* Voice Mode Toggle (Saraiki/Urdu vs English) */}
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

          {/* Sound Mute */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded border cursor-pointer ${
              soundEnabled ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300' : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}
            title={soundEnabled ? 'Audio ON' : 'Audio Muted'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen Toggle */}
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

        {/* Ambient Top Glow Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#02070e] via-transparent to-[#02070e]/40" />

        {/* Real-time Notification Banner */}
        {notification && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-[#031525]/95 border border-cyan-400 text-cyan-100 text-xs font-mono-tech flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] pointer-events-none animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>{notification}</span>
          </div>
        )}

        {/* Live Speech Bubble when Agent is Speaking */}
        {speakingAgentId && activeSpeechText && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-96 max-w-[90vw] p-3.5 rounded-2xl bg-[#03182b]/95 border-2 border-emerald-400 text-emerald-100 text-xs shadow-[0_0_35px_rgba(16,185,129,0.7)] backdrop-blur-md z-30 font-sans animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-emerald-500/30 text-[10px] font-mono text-emerald-400">
              <span className="font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
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
      </div>

      {/* ================= 3. BOTTOM PRESET BAR & QUICK ACTIONS (EXACT MATCH) ================= */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-[#031320]/95 border-t border-cyan-500/30 shrink-0 z-30 gap-2 font-mono-tech text-xs">
        {/* Left Side: Camera Presets */}
        <div className="flex items-center gap-1 bg-[#020e18] border border-cyan-500/30 rounded-lg p-0.5">
          {(['OVERVIEW', 'ALICE', 'BOB', 'CAROL', 'DAVE', 'MEETING'] as CameraPreset[]).map((preset) => {
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
        <div className="flex items-center gap-1.5">
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

          {/* Crypto Market Hub Buttons */}
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

      {/* ================= 4. SLIDE-OVER AGENT TERMINAL DRAWER ================= */}
      {isTerminalOpen && (
        <div className="absolute inset-x-2 bottom-12 max-h-[50%] z-40 bg-[#020d18]/98 border border-cyan-400/80 rounded-xl flex flex-col overflow-hidden shadow-[0_0_35px_rgba(0,240,255,0.35)] font-mono-tech backdrop-blur-md">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#031c2e] border-b border-cyan-500/30">
            <div className="flex items-center gap-2 text-xs text-cyan-200 font-bold">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: AGENTS_META[selectedAgentId].dotColor }}
              />
              <span>{AGENTS_META[selectedAgentId].name.toUpperCase()} // LIVE AGENT TERMINAL & CREW-AI TELEMETRY</span>
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
              handleDispatchTask();
            }}
            className="flex items-center gap-2 p-2 bg-[#021524] border-t border-cyan-500/30"
          >
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder={`Assign directive to ${AGENTS_META[selectedAgentId].name} (e.g. "Audit port 443", "Compile satellite dossier")...`}
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
    </div>
  );
};
