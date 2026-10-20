import * as THREE from 'three';
import { LipSyncData } from '../../utils/audioEffects';

export type AgentState =
  | 'IDLE_DESK'
  | 'IDLE_CONFERENCE'
  | 'WALKING_TO_DESK'
  | 'WALKING_TO_CONFERENCE'
  | 'WALKING_TO_WATER'
  | 'WORKING_TYPING'
  | 'SPEAKING'
  | 'CELEBRATING';

export interface HumanoidRigConfig {
  id: 'alice' | 'bob' | 'carol' | 'dave';
  name: string;
  suitColor: string;
  pantsColor: string;
  skinColor: string;
  hairColor: string;
  hairStyle: 'sleek_bob' | 'tactical_short' | 'auburn_waves' | 'modern_sidepart';
  visorColor?: string;
  badgeColor: string;
  deskPos: [number, number, number];
  conferencePos: [number, number, number];
}

export class HumanoidAgentRig {
  public id: string;
  public name: string;
  public group: THREE.Group;
  public state: AgentState = 'WORKING_TYPING';

  // Skeletal hierarchy
  public hips: THREE.Group;
  public torso: THREE.Group;
  public headGroup: THREE.Group;
  public jaw: THREE.Mesh;
  public badgeSprite: THREE.Sprite;
  public leftArm: THREE.Group;
  public leftForearm: THREE.Group;
  public leftHand: THREE.Mesh;
  public rightArm: THREE.Group;
  public rightForearm: THREE.Group;
  public rightHand: THREE.Mesh;
  public leftThigh: THREE.Group;
  public leftShin: THREE.Group;
  public leftFoot: THREE.Mesh;
  public rightThigh: THREE.Group;
  public rightShin: THREE.Group;
  public rightFoot: THREE.Mesh;

  // Waypoints & Navigation
  public currentPos: THREE.Vector3;
  public targetPos: THREE.Vector3;
  public currentRotationY: number = 0;
  public targetRotationY: number = 0;
  public walkPhase: number = 0;
  public deskPos: THREE.Vector3;
  public conferencePos: THREE.Vector3;
  public isSeated: boolean = true;
  public onArrivedCallback?: () => void;

