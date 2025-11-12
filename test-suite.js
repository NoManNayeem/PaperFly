/**
 * Feature Test Suite for PaperFly
 * Run with: node test-suite.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 PaperFly Feature Test Suite\n');
console.log('=' .repeat(50));

const tests = {
  passed: 0,
  failed: 0,
  errors: []
};

function test(name, condition, errorMsg) {
  if (condition) {
    console.log(`✅ ${name}`);
    tests.passed++;
  } else {
    console.log(`❌ ${name}: ${errorMsg}`);
    tests.failed++;
    tests.errors.push({ name, error: errorMsg });
  }
}

// Test 1: Check all required files exist
console.log('\n📁 File Structure Tests:');
const requiredFiles = [
  'app/layout.js',
  'app/page.js',
  'app/login/page.js',
  'app/register/page.js',
  'app/dashboard/page.js',
  'app/scan/page.js',
  'app/documents/page.js',
  'app/documents/view/page.js',
  'app/settings/page.js',
  'lib/storage.js',
  'lib/ocr.js',
  'lib/pdf.js',
  'lib/docx.js',
  'lib/image-processing.js',
  'contexts/AuthContext.js',
  'hooks/useCamera.js',
  'components/camera/CameraCapture.js',
  'components/scanner/ImageEditor.js',
  'components/scanner/OCRPanel.js',
  'components/document-list/DocumentList.js',
  'components/editor/AnnotationTools.js',
  'next.config.js',
  'package.json',
  'Dockerfile',
  'docker-compose.yml'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  test(`File exists: ${file}`, exists, 'File not found');
});

// Test 2: Check package.json dependencies
console.log('\n📦 Dependency Tests:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'next',
  'react',
  'react-dom',
  'tesseract.js',
  'jspdf',
  'docx',
  'react-icons',
  'file-saver'
];

requiredDeps.forEach(dep => {
  const hasDep = packageJson.dependencies && packageJson.dependencies[dep];
  test(`Dependency: ${dep}`, hasDep, 'Missing dependency');
});

// Test 3: Check Next.js config
console.log('\n⚙️  Configuration Tests:');
const nextConfig = fs.readFileSync('next.config.js', 'utf8');
test('Static export configured', nextConfig.includes("output: 'export'"), 'Static export not configured');
test('Images unoptimized', nextConfig.includes('unoptimized: true'), 'Images not unoptimized');

// Test 4: Check critical code patterns
console.log('\n💻 Code Quality Tests:');
const storageCode = fs.readFileSync('lib/storage.js', 'utf8');
test('IndexedDB initialization', storageCode.includes('indexedDB.open'), 'IndexedDB not initialized');
test('User authentication functions', storageCode.includes('registerUser') && storageCode.includes('loginUser'), 'Auth functions missing');

const ocrCode = fs.readFileSync('lib/ocr.js', 'utf8');
test('Tesseract.js integration', ocrCode.includes('tesseract.js'), 'Tesseract.js not integrated');

const pdfCode = fs.readFileSync('lib/pdf.js', 'utf8');
test('jsPDF integration', pdfCode.includes('jspdf'), 'jsPDF not integrated');

const docxCode = fs.readFileSync('lib/docx.js', 'utf8');
test('docx library integration', docxCode.includes('docx'), 'docx library not integrated');
test('file-saver import', docxCode.includes('file-saver'), 'file-saver not imported');

const imageCode = fs.readFileSync('lib/image-processing.js', 'utf8');
test('Edge detection function', imageCode.includes('detectEdges'), 'Edge detection missing');
test('Image enhancement functions', imageCode.includes('adjustBrightness') && imageCode.includes('adjustContrast'), 'Enhancement functions missing');

// Test 5: Check component structure
console.log('\n🧩 Component Tests:');
const cameraCode = fs.readFileSync('components/camera/CameraCapture.js', 'utf8');
const useCameraCode = fs.readFileSync('hooks/useCamera.js', 'utf8');
test('Camera component uses MediaDevices API', useCameraCode.includes('getUserMedia'), 'MediaDevices API not used');
test('Camera component uses useCamera hook', cameraCode.includes('useCamera'), 'useCamera hook not used');

const imageEditorCode = fs.readFileSync('components/scanner/ImageEditor.js', 'utf8');
test('ImageEditor has enhancement controls', imageEditorCode.includes('brightness') && imageEditorCode.includes('contrast'), 'Enhancement controls missing');

const ocrPanelCode = fs.readFileSync('components/scanner/OCRPanel.js', 'utf8');
test('OCRPanel uses Tesseract', ocrPanelCode.includes('recognizeText'), 'OCR integration missing');

// Test 6: Check routing
console.log('\n🛣️  Routing Tests:');
const pages = [
  'app/page.js',
  'app/login/page.js',
  'app/register/page.js',
  'app/dashboard/page.js',
  'app/scan/page.js',
  'app/documents/page.js',
  'app/settings/page.js'
];

pages.forEach(page => {
  const code = fs.readFileSync(page, 'utf8');
  test(`Page exports default: ${path.basename(path.dirname(page))}`, code.includes('export default'), 'No default export');
});

// Test 7: Check mobile-first design
console.log('\n📱 Mobile-First Tests:');
const globalsCss = fs.readFileSync('app/globals.css', 'utf8');
test('Tailwind CSS included', globalsCss.includes('@tailwind'), 'Tailwind not included');
test('Touch-friendly utilities', globalsCss.includes('touch-target'), 'Touch utilities missing');

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Test Summary:');
console.log(`✅ Passed: ${tests.passed}`);
console.log(`❌ Failed: ${tests.failed}`);
console.log(`📈 Success Rate: ${((tests.passed / (tests.passed + tests.failed)) * 100).toFixed(1)}%`);

if (tests.errors.length > 0) {
  console.log('\n⚠️  Errors:');
  tests.errors.forEach(err => {
    console.log(`  - ${err.name}: ${err.error}`);
  });
}

console.log('\n' + '='.repeat(50));
process.exit(tests.failed > 0 ? 1 : 0);

