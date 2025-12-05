# 🚀 Deployment Guide for EduPredict AI

This guide will help you deploy the EduPredict AI application:
- **Python API** → SAP BTP Cloud Foundry
- **Web App** → GitHub Pages

---

## 📋 Prerequisites

### For SAP BTP Deployment
- SAP BTP account with Cloud Foundry enabled
- Cloud Foundry CLI installed (`cf` command)
- Logged into your CF space

### For GitHub Pages
- GitHub account
- Git installed locally
- This repository pushed to GitHub

---

## 🔧 Part 1: Deploy Python API to SAP BTP

### Step 1: Install Cloud Foundry CLI (if not installed)
```bash
# macOS
brew install cloudfoundry/tap/cf-cli

# Or download from: https://github.com/cloudfoundry/cli/releases
```

### Step 2: Login to SAP BTP Cloud Foundry
```bash
# Login to your CF endpoint
cf login -a https://api.cf.[your-region].hana.ondemand.com

# Example regions: eu10, us10, ap21, jp20
# You'll be prompted for email and password
```

### Step 3: Deploy the API
```bash
# Make sure you're in the project root directory
cd /path/to/pyFirstHANApal

# Push to Cloud Foundry
cf push edupredict-api
```

**Note:** The deployment uses `requirements-prod.txt` (specified in manifest.yml). The model file (`my_colombia_model.pkl` - 58MB) is included in the deployment.

### Step 4: Get Your API URL
After deployment completes, you'll see output like:
```
name:              edupredict-api
requested state:   started
routes:            edupredict-api.cfapps.eu10.hana.ondemand.com
```

**Copy this URL!** You'll need it for the next step.

### Step 5: Verify API is Running
```bash
# Test the health endpoint
curl https://edupredict-api.cfapps.eu10.hana.ondemand.com/

# Or visit in browser
open https://edupredict-api.cfapps.eu10.hana.ondemand.com/docs
```

---

## 🌐 Part 2: Deploy Web App to GitHub Pages

### Step 1: Update API URL in Config

Edit `web/config.js` and replace the placeholder with your actual SAP BTP URL:

```javascript
production: 'https://edupredict-api.cfapps.eu10.hana.ondemand.com'  // Your actual URL
```

### Step 2: Commit and Push Changes
```bash
git add web/config.js
git commit -m "Update production API URL"
git push origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub: https://github.com/cadiraca/edupredictai
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**, select:
   - **Source**: GitHub Actions
5. Save changes

The GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) will automatically deploy on every push to main.

### Step 4: Wait for Deployment

- Go to **Actions** tab in your GitHub repo
- Watch the "Deploy to GitHub Pages" workflow run
- Takes ~1-2 minutes
- Once complete, your site will be live at:
  ```
  https://cadiraca.github.io/edupredictai/
  ```

---

## 🔒 Part 3: Update CORS (Important!)

After GitHub Pages is live, update the API to allow requests from your frontend:

### Option A: Update via CF Environment Variable
```bash
cf set-env edupredict-api ALLOWED_ORIGINS "https://cadiraca.github.io"
cf restage edupredict-api
```

### Option B: Update main.py and Redeploy
Edit `api/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cadiraca.github.io",
        "http://localhost:8080",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Then redeploy:
```bash
cf push edupredict-api
```

---

## ✅ Verification Checklist

After deployment:

- [ ] API responds at SAP BTP URL: `curl https://your-api.cfapps.xx.hana.ondemand.com/`
- [ ] API docs accessible: `https://your-api.cfapps.xx.hana.ondemand.com/docs`
- [ ] Web app loads at: `https://cadiraca.github.io/edupredictai/`
- [ ] Web app can call API (check browser console for errors)
- [ ] Language toggle works
- [ ] Simulator page loads data correctly
- [ ] Analytics dashboard displays charts

---

## 🐛 Troubleshooting

### API Won't Start on SAP BTP
```bash
# Check logs
cf logs edupredict-api --recent

# Common issues:
# - Missing model file → Check .cfignore
# - Memory limit → Increase in manifest.yml
# - Python version → Check runtime.txt
```

### GitHub Pages Shows 404
- Verify Actions workflow completed successfully
- Check Pages is enabled in Settings
- Wait 2-3 minutes for DNS propagation

### CORS Errors in Browser Console
```
Access to fetch at 'https://...' from origin 'https://cadiraca.github.io' 
has been blocked by CORS policy
```
**Solution:** Update CORS settings in API (see Part 3 above)

### Web App Shows "API health check failed"
- Verify API URL in `web/config.js` is correct
- Check API is actually running: `cf app edupredict-api`
- Check CORS is configured properly

---

## 📊 Monitoring

### Check API Status
```bash
cf app edupredict-api
cf logs edupredict-api --recent
```

### Check GitHub Pages Status
- Go to repo → Actions tab
- View deployment history and logs

---

## 🔄 Making Updates

### Update API
```bash
# Make changes to Python code
git add .
git commit -m "Update API"
git push

# Redeploy to SAP BTP
cf push edupredict-api
```

### Update Web App
```bash
# Make changes to web/ files
git add .
git commit -m "Update web app"
git push

# GitHub Actions automatically deploys!
```

---

## 💰 Cost Considerations

- **SAP BTP**: Free tier includes limited runtime hours and memory
- **GitHub Pages**: Free for public repos, unlimited bandwidth
- **Model Size**: 58MB included in deployment (within limits)

---

## 📞 Support

If you encounter issues:
1. Check SAP BTP logs: `cf logs edupredict-api --recent`
2. Check GitHub Actions logs in the Actions tab
3. Review browser console for frontend errors

---

**Quick Reference:**
- API Docs: `https://your-api.cfapps.xx.hana.ondemand.com/docs`
- Web App: `https://cadiraca.github.io/edupredictai/`
- GitHub Repo: `https://github.com/cadiraca/edupredictai`
