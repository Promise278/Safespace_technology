# SafeSpace Web (Frontend)
SafeSpace Web is the Next.js frontend for the SafeSpace platform. It provides a secure, anonymous space where Sharers can post their stories and connect with Supporters who offer empathy, comments, supports, and private messaging.

#### Features
* Anonymous Story Feed
Sharers can post stories with optional anonymity.
Supporters can browse, react (“Supports”), and comment.

* Role-Based Experience
Sharer: create stories, manage your own posts, chat with supporters.
Supporter: discover stories, support sharers, and start 1:1 conversations.

* Real-Time Messaging
Web client integrates with the backend’s Socket.IO server for live chat.

* Modern UI/UX
Built with Next.js App Router.
Tailwind CSS v4 for styling.
Skeleton loaders and subtle animations for a premium feel.
Iconography via Lucide React.
Toast feedback via React Hot Toast.

* Secure Auth
Auth flows consume the backend’s JWT-based API.
Protected pages and API calls respect the user’s role and auth state.

* Tech Stack
Framework: Next.js 15+ (App Router)
Language: TypeScript
Styling: Tailwind CSS v4
Icons: Lucide React
Notifications: React Hot Toast
State / Data: React Query / SWR or custom hooks (depending on your implementation)
Realtime: Socket.IO client (connected to backend)

* Getting Started
1. Prerequisites
Node.js v18+
The backend API running (see /backend README) with:
PostgreSQL configured
Socket.IO server active
JWT auth enabled

2. Installation
From the frontend/ directory:
```bash
cd frontend
npm install
```

4. Build & Production
```bash
npm run build
npm start
Project Structure (Frontend)
bash
frontend/
├── app/
│   ├── layout.tsx          # Root layout, shared providers
│   ├── page.tsx            # Landing / marketing page
│   ├── home/               # Authenticated feed
│   ├── auth/               # Sign in / sign up
│   ├── story/              # Story details / creation
│   └── chat/               # Messaging UI
├── components/
│   ├── layout/             # Navbar, footer, shells
│   ├── story/              # Story cards, forms
│   ├── chat/               # Chat window, message bubbles
│   └── ui/                 # Buttons, inputs, skeletons
├── lib/
│   ├── api.ts              # API helpers (fetchers, axios, etc.)
│   ├── socket.ts           # Socket.IO client setup
│   └── auth.ts             # JWT helpers, guards
└── tailwind.config.ts
```
Use this as a guide; adapt to your actual structure.

Scripts
Common scripts:

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Lint codebase
```
## License
SafeSpace Web is distributed under the MIT License. See the root LICENSE file for details.