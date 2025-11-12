import Link from 'next/link'
import { FaCamera, FaFilePdf, FaFileWord, FaSearch } from 'react-icons/fa'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container-mobile py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            PaperFly
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8">
            Free Document Scanner with OCR
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg touch-target transition-colors shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/register"
              className="bg-white hover:bg-gray-50 text-primary-600 font-semibold py-3 px-8 rounded-lg touch-target transition-colors shadow-lg border-2 border-primary-600"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-primary-600 text-4xl mb-4">
              <FaCamera />
            </div>
            <h3 className="text-xl font-semibold mb-2">Camera Capture</h3>
            <p className="text-gray-600">
              Use your device camera to scan documents with automatic edge detection
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-primary-600 text-4xl mb-4">
              <FaSearch />
            </div>
            <h3 className="text-xl font-semibold mb-2">OCR Technology</h3>
            <p className="text-gray-600">
              Extract text from images with multi-language OCR support
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-primary-600 text-4xl mb-4">
              <FaFilePdf />
            </div>
            <h3 className="text-xl font-semibold mb-2">Export Options</h3>
            <p className="text-gray-600">
              Export as PDF or DOCX with searchable text
            </p>
          </div>
        </div>

        <div className="mt-16 text-center text-gray-600">
          <p>100% Client-Side • No Backend • Your Data Stays Private</p>
        </div>
      </div>
    </div>
  )
}

