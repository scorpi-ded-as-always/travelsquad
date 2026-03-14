# TravelSquad 🌍✈️

**Find your travel tribe.** TravelSquad is a production-grade social travel platform where travelers discover people visiting the same destination, match with compatible travelers, form travel squads, chat in real time, and collaboratively plan trips.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com/atlas)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-black)](https://socket.io)

---

## Features

### Core Platform
- **Smart Traveler Matching** — Proprietary algorithm scoring destination, date overlap, interest similarity, and budget alignment
- **Travel Squads** — Create/join groups, manage join requests, up to 20 members
- **Real-Time Chat** — Socket.io powered squad chat rooms with typing indicators and join/leave notifications
- **Collaborative Itinerary** — Any squad member can add/remove day-by-day activities
- **Trip Discovery** — Browse and filter public trips by destination

### Technical
- JWT authentication with 7-day tokens
- Bcrypt password hashing (12 rounds)
- Input validation on all API endpoints
- MongoDB Atlas with proper indexing
- Layered backend architecture (controllers → services → models)
- Global error handling
- Responsive mobile-first UI

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, Shadcn UI |
| State | Zustand |
| Real-time | Socket.io client |
| HTTP client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + Bcrypt |
| Real-time server | Socket.io |
| Deployment (FE) | Vercel |
| Deployment (BE) | Render / Railway |

---

## Project Structure

```
travelsquad/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── MainLayout.tsx      # Sidebar + mobile nav
│   │   ├── hooks/
│   │   │   ├── useAuthStore.ts         # Zustand auth state
│   │   │   └── useSocket.ts            # Socket.io hook
│   │   ├── lib/
│   │   │   ├── axios.ts                # Axios instance + interceptors
│   │   │   └── utils.ts                # cn() utility
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx        # 2-step registration
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ExplorePage.tsx
│   │   │   ├── TripCreatePage.tsx
│   │   │   ├── TripDetailPage.tsx
│   │   │   ├── SquadsPage.tsx
│   │   │   ├── SquadDetailPage.tsx     # Tabs: overview/itinerary/members/requests
│   │   │   ├── SquadCreatePage.tsx
│   │   │   ├── ChatPage.tsx            # Real-time Socket.io chat
│   │   │   ├── MatchesPage.tsx         # Smart matching results
│   │   │   └── ProfilePage.tsx         # View + edit profile
│   │   ├── services/
│   │   │   └── api.ts                  # All API calls
│   │   └── types/
│   │       └── index.ts                # TypeScript interfaces
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── server/                     # Express backend
    └── src/
        ├── config/
        │   └── database.js             # MongoDB connection
        ├── controllers/
        │   ├── authController.js
        │   ├── tripController.js
        │   ├── squadController.js
        │   ├── messageController.js
        │   └── userController.js
        ├── middleware/
        │   ├── authMiddleware.js        # JWT protect()
        │   ├── errorMiddleware.js       # Global error handler
        │   └── validateMiddleware.js    # express-validator
        ├── models/
        │   ├── User.js
        │   ├── Trip.js
        │   ├── Squad.js
        │   └── Message.js
        ├── routes/
        │   ├── authRoutes.js
        │   ├── tripRoutes.js
        │   ├── squadRoutes.js
        │   ├── messageRoutes.js
        │   └── userRoutes.js
        ├── services/
        │   ├── authService.js
        │   ├── tripService.js           # Matching algorithm
        │   ├── squadService.js
        │   └── messageService.js
        ├── socket/
        │   └── index.js                 # Socket.io server
        ├── utils/
        │   ├── asyncHandler.js
        │   └── jwt.js
        ├── app.js                       # Express app
        └── index.js                     # Entry point
```

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/profile` | ✅ | Get own profile |
| PUT | `/api/auth/profile` | ✅ | Update own profile |

### Trips

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/trips` | — | Browse all public trips |
| GET | `/api/trips?destination=Bali` | — | Filter by destination |
| GET | `/api/trips/my` | ✅ | Get my trips |
| GET | `/api/trips/match` | ✅ | Get smart matches |
| GET | `/api/trips/:id` | — | Trip detail |
| POST | `/api/trips` | ✅ | Create trip |
| PUT | `/api/trips/:id` | ✅ | Update trip (creator only) |
| DELETE | `/api/trips/:id` | ✅ | Delete trip (creator only) |

### Squads

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/squads` | — | Browse all public squads |
| GET | `/api/squads/my` | ✅ | Get my squads |
| GET | `/api/squads/:id` | — | Squad detail + itinerary |
| POST | `/api/squads` | ✅ | Create squad |
| POST | `/api/squads/:id/join` | ✅ | Request to join |
| PUT | `/api/squads/:id/join/:requestId` | ✅ | Approve/reject request |
| DELETE | `/api/squads/:id/leave` | ✅ | Leave squad |
| POST | `/api/squads/:id/itinerary` | ✅ | Add itinerary item |
| DELETE | `/api/squads/:id/itinerary/:itemId` | ✅ | Remove itinerary item |

### Messages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/messages/:squadId` | ✅ | Get message history |

---

## Matching Algorithm

```
matchScore =
  destinationMatch  × 40  (exact = 40pts, partial = 20pts)
  dateOverlap       × 30  (proportional to trip duration overlap)
  interestSimilarity × 20 (Jaccard similarity of interest arrays)
  budgetSimilarity  × 10  (based on budget level proximity)

Maximum possible score: 100
Returns: Top 5 matches sorted by score descending
```

---

## Socket.io Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_room` | `{ squadId }` | Join squad chat room |
| `leave_room` | `{ squadId }` | Leave chat room |
| `send_message` | `{ squadId, content }` | Send a message |
| `typing_start` | `{ squadId }` | Broadcast typing start |
| `typing_stop` | `{ squadId }` | Broadcast typing stop |
| `itinerary_updated` | `{ squadId, itinerary }` | Broadcast itinerary change |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | `Message` object | New chat message |
| `user_joined` | `{ user, message, timestamp }` | Member joined room |
| `user_left` | `{ user, message }` | Member left room |
| `user_typing` | `{ user }` | Someone is typing |
| `user_stopped_typing` | `{ userId }` | Typing stopped |
| `itinerary_update` | `{ itinerary, updatedBy }` | Itinerary was changed |

---

## Database Schemas

### User
```js
{ name, email, password(hashed), bio, profilePhoto, homeCity,
  interests[], travelStyle, squads[ref:Squad], isActive, timestamps }
```

### Trip
```js
{ creator(ref:User), destination, startDate, endDate, budget{min,max,currency},
  budgetLevel, interests[], description, coverImage, squad(ref:Squad),
  isPublic, status, maxGroupSize, timestamps }
```

### Squad
```js
{ name, destination, description, coverImage, creator(ref:User),
  members[ref:User], maxMembers, trip(ref:Trip), itinerary[], joinRequests[],
  isPrivate, status, chatRoom, timestamps }
```

### Message
```js
{ squad(ref:Squad), sender(ref:User), content, type, readBy[ref:User], timestamps }
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/travelsquad.git
cd travelsquad
```

### 2. Install all dependencies
```bash
npm run install:all
```

### 3. Configure server environment
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/travelsquad
JWT_SECRET=your-super-secret-key-minimum-32-chars
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Configure client environment
```bash
cd client
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 5. Start development servers
```bash
# From root — starts both simultaneously
npm run dev
```

Or individually:
```bash
npm run dev:server    # Backend on :5000
npm run dev:client    # Frontend on :5173
```

---

## Production Deployment

### Backend → Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Configure:
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Root Directory:** *(leave empty)*
5. Add environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=<your atlas URI>
   JWT_SECRET=<strong random string>
   CLIENT_URL=https://your-app.vercel.app
   ```
6. Deploy → note your service URL (e.g. `https://travelsquad-api.onrender.com`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variables:
   ```
   VITE_API_URL=https://travelsquad-api.onrender.com/api
   VITE_SOCKET_URL=https://travelsquad-api.onrender.com
   ```
5. Deploy

### MongoDB Atlas Setup
1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user (username + password)
3. Add your IP to the allowlist (or `0.0.0.0/0` for all)
4. Copy the connection string and update `MONGODB_URI`

---

## Environment Variables Reference

### Server (`server/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `MONGODB_URI` | **Yes** | MongoDB Atlas connection string |
| `JWT_SECRET` | **Yes** | Secret for signing JWTs (min 32 chars) |
| `CLIENT_URL` | **Yes** | Frontend URL for CORS |
| `NODE_ENV` | No | `development` or `production` |

### Client (`client/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend API URL (default: `/api`) |
| `VITE_SOCKET_URL` | No | Socket.io server URL |

---

## Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens expire in 7 days
- `password` field excluded from all queries by default (`select: false`)
- Input validation on all POST/PUT endpoints via `express-validator`
- CORS restricted to `CLIENT_URL` origin
- MongoDB injection protection via Mongoose
- Auth middleware verifies token on every protected route

---

## Interests

Users and trips can tag interests from this set:
`adventure` `beaches` `culture` `food` `hiking` `history` `luxury` `nature` `nightlife` `photography` `road-trips` `skiing` `solo-travel` `spirituality` `wildlife`

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

MIT © TravelSquad

---

*Built with ❤️ by explorers, for explorers.*
