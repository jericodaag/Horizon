// Mock Loader component
jest.mock('@/components/shared/Loader', () => ({
    __esModule: true,
    default: () => <div data-testid="loader">Loading...</div>
}));

// Mock GridPostList component
jest.mock('@/components/shared/GridPostList', () => ({
    __esModule: true,
    default: ({ posts, showUser, showStats }: any) => (
        <div data-testid="grid-post-list" data-showuser={showUser} data-showstats={showStats}>
            {posts?.map((post: any) => (
                <div key={post.$id} data-testid={`post-${post.$id}`}>
                    {post.caption}
                </div>
            ))}
        </div>
    )
}));

// Mock FollowButton component
jest.mock('@/components/shared/FollowButton', () => ({
    __esModule: true,
    default: ({ userId, className }: any) => (
        <button data-testid={`follow-button-${userId}`} className={className}>
            Follow
        </button>
    )
}));

// Mock PostCard component
jest.mock('@/components/shared/PostCard', () => ({
    __esModule: true,
    default: ({ post }: any) => (
        <div data-testid={`post-card-${post.$id}`} className='post-card'>
            <h3>{post.caption}</h3>
            <p>By: {post.creator?.username || 'Unknown'}</p>
        </div>
    ),
}));

// Mock PostCardSkeleton component
jest.mock('@/components/shared/PostCardSkeleton', () => ({
    __esModule: true,
    default: () => (
        <div data-testid='post-skeleton'>Loading...</div>
    ),
}));

// Mock ConversationList component
jest.mock('@/components/shared/ConversationList', () => ({
    __esModule: true,
    default: ({ conversations, onSelectConversation }: any) => (
        <div data-testid='conversation-list'>
            {conversations && conversations.length > 0 ? (
                conversations.map((conversation: any) => {
                    const userId = conversation.user.$id || conversation.user.id;
                    return (
                        <button
                            key={userId}
                            data-testid={`conversation-${userId}`}
                            onClick={() => onSelectConversation(conversation.user)}
                        >
                            {conversation.user.name}
                        </button>
                    );
                })
            ) : (
                <div data-testid='no-conversations'>No conversations yet</div>
            )}
        </div>
    ),
}));

// Mock MessageChat component
jest.mock('@/components/shared/MessageChat', () => ({
    __esModule: true,
    default: ({ conversation, onBack }: any) => (
        <div data-testid='message-chat'>
            <button data-testid='back-button' onClick={onBack}>
                Back
            </button>
            <div data-testid='conversation-name'>{conversation.name}</div>
        </div>
    ),
}));

// Mock OnlineStatusIndicator component
jest.mock('@/components/shared/OnlineStatusIndicator', () => ({
    __esModule: true,
    default: ({ userId }: any) => (
        <div data-testid={`online-status-${userId}`} className="h-3 w-3 rounded-full bg-green-500"></div>
    ),
}));

// Mock DeleteConfirmationModal component
jest.mock('@/components/shared/DeleteConfirmationModal', () => ({
    __esModule: true,
    default: ({ isOpen, onClose, onConfirm, title = 'Delete Post', description = 'Are you sure you want to delete this post? This action cannot be undone.' }: any) => {
        if (!isOpen) return null;

        return (
            <div data-testid="delete-modal">
                <div data-testid="dialog-title">{title}</div>
                <div data-testid="dialog-description">{description}</div>
                <div data-testid="dialog-footer">
                    <button
                        data-testid="cancel-button"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        data-testid="confirm-delete"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        );
    }
}));

// Mock CommentSection component
jest.mock('@/components/shared/CommentSection', () => ({
    __esModule: true,
    default: ({ postId, postCreatorId }: any) => (
        <div data-testid='comment-section'>
            <div>Comments for post: {postId}</div>
            <div>Post creator: {postCreatorId}</div>
        </div>
    ),
}));


// Mock FollowModal component
jest.mock('@/components/shared/FollowModal', () => ({
    __esModule: true,
    default: ({ userId, type, isOpen, onClose }: any) =>
        isOpen ? (
            <div data-testid='follow-modal' data-type={type} data-userid={userId}>
                <button onClick={onClose} data-testid='close-modal'>
                    Close
                </button>
            </div>
        ) : null,
}));

// Mock ProfileUploader component
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

// Mock CoverPhotoUploader component
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

// PostStats mock
jest.mock('@/components/shared/PostStats', () => ({
    __esModule: true,
    default: ({ post, isGridView }: any) => (
        <div data-testid={`post-stats-${post.$id}`}>
            <div>{post.likes.length} likes</div>
            <div data-is-grid-view={isGridView}></div>
        </div>
    ),
}));

// TranslateButton Mock
jest.mock('@/components/shared/TranslateButton', () => ({
    __esModule: true,
    default: ({ text, showAlways }: any) => (
        <div data-testid="translate-button" data-show-always={showAlways}>
            <p>{text}</p>
            <button data-testid="translate-action">
                {showAlways ? 'Always Translate' : 'Translate'}
            </button>
        </div>
    ),
}));


