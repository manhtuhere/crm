export { LANGUAGE_OPTIONS, type LanguageCode } from './languages';

export type { UiCopy, UiLangCode } from './ui-copy-base';
export { formatIssueCount } from './ui-copy-base';

import type { LanguageCode } from './languages';
import { EN } from './ui-copy-base';
import { LOCALE_COPIES } from './ui-copy-locales';

export function getUiCopy(lang: string) {
  return LOCALE_COPIES[lang as LanguageCode] ?? EN;
}
