# Deployment Guide for Render

## 🚀 Deploying to Render

### Method 1: Using Render Dashboard (Recommended)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Connect GitHub Repository**
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select your `infitoe` repository

3. **Configure Service**
   ```
   Name: infitoe
   Environment: Node
   Region: Choose closest to your users
   Branch: main
   Build Command: npm ci && npm run build
   Start Command: npm run start:render
   ```

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   NEXT_PUBLIC_SOCKET_URL=https://your-app-name.onrender.com
   ```
   
   **Important**: Replace `your-app-name` with your actual Render service name!

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build and deployment (5-10 minutes)

### Method 2: Using render.yaml

1. **Push render.yaml to your repo**
   ```bash
   git add render.yaml
   git commit -m "Add Render configuration"
   git push origin main
   ```

2. **Create Service from render.yaml**
   - In Render dashboard: "New +" → "Blueprint"
   - Connect repository and select `render.yaml`

### Method 3: Using Docker

1. **Enable Docker deployment in Render**
   - Build Command: `docker build -t infitoe .`
   - Start Command: `docker run -p 3000:3000 infitoe`

## 🔧 Important Configuration Steps

### 1. Update Socket URLs
After deployment, update these files with your actual Render URL:

**server.js** (line ~163):
```javascript
origin: process.env.NODE_ENV === 'production' 
  ? ["https://YOUR-ACTUAL-RENDER-URL.onrender.com"]
  : "*",
```

**Environment Variables in Render Dashboard**:
```
NEXT_PUBLIC_SOCKET_URL=https://YOUR-ACTUAL-RENDER-URL.onrender.com
```

### 2. Custom Domain (Optional)
- In Render dashboard → Settings → Custom Domains
- Add your domain and configure DNS

### 3. Monitoring
- Enable "Auto-Deploy" for automatic deployments on git push
- Set up monitoring in Render dashboard
- Check logs in Render dashboard → Logs tab

## 🐛 Troubleshooting

### Common Issues:

1. **Socket connection fails**
   - Check CORS settings in server.js
   - Verify NEXT_PUBLIC_SOCKET_URL environment variable
   - Check browser console for errors

2. **Build fails**
   - Ensure all dependencies are in package.json
   - Check Node.js version compatibility
   - Review build logs in Render dashboard

3. **App doesn't start**
   - Verify start command: `npm run start:render`
   - Check server listens on `0.0.0.0` and `process.env.PORT`
   - Review application logs

### Debug Commands:
```bash
# Local testing with production build
npm run build
npm run start

# Check environment variables
echo $NEXT_PUBLIC_SOCKET_URL

# Test socket connection
curl -v https://your-app.onrender.com/socket.io/
```

## 🎉 Post-Deployment

1. **Test multiplayer functionality**
   - Open two browser tabs
   - Create and join rooms
   - Test real-time gameplay

2. **Performance monitoring**
   - Monitor response times
   - Check WebSocket connection stability
   - Monitor memory usage in Render dashboard

3. **Share your game!**
   - Your app will be available at: `https://your-app-name.onrender.com`
   - Share with friends to test multiplayer
