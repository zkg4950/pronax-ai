// Advanced User Emotion & Sentiment Detection Engine
// Understands Urdu, Saraiki, Roman Urdu, and English emotional states ("user ki filling/feeling ko smjhy")
// Provides empathetic framing, emotional tone adjustments, and agent-specific empathy responses

import { EmotionAnalysis, UserEmotion } from '../types';

export function detectUserEmotion(text: string): EmotionAnalysis {
  if (!text || !text.trim()) {
    return {
      emotion: 'neutral_chill',
      label: 'Chill / Neutral',
      emoji: '😌',
      confidence: 0.9,
      triggerWords: [],
      recommendedTone: 'calm, friendly, receptive',
      agentEmpathyQuote: 'Jani kivein o? Haal chaal sunao, Stonic crew bilkul tayar hey!',
    };
  }

  const lower = text.toLowerCase();

  // 1. Worried / Anxious / Fearful / Stressed (Crypto loss, market drop, stress, fear, confusion)
  const anxiousKeywords = [
    'loss', 'nuksan', 'loss ho gya', 'parishan', 'tension', 'dar', 'khauf', 'crash', 'drop',
    'gir gaya', 'mar gaya', 'dharak', 'sad', 'rona', 'tension na le', 'ghubra', 'ghabra',
    'stress', 'worried', 'afraid', 'panick', 'panic', 'red market', 'haaye', 'bura haal',
    'help', 'bachao', 'bacha lo', 'phas gaya', 'phas gya', 'fucker', 'fikar', 'pareshan'
  ];

  const matchedAnxious = anxiousKeywords.filter((kw) => lower.includes(kw));
  if (matchedAnxious.length > 0) {
    return {
      emotion: 'worried_anxious',
      label: 'Anxious / Stressed',
      emoji: '😟',
      confidence: Math.min(0.98, 0.65 + matchedAnxious.length * 0.15),
      triggerWords: matchedAnxious,
      recommendedTone: 'deeply comforting, reassuring, protective, clear and calming',
      agentEmpathyQuote:
        'Jani tusi bilkul fikar na karo! Main tuhadi tension te feeling poori tarah samjh sakdi haan. Crypto market vich utar charhao aam gal hey, asaan technical hedge te stop-loss nal safe rakhan ge.',
    };
  }

  // 2. Excited / Bullish / Greedy / Pump / Hype
  const bullishKeywords = [
    'moon', 'pump', 'profit', 'fayda', 'fayeda', 'paisa ban', 'crorepati', 'lakhpati',
    'bullish', 'zabardast', 'kamaal', 'chass', 'mazza', 'rock', 'rich', 'to the moon',
    '100x', '10x', 'green', 'breakout', 'all time high', 'ath', 'wah', 'zindabad',
    'khush', 'happy', 'excited', 'banger', 'alpha', 'win', 'jeet gaye'
  ];

  const matchedBullish = bullishKeywords.filter((kw) => lower.includes(kw));
  if (matchedBullish.length > 0) {
    return {
      emotion: 'excited_bullish',
      label: 'Excited / Bullish Hype',
      emoji: '🚀',
      confidence: Math.min(0.99, 0.7 + matchedBullish.length * 0.15),
      triggerWords: matchedBullish,
      recommendedTone: 'energetic, hype, laser-focused, celebratory yet tactical',
      agentEmpathyQuote:
        'Wah jani chass aa gayi! Tuhada josh te energy dekh ke dil baagh baagh ho gaya! Aao Dave nal viral crypto campaign te next 10x breakout scan kariyay!',
    };
  }

  // 3. Frustrated / Angry / Impatient
  const frustratedKeywords = [
    'kharab', 'ghalat', 'gussa', 'bakwas', 'fraud', 'scam', 'slow', 'bore', 'tang',
    'irritated', 'badtameez', 'pagal', 'nahi chal raha', 'band karo', 'stupid', 'idiot',
    'hate', 'angry', 'fail', 'error', 'bug', 'nahi sun raha', 'bar bar bola'
  ];

  const matchedFrustrated = frustratedKeywords.filter((kw) => lower.includes(kw));
  if (matchedFrustrated.length > 0) {
    return {
      emotion: 'frustrated_angry',
      label: 'Frustrated / Urgent',
      emoji: '😤',
      confidence: Math.min(0.95, 0.7 + matchedFrustrated.length * 0.15),
      triggerWords: matchedFrustrated,
      recommendedTone: 'apologetic, instant compliance, humble, highly efficient and precise',
      agentEmpathyQuote:
        'Jani dil te na lwo, main tuhadi shikayat note kar litti hey. Hukm karo, foran theek karke clear awaz te exact action haazir karday aan!',
    };
  }

  // 4. Curious / Analytical / Inquisitive
  const curiousKeywords = [
    'analyze', 'analysis', 'chart', 'batao', 'dasso', 'kyun', 'kivein', 'how', 'why',
    'kya', 'kia', 'samjhao', 'dikhao', 'kholo', 'open', 'details', 'scan', 'audit',
    'tokenomics', 'research', 'socho', 'guide', 'seekhna', 'dossier', 'report'
  ];

  const matchedCurious = curiousKeywords.filter((kw) => lower.includes(kw));
  if (matchedCurious.length > 0) {
    return {
      emotion: 'curious_analytical',
      label: 'Curious / Analytical',
      emoji: '🧐',
      confidence: Math.min(0.92, 0.65 + matchedCurious.length * 0.12),
      triggerWords: matchedCurious,
      recommendedTone: 'intellectual, precise, structured, insightful and empowering',
      agentEmpathyQuote:
        'Bohot aala sawal pucha hey jani! Alice te Bob deep analysis terminal te data decode kar rahay han, ek ek cheez clear karday aan.',
    };
  }

  // 5. Default Neutral / Friendly
  return {
    emotion: 'neutral_chill',
    label: 'Chill / Friendly',
    emoji: '😊',
    confidence: 0.85,
    triggerWords: [],
    recommendedTone: 'warm, conversational, loyal, ready for instant command',
    agentEmpathyQuote: 'G jani, Stonic office de saare agents tuhade ek hukum te hazir han!',
  };
}

export function getAgentEmpathyPromptInstruction(userEmotion: EmotionAnalysis): string {
  return `
[USER EMOTION DETECTED: ${userEmotion.label} (${userEmotion.emoji}) - Confidence: ${Math.round(userEmotion.confidence * 100)}%]
Tone Directive: ${userEmotion.recommendedTone}.
Emotion Understanding Requirement:
- First acknowledge and validate the user's feelings with human empathy in authentic Pakistani Saraiki / Roman Urdu (e.g. "${userEmotion.agentEmpathyQuote}").
- Speak in crystal clear, articulate sentences with genuine human emotion, warmth, and supportive voice.
- Never be cold, robotic, or dismissive.
`;
}
