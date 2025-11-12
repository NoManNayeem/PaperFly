# PaperFly - Document Scanner App

A free, client-side web application for document scanning with OCR, PDF, and DOCX export capabilities. Built with Next.js 16, completely client-side with no backend required.

## Features

- 📷 **Camera Capture**: Use your device camera to scan documents
- 🔍 **Automatic Edge Detection**: Automatically detects and crops document edges
- 🎨 **Image Enhancement**: Adjust brightness, contrast, and color modes
- 📝 **OCR (Optical Character Recognition)**: Extract text from scanned documents
- 📄 **PDF Export**: Generate searchable PDF files
- 📝 **DOCX Export**: Export documents as Word files
- 💾 **Local Storage**: All data stored in browser (IndexedDB)
- 🔐 **User Authentication**: Simple client-side authentication
- 📱 **Mobile-First**: Fully responsive design optimized for mobile devices

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **OCR**: Tesseract.js
- **PDF Generation**: jsPDF
- **DOCX Generation**: docx library
- **Icons**: React Icons
- **Storage**: IndexedDB + localStorage

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd PaperFly
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

This will generate static files in the `out` directory, ready for deployment.

## Deployment

### GitHub Pages

The project is configured for automatic deployment to GitHub Pages using GitHub Actions. 

**Repository**: [https://github.com/NoManNayeem/PaperFly](https://github.com/NoManNayeem/PaperFly)

**To enable GitHub Pages:**

1. Go to your repository settings on GitHub
2. Navigate to "Pages" in the left sidebar
3. Under "Source", select "GitHub Actions"
4. The workflow will automatically build and deploy on every push to `main`

The application will be available at: `https://nomannayeem.github.io/PaperFly/`

**Note**: Update `next.config.js` with your repository name if needed:
```javascript
const nextConfig = {
  output: 'export',
  basePath: '/PaperFly', // Add this if deploying to GitHub Pages subdirectory
  // ...
}
```

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. The `out` directory contains all static files
3. Deploy the `out` directory to your hosting provider

## Usage

1. **Register/Login**: Create an account or login to start
2. **Scan Document**: Click "New Scan" and allow camera access
3. **Enhance Image**: Adjust brightness, contrast, and color mode
4. **Extract Text**: Use OCR to extract text from the document
5. **Save**: Save the document to your library
6. **Export**: Export as PDF or DOCX from the document list

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Privacy

All processing happens client-side in your browser. No data is sent to any server. All documents and user data are stored locally in your browser using IndexedDB.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

