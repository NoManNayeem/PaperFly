# PaperFly Testing Guide

## Quick Test Commands

### Run Automated Test Suite
```bash
node test-suite.js
```

### Test All Routes
```bash
# Test locally
npm run dev
# Then visit: http://localhost:3000

# Test in Docker
docker-compose up -d
curl http://localhost:3000
```

### Build Test
```bash
npm run build
```

## Manual Testing Checklist

### 1. Authentication ✅
- [ ] Register a new user
  - Fill registration form
  - Submit and verify redirect to dashboard
  - Check IndexedDB for user data

- [ ] Login
  - Use registered credentials
  - Verify session persists on page reload
  - Test logout functionality

### 2. Camera & Scanning ✅
- [ ] Access camera
  - Click "New Scan" button
  - Allow camera permissions
  - Verify video preview appears
  - Test front/back camera switch

- [ ] Capture image
  - Click capture button
  - Verify image is captured
  - Check auto-crop functionality

### 3. Image Processing ✅
- [ ] Edge detection
  - Scan a document
  - Verify automatic edge detection
  - Check auto-crop result

- [ ] Image enhancement
  - Adjust brightness slider
  - Adjust contrast slider
  - Test color modes (Color, Grayscale, B&W)
  - Verify real-time preview updates

### 4. OCR ✅
- [ ] Text extraction
  - Click "Extract Text" button
  - Wait for OCR processing
  - Verify text appears in text area
  - Test text editing

- [ ] Re-extraction
  - Click "Re-extract Text"
  - Verify new extraction works

### 5. Annotations ✅
- [ ] Drawing tools
  - Select pen tool
  - Draw on image
  - Change color
  - Adjust size
  - Test highlighter
  - Test shape tool

- [ ] Signature
  - Click signature button
  - Verify signature appears

### 6. Document Management ✅
- [ ] Save document
  - Add document title
  - Click save
  - Verify document appears in dashboard

- [ ] View documents
  - Navigate to documents page
  - Verify document list displays
  - Test search functionality
  - Click on document to view details

- [ ] Delete document
  - Click delete button
  - Confirm deletion
  - Verify document removed

### 7. Export ✅
- [ ] PDF export
  - Open document
  - Click "Export as PDF"
  - Verify PDF downloads
  - Open PDF and check content

- [ ] DOCX export
  - Open document
  - Click "Export as DOCX"
  - Verify DOCX downloads
  - Open DOCX and check content

### 8. Settings ✅
- [ ] View storage info
  - Navigate to settings
  - Check storage usage display

- [ ] Clear data
  - Click "Clear All Data"
  - Confirm action
  - Verify data cleared and logged out

## Browser Testing

### Desktop Browsers
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari

### Mobile Browsers
- [ ] iOS Safari
- [ ] Chrome Mobile
- [ ] Firefox Mobile

### Test Scenarios
- [ ] Responsive design at different screen sizes
- [ ] Touch interactions on mobile
- [ ] Camera access on mobile
- [ ] Storage limits (test with many documents)

## Performance Testing

### Load Time
- [ ] Initial page load < 3 seconds
- [ ] Route navigation < 1 second
- [ ] Image processing < 5 seconds
- [ ] OCR processing < 30 seconds (depends on image)

### Storage
- [ ] Test with 10+ documents
- [ ] Test with large images
- [ ] Monitor IndexedDB usage

## Error Handling Tests

### Camera Errors
- [ ] Deny camera permission
- [ ] Test with no camera available
- [ ] Test camera access errors

### Storage Errors
- [ ] Test with storage quota exceeded
- [ ] Test with IndexedDB unavailable

### OCR Errors
- [ ] Test with very low quality image
- [ ] Test with no text in image

## Security Tests

### Client-Side Security
- [ ] Verify no data sent to external servers
- [ ] Check localStorage usage
- [ ] Verify IndexedDB isolation per origin

## Known Test Limitations

1. **Camera Testing**: Requires physical device or browser with camera access
2. **OCR Testing**: Accuracy depends on image quality
3. **Storage Testing**: Limited by browser quota
4. **Export Testing**: Requires manual verification of downloaded files

## Automated Testing

Run the test suite:
```bash
node test-suite.js
```

Expected output:
- ✅ 56/56 tests passed
- 100% success rate
- All routes accessible
- All dependencies present

## Continuous Testing

For CI/CD integration:
```bash
# In CI pipeline
npm install
npm run build
node test-suite.js
docker-compose build
docker-compose up -d
# Test endpoints
```

## Reporting Issues

If you find issues:
1. Check browser console for errors
2. Check Docker logs: `docker-compose logs`
3. Verify all dependencies: `npm list`
4. Rebuild: `npm run build`
5. Check test suite output: `node test-suite.js`

