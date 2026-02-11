
import { TarotCard, TarotTheme } from './types';

export const DEFAULT_CARD_BACK = './cards/original/back.png';

export const THEME_CONFIGS: Record<TarotTheme, { name: string; baseUrl: string; filter: string; description: string }> = {
  original: { 
    name: "Classic", 
    baseUrl: "./cards/original", 
    filter: "none",
    description: "The timeless standard deck for clear guidance."
  },
  anime: { 
    name: "Anime", 
    baseUrl: "./cards/anime", 
    filter: "saturate(1.2)",
    description: "Vibrant expressive art for modern questions."
  },
  alchemy: { 
    name: "Alchemy", 
    baseUrl: "./cards/alchemy", 
    filter: "sepia(0.5)",
    description: "Antique finishes for deep introspection."
  },
  midnight: { 
    name: "Midnight", 
    baseUrl: "./cards/midnight", 
    filter: "hue-rotate(240deg)",
    description: "Lunar energy for secrets and hidden truths."
  },
  ethereal: { 
    name: "Ethereal", 
    baseUrl: "./cards/ethereal", 
    filter: "opacity(0.8) contrast(0.8)",
    description: "Dream-like visions for spiritual work."
  }
};

const generateFilename = (suit: string, val: string): string => {
  if (suit === 'major') return `m${val.padStart(2, '0')}`;
  const s = suit[0]; 
  let v = val === 'Ace' ? '01' : val === 'Page' ? '11' : val === 'Knight' ? '12' : val === 'Queen' ? '13' : val === 'King' ? '14' : val.padStart(2, '0');
  return `${s}${v}`;
};

export const TAROT_DECK: TarotCard[] = [
  ...Array.from({ length: 22 }, (_, i) => {
    const names = ['The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance', 'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'];
    return { name: names[i], suit: 'major' as const, value: String(i), filename: generateFilename('major', String(i)) };
  }),
  ...(['wands', 'cups', 'swords', 'pentacles'] as const).flatMap(suit => {
    const cards: TarotCard[] = [];
    for (let i = 1; i <= 10; i++) {
      const val = i === 1 ? 'Ace' : String(i);
      cards.push({ name: `${val} of ${suit}`, suit, value: val, filename: generateFilename(suit, val) });
    }
    ['Page', 'Knight', 'Queen', 'King'].forEach(court => {
      cards.push({ name: `${court} of ${suit}`, suit, value: court, filename: generateFilename(suit, court) });
    });
    return cards;
  })
];

export const getThemeCardUrl = (card: TarotCard | null, theme: TarotTheme): string => {
  const config = THEME_CONFIGS[theme] || THEME_CONFIGS.original;
  if (!card) return `${config.baseUrl}/back.png`;
  return `${config.baseUrl}/${card.filename}.png`;
};
