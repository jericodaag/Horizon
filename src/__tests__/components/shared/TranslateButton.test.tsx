import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TranslateButton from '@/components/shared/TranslateButton';
import { useTranslation } from '@/hooks/useTranslation';

// Unmock the component we're testing
jest.unmock('@/components/shared/TranslateButton');

// Mock dependencies
jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: jest.fn(),
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
      data-testid='translate-button'
    >
      {children}
    </button>
  ),
}));

describe('TranslateButton Component', () => {
  // Mock implementation of translateText
  const mockTranslateText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock for useTranslation
    (useTranslation as jest.Mock).mockReturnValue({
      translateText: mockTranslateText,
      isTranslating: false,
    });

    // Default behavior for translateText - simulate non-English text
    mockTranslateText.mockResolvedValue({
      translatedText: 'Translated text',
      detectedSourceLanguage: 'es',
    });
  });

  it('renders only text content if translation is not needed', async () => {
    // Mock English text
    mockTranslateText.mockResolvedValue({
      translatedText: 'English text',
      detectedSourceLanguage: 'en',
    });

    const { rerender } = render(<TranslateButton text='Some English text' />);

    // Wait for language detection
    await waitFor(() => {
      expect(mockTranslateText).toHaveBeenCalled();
    });

    // Should only render the text, no button
    expect(screen.getByText('Some English text')).toBeInTheDocument();
    expect(screen.queryByTestId('translate-button')).not.toBeInTheDocument();

    // Test with showAlways=true
    rerender(<TranslateButton text='Some English text' showAlways={true} />);

    // Should render the button due to showAlways
    await waitFor(() => {
      expect(screen.getByTestId('translate-button')).toBeInTheDocument();
    });
  });

  it('renders translate button when non-English text is detected', async () => {
    render(<TranslateButton text='Texto en español' />);

    await waitFor(() => {
      const translateButton = screen.getByTestId('translate-button');
      expect(translateButton).toBeInTheDocument();
      expect(translateButton).toHaveTextContent('Translate to English');
    });

    // Should show source language
    expect(screen.getByText('(es)')).toBeInTheDocument();
  });

  it('translates text when translate button is clicked', async () => {
    render(<TranslateButton text='Texto en español' />);

    // Wait for initial render with button
    await waitFor(() => {
      expect(screen.getByTestId('translate-button')).toBeInTheDocument();
    });

    // Reset mock to verify next call
    mockTranslateText.mockClear();
    mockTranslateText.mockResolvedValue({
      translatedText: 'Text in Spanish',
      detectedSourceLanguage: 'es',
    });

    // Click translate button
    fireEvent.click(screen.getByTestId('translate-button'));

    // Verify translateText was called again
    expect(mockTranslateText).toHaveBeenCalledWith('Texto en español');

    // Wait for translated text to appear
    await waitFor(() => {
      expect(screen.getByText('Text in Spanish')).toBeInTheDocument();
    });

    // Button text should change
    expect(screen.getByTestId('translate-button')).toHaveTextContent(
      'View original'
    );
  });

  it('toggles between original and translated text', async () => {
    render(<TranslateButton text='Texto en español' />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Texto en español')).toBeInTheDocument();
      expect(screen.getByTestId('translate-button')).toHaveTextContent(
        'Translate to English'
      );
    });

    // Setup mock for translation
    mockTranslateText.mockResolvedValue({
      translatedText: 'Text in Spanish',
      detectedSourceLanguage: 'es',
    });

    // Click to translate
    fireEvent.click(screen.getByTestId('translate-button'));

    // Wait for translated text
    await waitFor(() => {
      expect(screen.getByText('Text in Spanish')).toBeInTheDocument();
      expect(screen.getByTestId('translate-button')).toHaveTextContent(
        'View original'
      );
    });

    // Click to view original
    fireEvent.click(screen.getByTestId('translate-button'));

    // Should show original again
    expect(screen.getByText('Texto en español')).toBeInTheDocument();
    expect(screen.getByTestId('translate-button')).toHaveTextContent(
      'Translate to English'
    );
  });

  it('shows loading state during translation', async () => {
    // Mock translation in progress
    (useTranslation as jest.Mock).mockReturnValue({
      translateText: mockTranslateText,
      isTranslating: true,
    });

    render(<TranslateButton text='Texto en español' />);

    // Wait for render with loading state
    await waitFor(() => {
      const button = screen.getByTestId('translate-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Translating...');
      expect(button).toBeDisabled();
    });
  });

  it('handles translation errors gracefully', async () => {
    // Initial language detection
    mockTranslateText.mockResolvedValueOnce({
      translatedText: '',
      detectedSourceLanguage: 'fr',
    });

    // Mock error on actual translation
    mockTranslateText.mockRejectedValueOnce(new Error('Translation failed'));

    // Spy on console.error
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(<TranslateButton text='Texte en français' />);

    // Wait for button to render
    await waitFor(() => {
      expect(screen.getByTestId('translate-button')).toBeInTheDocument();
    });

    // Click translate button
    fireEvent.click(screen.getByTestId('translate-button'));

    // Should log error
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Translation error:',
        expect.any(Error)
      );
    });

    // Should still show original text
    expect(screen.getByText('Texte en français')).toBeInTheDocument();

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('displays the original text if translation is not available', async () => {
    // Initial language detection
    mockTranslateText.mockResolvedValueOnce({
      translatedText: '',
      detectedSourceLanguage: 'ru',
    });

    // Return null for actual translation
    mockTranslateText.mockResolvedValueOnce({
      translatedText: null,
      detectedSourceLanguage: 'ru',
    });

    render(<TranslateButton text='Русский текст' />);

    // Wait for button to render
    await waitFor(() => {
      expect(screen.getByTestId('translate-button')).toBeInTheDocument();
    });

    // Click translate button
    fireEvent.click(screen.getByTestId('translate-button'));

    // Should fall back to original text
    await waitFor(() => {
      // We're still showing the original text since translation is null
      expect(screen.getByText('Русский текст')).toBeInTheDocument();
    });
  });
});
