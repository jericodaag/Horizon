# Horizon - Full-Stack Social Media Application

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Appwrite](https://img.shields.io/badge/Appwrite-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)](https://appwrite.io/)
[![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=react-hook-form&logoColor=white)](https://react-hook-form.com/)
[![Zod](https://img.shields.io/badge/Zod-3068B7?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)

## Project Overview

Horizon is a modern social media platform built with cutting-edge technologies, offering users a seamless and engaging experience for content creation and social interaction. The application provides a complete social media experience with features like post creation, user follows, real-time messaging, notifications, and more.

## Key Features

🔐 **Secure Authentication**
  - Email & Password login
  - Protected routes & sessions
  - User profile management

📱 **Core Social Features**
  - Create, edit & delete posts with images
  - Like & save functionality
  - Follow/unfollow users
  - Personalized feed
  - Explore page with search functionality

💬 **Interactive Elements**
  - Real-time notifications for likes, comments, and follows
  - Live chat messaging with read receipts
  - Post comments with GIF support
  - Media sharing capabilities

🎨 **Modern UI/UX**
  - Responsive design (mobile & desktop)
  - Dark/Light themes
  - Animated transitions using Framer Motion
  - Infinite scrolling for posts

## Tech Stack

### Frontend Technologies
<p align="left">
  <img src="https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg" alt="react" width="25" height="25"/>
  <img src="https://www.vectorlogo.zone/logos/typescriptlang/typescriptlang-icon.svg" alt="typescript" width="25" height="25"/>
  <img src="https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg" alt="tailwind" width="25" height="25"/>
  <img src="https://www.vectorlogo.zone/logos/javascript/javascript-icon.svg" alt="javascript" width="25" height="25"/>
  <img src="https://www.vectorlogo.zone/logos/socketio/socketio-icon.svg" alt="socket.io" width="25" height="25"/>
  <img src="https://www.vectorlogo.zone/logos/framer/framer-icon.svg" alt="framer" width="25" height="25"/>
  <img src="https://www.vectorlogo.zone/logos/vitejsdev/vitejsdev-icon.svg" alt="vite" width="25" height="25" />
</p>

- **React + TypeScript** - Type-safe component development
- **Tailwind CSS + shadcn/ui** - Modern UI components
- **React Query** - Efficient data fetching & caching
- **Framer Motion** - Smooth animations
- **React Hook Form + Zod** - Form validation
- **React Dropzone** - File uploads
- **Socket.io** - Real-time communication

### Backend Services
<p align="left">
  <img src="https://www.vectorlogo.zone/logos/appwriteio/appwriteio-icon.svg" alt="appwrite" width="25" height="25"/>
  <img src="https://www.vectorlogo.zone/logos/giphy/giphy-icon.svg" alt="giphy" width="25" height="25"/>
  <img src="https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg" alt="google cloud" width="25" height="25"/>
</p>

- **Appwrite BaaS** - Authentication, Database, Storage, Cloud Functions
- **GIPHY API** - GIF integration
- **Google Translate API** - Translation capabilities

## Installation & Setup

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Git
- Appwrite account

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/horizon.git
   cd horizon
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up Appwrite**
   - Create an account on [Appwrite](https://appwrite.io/)
   - Create a new project named "Horizon"
   - Set up the following services:

   #### Authentication
   - Go to the Authentication section
   - Enable Email/Password authentication

   #### Storage Setup
   - Go to Storage → Create Bucket
   - Name: "horizon-media"
   - File Permissions: Enable read and write access
   - Maximum File Size: 10MB
   - Note your Storage ID

   #### Database Setup
   - Go to Databases → Create Database
   - Name: "horizon-db"
   - Note your Database ID

   #### Collections Setup
   1. **Users Collection**
      - Create collection named "users"
      - Add these attributes:
        - `name` (String, size: 255)
        - `username` (String, size: 100)
        - `accountId` (String, size: 36, Required)
        - `email` (Email, Required)
        - `bio` (String, size: 1000)
        - `imageId` (String, size: 36)
        - `imageUrl` (URL, Required)
        - `coverImageId` (String, size: 36)
        - `coverImageUrl` (String, size: 255)
        - `coverPosition` (String, size: 100, Default: `{"x": 0, "y": 0}`)
      - Set permissions to allow read/write access

   2. **Posts Collection**
      - Create collection named "posts"
      - Add these attributes:
        - `creator` (Relationship → users, Required)
        - `caption` (String, size: 2000)
        - `imageUrl` (URL, Required)
        - `imageId` (String, size: 36, Required)
        - `location` (String, size: 255)
        - `tags` (String Array)
        - `likes` (String Array)
      - Create a fulltext index on `caption` field (for search)
      - Set permissions to allow read/write access

   3. **Saves Collection**
      - Create collection named "saves"
      - Add these attributes:
        - `user` (Relationship → users, Required)
        - `post` (Relationship → posts, Required)
      - Set permissions to allow read/write access

   4. **Follows Collection**
      - Create collection named "follows"
      - Add these attributes:
        - `follower` (String, size: 36, Required)
        - `following` (String, size: 36, Required)
        - `createdAt` (String, size: 30)
      - Set permissions to allow read/write access

   5. **Comments Collection**
      - Create collection named "comments"
      - Add these attributes:
        - `postId` (Relationship → posts)
        - `userId` (Relationship → users)
        - `content` (String, size: 1000, Required)
        - `createdAt` (DateTime, Required)
        - `likes` (String Array)
        - `gifUrl` (String, size: 255)
        - `gifId` (String, size: 100)
      - Set permissions to allow read/write access

   6. **Messages Collection**
      - Create collection named "messages"
      - Add these attributes:
        - `sender` (Relationship → users)
        - `receiver` (Relationship → users)
        - `content` (String, size: 5000, Required)
        - `createdAt` (DateTime, Required)
        - `isRead` (Boolean, Default: false, Required)
        - `attachmentUrl` (String, size: 255)
        - `attachmentType` (String, size: 50)
      - Set permissions to allow read/write access

   7. **Notifications Collection**
      - Create collection named "notifications"
      - Add these attributes:
        - `userId` (String, size: 36, Required)
        - `actorId` (String, size: 36, Required)
        - `type` (String, size: 20, Required)
        - `postId` (String, size: 36)
        - `commentId` (String, size: 36)
        - `read` (Boolean, Default: false, Required)
        - `createdAt` (DateTime, Required)
      - Create these indexes:
        - Single index on `userId` (Key type, ASC)
        - Composite index on `userId` and `read` (Key type, both ASC)
        - Composite index on `userId` and `createdAt` (Key type, userId ASC, createdAt DESC)
      - Set permissions to allow read/write access

4. **Setup API Keys**
   - Get your Appwrite API keys from each service
   - Get a GIPHY API key from [developers.giphy.com](https://developers.giphy.com/)
   - Get a Google Translate API key from [Google Cloud Console](https://console.cloud.google.com/)

5. **Environment Configuration**
   Create a `.env.local` file in the root directory with the following variables:
   ```
   # APPWRITE API
   VITE_APPWRITE_URL='https://cloud.appwrite.io/v1'
   VITE_APPWRITE_PROJECT_ID='your_project_id'
   VITE_APPWRITE_DATABASE_ID='your_database_id'
   VITE_APPWRITE_STORAGE_ID='your_storage_id'
   VITE_APPWRITE_USER_COLLECTION_ID='your_user_collection_id'
   VITE_APPWRITE_POST_COLLECTION_ID='your_post_collection_id'
   VITE_APPWRITE_SAVES_COLLECTION_ID='your_saves_collection_id'
   VITE_APPWRITE_FOLLOWS_COLLECTION_ID='your_follows_collection_id'
   VITE_APPWRITE_COMMENTS_COLLECTION_ID='your_comments_collection_id'
   VITE_APPWRITE_MESSAGES_COLLECTION_ID='your_messages_collection_id'
   VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID='your_notifications_collection_id'

   # GIPHY API
   VITE_GIPHY_API_KEY='your_giphy_api_key'

   # GOOGLE CLOUD API
   VITE_GOOGLE_API_KEY='your_google_api_key'
   ```

6. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. **Open your browser**
   The application will be available at `http://localhost:5173`

## Project Structure

```
horizon/
├── public/                          # Static assets
├── socket-server/                   # Socket.io backend for real-time features
├── src/
│   ├── _auth/                       # Authentication pages
│   │   ├── forms/                   # Auth forms (SigninForm, SignupForm)
│   │   └── pages/                   # Auth pages and landing page
│   ├── _root/                       # Main application pages
│   │   └── pages/                   # App pages (Home, Explore, Profile, etc.)
│   ├── components/                  # Reusable components
│   │   ├── forms/                   # Form components
│   │   ├── shared/                  # Shared components (PostCard, Sidebar, etc.)
│   │   └── ui/                      # UI components (buttons, inputs, etc.)
│   ├── constants/                   # Application constants
│   ├── context/                     # React context providers
│   │   ├── AuthContext.tsx          # Authentication context
│   │   ├── SocketContext.tsx        # Real-time features context
│   │   └── ThemeContext.tsx         # Theme context
│   ├── hooks/                       # Custom React hooks
│   ├── lib/                         # Library code
│   │   ├── appwrite/                # Appwrite API functions
│   │   ├── react-query/             # React Query setup
│   │   └── validation/              # Form validation
│   ├── types/                       # TypeScript type definitions
│   ├── App.tsx                      # Main application component
│   ├── globals.css                  # Global styles
│   └── main.tsx                     # Entry point
├── .env.local                       # Environment variables
└── package.json                     # Dependencies and scripts
```

## Features Walkthrough

### Authentication
- Sign up with email, password, and username
- Sign in with existing credentials
- Automatic session management

### Posts
- Create posts with images, captions, location, and tags
- Edit and delete your own posts
- Like and save posts
- View post details and comments

### User Profiles
- View user profiles with their posts and stats
- Follow/unfollow users
- Update your profile with bio and cover image
- See followers and following lists

### Explore and Search
- Discover new posts from all users
- Search posts by caption
- View trending content

### Messaging
- Real-time private messaging
- Message read receipts
- Typing indicators
- Media attachment sharing

### Notifications
- Real-time notifications for likes, comments, and follows
- Mark notifications as read
- Navigate to relevant content

## 🚀 Deployment

To build the project for production:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory, ready to be deployed to your hosting provider of choice.

## Advanced Features

### Real-time Communication
The application uses Socket.io for real-time features including:
- Live messaging
- Typing indicators
- Online status indicators
- Instant notifications

### Optimistic Updates
React Query is used for optimistic updates to provide a smooth user experience:
- Likes update instantly
- Messages appear immediately
- UI updates before server confirmation

### Infinite Scrolling
Posts and feeds implement infinite scrolling for performance optimization:
- Load content as needed
- Efficient rendering of large datasets
- Smooth scrolling experience

## 📚 Additional Resources

| Technology | Documentation |
|------------|--------------|
| React | [Documentation](https://react.dev/) |
| React Router | [Documentation](https://reactrouter.com/) |
| React Query | [Documentation](https://tanstack.com/query/latest/docs/react/overview) |
| Appwrite | [Documentation](https://appwrite.io/docs) |
| Vite | [Documentation](https://vitejs.dev/guide/) |
| Tailwind CSS | [Documentation](https://tailwindcss.com/docs) |
| Socket.io | [Documentation](https://socket.io/docs/) |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙇🏻‍♂️ Acknowledgements

- [Appwrite](https://appwrite.io/) for the backend services
- [TanStack Query](https://tanstack.com/query) for data fetching
- [Radix UI](https://www.radix-ui.com/) for accessible UI components
- [Framer Motion](https://www.framer.com/motion/) for animations
- [GIPHY](https://developers.giphy.com/) for GIF integration
