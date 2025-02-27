# 🔮 Horizon - Full-Stack Social Media Application
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
## 📌 Project Overview
Horizon is a modern social media platform built with cutting-edge technologies, offering users a seamless and engaging experience for content creation and social interaction.
## 🚀 Key Features
- 🔐 **Secure Authentication**
  - Email & Password login
  - Social media authentication
  - Protected routes & sessions
- 📱 **Core Social Features**
  - Create, edit & delete posts
  - Like & save functionality
  - Real-time feed updates
  - User profiles & customization
- 💬 **Interactive Elements**
  - Real-time notifications
  - Live chat functionality
  - Post comments & reactions
  - Media sharing capabilities
- 🎨 **Modern UI/UX**
  - Responsive design
  - Dark/Light themes
  - Animated transitions
  - Intuitive navigation
## 🛠️ Tech Stack
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

- ⚛️ **React + TypeScript** - Type-safe component development
- 🎨 **Tailwind CSS + shadcn/ui** - Modern UI components
- 🔄 **React Query** - Efficient data fetching & caching
- ✨ **Framer Motion** - Smooth animations
- 📝 **React Hook Form + Zod** - Form validation
- 🔌 **Socket.io** - Real-time features
- 📁 **React Dropzone** - File uploads
### Backend Services
<p align="left">
  <img src="https://www.vectorlogo.zone/logos/appwriteio/appwriteio-icon.svg" alt="appwrite" width="25" height="25"/>
  <img src="https://www.vectorlogo.zone/logos/socketio/socketio-icon.svg" alt="socket.io" width="25" height="25"/>
</p>

- ☁️ **Appwrite BaaS**
  - Authentication & Authorization
  - Database Management
  - File Storage
  - Cloud Functions

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Git

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

3. **Environment Configuration**
   Create a `.env.local` file in the root directory with the following variables:
   ```
   VITE_APPWRITE_URL=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_project_id
   VITE_APPWRITE_DATABASE_ID=your_database_id
   VITE_APPWRITE_STORAGE_ID=your_storage_id
   VITE_APPWRITE_USER_COLLECTION_ID=your_user_collection_id
   VITE_APPWRITE_POST_COLLECTION_ID=your_post_collection_id
   VITE_APPWRITE_SAVES_COLLECTION_ID=your_saves_collection_id
   VITE_APPWRITE_FOLLOWS_COLLECTION_ID=your_follows_collection_id
   VITE_APPWRITE_COMMENTS_COLLECTION_ID=your_comments_collection_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   The application will be available at `http://localhost:5173`

### Database Structure
Horizon uses Appwrite as its backend service with the following collections:

- **Users**: Stores user profiles with name, username, email, bio, and profile image
- **Posts**: Contains user-created posts with captions, images, location, and tags
- **Saves**: Tracks which posts are saved by which users
- **Follows**: Manages follower/following relationships between users
- **Comments**: Stores post comments with user references and timestamps

### Testing Accounts
For testing purposes, you can use:
- Email: testuser@gmail.com
- Password: password1

### Build for Production
```bash
npm run build
# or
yarn build
```
The build artifacts will be stored in the `dist/` directory.

## 📚 Resources
| Technology | Documentation |
|------------|--------------|
| React | [Documentation](https://react.dev/) |
| React Router | [Documentation](https://reactrouter.com/) |
| React Query | [Documentation](https://tanstack.com/query/latest/docs/react/overview) |
| Appwrite | [Documentation](https://appwrite.io/docs) |
| Vite | [Documentation](https://vitejs.dev/guide/) |
| Tailwind CSS | [Documentation](https://tailwindcss.com/docs) |

### Note for Sir Rannie
Dear Sir, thank you for taking the time to evaluate my project. To run this application locally, I would be happy to provide you with the .env.local file containing the necessary Appwrite credentials.
Please let me know your preference - I can either:

- Send you the environment file directly for immediate testing
- You could follow the setup instructions provided separately to create your own Appwrite instance.
