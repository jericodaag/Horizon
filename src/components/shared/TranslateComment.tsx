import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { IComment } from '@/types';

interface TranslateCommentProps {
  comment: IComment;
}

const TranslateComment: React.FC<TranslateCommentProps> = ({ comment }) => {
  const [translatedContent, setTranslatedContent] = useState<string | null>(
    null
  );
  const [showTranslation, setShowTranslation] = useState(false);
  const [needsTranslation, setNeedsTranslation] = useState(false);
  const [sourceLang, setSourceLang] = useState<string | null>(null);
  const { translateText, isTranslating, error } = useTranslation();

  // Helper function to decode HTML entities
  const decodeHtml = (html: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
  };

  // Check if translation is needed
  useEffect(() => {
    const checkLanguage = async () => {
      if (!comment.content) return;

      try {
        // Do a quick check to detect language
        const { detectedSourceLanguage } = await translateText(
          comment.content.substring(0, 50)
        );
        const needsTranslating =
          detectedSourceLanguage !== 'en' && detectedSourceLanguage !== '';
        setNeedsTranslation(needsTranslating);
        if (needsTranslating) {
          setSourceLang(detectedSourceLanguage);
        }
      } catch (error) {
        console.error('Error checking language:', error);
      }
    };

    checkLanguage();
  }, [comment.content, translateText]);

  const handleTranslate = async () => {
    if (!showTranslation && !translatedContent) {
      try {
        const { translatedText: result } = await translateText(comment.content);
        setTranslatedContent(result);
      } catch (error) {
        console.error('Translation error:', error);
      }
    }

    setShowTranslation(!showTranslation);
  };

  // If no content or translation not needed, show original
  if (!comment.content || (!needsTranslation && !showTranslation)) {
    return <p className='text-light-2 text-sm'>{comment.content}</p>;
  }

  return (
    <div className='comment-translate-container'>
      <p className='text-light-2 text-sm'>
        {showTranslation
          ? decodeHtml(translatedContent || comment.content)
          : comment.content}
      </p>

      {needsTranslation && (
        <div className='flex items-start justify-start mb-1'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleTranslate}
            disabled={isTranslating}
            className='text-xs text-primary-500 hover:text-primary-600 mt-0.5 p-0 h-auto flex items-center gap-1 justify-start'
          >
            {isTranslating ? (
              'Translating...'
            ) : showTranslation ? (
              'View original'
            ) : (
              <>
                {sourceLang && (
                  <span className='text-light-3 text-[10px]'>
                    ({sourceLang})
                  </span>
                )}
                Translate
              </>
            )}
          </Button>

          {error && <p className='text-xs text-red-500 mt-1'>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default TranslateComment;
