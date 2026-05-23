/** Queue languages — single source of truth for landing dropdown and agent config. */
export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Vietnamese (Tiếng Việt)' },
  { code: 'zh', label: 'Mandarin Chinese (普通话)' },
  { code: 'ja', label: 'Japanese (日本語)' },
  { code: 'ko', label: 'Korean (한국어)' },
  { code: 'fr', label: 'French (Français)' },
  { code: 'es', label: 'Spanish (Español)' },
  { code: 'id', label: 'Indonesian (Bahasa Indonesia)' },
  { code: 'ms', label: 'Malay (Bahasa Melayu)' },
  { code: 'th', label: 'Thai (ภาษาไทย)' },
  { code: 'tl', label: 'Filipino (Tagalog)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'my', label: 'Burmese (မြန်မာဘာသာ)' },
  { code: 'km', label: 'Khmer (ភាសាខ្មែរ)' },
  { code: 'sg-en', label: 'Singapore English (Singlish)' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
] as const;

export type LanguageCode = (typeof LANGUAGE_OPTIONS)[number]['code'];

/** Languages with dedicated Valsea real-time ASR mapping. Others use Agora Ares STT. */
export const VALSEA_ASR_LANGUAGE: Record<string, string> = {
  en: 'english',
  vi: 'vietnamese',
  id: 'indonesian',
  ms: 'malay',
  th: 'thai',
  tl: 'filipino',
  ta: 'tamil',
  km: 'khmer',
};

export function hasValseaAsr(code: string): boolean {
  return code in VALSEA_ASR_LANGUAGE;
}
