import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';

interface TranslateButtonProps {
  text: string;
  showAlways?: boolean;
}

const TranslateButton: React.FC<TranslateButtonProps> = ({
  text,
  showAlways = false,
}) => {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [needsTranslation, setNeedsTranslation] = useState(false);
  const [sourceLang, setSourceLang] = useState<string | null>(null);
  // Remove the unused detectedLanguage from destructuring
  const { translateText, isTranslating } = useTranslation();

  // Check if translation is needed
  useEffect(() => {
    const checkLanguage = async () => {
      if (!text) return;

      try {
        // Do a quick check to detect language
        const { detectedSourceLanguage } = await translateText(
          text.substring(0, 100)
        );
        const needsTranslating =
          detectedSourceLanguage !== 'en' && detectedSourceLanguage !== '';
        setNeedsTranslation(needsTranslating);
        // Store the source language for display
        if (needsTranslating) {
          setSourceLang(detectedSourceLanguage);
        }
      } catch (error) {
        console.error('Error checking language:', error);
      }
    };

    checkLanguage();
  }, [text, translateText]);

  const handleTranslate = async () => {
    if (!showTranslation && !translatedText) {
      try {
        const { translatedText: result } = await translateText(text);
        setTranslatedText(result);
      } catch (error) {
        console.error('Translation error:', error);
      }
    }

    setShowTranslation(!showTranslation);
  };

  // Don't render anything if translation not needed and showAlways is false
  if (!needsTranslation && !showAlways) return <>{text}</>;

  return (
    <div className='translate-container'>
      <p className='text-light-2'>
        {showTranslation ? translatedText || text : text}
      </p>

      {(needsTranslation || showAlways) && (
        <Button
          variant='ghost'
          size='sm'
          onClick={handleTranslate}
          disabled={isTranslating}
          className='text-xs text-primary-500 hover:text-primary-600 mt-1 p-0 h-auto flex items-center gap-1'
        >
          {isTranslating ? (
            'Translating...'
          ) : showTranslation ? (
            'View original'
          ) : (
            <>
              {sourceLang && (
                <span className='text-light-3 text-[10px]'>({sourceLang})</span>
              )}
              Translate to English
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default TranslateButton;
