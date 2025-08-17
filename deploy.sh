#!/bin/bash

echo "🚀 TomoBoard Deployment Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Backend deployment
echo "📦 Deploying Backend..."
cd backend

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Backend deployed!"
echo ""
echo "🔧 Next Steps:"
echo "1. Copy the deployment URL from above"
echo "2. Update frontend .env with your backend URL:"
echo "   REACT_APP_API_URL=https://your-backend-url.vercel.app"
echo "   REACT_APP_WEBSOCKET_URL=https://your-backend-url.vercel.app"
echo ""
echo "3. Set environment variables in Vercel dashboard:"
echo "   - DATABASE_URL (already configured)"
echo "   - JWT_SECRET (already configured)"
echo "   - JWT_REFRESH_SECRET (already configured)"
echo "   - ALLOWED_ORIGINS (set to your frontend URL)"
echo ""
echo "4. Test the deployment:"
echo "   - Visit your backend URL/health"
echo "   - Test user registration and login"
echo "   - Test real-time collaboration"
echo ""
echo "🎉 Deployment complete!"
