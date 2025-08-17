# TomoBoard Backend

Real-time collaborative whiteboard backend server built with Express.js, Socket.IO, and PostgreSQL.

## 🚀 Features

- **Real-time Collaboration**: Socket.IO powered live editing, cursors, and chat
- **Authentication**: JWT-based authentication with refresh tokens
- **Database**: PostgreSQL with Prisma ORM
- **Security**: Rate limiting, CORS, Helmet, input validation
- **File Upload**: Avatar upload with image processing
- **Session Management**: Multi-device session handling
- **Real-time Features**:
  - Live canvas synchronization
  - User presence tracking
  - Real-time cursors
  - Chat messaging
  - Typing indicators
  - Object selection/editing states

## 📋 Prerequisites

- Node.js (>= 18.0.0)
- PostgreSQL database
- Redis (optional, for production scaling)

## 🛠️ Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables** in `.env`:
   ```bash
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/tomoboard"

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d

   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

4. **Database Setup**:
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run database migrations
   npm run db:migrate

   # Seed database with sample data
   npm run db:seed
   ```

## 🏃‍♂️ Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:3001` (or your configured PORT).

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/logout-all` - Logout from all devices
- `GET /api/auth/me` - Get current user

### Whiteboards
- `GET /api/whiteboards` - List user's whiteboards
- `POST /api/whiteboards` - Create new whiteboard
- `GET /api/whiteboards/:id` - Get specific whiteboard
- `PUT /api/whiteboards/:id` - Update whiteboard
- `DELETE /api/whiteboards/:id` - Delete whiteboard
- `POST /api/whiteboards/:id/collaborators` - Add collaborator
- `DELETE /api/whiteboards/:id/collaborators/:userId` - Remove collaborator

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/avatar` - Upload avatar
- `DELETE /api/users/avatar` - Remove avatar
- `PUT /api/users/password` - Change password
- `GET /api/users/search` - Search users
- `DELETE /api/users/account` - Delete account

### Health Check
- `GET /health` - Server health status

## 🔌 Socket.IO Events

### Client → Server
- `join-whiteboard` - Join a whiteboard room
- `leave-whiteboard` - Leave a whiteboard room
- `canvas-update` - Send canvas operation
- `canvas-sync` - Sync full canvas state
- `cursor-move` - Send cursor position
- `chat-message` - Send chat message
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator
- `object-select` - Object selection
- `object-editing` - Object editing state

### Server → Client
- `user-joined` - User joined whiteboard
- `user-left` - User left whiteboard
- `active-users` - Active users in whiteboard
- `canvas-update` - Canvas operation from other user
- `canvas-sync` - Full canvas sync from other user
- `cursor-move` - Cursor movement from other user
- `chat-message` - New chat message
- `typing-start` - User started typing
- `typing-stop` - User stopped typing
- `object-select` - Object selected by other user
- `object-editing` - Object editing by other user
- `error` - Error message

## 🗄️ Database Schema

### Users
- Authentication and profile information
- Avatar and preferences

### Whiteboards
- Canvas data and settings
- Access permissions

### Collaborators
- User roles and permissions per whiteboard

### Chat Messages
- Real-time chat history

### User Sessions
- Multi-device session management

## 🔧 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data
- `npm test` - Run tests

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevent abuse and DoS attacks
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Request validation with express-validator
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Secure refresh token rotation

## 📁 Project Structure

```
backend/
├── middleware/
│   ├── auth.js           # Authentication middleware
│   └── errorHandler.js   # Global error handling
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.js          # Database seeding
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── whiteboards.js   # Whiteboard CRUD routes
│   └── users.js         # User management routes
├── socket/
│   └── socketHandler.js # Socket.IO event handling
├── uploads/             # File upload directory
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
├── README.md           # This file
└── server.js           # Main application entry point
```

## 🧪 Testing

The backend includes comprehensive test coverage:

```bash
npm test
```

## 🚀 Deployment

1. **Environment Variables**: Set all required environment variables
2. **Database**: Ensure PostgreSQL is available and migrations are run
3. **Build**: No build step required for Node.js
4. **Start**: Use `npm start` for production

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run db:generate
EXPOSE 3001
CMD ["npm", "start"]
```

## 📊 Monitoring

- Health check endpoint: `/health`
- Console logging for development
- Structured logging recommended for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
