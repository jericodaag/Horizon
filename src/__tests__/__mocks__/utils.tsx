export const mockCn = jest.fn((...inputs) => {
    // Actually use the inputs to silence TypeScript warnings
    const inputsString = inputs.join(' ');
    return `mock-classname-${inputsString}`;
});

export const mockConvertFileToUrl = jest.fn((file) => {
    // Use file parameter to silence TypeScript warnings
    return `mock-file-url-for-${file.name || 'unnamed-file'}`;
});

export const mockFormatDateString = jest.fn((dateString) => {
    // Use dateString parameter to silence TypeScript warnings
    return `January 1, 2023 at 12:00 PM (from ${dateString})`;
});

export const mockMultiFormatDateString = jest.fn((timestamp) => {
    // Use timestamp parameter to silence TypeScript warnings
    return timestamp ? '2 days ago' : 'Just now';
});

export const mockCheckIsLiked = jest.fn((likeList, userId) => {
    // Use both parameters as intended
    return likeList.includes(userId);
});

export const mockTimeAgo = jest.fn((timestamp) => {
    // Use timestamp parameter to silence TypeScript warnings
    return timestamp ? '2 days ago' : 'Just now';
});

// Mock the entire utils module
jest.mock('@/lib/utils', () => ({
    cn: (...inputs) => mockCn(...inputs),
    convertFileToUrl: (file) => mockConvertFileToUrl(file),
    formatDateString: (dateString) => mockFormatDateString(dateString),
    multiFormatDateString: (timestamp) => mockMultiFormatDateString(timestamp),
    checkIsLiked: (likeList, userId) => mockCheckIsLiked(likeList, userId),
    timeAgo: (timestamp) => mockTimeAgo(timestamp)
}));