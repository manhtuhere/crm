'use client';

import { useEffect } from 'react';

/** Maps BCP-47-ish language codes to a valid `html[lang]` value. */
function toHtmlLang(code: string): string {
  if (code === 'yue') return 'zh-HK';
  if (code === 'zh') return 'zh';
  return code.split('-')[0] || 'en';
}

export function useDocumentLang(languageCode: string) {
  useEffect(() => {
    document.documentElement.lang = toHtmlLang(languageCode);
  }, [languageCode]);
}