  constructor(cfg: HumanoidRigConfig) {
    this.id = cfg.id;
    this.name = cfg.name;
    this.group = new THREE.Group();

    this.deskPos = new THREE.Vector3(...cfg.deskPos);
    this.conferencePos = new THREE.Vector3(...cfg.conferencePos);
    this.currentPos = new THREE.Vector3(...cfg.deskPos);
    this.targetPos = new THREE.Vector3(...cfg.deskPos);
    this.group.position.copy(this.currentPos);

    // Common Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: cfg.skinColor,
      roughness: 0.55,
      metalness: 0.05,
    });
    const suitMat = new THREE.MeshStandardMaterial({
      color: cfg.suitColor,
      roughness: 0.6,
      metalness: 0.2,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: cfg.pantsColor,
      roughness: 0.7,
      metalness: 0.1,
    });
    const shoeMat = new THREE.MeshStandardMaterial({
      color: '#080d14',
      roughness: 0.3,
      metalness: 0.4,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: cfg.hairColor,
      roughness: 0.8,
    });
    const cyberMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      metalness: 0.85,
      roughness: 0.2,
    });
    const neonGlowMat = new THREE.MeshBasicMaterial({
      color: cfg.badgeColor,
    });

    // 1. Hips / Pelvis (Root pivot)
    this.hips = new THREE.Group();
    this.hips.position.y = 0.54; // sitting baseline
    this.group.add(this.hips);

    const pelvisMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.18, 0.22),
      pantsMat
    );
    pelvisMesh.castShadow = true;
    this.hips.add(pelvisMesh);

    // 2. Torso (attached to hips)
    this.torso = new THREE.Group();
    this.torso.position.y = 0.16;
    this.hips.add(this.torso);

    const chestMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.44, 0.22),
      suitMat
    );
    chestMesh.position.y = 0.22;
    chestMesh.castShadow = true;
    this.torso.add(chestMesh);

    // Collar & Lapel accent
    const collarGeo = new THREE.BoxGeometry(0.18, 0.12, 0.04);
    const collarMesh = new THREE.Mesh(collarGeo, suitMat);
    collarMesh.position.set(0, 0.40, 0.11);
    this.torso.add(collarMesh);

    // Glowing ID Badge on Left Chest
    const badgeGeo = new THREE.BoxGeometry(0.06, 0.08, 0.02);
    const badgeMesh = new THREE.Mesh(badgeGeo, neonGlowMat);
    badgeMesh.position.set(-0.11, 0.30, 0.12);
    this.torso.add(badgeMesh);

    // 3. Head & Face (attached to torso)
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.48, 0);
    this.torso.add(this.headGroup);

    // Neck
    const neckMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.07, 0.1, 16),
      skinMat
    );
    neckMesh.position.y = 0.04;
    this.headGroup.add(neckMesh);

    // Head Base
    const headMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.27, 0.24),
      skinMat
    );
    headMesh.position.y = 0.18;
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Eyes / Visor
    if (cfg.visorColor) {
      const visorGeo = new THREE.BoxGeometry(0.22, 0.06, 0.05);
      const visorMat = new THREE.MeshStandardMaterial({
        color: cfg.visorColor,
        emissive: cfg.visorColor,
        emissiveIntensity: 0.6,
        roughness: 0.1,
      });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.position.set(0, 0.20, 0.12);
      this.headGroup.add(visor);
    } else {
      // Natural cyber eyes
      const eyeMat = new THREE.MeshBasicMaterial({ color: '#00f0ff' });
      const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.02), eyeMat);
      leftEye.position.set(-0.06, 0.20, 0.125);
      const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.02), eyeMat);
      rightEye.position.set(0.06, 0.20, 0.125);
      this.headGroup.add(leftEye, rightEye);
    }

    // Cyber Headset / Comm Device
    const earCom1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16), cyberMat);
    earCom1.rotation.z = Math.PI / 2;
    earCom1.position.set(0.13, 0.18, 0);
    const earCom2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16), cyberMat);
    earCom2.rotation.z = Math.PI / 2;
    earCom2.position.set(-0.13, 0.18, 0);
    this.headGroup.add(earCom1, earCom2);

    // Headset Mic Boom
    const micBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12), cyberMat);
    micBoom.rotation.x = -Math.PI / 3;
    micBoom.position.set(0.12, 0.14, 0.06);
    this.headGroup.add(micBoom);

    // Hair Geometry based on character style
    const hairGroup = new THREE.Group();
    if (cfg.hairStyle === 'sleek_bob') {
      const topHair = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.10, 0.26), hairMat);
      topHair.position.set(0, 0.32, 0);
      const sideHairL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.24), hairMat);
      sideHairL.position.set(-0.13, 0.18, 0);
      const sideHairR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.24), hairMat);
      sideHairR.position.set(0.13, 0.18, 0);
      const backHair = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.04), hairMat);
      backHair.position.set(0, 0.18, -0.12);
      hairGroup.add(topHair, sideHairL, sideHairR, backHair);
    } else if (cfg.hairStyle === 'auburn_waves') {
      const topHair = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.12, 0.27), hairMat);
      topHair.position.set(0, 0.32, 0.01);
      const wavySideL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.28, 0.22), hairMat);
      wavySideL.position.set(-0.14, 0.14, 0.02);
      const wavySideR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.28, 0.22), hairMat);
      wavySideR.position.set(0.14, 0.14, 0.02);
      hairGroup.add(topHair, wavySideL, wavySideR);
    } else {
      const shortHair = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.10, 0.26), hairMat);
      shortHair.position.set(0, 0.32, 0);
      hairGroup.add(shortHair);
    }
    this.headGroup.add(hairGroup);

    // Mouth / Jaw (lip-sync movement)
    const jawGeo = new THREE.BoxGeometry(0.10, 0.035, 0.04);
    const jawMat = new THREE.MeshStandardMaterial({ color: '#7f1d1d' });
    this.jaw = new THREE.Mesh(jawGeo, jawMat);
    this.jaw.position.set(0, 0.09, 0.12);
    this.headGroup.add(this.jaw);

    // 4. Arms & Forearms (Shoulder pivots)
    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.24, 0.38, 0);
    this.torso.add(this.leftArm);

    const lShoulderMesh = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.24, 0.11), suitMat);
    lShoulderMesh.position.y = -0.10;
    this.leftArm.add(lShoulderMesh);

    this.leftForearm = new THREE.Group();
    this.leftForearm.position.y = -0.22;
    this.leftArm.add(this.leftForearm);

    const lForearmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.22, 0.09), suitMat);
    lForearmMesh.position.y = -0.10;
    this.leftForearm.add(lForearmMesh);

    this.leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.07), skinMat);
    this.leftHand.position.y = -0.22;
    this.leftForearm.add(this.leftHand);

    // Right Arm
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.24, 0.38, 0);
    this.torso.add(this.rightArm);

    const rShoulderMesh = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.24, 0.11), suitMat);
    rShoulderMesh.position.y = -0.10;
    this.rightArm.add(rShoulderMesh);

    this.rightForearm = new THREE.Group();
    this.rightForearm.position.y = -0.22;
    this.rightArm.add(this.rightForearm);

    const rForearmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.22, 0.09), suitMat);
    rForearmMesh.position.y = -0.10;
    this.rightForearm.add(rForearmMesh);

    this.rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.07), skinMat);
    this.rightHand.position.y = -0.22;
    this.rightForearm.add(this.rightHand);

    // 5. Legs & Feet (Hip pivots)
    // Left Leg
    this.leftThigh = new THREE.Group();
    this.leftThigh.position.set(-0.10, -0.05, 0);
    this.hips.add(this.leftThigh);

    const lThighMesh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.36, 0.13), pantsMat);
    lThighMesh.position.y = -0.16;
    lThighMesh.castShadow = true;
    this.leftThigh.add(lThighMesh);

    this.leftShin = new THREE.Group();
    this.leftShin.position.y = -0.34;
    this.leftThigh.add(this.leftShin);

    const lShinMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.34, 0.12), pantsMat);
    lShinMesh.position.y = -0.16;
    lShinMesh.castShadow = true;
    this.leftShin.add(lShinMesh);

    this.leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.22), shoeMat);
    this.leftFoot.position.set(0, -0.32, 0.04);
    this.leftShin.add(this.leftFoot);

    // Right Leg
    this.rightThigh = new THREE.Group();
    this.rightThigh.position.set(0.10, -0.05, 0);
    this.hips.add(this.rightThigh);

    const rThighMesh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.36, 0.13), pantsMat);
    rThighMesh.position.y = -0.16;
    rThighMesh.castShadow = true;
    this.rightThigh.add(rThighMesh);

    this.rightShin = new THREE.Group();
    this.rightShin.position.y = -0.34;
    this.rightThigh.add(this.rightShin);

    const rShinMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.34, 0.12), pantsMat);
    rShinMesh.position.y = -0.16;
    rShinMesh.castShadow = true;
    this.rightShin.add(rShinMesh);

    this.rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.22), shoeMat);
    this.rightFoot.position.set(0, -0.32, 0.04);
    this.rightShin.add(this.rightFoot);

    // 6. Nameplate Canvas Badge above Agent
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 256;
    badgeCanvas.height = 72;
    const bctx = badgeCanvas.getContext('2d')!;
    bctx.fillStyle = '#021320';
    bctx.fillRect(0, 0, 256, 72);
    bctx.strokeStyle = cfg.badgeColor;
    bctx.lineWidth = 4;
    bctx.strokeRect(2, 2, 252, 68);
    bctx.fillStyle = '#ffffff';
    bctx.font = 'bold 24px monospace';
    bctx.fillText(cfg.name.toUpperCase(), 16, 32);
    bctx.fillStyle = cfg.badgeColor;
    bctx.font = '15px monospace';
    bctx.fillText('ONLINE', 16, 56);

    const badgeTex = new THREE.CanvasTexture(badgeCanvas);
    const badgeSpriteMat = new THREE.SpriteMaterial({ map: badgeTex, transparent: true });
    this.badgeSprite = new THREE.Sprite(badgeSpriteMat);
    this.badgeSprite.scale.set(1.1, 0.35, 1);
    this.badgeSprite.position.set(0, 1.85, 0);
    this.group.add(this.badgeSprite);

    // Initial pose: sitting at desk typing
    this.setPoseSittingTyping();
  }

  // Update badge text dynamically
  public updateBadge(statusText: string, color?: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 72;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#021320';
    ctx.fillRect(0, 0, 256, 72);
    ctx.strokeStyle = color || '#00f0ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 252, 68);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(this.name.toUpperCase(), 16, 32);
    ctx.fillStyle = color || '#00f0ff';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(statusText.toUpperCase().slice(0, 18), 16, 56);

    this.badgeSprite.material.map?.dispose();
    this.badgeSprite.material.map = new THREE.CanvasTexture(canvas);
    this.badgeSprite.material.needsUpdate = true;
  }

  // Navigation: dispatch agent to target location
  public walkTo(target: THREE.Vector3, targetRotationY: number, onArrived?: () => void) {
    this.targetPos.copy(target);
    this.targetRotationY = targetRotationY;
    this.onArrivedCallback = onArrived;
    this.isSeated = false;
    this.hips.position.y = 0.85; // standing height
    this.state = 'WALKING_TO_DESK';
  }

  public setPoseSittingTyping() {
    this.isSeated = true;
    this.hips.position.y = 0.54;
    // Thighs 90 degrees forward
    this.leftThigh.rotation.set(-Math.PI / 2, 0, 0);
    this.rightThigh.rotation.set(-Math.PI / 2, 0, 0);
    // Knees 90 degrees down
    this.leftShin.rotation.set(Math.PI / 2, 0, 0);
    this.rightShin.rotation.set(Math.PI / 2, 0, 0);
    // Arms angled forward over keyboard
    this.leftArm.rotation.set(-0.75, 0.2, 0);
    this.leftForearm.rotation.set(-0.65, 0, 0);
    this.rightArm.rotation.set(-0.75, -0.2, 0);
    this.rightForearm.rotation.set(-0.65, 0, 0);
  }

  // Frame tick animation loop
  public update(time: number, delta: number, isSpeaking: boolean, lipSync?: LipSyncData, cameraPos?: THREE.Vector3) {
    // 1. Navigation & Walking state
    const distToTarget = this.currentPos.distanceTo(this.targetPos);
    if (distToTarget > 0.08) {
      this.isSeated = false;
      this.hips.position.y = 0.85;

      // Move toward target
      const moveDir = this.targetPos.clone().sub(this.currentPos).normalize();
      const speed = 2.4; // m/s
      this.currentPos.addScaledVector(moveDir, speed * delta);
      this.group.position.copy(this.currentPos);

      // Rotate to face movement direction
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      this.currentRotationY = THREE.MathUtils.lerp(this.currentRotationY, targetAngle, 0.15);
      this.group.rotation.y = this.currentRotationY;

      // Leg stride kinematics
      this.walkPhase += delta * 9.5;
      const legAngle = Math.sin(this.walkPhase) * 0.65;
      this.leftThigh.rotation.set(legAngle, 0, 0);
      this.leftShin.rotation.set(Math.max(0, -legAngle * 0.8), 0, 0);

      this.rightThigh.rotation.set(-legAngle, 0, 0);
      this.rightShin.rotation.set(Math.max(0, legAngle * 0.8), 0, 0);

      // Arm counter swing
      this.leftArm.rotation.set(-legAngle * 0.6, 0, 0);
      this.leftForearm.rotation.set(-0.2, 0, 0);
      this.rightArm.rotation.set(legAngle * 0.6, 0, 0);
      this.rightForearm.rotation.set(-0.2, 0, 0);

      // Hip bob
      this.hips.position.y = 0.85 + Math.sin(this.walkPhase * 2) * 0.035;
      return;
    } else if (!this.isSeated && distToTarget <= 0.08) {
      // Arrived at destination
      this.currentPos.copy(this.targetPos);
      this.group.position.copy(this.currentPos);
      this.currentRotationY = this.targetRotationY;
      this.group.rotation.y = this.currentRotationY;
      this.setPoseSittingTyping();
      this.state = 'WORKING_TYPING';
      if (this.onArrivedCallback) {
        this.onArrivedCallback();
        this.onArrivedCallback = undefined;
      }
    }

    // 2. Seated / Working / Idle animations
    const breathing = Math.sin(time * 2.2 + this.id.charCodeAt(0)) * 0.015;
    this.torso.position.y = 0.16 + breathing;

    // Speaking reaction
    if (isSpeaking) {
      this.headGroup.rotation.y = Math.sin(time * 3.5) * 0.15;
      this.headGroup.rotation.x = Math.sin(time * 4.5) * 0.08;
      if (lipSync) {
        this.jaw.position.y = 0.09 - (lipSync.isOpen ? lipSync.openRatio * 0.06 : 0);
      }
      this.rightArm.rotation.x = -0.9 + Math.sin(time * 5.0) * 0.25;
      this.rightForearm.rotation.x = -0.5;
      return;
    }

    // Default Working Typing Mode
    if (this.state === 'WORKING_TYPING' || this.isSeated) {
      const typeSpeed = 22.0;
      const leftTap = Math.sin(time * typeSpeed) * 0.04;
      const rightTap = Math.cos(time * typeSpeed + 1.2) * 0.04;

      this.leftArm.rotation.set(-0.75 + leftTap, 0.2, 0);
      this.leftForearm.rotation.set(-0.65 + leftTap, 0, 0);
      this.rightArm.rotation.set(-0.75 + rightTap, -0.2, 0);
      this.rightForearm.rotation.set(-0.65 + rightTap, 0, 0);

      // Head monitors code/screen
      this.headGroup.rotation.y = Math.sin(time * 0.9) * 0.12;
      this.headGroup.rotation.x = -0.15 + Math.sin(time * 1.8) * 0.04;
    } else if (this.state === 'CELEBRATING') {
      // Victory celebration pose
      this.leftArm.rotation.set(-2.2, 0, -0.35);
      this.leftForearm.rotation.set(-0.2, 0, 0);
      this.rightArm.rotation.set(-2.2, 0, 0.35);
      this.rightForearm.rotation.set(-0.2, 0, 0);
      this.headGroup.rotation.set(0.2, Math.sin(time * 4.0) * 0.15, 0);
    }
  }
}
