import { useAppContext } from '../store/AppContext';
import { translations, TranslationKey, Language } from '../i18n/translations';

export function useTranslation() {
  const { settings } = useAppContext();
  
  const t = (key: TranslationKey): string => {
    // Default to 'de' if language is not set or not found
    const lang = (settings.language as Language) || 'de';
    // Fallback to 'de', then 'en' if key is somehow missing
    const dict = translations[lang] || translations['de'];
    
    return dict[key] || translations['de'][key] || translations['en'][key] || key;
  };

  return { t, lang: settings.language };
}
