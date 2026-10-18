// Authentic Stonic AI Sci-Fi Sound Effects via Web Audio API & Crystal-Clear Speech Engine with Real-Time Lip-Sync

export interface LipSyncData {
  isOpen: boolean;
  openRatio: number; // 0.0 to 1.0
  mouthWidth: number; // 0.85 to 1.25
  jawOffset: number; // pixels to lower the jaw
  phoneme: 'A' | 'O' | 'E' | 'M' | 'rest';
}

type LipSyncListener = (speakerId: string, data: LipSyncData) => void;
const lipSyncListeners = new Set<LipSyncListener>();

export function subscribeLipSync(listener: LipSyncListener) {
  lipSyncListeners.add(listener);
  return () => {
    lipSyncListeners.delete(listener);
  };
}

function broadcastLipSync(speakerId: string, data: LipSyncData) {
  lipSyncListeners.forEach((fn) => fn(speakerId, data));
}

let activeSpeechTimer: any = null;

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Tactical radio transmission chirp before speaking (like JARVIS / Military Comms)
export function playRadioChirp() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(2200, now + 0.05);
    osc.frequency.setValueAtTime(800, now + 0.07);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  } catch (e) {
    // Ignore audio policy issues
  }
}

// Confirmation beep when directive is executed
export function playConfirmChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.06, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.18);
    });
  } catch (e) {
    // Ignore
  }
}

// Export alias for backward compatibility
export const playAccessGrantedSound = playBiometricGrantedChime;

// High clarity speech synthesizer that uses appropriate native voices and drives real lip-sync
export function speakAgentDialogue(
  spokenText: string,
  speakerId: string,
  voiceMode: 'native_urdu_hindi' | 'english_clear' = 'native_urdu_hindi'
) {
  // Clear any existing lip sync timer
  if (activeSpeechTimer) {
    clearInterval(activeSpeechTimer);
    activeSpeechTimer = null;
  }

  // Calculate approximate duration based on text length
  const approxDurationMs = Math.max(3000, spokenText.length * 75);
  const startTime = Date.now();

  // Start animated lip-sync simulation loop immediately (runs at 25 FPS)
  const phonemes: ('A' | 'O' | 'E' | 'M')[] = ['A', 'E', 'O', 'A', 'M', 'E', 'O'];
  let tick = 0;

  activeSpeechTimer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    if (elapsed > approxDurationMs) {
      clearInterval(activeSpeechTimer);
      activeSpeechTimer = null;
      broadcastLipSync(speakerId, {
        isOpen: false,
        openRatio: 0,
        mouthWidth: 1.0,
        jawOffset: 0,
        phoneme: 'rest',
      });
      return;
    }

    tick++;
    // Add natural micro pauses between words
    const isPause = tick % 9 === 0;
    if (isPause) {
      broadcastLipSync(speakerId, {
        isOpen: false,
        openRatio: 0.1,
        mouthWidth: 1.0,
        jawOffset: 1,
        phoneme: 'rest',
      });
    } else {
      const curPhoneme = phonemes[tick % phonemes.length];
      const intensity = 0.4 + 0.6 * Math.abs(Math.sin(tick * 0.7));
      const openRatio = curPhoneme === 'M' ? 0.05 : curPhoneme === 'O' ? 0.9 * intensity : 0.75 * intensity;
      const mouthWidth = curPhoneme === 'O' ? 0.85 : curPhoneme === 'E' ? 1.25 : 1.05;
      const jawOffset = Math.round(openRatio * 7);

      broadcastLipSync(speakerId, {
        isOpen: openRatio > 0.15,
        openRatio,
        mouthWidth,
        jawOffset,
        phoneme: curPhoneme,
      });
    }
  }, 45);

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    playRadioChirp();

    const utterance = new SpeechSynthesisUtterance(spokenText);
    const voices = window.speechSynthesis.getVoices();

    // Look for native Urdu or Hindi voices for 100% natural accent
    const urduHindiVoice = voices.find(
      (v) =>
        /ur-PK|ur_PK|urdu|hi-IN|hi_IN|hindi|Google हिन्दी|Microsoft Asma|Microsoft Uzma/i.test(v.name) ||
        /ur|hi/i.test(v.lang)
    );

    const englishFemaleVoice = voices.find(
      (v) =>
        /Google UK English Female|Samantha|Victoria|Zira|Jenny/i.test(v.name) ||
        (v.lang.startsWith('en') && /female/i.test(v.name))
    );

    const englishMaleVoice = voices.find(
      (v) =>
        /Google UK English Male|David|George|Mark|Guy/i.test(v.name) ||
        (v.lang.startsWith('en') && /male/i.test(v.name))
    );

    if (voiceMode === 'native_urdu_hindi' && urduHindiVoice) {
      utterance.voice = urduHindiVoice;
      utterance.rate = 1.0;
    } else {
      if (speakerId === 'alice' || speakerId === 'carol') {
        if (englishFemaleVoice) utterance.voice = englishFemaleVoice;
      } else {
        if (englishMaleVoice) utterance.voice = englishMaleVoice;
      }
      utterance.rate = 1.05;
    }

    // Agent pitch tuning
    if (speakerId === 'alice') {
      utterance.pitch = 1.25;
    } else if (speakerId === 'carol') {
      utterance.pitch = 1.15;
    } else if (speakerId === 'bob') {
      utterance.pitch = 0.95;
    } else {
      utterance.pitch = 0.85; // Dave
    }

    utterance.onend = () => {
      if (activeSpeechTimer) {
        clearInterval(activeSpeechTimer);
        activeSpeechTimer = null;
      }
      broadcastLipSync(speakerId, {
        isOpen: false,
        openRatio: 0,
        mouthWidth: 1.0,
        jawOffset: 0,
        phoneme: 'rest',
      });
    };

    utterance.onerror = () => {
      // Keep fallback timer
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    // Keep fallback timer
  }
}

// Security Sentry: High-Alert Red Intruder Siren Sound
let sirenInterval: any = null;

export function playIntruderAlarmSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Play an immediate alternating two-tone alarm siren
    const playTone = (freq1: number, freq2: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq1, now);
      osc.frequency.exponentialRampToValueAtTime(freq2, now + dur);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + dur);
    };

    playTone(850, 420, 0.28);
    setTimeout(() => {
      playTone(950, 450, 0.32);
    }, 280);
  } catch (e) {
    // Suppress audio policy issues
  }
}

// Biometric Access Granted Chime (Futuristic crystal clear unlock tone)
export function playBiometricGrantedChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.12, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.35);
    });
  } catch (e) {
    // Suppress
  }
}

// Biometric Access Denied Sound (Harsh error buzz)
export function playBiometricDeniedSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [180, 160].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);

      gain.gain.setValueAtTime(0.14, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.12);
    });
  } catch (e) {
    // Suppress
  }
}

