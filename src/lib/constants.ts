import { Theme, AmbientSound, Badge } from '../types';

export const COUNTRIES = [
  { code: 'IN', name: 'India', timezone: 'Asia/Kolkata' },
  { code: 'US', name: 'United States', timezone: 'America/New_York' },
  { code: 'GB', name: 'United Kingdom', timezone: 'Europe/London' },
  { code: 'CA', name: 'Canada', timezone: 'America/Toronto' },
  { code: 'AU', name: 'Australia', timezone: 'Australia/Sydney' },
  { code: 'JP', name: 'Japan', timezone: 'Asia/Tokyo' },
  { code: 'DE', name: 'Germany', timezone: 'Europe/Berlin' },
  { code: 'FR', name: 'France', timezone: 'Europe/Paris' },
  { code: 'ZA', name: 'South Africa', timezone: 'Africa/Johannesburg' },
  { code: 'BR', name: 'Brazil', timezone: 'America/Sao_Paulo' },
  { code: 'SG', name: 'Singapore', timezone: 'Asia/Singapore' },
  { code: 'AE', name: 'United Arab Emirates', timezone: 'Asia/Dubai' },
  { code: 'MX', name: 'Mexico', timezone: 'America/Mexico_City' },
  { code: 'CN', name: 'China', timezone: 'Asia/Shanghai' },
  { code: 'ES', name: 'Spain', timezone: 'Europe/Madrid' },
  { code: 'IT', name: 'Italy', timezone: 'Europe/Rome' },
  { code: 'NL', name: 'Netherlands', timezone: 'Europe/Amsterdam' },
  { code: 'SE', name: 'Sweden', timezone: 'Europe/Stockholm' },
  { code: 'CH', name: 'Switzerland', timezone: 'Europe/Zurich' },
  { code: 'NZ', name: 'New Zealand', timezone: 'Pacific/Auckland' },
  { code: 'KR', name: 'South Korea', timezone: 'Asia/Seoul' },
  { code: 'PH', name: 'Philippines', timezone: 'Asia/Manila' },
  { code: 'MY', name: 'Malaysia', timezone: 'Asia/Kuala_Lumpur' },
  { code: 'ID', name: 'Indonesia', timezone: 'Asia/Jakarta' },
  { code: 'VN', name: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
  { code: 'TH', name: 'Thailand', timezone: 'Asia/Bangkok' },
  { code: 'PK', name: 'Pakistan', timezone: 'Asia/Karachi' },
  { code: 'BD', name: 'Bangladesh', timezone: 'Asia/Dhaka' },
  { code: 'NP', name: 'Nepal', timezone: 'Asia/Kathmandu' },
  { code: 'LK', name: 'Sri Lanka', timezone: 'Asia/Colombo' },
  { code: 'SA', name: 'Saudi Arabia', timezone: 'Asia/Riyadh' },
  { code: 'TR', name: 'Turkey', timezone: 'Europe/Istanbul' },
  { code: 'EG', name: 'Egypt', timezone: 'Africa/Cairo' },
  { code: 'QA', name: 'Qatar', timezone: 'Asia/Qatar' },
  { code: 'IL', name: 'Israel', timezone: 'Asia/Jerusalem' },
  { code: 'AR', name: 'Argentina', timezone: 'America/Argentina/Buenos_Aires' },
  { code: 'CL', name: 'Chile', timezone: 'America/Santiago' },
  { code: 'CO', name: 'Colombia', timezone: 'America/Bogota' },
  { code: 'PE', name: 'Peru', timezone: 'America/Lima' },
  { code: 'CR', name: 'Costa Rica', timezone: 'America/Costa_Rica' },
  { code: 'NG', name: 'Nigeria', timezone: 'Africa/Lagos' },
  { code: 'KE', name: 'Kenya', timezone: 'Africa/Nairobi' },
  { code: 'MA', name: 'Morocco', timezone: 'Africa/Casablanca' },
  { code: 'GH', name: 'Ghana', timezone: 'Africa/Accra' },
  { code: 'IE', name: 'Ireland', timezone: 'Europe/Dublin' },
  { code: 'NO', name: 'Norway', timezone: 'Europe/Oslo' },
  { code: 'PL', name: 'Poland', timezone: 'Europe/Warsaw' },
  { code: 'PT', name: 'Portugal', timezone: 'Europe/Lisbon' },
  { code: 'AT', name: 'Austria', timezone: 'Europe/Vienna' },
  { code: 'BE', name: 'Belgium', timezone: 'Europe/Brussels' },
  { code: 'FI', name: 'Finland', timezone: 'Europe/Helsinki' },
  { code: 'DK', name: 'Denmark', timezone: 'Europe/Copenhagen' },
  { code: 'UA', name: 'Ukraine', timezone: 'Europe/Kyiv' },
  { code: 'RU', name: 'Russia', timezone: 'Europe/Moscow' },
  { code: 'KZ', name: 'Kazakhstan', timezone: 'Asia/Almaty' },
  { code: 'GR', name: 'Greece', timezone: 'Europe/Athens' },
  { code: 'DZ', name: 'Algeria', timezone: 'Africa/Algiers' },
  { code: 'ET', name: 'Ethiopia', timezone: 'Africa/Addis_Ababa' },
  { code: 'UG', name: 'Uganda', timezone: 'Africa/Kampala' },
  { code: 'TZ', name: 'Tanzania', timezone: 'Africa/Dar_es_Salaam' }
];

export const THEMES: Theme[] = [
  {
    id: 'warm-cozy',
    name: 'Warm Cozy',
    isPremium: false,
    className: 'theme-warm-cozy',
    colors: {
      bg: 'bg-amber-50/70',
      card: 'bg-white/90 border border-amber-100',
      text: 'text-amber-900',
      primary: 'bg-amber-600',
      primaryHover: 'hover:bg-amber-700',
      accent: 'text-amber-600',
      muted: 'text-amber-700/60',
      border: 'border-amber-100'
    }
  },
  {
    id: 'dark-academia',
    name: 'Dark Academia',
    isPremium: false,
    className: 'theme-dark-academia',
    colors: {
      bg: 'bg-stone-900/95 text-stone-100',
      card: 'bg-stone-850/90 border border-stone-800',
      text: 'text-stone-100',
      primary: 'bg-amber-800',
      primaryHover: 'hover:bg-amber-900',
      accent: 'text-amber-400',
      muted: 'text-stone-400',
      border: 'border-stone-800'
    }
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    isPremium: false,
    className: 'theme-pastel',
    colors: {
      bg: 'bg-purple-50/70',
      card: 'bg-white/90 border border-purple-100',
      text: 'text-purple-900',
      primary: 'bg-purple-500',
      primaryHover: 'hover:bg-purple-600',
      accent: 'text-purple-600',
      muted: 'text-purple-500/60',
      border: 'border-purple-100'
    }
  },
  {
    id: 'forest-sanctuary',
    name: 'Forest Sanctuary',
    isPremium: false,
    className: 'theme-forest',
    colors: {
      bg: 'bg-emerald-50/70',
      card: 'bg-white/90 border border-emerald-100',
      text: 'text-emerald-950',
      primary: 'bg-emerald-700',
      primaryHover: 'hover:bg-emerald-800',
      accent: 'text-emerald-600',
      muted: 'text-emerald-800/60',
      border: 'border-emerald-100'
    }
  },
  {
    id: 'midnight-chill',
    name: 'Midnight Chill',
    isPremium: false,
    className: 'theme-midnight',
    colors: {
      bg: 'bg-slate-950 text-slate-100',
      card: 'bg-slate-900/80 border border-slate-800',
      text: 'text-slate-100',
      primary: 'bg-indigo-600',
      primaryHover: 'hover:bg-indigo-700',
      accent: 'text-indigo-400',
      muted: 'text-slate-400',
      border: 'border-slate-800'
    }
  },
  {
    id: 'cyberpunk-study',
    name: 'Cyberpunk Study',
    isPremium: false,
    className: 'theme-cyberpunk',
    colors: {
      bg: 'bg-zinc-950 text-zinc-100',
      card: 'bg-zinc-900/80 border border-yellow-400/20',
      text: 'text-zinc-100',
      primary: 'bg-yellow-400 text-zinc-950 font-semibold',
      primaryHover: 'hover:bg-yellow-500',
      accent: 'text-yellow-400',
      muted: 'text-zinc-500',
      border: 'border-zinc-800'
    }
  },
  {
    id: 'matcha-latte',
    name: 'Matcha Latte',
    isPremium: false,
    className: 'theme-matcha-latte',
    colors: {
      bg: 'bg-green-50/70',
      card: 'bg-white/90 border border-green-100',
      text: 'text-green-900',
      primary: 'bg-green-600',
      primaryHover: 'hover:bg-green-700',
      accent: 'text-green-600',
      muted: 'text-green-700/60',
      border: 'border-green-100'
    }
  },
  {
    id: 'lavender-mist',
    name: 'Lavender Mist',
    isPremium: false,
    className: 'theme-lavender-mist',
    colors: {
      bg: 'bg-violet-50/70',
      card: 'bg-white/90 border border-violet-100',
      text: 'text-violet-950',
      primary: 'bg-violet-600',
      primaryHover: 'hover:bg-violet-700',
      accent: 'text-violet-600',
      muted: 'text-violet-800/60',
      border: 'border-violet-100'
    }
  },
  {
    id: 'autumn-leaves',
    name: 'Autumn Leaves',
    isPremium: false,
    className: 'theme-autumn-leaves',
    colors: {
      bg: 'bg-orange-50/70',
      card: 'bg-white/90 border border-orange-100',
      text: 'text-orange-950',
      primary: 'bg-orange-600',
      primaryHover: 'hover:bg-orange-700',
      accent: 'text-orange-600',
      muted: 'text-orange-800/60',
      border: 'border-orange-100'
    }
  },
  {
    id: 'espresso-bar',
    name: 'Espresso Bar',
    isPremium: false,
    className: 'theme-espresso-bar',
    colors: {
      bg: 'bg-stone-900/95 text-stone-100',
      card: 'bg-stone-850/90 border border-stone-800',
      text: 'text-stone-100',
      primary: 'bg-amber-800',
      primaryHover: 'hover:bg-amber-900',
      accent: 'text-amber-500',
      muted: 'text-stone-400',
      border: 'border-stone-800'
    }
  },
  {
    id: 'peach-sorbet',
    name: 'Peach Sorbet',
    isPremium: false,
    className: 'theme-peach-sorbet',
    colors: {
      bg: 'bg-rose-50/70',
      card: 'bg-white/90 border border-rose-100',
      text: 'text-rose-950',
      primary: 'bg-rose-500',
      primaryHover: 'hover:bg-rose-600',
      accent: 'text-rose-600',
      muted: 'text-rose-800/60',
      border: 'border-rose-100'
    }
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    isPremium: false,
    className: 'theme-ocean-breeze',
    colors: {
      bg: 'bg-sky-50/70',
      card: 'bg-white/90 border border-sky-100',
      text: 'text-sky-950',
      primary: 'bg-sky-600',
      primaryHover: 'hover:bg-sky-700',
      accent: 'text-sky-600',
      muted: 'text-sky-800/60',
      border: 'border-sky-100'
    }
  }
];

export const FONTS = [
  { id: 'font-timer-mono', name: 'Digital Mono', className: 'font-timer-mono' },
  { id: 'font-timer-serif', name: 'Vintage Serif', className: 'font-timer-serif' },
  { id: 'font-timer-cute', name: 'Cozy Cute (Rounded)', className: 'font-timer-cute' },
  { id: 'font-timer-modern', name: 'Modern Geometric', className: 'font-timer-modern' },
  { id: 'font-timer-sans', name: 'Minimalist Sans', className: 'font-timer-sans' }
];

export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'none', name: 'Silent Ambiance', icon: 'VolumeX', isPremium: false, type: 'synthesized' },
  { id: 'rain', name: 'Gentle Rain', icon: 'CloudRain', isPremium: false, type: 'synthesized', synthType: 'rain' },
  { id: 'cafe', name: 'Lo-Fi Cafe', icon: 'Coffee', isPremium: false, type: 'synthesized', synthType: 'cafe' },
  { id: 'nebula', name: 'Space Nebula', icon: 'Sparkles', isPremium: false, type: 'synthesized', synthType: 'nebula' },
  { id: 'campfire', name: 'Cozy Fireplace', icon: 'Flame', isPremium: false, type: 'synthesized', synthType: 'campfire' }
];

