# Premium MERN Comment System

A state-of-the-art real-time comment and post system built with the MERN stack, featuring a premium "Twitter Dim" aesthetic, advanced React 19 patterns, and mutually exclusive reaction logic.

## 🚀 Key Features

- **Premium UI/UX**: Sophisticated "Twitter Dim" dark mode (`#15202b`) with high-contrast icons and glassmorphism elements.
- **Real-Time Engine**: Powered by WebSockets (Socket.io) for instantaneous updates across all users.
- **Advanced Reactions**: A mutually exclusive like/dislike system ensuring data integrity and a polished user experience.
- **Optimistic UI**: Leverages React 19's `useOptimistic` and `startTransition` for zero-latency interactions.
- **Threaded Conversations**: Supports nested replies with a visual thread-line navigation system.
- **Server-Side Pagination**: High-performance feed with "Load More" support and optimized MongoDB queries.
- **Secure Auth**: Full authentication suite with profile image uploads and protected routes.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: SCSS (Advanced variables & nesting)
- **State Management**: React Hooks & Context API
- **Icons**: React Icons (Twitter style)
- **Notifications**: Sonner (Toast notifications)

### Backend
- **Runtime**: Node.js & Express
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **Security**: JWT Authentication & BCrypt

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd comment_system
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   # Create a .env file with:
   # PORT=5000
   # MONGO_URI=your_mongodb_uri
   # JWT_SECRET=your_jwt_secret
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## 🏗 Architecture Highlights

- **Fast Refresh Optimized**: Isolated hooks (`useAuth`, `useWebSocket`) to ensure flawless Hot Module Replacement.
- **Type-Safe Payloads**: Centralized `OptimisticAction` union types for consistent state transitions.
- **Scalable Real-time**: Room-based WebSocket architecture separating post feeds from specific comment threads.

---
*Created with passion by Arafat and Mannan (2019-2026).*
