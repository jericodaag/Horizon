import { useState } from 'react';

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [translationCache, setTranslationCache] = useState<Record<string, any>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);

  const translateText = async (text: string, targetLang = 'en') => {
    if (!text) return { translatedText: '', detectedSourceLanguage: '' };

    // Check cache first
    const cacheKey = `${text}-${targetLang}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    try {
      setIsTranslating(true);
      setError(null);

      // Get API key from environment variables
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

      if (!apiKey) {
        console.error('Translation API key is missing');
        throw new Error('Translation API configuration error');
      }

      const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLang,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Translation API HTTP error: ${response.status}`,
          errorText
        );
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error('Translation API error:', data.error);
        throw new Error(data.error.message || 'Translation failed');
      }

      if (
        data.data &&
        data.data.translations &&
        data.data.translations.length > 0
      ) {
        const sourceLang = data.data.translations[0].detectedSourceLanguage;
        setDetectedLanguage(sourceLang);

        // Cache the result
        const result = {
          translatedText: data.data.translations[0].translatedText,
          detectedSourceLanguage: sourceLang,
        };

        setTranslationCache((prev) => ({
          ...prev,
          [cacheKey]: result,
        }));

        return result;
      }

      return { translatedText: text, detectedSourceLanguage: 'en' };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown translation error';
      console.error('Translation error:', error);
      setError(errorMessage);
      return { translatedText: text, detectedSourceLanguage: 'en' };
    } finally {
      setIsTranslating(false);
    }
  };

  const checkLanguage = async (text: string) => {
    if (!text) return null;

    try {
      const { detectedSourceLanguage } = await translateText(
        text.substring(0, 50)
      );
      if (detectedSourceLanguage !== 'en') {
        return detectedSourceLanguage;
      }
      return null;
    } catch (error) {
      console.error('Language detection error:', error);
      return null;
    }
  };

  return {
    translateText,
    checkLanguage,
    isTranslating,
    detectedLanguage,
    error,
  };
};
