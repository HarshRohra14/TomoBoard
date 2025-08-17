# TomoBoard Deployment Guide

## 🗄️ Database Setup ✅

Your Neon PostgreSQL database is already configured:
- **Project ID**: `weathered-salad-81061076`
- **Database**: `neondb`
- **Connection String**: Already configured in backend

## 🚀 Backend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy Backend**:
   ```bash
   cd backend
   vercel --prod
   ```

3. **Set Environment Variables** in Vercel dashboard:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_VO3GmFda9qQx@ep-holy-darkness-af4g807d-pooler.c-2.us-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
   JWT_SECRET=tomoboard_super_secret_jwt_key_2024_production
   JWT_REFRESH_SECRET=tomoboard_super_secret_refresh_key_2024_production
   ALLOWED_ORIGINS=https://ef43646a1d28499981536b4c9f6f03d0-5a95b4ab3bf24d1eab959f0d0.fly.dev
   ```

### Option 2: Railway

1. **Connect Railway to your repo**:
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repo
   - Select the `backend` folder

2. **Environment Variables** will be set automatically from `railway.json`

### Option 3: Render

1. **Create new Web Service** on [render.com](https://render.com)
2. **Build Command**: `npm install && npm run db:generate`
3. **Start Command**: `npm start`
4. **Set Environment Variables** (same as above)

## 🌐 Frontend Update

Your frontend is already configured to connect to the deployed backend:

```bash
# Environment variables in .env
REACT_APP_API_URL=https://your-backend-url.vercel.app
REACT_APP_WEBSOCKET_URL=https://your-backend-url.vercel.app
```

## 🧪 Testing the Integration

1. **Deploy Backend** using one of the options above
2. **Update Frontend URLs** with your actual backend URL
3. **Test Features**:
   - User registration/login
   - Whiteboard creation
   - Real-time collaboration
   - Chat functionality

## 📱 Demo Accounts

Your database includes demo accounts:
- **Email**: `demo@tomoboard.com`
- **Password**: `password123`

- **Email**: `admin@tomoboard.com`  
- **Password**: `password123`

## 🔧 Post-Deployment

After backend is deployed:

1. **Update Frontend URLs**:
   ```javascript
   // Replace in .env
   REACT_APP_API_URL=https://YOUR_ACTUAL_BACKEND_URL
   REACT_APP_WEBSOCKET_URL=https://YOUR_ACTUAL_BACKEND_URL
   ```

2. **Update Backend CORS**:
   ```javascript
   // In backend .env
   ALLOWED_ORIGINS=https://YOUR_FRONTEND_URL
   ```

3. **Test Real-time Features**:
   - Open two browser tabs
   - Login with different accounts
   - Create a whiteboard
   - Test real-time collaboration

## 🐛 Troubleshooting

- **CORS Issues**: Ensure `ALLOWED_ORIGINS` includes your frontend URL
- **Database Connection**: Check if `DATABASE_URL` is correct in environment
- **Socket.IO**: Verify WebSocket connection in browser dev tools
- **Authentication**: Check JWT secrets are set in environment

## 📊 Monitoring

Backend includes health endpoint: `GET /health`
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "version": "1.0.0"
}
```
