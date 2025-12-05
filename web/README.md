# Colombia Education Secretary Simulator - Frontend

Interactive web application for predicting and simulating educational interventions in Colombian municipalities.

## 🎯 Overview

This is a **static web application** that connects to the Colombia Dropout Prediction API. It allows education secretaries and policy makers to:

- Select municipalities by department
- View baseline dropout predictions
- Simulate investment scenarios
- See real-time impact on dropout rates and student numbers

## 🏗️ Architecture

```
web/
├── index.html           # Main HTML page
├── css/
│   └── styles.css       # All styling (no external dependencies)
├── js/
│   ├── api-client.js    # API communication layer (isolated)
│   └── app.js           # UI logic and interactions
└── README.md            # This file
```

### Clean Separation

- **api-client.js**: Handles ALL API calls - NO UI logic
- **app.js**: Handles ALL UI interactions - NO direct API calls
- **Backend API**: Completely separate (Python FastAPI)

## 🚀 Local Development

### Prerequisites

1. **Backend API must be running** on `http://localhost:8000`
   ```bash
   # From project root
   cd api
   python main.py
   ```

2. **Simple HTTP server** to serve static files

### Option 1: Python HTTP Server

```bash
cd web
python -m http.server 8080
```

Then open: http://localhost:8080

### Option 2: Node.js HTTP Server

```bash
cd web
npx http-server -p 8080
```

Then open: http://localhost:8080

### Option 3: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## 📦 Deployment to GitHub Pages

### Step 1: Prepare Your API

Your backend API must be deployed and accessible. Options:

- **Render.com** (recommended, free tier)
- **Railway.app** (free tier)
- **Heroku** (free dyno hours)
- **Your own server**

### Step 2: Update API URL

Edit `web/js/api-client.js`:

```javascript
const API_CONFIG = {
    // Change this to your deployed API URL
    BASE_URL: 'https://your-api-url.com',
};
```

### Step 3: Deploy to GitHub Pages

**Method A: Using GitHub Web Interface**

1. Create a new repository on GitHub
2. Upload the `web/` folder contents
3. Go to Settings → Pages
4. Select branch: `main`
5. Select folder: `/` (root)
6. Click Save

**Method B: Using Git Commands**

```bash
# Initialize git in web folder
cd web
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main

# Enable GitHub Pages
# Go to repo Settings → Pages → Select 'main' branch
```

Your site will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### Step 4: Enable CORS on Your API

Make sure your API allows requests from GitHub Pages:

```python
# In api/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://YOUR_USERNAME.github.io",  # Your GitHub Pages URL
        "*"  # Or allow all (not recommended for production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🔧 Configuration

### API Endpoint

The API base URL is configured in `js/api-client.js`:

```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost:8000',  // Development
    // BASE_URL: 'https://your-api.com',  // Production
};
```

### Investment Parameters

Investment effects are configured in `js/app.js`:

```javascript
const INVESTMENT_CONFIG = {
    infrastructure: {
        cost: 3000,
        parameter: 'primaria_to_media_ratio',
        improvement: 0.05  // Adjust as needed
    },
    // ... more investments
};
```

## 🎨 Customization

### Styling

All styles are in `css/styles.css`. Key variables:

```css
/* Main brand colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Budget indicator */
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
```

### Text Content

All text is in Spanish. To change to English, edit:

1. `index.html` - All labels and buttons
2. `js/app.js` - Error messages and labels

## 🧪 Testing

### Test Locally

1. Start the backend API
2. Serve the web folder
3. Open in browser
4. Test the flow:
   - Select department
   - Select municipality
   - Click "Cargar Datos"
   - Try investments
   - Check budget updates
   - Click "Reiniciar"

### Test on GitHub Pages

1. Deploy to GitHub Pages
2. Update API URL to production
3. Open GitHub Pages URL
4. Test all functionality

## 📊 API Endpoints Used

The frontend uses these API endpoints:

- `GET /` - Health check
- `GET /departments` - List departments with municipalities
- `POST /predict` - Get dropout predictions
  - With `scenario_adjustments` for investments

## 🐛 Troubleshooting

### CORS Errors

```
Access to fetch at 'http://localhost:8000/...' has been blocked by CORS policy
```

**Solution**: Ensure CORS is properly configured in your API (see Step 4 above)

### API Not Found

```
Error al conectar con la API: Failed to fetch
```

**Solutions**:
1. Check API is running
2. Verify API URL in `api-client.js`
3. Check browser console for exact error

### Departments Not Loading

**Solutions**:
1. Check `/departments` endpoint returns data
2. Open browser DevTools → Network tab
3. Look for failed requests

## 📱 Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## 🔒 Security Notes

- Never commit API keys or secrets to GitHub
- Use environment variables for sensitive data
- Consider adding authentication for production use
- Limit CORS origins in production

## 📄 License

[Your License Here]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Contact the development team

---

**Note**: This is a static frontend. The backend API must be deployed separately and configured in `api-client.js`.
