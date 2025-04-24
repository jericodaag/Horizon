import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TranslateComment from '@/components/shared/TranslateComment';
import { useTranslation } from '@/hooks/useTranslation';
import { IComment } from '@/types';

jest.unmock('@/components/shared/TranslateComment');

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

describe('TranslateComment Component', () => {
  const mockTranslateText = jest.fn();

  const mockEnglishComment: IComment = {
    $id: 'comment-1',
    userId: 'user-1',
    postId: 'post-1',
    content: 'This is a comment in English',
    createdAt: '2023-01-01T00:00:00Z',
    likes: [],
    user: {
      $id: 'user-1',
      name: 'Test User',
      username: 'testuser',
      imageUrl: '/test-user.jpg',
    },
  };

  const mockSpanishComment: IComment = {
    $id: 'comment-2',
    userId: 'user-2',
    postId: 'post-1',
    content: 'Este es un comentario en español',
    createdAt: '2023-01-01T00:00:00Z',
    likes: [],
    user: {
      $id: 'user-2',
      name: 'Spanish User',
      username: 'spanishuser',
      imageUrl: '/spanish-user.jpg',
    },
  };

  const mockEmptyComment: IComment = {
    $id: 'comment-3',
    userId: 'user-3',
    postId: 'post-1',
    content: '',
    createdAt: '2023-01-01T00:00:00Z',
    likes: [],
    user: {
      $id: 'user-3',
      name: 'Empty User',
      username: 'emptyuser',
      imageUrl: '/empty-user.jpg',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useTranslation as jest.Mock).mockReturnValue({
      translateText: mockTranslateText,
      isTranslating: false,
      error: null,
    });

  });

  it('renders comment content without translation button for English text', async () => {
    mockTranslateText.mockResolvedValue({
      translatedText: mockEnglishComment.content,
      detectedSourceLanguage: 'en',
    });

    render(<TranslateComment comment={mockEnglishComment} />);

    await waitFor(() => {
      expect(mockTranslateText).toHaveBeenCalled();
    });

    expect(screen.getByText(mockEnglishComment.content)).toBeInTheDocument();

    expect(screen.queryByTestId('translate-button')).not.toBeInTheDocument();
  });

  it('renders comment with translation button for non-English text', async () => {
    mockTranslateText.mockResolvedValue({
      translatedText: '',
      detectedSourceLanguage: 'es',
    });

    render(<TranslateComment comment={mockSpanishComment} />);

    await waitFor(() => {
      expect(mockTranslateText).toHaveBeenCalled();
    });

    expect(screen.getByText(mockSpanishComment.content)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('translate-button')).toBeInTheDocument();
    });

    expect(screen.getByText('(es)')).toBeInTheDocument();
  });

  it('shows translated content when translate button is clicked', async () => {
    mockTranslateText.mockResolvedValueOnce({
      translatedText: '',
      detectedSourceLanguage: 'es',
    });

    mockTranslateText.mockResolvedValueOnce({
      translatedText: 'This is a comment in Spanish',
      detectedSourceLanguage: 'es',
    });

    render(<TranslateComment comment={mockSpanishComment} />);

    await waitFor(() => {
      expect(screen.getByTestId('translate-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('translate-button'));

    expect(mockTranslateText).toHaveBeenCalledWith(mockSpanishComment.content);

    await waitFor(() => {
      expect(
        screen.getByText('This is a comment in Spanish')
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId('translate-button')).toHaveTextContent(
      'View original'
    );
  });

  it('toggles between original and translated text', async () => {
    mockTranslateText.mockResolvedValueOnce({
      translatedText: '',
      detectedSourceLanguage: 'es',
    });

    mockTranslateText.mockResolvedValueOnce({
      translatedText: 'This is a comment in Spanish',
      detectedSourceLanguage: 'es',
    });

    render(<TranslateComment comment={mockSpanishComment} />);

    await waitFor(() => {
      expect(screen.getByTestId('translate-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('translate-button'));

    await waitFor(() => {
      expect(
        screen.getByText('This is a comment in Spanish')
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('translate-button'));

    expect(screen.getByText(mockSpanishComment.content)).toBeInTheDocument();
    expect(screen.getByTestId('translate-button')).toHaveTextContent(
      'Translate'
    );
  });

  it('shows loading state during translation', async () => {
    mockTranslateText.mockResolvedValue({
      translatedText: '',
      detectedSourceLanguage: 'es',
    });

    (useTranslation as jest.Mock).mockReturnValue({
      translateText: mockTranslateText,
      isTranslating: true,
      error: null,
    });

    render(<TranslateComment comment={mockSpanishComment} />);

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
      detectedSourceLanguage: 'es',
    });

    mockTranslateText.mockRejectedValueOnce(new Error('Translation failed'));

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => { });

    render(<TranslateComment comment={mockSpanishComment} />);

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

    expect(screen.getByText(mockSpanishComment.content)).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('shows error message when provided from useTranslation', async () => {
    mockTranslateText.mockResolvedValue({
      translatedText: '',
      detectedSourceLanguage: 'es',
    });

    (useTranslation as jest.Mock).mockReturnValue({
      translateText: mockTranslateText,
      isTranslating: false,
      error: 'Translation service unavailable',
    });

    render(<TranslateComment comment={mockSpanishComment} />);

    await waitFor(() => {
      expect(
        screen.getByText('Translation service unavailable')
      ).toBeInTheDocument();
    });
  });

  it('handles empty comment content', async () => {
    render(<TranslateComment comment={mockEmptyComment} />);

    const paragraphs = screen.getAllByText('');
    expect(paragraphs.length).toBeGreaterThan(0);

    expect(screen.queryByTestId('translate-button')).not.toBeInTheDocument();

    expect(mockTranslateText).not.toHaveBeenCalled();
  });

  it('decodes HTML entities in translated text', async () => {
    mockTranslateText.mockResolvedValueOnce({
      translatedText: '',
      detectedSourceLanguage: 'es',
    });

    mockTranslateText.mockResolvedValueOnce({
      translatedText: 'This &amp; that',
      detectedSourceLanguage: 'es',
    });


    render(<TranslateComment comment={mockSpanishComment} />);

    await waitFor(() => {
      expect(screen.getByTestId('translate-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('translate-button'));

    await waitFor(() => {
      expect(mockTranslateText).toHaveBeenCalledWith(
        mockSpanishComment.content
      );
    });
  });
});
