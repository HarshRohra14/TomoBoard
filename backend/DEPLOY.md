# Deploy TomoBoard Backend

## Quick Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from backend folder**:
   ```bash
   cd backend
   vercel --prod
   ```

4. **Set Environment Variables** in Vercel dashboard:
   ```
   DATABASE_URL = postgresql://neondb_owner:npg_VO3GmFda9qQx@ep-holy-darkness-af4g807d-pooler.c-2.us-west-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require
   JWT_SECRET = tomoboard_super_secret_jwt_key_2024_production
   JWT_REFRESH_SECRET = tomoboard_super_secret_refresh_key_2024_production
   ```

5. **Update Frontend** with your deployed URL:
   ```bash
   # In main project directory
   REACT_APP_API_URL=https://your-backend-url.vercel.app
   ```

## Alternative: Railway Deploy

1. Connect Railway to your GitHub repo
2. Select `backend` folder as root
3. Environment variables will be set automatically

## Test Deployment

Visit: `https://your-backend-url.vercel.app/health`

Should return:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "TomoBoard Backend API",
  "version": "1.0.0"
}
```
