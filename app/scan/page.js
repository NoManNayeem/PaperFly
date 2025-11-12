'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import CameraCapture from '@/components/camera/CameraCapture'
import ImageEditor from '@/components/scanner/ImageEditor'
import OCRPanel from '@/components/scanner/OCRPanel'
import AnnotationTools from '@/components/editor/AnnotationTools'
import EdgeSelector from '@/components/scanner/EdgeSelector'
import { autoCropDocument } from '@/lib/image-processing'
import { saveDocument } from '@/lib/storage'
import { FaArrowLeft, FaSave, FaCrop } from 'react-icons/fa'

export default function ScanPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [processedImage, setProcessedImage] = useState(null)
  const [ocrText, setOcrText] = useState('')
  const [documentTitle, setDocumentTitle] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showEdgeSelector, setShowEdgeSelector] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleCapture = async (imageData) => {
    setCapturedImage(imageData)
    setShowCamera(false)
    setIsProcessing(true)

    try {
      // Auto-crop document
      const croppedImage = await autoCropDocument(imageData)
      setProcessedImage(croppedImage)
    } catch (error) {
      console.error('Error processing image:', error)
      setProcessedImage(imageData) // Use original if processing fails
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSave = async () => {
    if (!processedImage || !user) return

    try {
      const document = {
        userId: user.id,
        title: documentTitle || `Document ${new Date().toLocaleDateString()}`,
        image: processedImage,
        ocrText: ocrText,
        createdAt: new Date().toISOString(),
      }

      await saveDocument(document)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving document:', error)
      alert('Failed to save document')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (showCamera) {
    return <CameraCapture onCapture={handleCapture} onClose={() => setShowCamera(false)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container-mobile py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="touch-target p-2 text-gray-700 hover:text-gray-900"
            aria-label="Go back"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">Scan Document</h1>
          <button
            onClick={handleSave}
            disabled={!processedImage}
            className="touch-target p-2 text-primary-600 hover:text-primary-700 disabled:text-gray-400"
            aria-label="Save document"
          >
            <FaSave size={20} />
          </button>
        </div>
      </div>

      <div className="container-mobile py-6">
        {!processedImage ? (
          <div className="text-center py-12">
            <button
              onClick={() => setShowCamera(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-lg touch-target transition-colors shadow-lg"
            >
              Start Scanning
            </button>
            {isProcessing && (
              <div className="mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Processing image...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Document Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title
              </label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Enter document title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-target"
              />
            </div>

            {/* Edge Selection Button */}
            <div className="mb-4">
              <button
                onClick={() => setShowEdgeSelector(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg touch-target transition-colors flex items-center justify-center gap-2"
              >
                <FaCrop />
                Select Edges Manually
              </button>
            </div>

            {/* Image Editor */}
            <ImageEditor
              image={processedImage}
              onImageChange={setProcessedImage}
            />

            {/* OCR Panel */}
            <OCRPanel
              image={processedImage}
              onTextExtracted={setOcrText}
              extractedText={ocrText}
            />

            {/* Annotation Tools */}
            <AnnotationTools
              image={processedImage}
              onAnnotatedImageChange={setProcessedImage}
            />

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowCamera(true)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg touch-target transition-colors"
              >
                Scan Another
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg touch-target transition-colors"
              >
                Save Document
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