export const BADGES: Badge[] = [
  {
    id: 'first-step',
    name: 'First Step',
    description: 'Completed your very first study session. Keep it up!',
    icon: 'Compass',
    condition: 'Completed 1 session'
  },
  {
    id: 'streak-3',
    name: 'Consistent Miner',
    description: 'Maintained a daily study streak of 3 days.',
    icon: 'Award',
    condition: '3-day streak'
  },
  {
    id: 'streak-7',
    name: 'Weekly Ritual',
    description: 'Maintained a daily study streak of 7 days.',
    icon: 'Calendar',
    condition: '7-day streak'
  },
  {
    id: 'streak-14',
    name: 'Golden Flame',
    description: 'Maintained a spectacular 14-day study streak.',
    icon: 'Flame',
    condition: '14-day streak'
  },
  {
    id: 'streak-30',
    name: 'Indomitable Will',
    description: 'Maintained an incredible daily study streak of 30 days!',
    icon: 'Flame',
    condition: '30-day streak'
  },
  {
    id: 'studious-5h',
    name: 'Committed Scholar',
    description: 'Studied for a total of 5 hours.',
    icon: 'BookOpen',
    condition: '5 hours studied'
  },
  {
    id: 'studious-24h',
    name: 'Day of Knowledge',
    description: 'Studied for a total of 24 hours.',
    icon: 'Clock',
    condition: '24 hours studied'
  },
  {
    id: 'studious-50h',
    name: 'Nest Master',
    description: 'Studied for a total of 50 hours inside the Nest.',
    icon: 'Trophy',
    condition: '50 hours studied'
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Completed a study session late at night (11 PM - 4 AM).',
    icon: 'Moon',
    condition: 'Study after 11 PM'
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Completed a study session early in the morning (5 AM - 8 AM).',
    icon: 'Sun',
    condition: 'Study early morning'
  },
  {
    id: 'globe-trotter',
    name: 'Globe Trotter',
    description: 'Set your native country while joining the StudyNest.',
    icon: 'Globe',
    condition: 'Set country'
  },
  {
    id: 'deep-thinker',
    name: 'Deep Thinker',
    description: 'Completed a deep study session of at least 45 minutes.',
    icon: 'Brain',
    condition: '45+ min session'
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Logged 5 or more study sessions of any length.',
    icon: 'Zap',
    condition: '5+ study sessions'
  },
  {
    id: 'task-slayer',
    name: 'Task Slayer',
    description: 'Completed 10 study planner tasks on your mini calendar.',
    icon: 'CheckSquare',
    condition: '10 planner tasks'
  },
  {
    id: 'planner-master',
    name: 'Planner Master',
    description: 'Scheduled focus plans for 3 or more unique calendar dates.',
    icon: 'Calendar',
    condition: 'Plans for 3 dates'
  },
  {
    id: 'grandmaster',
    name: 'Study Grandmaster',
    description: 'Elevated your scholar level to Level 10 or higher!',
    icon: 'Crown',
    condition: 'Reach Level 10'
  },
  {
    id: 'monk-mode',
    name: 'Monk Mode',
    description: 'Logged an ultra-deep study session of 90 minutes or more.',
    icon: 'Activity',
    condition: '90+ min session'
  },
  {
    id: 'knowledge-sponge',
    name: 'Knowledge Sponge',
    description: 'Logged a total of 30 study sessions of any length.',
    icon: 'Sparkles',
    condition: '30+ study sessions'
  },
  {
    id: 'scholarly-century',
    name: 'Scholarly Century',
    description: 'Completed an incredible milestone of 100 study sessions!',
    icon: 'Trophy',
    condition: '100+ study sessions'
  },
  {
    id: 'zen-master',
    name: 'Zen Master',
    description: 'Logged a study session with calming soundscapes active.',
    icon: 'Volume2',
    condition: 'Study with sound'
  },
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Kept the grind alive by studying on a Saturday or Sunday.',
    icon: 'Flame',
    condition: 'Study on weekends'
  },
  {
    id: 'creative-genius',
    name: 'Creative Genius',
    description: 'Studied with one of the premium cozy or creative themes.',
    icon: 'Palette',
    condition: 'Cozy/Creative theme'
  },
  {
    id: 'customizer',
    name: 'Font Customizer',
    description: 'Aesthetic touch! Changed your timer to a custom typeface.',
    icon: 'Settings',
    condition: 'Change time font'
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Completed a complete full standard 25-minute Pomodoro block.',
    icon: 'CheckCircle2',
    condition: 'Full Pomodoro'
  }
];
