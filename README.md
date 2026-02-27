# SafeSpace

**SafeSpace** is a dual-platform (Web & Mobile) application designed to provide a secure, compassionate environment for individuals to share their personal stories and struggles anonymously. It connects "Sharers" with dedicated "Supporters" who offer empathy, advice, and real-time support.

---

## Key Features

- **Anonymous Storytelling**: Share your journey without fear of judgment. True identity is hidden by default.
- **Dual User Roles**:
  - **Sharer**: Post stories, receive support, and engage in private conversations.
  - **Supporter**: Read stories, offer encouragement through "Supports" (likes), comments, and direct messaging.
- **Real-Time Messaging**: Integrated Socket.IO for instant, private peer-to-peer communication.
- **Support System**: Engage with others through structured likes and threaded comments.
- **Premium UX**: Smooth Skeleton loaders across platforms for a high-performance feel.
- **Cross-Platform**: Seamless experience across Web (Next.js) and Mobile (React Native/Expo).

---

## Tech Stack

### Backend

- **Core**: Node.js & Express
- **Database**: PostgreSQL with Sequelize ORM
- **Real-Time**: Socket.IO
- **Auth**: JWT (JSON Web Tokens) with Secure Middleware

### Frontend (Web)

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4 (Modern Aesthetics)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Mobile (App)

- **Framework**: React Native & Expo
- **Styling**: NativeWind (Tailwind CSS for Native)
- **Icons**: Expo Vector Icons (Feather, Ionicons)
- **Navigation**: Expo Router (File-based routing)

---

## Project Structure

```bash
SafeSpace/
├── backend/            # Express API, Sequelize Models, Socket logic
├── frontend/           # Next.js Web application
└── mobile/             # React Native / Expo application
```

---

## Installation & Setup

### 1. Prerequisites

- Node.js (v18+)
- PostgreSQL Database
- Expo Go (for mobile testing)

### 2. Backend Setup

```bash
cd backend
npm install
# Configure your .env (see Environment Variables below)
nodemon index.js
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

---

## Privacy & Security

SafeSpace is built with a **Privacy-First** philosophy.

- **Global Anonymity**: Sharers can choose to post anonymously, hiding their username from the public feed.
- **Gatekeeping**: Community browsing is restricted to authorized roles to prevent unsolicited mining of user data.
- **Secure Auth**: All personal data and routes are protected by robust JWT-based authentication.

---

## License

Distrubuted under the MIT License. See `LICENSE` for more information.
