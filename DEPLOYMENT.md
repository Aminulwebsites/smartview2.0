# Deploying SmartView2.0 to Render.com

## Prerequisites

1. A GitHub account with your SmartView2.0 code
2. A Render.com account
3. Your database connection string

## Step-by-Step Deployment Guide

### 1. Prepare Your Repository

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

### 2. Create a Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Fill in the details:
   - **Name**: `smartview-db`
   - **Database**: `smartview`
   - **User**: `smartview_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free (for development) or paid (for production)
4. Click "Create Database"
5. **Important**: Copy the "External Database URL" - you'll need this!

### 3. Deploy the Web Service

1. Go back to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `smartview-app`
   - **Environment**: `Node`
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 4. Set Environment Variables

In the "Environment" section, add these variables:

1. **NODE_ENV**: `production`
2. **DATABASE_URL**: Paste the External Database URL from step 2
3. **PORT**: `5000` (Render automatically sets this, but good to have)

### 5. Deploy

1. Click "Create Web Service"
2. Render will automatically start building and deploying your app
3. Wait for the build to complete (usually 5-10 minutes)

### 6. Initialize Database

The database schema is automatically initialized during deployment. However, if you need to manually push changes:

1. Install Drizzle CLI locally: `npm install -g drizzle-kit`
2. Set your DATABASE_URL in local environment
3. Run: `npm run db:push`

### 6.1. Troubleshooting API Issues

If your foods and admin data are not loading:

1. **Check Health Endpoint**: Visit `https://your-app.onrender.com/api/health`
   - Should return `{"status": "healthy", "database": "connected"}`
   - If unhealthy, check database connection

2. **Check Build Logs**: In Render dashboard → Your Service → Logs
   - Look for "Database push failed" or similar errors
   - Ensure DATABASE_URL is correctly set

3. **Check Runtime Logs**: Look for API errors in the live logs
   - Common issues: missing environment variables, database connection timeouts

4. **Test API Endpoints Manually**:
   - `GET /api/foods` - Should return food items array
   - `GET /api/auth/user` - Should return user info or null
   - `POST /api/auth/login` - Test with valid credentials

5. **Database Issues**:
   - Ensure your DATABASE_URL includes all required parameters
   - Check if database is accessible from your Render region
   - Verify database user has proper permissions

### 7. Access Your App

1. Once deployed, Render will provide you with a URL like: `https://smartview-app.onrender.com`
2. Your admin panel will be at: `https://smartview-app.onrender.com/admin`
3. Admin credentials: username: `javascript`, password: `javascript`

## Alternative: One-Click Deploy

You can also use the render.yaml file for automatic deployment:

1. In your Render dashboard, click "New +" → "Blueprint"
2. Connect your repository
3. Render will automatically read the `render.yaml` file and set up both database and web service

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all dependencies are in `package.json`
2. **Database connection fails**: Verify the DATABASE_URL is correct
3. **App doesn't load**: Check the start command and port configuration
4. **Admin login fails**: The app uses in-memory sessions in development - you may need to implement persistent sessions for production

### Logs:

- View logs in Render Dashboard → Your Service → Logs
- Check for any error messages during startup

## Production Considerations

1. **Sessions**: Currently uses in-memory sessions - consider Redis for production
2. **File uploads**: Food images are handled as base64 - consider using cloud storage
3. **Database**: Free tier has limitations - upgrade for production use
4. **SSL**: Render automatically provides HTTPS
5. **Custom Domain**: Available on paid plans

## Costs

- **Free Tier**: Web service spins down after 15 minutes of inactivity
- **Paid Plans**: Start at $7/month for always-on service
- **Database**: Free tier available, paid plans start at $7/month

Your SmartView2.0 app should now be live and accessible to users worldwide!