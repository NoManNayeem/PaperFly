# Deployment Guide for PaperFly

## GitHub Pages Deployment

### Repository
**GitHub**: [https://github.com/NoManNayeem/PaperFly](https://github.com/NoManNayeem/PaperFly)

### Automatic Deployment

The project uses GitHub Actions for automatic deployment. The workflow is configured in `.github/workflows/deploy.yml`.

**How it works:**
1. Push code to `main` branch
2. GitHub Actions automatically:
   - Installs dependencies
   - Builds the static site
   - Deploys to GitHub Pages

### Enable GitHub Pages

1. Go to your repository: https://github.com/NoManNayeem/PaperFly
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save the settings

### Access Your Deployed App

Once deployed, your app will be available at:
- **URL**: `https://nomannayeem.github.io/PaperFly/`

### Manual Deployment Steps

If you need to deploy manually:

```bash
# Clone the repository
git clone https://github.com/NoManNayeem/PaperFly.git
cd PaperFly

# Install dependencies
npm install --legacy-peer-deps

# Build the static site
npm run build

# The 'out' directory contains all static files
# Upload the contents of 'out' to your hosting provider
```

### Troubleshooting GitHub Actions

If the workflow fails:

1. **Check Actions tab**: Go to your repository → Actions tab
2. **View logs**: Click on the failed workflow run to see error details
3. **Common issues**:
   - Dependency conflicts: Already fixed with `--legacy-peer-deps`
   - Build errors: Check `npm run build` locally first
   - Missing files: Ensure all files are committed

### Local Testing Before Deployment

```bash
# Test the build locally
npm run build

# Test the static files
npx serve out

# Visit http://localhost:3000
```

### Docker Deployment

For Docker deployment:

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t paperfly .
docker run -p 3000:3000 paperfly
```

### Environment Variables

No environment variables needed - the app is fully client-side!

### Post-Deployment Checklist

- [ ] Verify app is accessible at GitHub Pages URL
- [ ] Test camera access (requires HTTPS in production)
- [ ] Test all features (scan, OCR, export)
- [ ] Check mobile responsiveness
- [ ] Verify IndexedDB storage works
- [ ] Test on different browsers

### Important Notes

1. **HTTPS Required**: Camera access requires HTTPS in production (GitHub Pages provides this automatically)
2. **Base Path**: If deploying to a subdirectory, update `next.config.js` with `basePath`
3. **Storage Limits**: Browser storage is limited (typically 5-10% of disk space)

## Support

For issues or questions:
- Check the [TESTING_GUIDE.md](TESTING_GUIDE.md)
- Review [FEATURES_STATUS.md](FEATURES_STATUS.md)
- Check GitHub Actions logs for deployment errors

