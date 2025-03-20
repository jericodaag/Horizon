import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UpdateProfile from '@/_root/pages/UpdateProfile';
import { act } from 'react-dom/test-utils';

// Import specific mocks we'll configure for this test
import { mockNavigate } from '@/__tests__/__mocks__/router';
import { mockGetUserById, mockUpdateUser } from '@/__tests__/__mocks__/api';

// Mock components specific to UpdateProfile that aren't in global mocks
jest.mock('@/components/shared/ProfileUploader', () => ({
    __esModule: true,
    default: ({ fieldChange, mediaUrl }: any) => (
        <div data-testid="profile-uploader">
            <img
                src={mediaUrl}
                alt="Profile preview"
                data-testid="profile-preview"
            />
            <button
                onClick={() => fieldChange([new File(['test'], 'test.png', { type: 'image/png' })])}
                data-testid="upload-profile"
            >
                Upload Profile
            </button>
        </div>
    ),
}));

jest.mock('@/components/shared/CoverPhotoUploader', () => ({
    __esModule: true,
    default: ({ fieldChange, mediaUrl, positionChange }: any) => (
        <div data-testid="cover-uploader">
            {mediaUrl && (
                <img
                    src={mediaUrl}
                    alt="Cover preview"
                    data-testid="cover-preview"
                />
            )}
            <button
                onClick={() => fieldChange([new File(['test'], 'cover.png', { type: 'image/png' })])}
                data-testid="upload-cover"
            >
                Upload Cover
            </button>
            <button
                onClick={() => positionChange && positionChange(JSON.stringify({ y: 30 }))}
                data-testid="adjust-position"
            >
                Adjust Position
            </button>
        </div>
    ),
}));

// Mock form validation libraries
jest.mock('@hookform/resolvers/zod', () => ({
    zodResolver: jest.fn(() => jest.fn()),
}));

// Override router mocks for UpdateProfile specific needs
jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom');
    return {
        ...originalModule,
        useParams: () => ({ id: 'user123' }),
        useNavigate: () => mockNavigate,
    };
});

// Mock the AuthContext
jest.mock('@/context/AuthContext', () => {
    const mockSetUser = jest.fn();
    return {
        useUserContext: () => ({
            user: {
                id: 'user123',
                name: 'Test User',
                username: 'testuser',
                email: 'test@example.com',
                imageUrl: 'https://example.com/avatar.jpg',
                bio: 'This is a test bio'
            },
            setUser: mockSetUser,
            isLoading: false,
            isAuthenticated: true,
            setIsAuthenticated: jest.fn(),
            checkAuthUser: jest.fn(),
        }),
    };
});

// Import AuthContext mock to get access to mockSetUser
import { useUserContext } from '@/context/AuthContext';
const mockSetUser = (useUserContext() as any).setUser;

describe('UpdateProfile Component', () => {
    // Mock user data from API
    const mockUserData = {
        $id: 'user123',
        $createdAt: '2023-01-01T12:00:00.000Z',
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        imageUrl: 'https://example.com/avatar.jpg',
        bio: 'This is a test bio',
        imageId: 'image123',
        coverImageUrl: 'https://example.com/cover.jpg',
        coverImageId: 'cover123',
        coverPosition: '{ "y": 50 }'
    };

    // Mock update user mutation function
    const mockUpdateUserFn = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Set up default mock implementations
        mockGetUserById.mockReturnValue({
            data: mockUserData,
            isLoading: false,
        });

        mockUpdateUser.mockReturnValue({
            mutateAsync: mockUpdateUserFn,
            isPending: false,
        });

        // Set up default mockUpdateUserFn implementation
        mockUpdateUserFn.mockResolvedValue({
            ...mockUserData,
            name: 'Updated User',
            bio: 'Updated bio',
        });
    });

    it('renders the update profile form with user data', () => {
        render(<UpdateProfile />);

        // Check page title
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();

        // Check for form fields
        expect(screen.getByText('Cover Photo')).toBeInTheDocument();
        expect(screen.getByText('Profile Picture')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Bio')).toBeInTheDocument();

        // Check for buttons
        expect(screen.getByTestId('button-button')).toHaveTextContent('Cancel');
        expect(screen.getByTestId('button-submit')).toHaveTextContent('Update Profile');
    });

    it('navigates back when cancel button is clicked', () => {
        render(<UpdateProfile />);

        // Click cancel button
        const cancelButton = screen.getByTestId('button-button');
        fireEvent.click(cancelButton);

        // Check if navigate was called with -1
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('shows loading spinner when update is in progress', () => {
        // Override the update user hook to show pending state
        mockUpdateUser.mockReturnValue({
            mutateAsync: mockUpdateUserFn,
            isPending: true,
        });

        render(<UpdateProfile />);

        // Check for loading icon
        expect(screen.getByTestId('loader-icon')).toBeInTheDocument();

        // Submit button should be disabled
        const submitButton = screen.getByTestId('button-submit');
        expect(submitButton).toBeDisabled();
    });

    it('handles profile image upload', async () => {
        render(<UpdateProfile />);

        // Find profile uploader component
        const profileUploader = screen.getByTestId('profile-uploader');
        expect(profileUploader).toBeInTheDocument();

        // Check that profile preview shows current image
        const profilePreview = screen.getByTestId('profile-preview');
        expect(profilePreview).toHaveAttribute('src', mockUserData.imageUrl);

        // Click upload button to simulate file selection
        const uploadButton = screen.getByTestId('upload-profile');
        fireEvent.click(uploadButton);

        // Submit the form
        const submitButton = screen.getByTestId('button-submit');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        // Check that updateUser was called
        expect(mockUpdateUserFn).toHaveBeenCalled();
    });

    it('handles form submission with file uploads and position adjustments', async () => {
        render(<UpdateProfile />);

        // Verify basic components are present
        expect(screen.getByTestId('profile-uploader')).toBeInTheDocument();
        expect(screen.getByTestId('cover-uploader')).toBeInTheDocument();

        // Simulate profile image upload 
        fireEvent.click(screen.getByTestId('upload-profile'));

        // Simulate cover photo upload and adjustment
        fireEvent.click(screen.getByTestId('upload-cover'));
        fireEvent.click(screen.getByTestId('adjust-position'));

        // Submit the form
        const submitButton = screen.getByTestId('button-submit');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        // Verify the update function was called
        expect(mockUpdateUserFn).toHaveBeenCalled();

        // Verify navigation happened after submission
        expect(mockNavigate).toHaveBeenCalledWith('/profile/user123');
    });

    it('updates user data and navigates to profile page when form is submitted', async () => {
        render(<UpdateProfile />);

        // Submit the form
        const submitButton = screen.getByTestId('button-submit');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        // Check that updateUser was called with the right user ID
        expect(mockUpdateUserFn).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'user123',
            })
        );

        // Check that setUser was called with updated data
        expect(mockSetUser).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Updated User',
                bio: 'Updated bio',
            })
        );

        // Check that navigate was called to profile page
        expect(mockNavigate).toHaveBeenCalledWith('/profile/user123');
    });

    it('handles update failure gracefully', async () => {
        // Mock updateUser to return null (failure)
        mockUpdateUserFn.mockResolvedValue(null);

        render(<UpdateProfile />);

        // Submit the form
        const submitButton = screen.getByTestId('button-submit');
        await act(async () => {
            fireEvent.click(submitButton);
        });

        // Check that setUser was not called
        expect(mockSetUser).not.toHaveBeenCalled();

        // Check that navigate was not called
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});