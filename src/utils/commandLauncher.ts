// Universal Command & Screen Launcher Engine
// Understands spoken and typed commands to immediately open requested tools, screens, charts, or websites
// ("jo cheze open karny ko bolo wo open kar ky de")

export type LaunchTarget =
  | 'crypto_market'
  | 'crypto_marketing'
  | 'screen_monitor'
  | 'brain_config'
  | 'agent_office'
  | 'agent_terminal'
  | 'satlink_feed'
  | 'voice_console'
  | 'external_web';

export interface CommandLaunchResult {
  shouldOpen: boolean;
  target: LaunchTarget;
  title: string;
  agentResponseVoice: string;
  externalUrl?: string;
  agentId?: 'alice' | 'bob' | 'carol' | 'dave' | 'stonic';
  tab?: 'analysis' | 'marketing';
}

export function detectOpenCommand(text: string): CommandLaunchResult | null {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  // Trigger keywords for opening
  const isOpenIntent =
    lower.includes('open') ||
    lower.includes('kholo') ||
    lower.includes('khol do') ||
    lower.includes('khol') ||
    lower.includes('show') ||
    lower.includes('dikhao') ||
    lower.includes('chalao') ||
    lower.includes('start') ||
    lower.includes('launch') ||
    lower.includes('view') ||
    lower.includes('dekho') ||
    lower.includes('dykho');

  // 1. Crypto Market & Deep Technical Analyzer
  if (
    lower.includes('crypto market') ||
    lower.includes('crypto chart') ||
    lower.includes('bitcoin') ||
    lower.includes('btc') ||
    lower.includes('solana') ||
    lower.includes('ethereum') ||
    lower.includes('coin chart') ||
    lower.includes('trading chart') ||
    (isOpenIntent && (lower.includes('crypto') || lower.includes('market') || lower.includes('chart') || lower.includes('analyze') || lower.includes('trade')))
  ) {
    return {
      shouldOpen: true,
      target: 'crypto_market',
      title: 'Crypto Market & AI Technical Analysis Terminal',
      agentResponseVoice: 'Hukum jani! Crypto Market Intelligence aur Live Analysis terminal foran open kar ditta hey, check karo!',
      agentId: 'alice',
      tab: 'analysis',
    };
  }

  // 2. Crypto Marketing & Viral Campaign Suite
  if (
    lower.includes('crypto markete') ||
    lower.includes('crypto marketin') ||
    lower.includes('crypto marketing') ||
    lower.includes('campaign') ||
    lower.includes('shill') ||
    lower.includes('viral post') ||
    lower.includes('twitter thread') ||
    lower.includes('telegram announcement') ||
    (isOpenIntent && (lower.includes('marketing') || lower.includes('markite') || lower.includes('promote') || lower.includes('advertise')))
  ) {
    return {
      shouldOpen: true,
      target: 'crypto_marketing',
      title: 'Automated Crypto Marketing & Viral Campaign Generator',
      agentResponseVoice: 'Zabardast jani! Dave aur Carol da Crypto Marketing suite open ho gaya hai, aao viral campaign launch kariyay!',
      agentId: 'dave',
      tab: 'marketing',
    };
  }

  // 3. Screen Monitor / Optical Camera Feed
  if (
    lower.includes('screen monitor') ||
    lower.includes('desktop monitor') ||
    lower.includes('camera') ||
    (isOpenIntent && (lower.includes('screen') || lower.includes('desktop') || lower.includes('display')))
  ) {
    return {
      shouldOpen: true,
      target: 'screen_monitor',
      title: 'Optical Screen & Vision Deck',
      agentResponseVoice: 'Ji jani, optical screen monitoring console activate karke open kar ditta hey!',
      agentId: 'bob',
    };
  }

  // 4. Brain Config / Settings / Multi-Provider Hub
  if (
    lower.includes('brain') ||
    lower.includes('setting') ||
    lower.includes('settings') ||
    lower.includes('api key') ||
    lower.includes('provider') ||
    lower.includes('config')
  ) {
    return {
      shouldOpen: true,
      target: 'brain_config',
      title: 'Stonic AI Neural Multi-Provider Brain Hub',
      agentResponseVoice: 'Neural Brain Configuration & Provider selector open kar ditta hey, jani!',
      agentId: 'stonic',
    };
  }

  // 5. Agent Office 3D / Specific Agent Desk
  if (lower.includes('office') || lower.includes('town') || lower.includes('meeting') || lower.includes('3d office')) {
    return {
      shouldOpen: true,
      target: 'agent_office',
      title: 'Autonomous 3D Agent Office Stage',
      agentResponseVoice: 'Office stage full view vich maximize kar ditta hey jani, saaray agents live operational han!',
      agentId: 'carol',
    };
  }

  // 6. Agent Terminal
  if (lower.includes('terminal') || lower.includes('agent desk') || lower.includes('crew terminal')) {
    return {
      shouldOpen: true,
      target: 'agent_terminal',
      title: 'Tactical Crew Terminal',
      agentResponseVoice: 'Live agent terminal drawer open kar ditta hey!',
      agentId: 'bob',
    };
  }

  // 7. External Crypto & Trading Platforms
  if (lower.includes('binance') && isOpenIntent) {
    return {
      shouldOpen: true,
      target: 'external_web',
      title: 'Binance Live Crypto Exchange',
      externalUrl: 'https://www.binance.com/en/markets/overview',
      agentResponseVoice: 'Binance crypto market portal open kar ditta hey jani!',
      agentId: 'alice',
    };
  }

  if (lower.includes('tradingview') && isOpenIntent) {
    return {
      shouldOpen: true,
      target: 'external_web',
      title: 'TradingView Advanced Charts',
      externalUrl: 'https://www.tradingview.com/chart/',
      agentResponseVoice: 'TradingView live technical charting portal open kar ditta hey!',
      agentId: 'dave',
    };
  }

  if ((lower.includes('coingecko') || lower.includes('coinmarketcap')) && isOpenIntent) {
    return {
      shouldOpen: true,
      target: 'external_web',
      title: 'CoinMarketCap Global Crypto Index',
      externalUrl: 'https://coinmarketcap.com/',
      agentResponseVoice: 'CoinMarketCap global market capital portal khol ditta hey!',
      agentId: 'carol',
    };
  }

  return null;
}
