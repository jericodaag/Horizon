import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TranslateButton from '@/components/shared/TranslateButton';
import { useTranslation } from '@/hooks/useTranslation';

jest.unmock('@/components/shared/TranslateButton');

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: jest.fn(),
}));

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
  const mockTranslateText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useTranslation as jest.Mock).mockReturnValue({
      translateText: mockTranslateText,
      isTranslating: false,
    });

    mockTranslateText.mockResolvedValue({
      translatedText: 'Translated text',
      detectedSourceLanguage: 'es',
    });
  });

  it('renders only text content if translation is not needed', async () => {
    mockTranslateText.mockResolvedValue({
      translatedText: 'English text',
      detectedSourceLanguage: 'en',
    });

    const { rerender } = render(<TranslateButton text='Some English text' />);

    await waitFor(() => {
      expect(mockTranslateText).toHaveBeenCalled();
    });

    expect(screen.getByText('Some English text')).toBeInTheDocument();
    expect(screen.queryByTestId('translate-button')).not.toBeInTheDocument();

    rerender(<TranslateButton text='Some English text' showAlways={true} />);

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

    expect(screen.getByText('(es)')).toBeInTheDocument();
  });

  it('translates text when translate button is clicked', async () => {
    render(<TranslateButton text='Texto en español' />);

    await waitFor(() => {
      expect(screen.getByTestId('translate-button')).toBeInTheDocument();
    });

    mockTranslateText.mockClear();
    mockTranslateText.mockResolvedValue({
      translatedText: 'Text in Spanish',
      detectedSourceLanguage: 'es',
    });

    fireEvent.click(screen.getByTestId('translate-button'));

    expect(mockTranslateText).toHaveBeenCalledWith('Texto en español');

    await waitFor(() => {
      expect(screen.getByText('Text in Spanish')).toBeInTheDocument();
    });

    expect(screen.getByTestId('translate-button')).toHaveTextContent(
      'View original'
    );
  });

  it('toggles between original and translated text', async () => {
    render(<TranslateButton text='Texto en español' />);

    await waitFor(() => {
      expect(screen.getByText('Texto en español')).toBeInTheDocument();
      expect(screen.getByTestId('translate-button')).toHaveTextContent(
        'Translate to English'
      );
    });

    mockTranslateText.mockResolvedValue({
      translatedText: 'Text in Spanish',
      detectedSourceLanguage: 'es',
    });

    fireEvent.click(screen.getByTestId('translate-button'));

    await waitFor(() => {
      expect(screen.getByText('Text in Spanish')).toBeInTheDocument();
      expect(screen.getByTestId('translate-button')).toHaveTextContent(
        'View original'
      );
    });

    fireEvent.click(screen.getByTestId('translate-button'));

    expect(screen.getByText('Texto en español')).toBeInTheDocument();
    expect(screen.getByTestId('translate-button')).toHaveTextContent(
      'Translate to English'
    );
  });

  it('shows loading state during translation', async () => {
    (useTranslation as jest.Mock).mockReturnValue({
      translateText: mockTranslateText,
      isTranslating: true,
    });

    render(<TranslateButton text='Texto en español' />);

    await waitFor(() => {
      const button = screen.getByTestId('translate-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Translating...');
      expect(button).toBeDisabled();
    });
  });

  it('handles translation errors gracefully', async () => {
    mockTranslateText.mockResolvedValueOnce({
      translatedText: '',
      detectedSourceLanguage: 'fr',
    });

    mockTranslateText.mockRejectedValueOnce(new Error('Translation failed'));

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => { });

    render(<TranslateButton text='Texte en français' />);

    await waitFor(() => {
      expect(screen.getByTestId('translate-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('translate-button'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Translation error:',
        expect.any(Error)
      );
    });

    expect(screen.getByText('Texte en français')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('displays the original text if translation is not available', async () => {
    mockTranslateText.mockResolvedValueOnce({
      translatedText: '',
      detectedSourceLanguage: 'ru',
    });

    mockTranslateText.mockResolvedValueOnce({
      translatedText: null,
      detectedSourceLanguage: 'ru',
    });

    render(<TranslateButton text='Русский текст' />);

    await waitFor(() => {
      expect(screen.getByTestId('translate-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('translate-button'));

    await waitFor(() => {
      expect(screen.getByText('Русский текст')).toBeInTheDocument();
    });
  });
});
