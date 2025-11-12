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
import { generatePDF, downloadPDF } from '@/lib/pdf'
import { FaArrowLeft, FaSave, FaCrop, FaTrash, FaFilePdf, FaPlus } from 'react-icons/fa'

export default function ScanPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [showCamera, setShowCamera] = useState(false)
  const [images, setImages] = useState([]) // Array of { id, image, ocrText, processedImage }
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [documentTitle, setDocumentTitle] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showEdgeSelector, setShowEdgeSelector] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleCapture = async (imageData) => {
    setShowCamera(false)
    setIsProcessing(true)

    try {
      // Auto-crop document
      const croppedImage = await autoCropDocument(imageData)
      const newImage = {
        id: Date.now(),
        image: imageData,
        processedImage: croppedImage,
        ocrText: '',
        hasOCR: false,
      }
      setImages([...images, newImage])
      setCurrentImageIndex(images.length)
    } catch (error) {
      console.error('Error processing image:', error)
      const newImage = {
        id: Date.now(),
        image: imageData,
        processedImage: imageData,
        ocrText: '',
        hasOCR: false,
      }
      setImages([...images, newImage])
      setCurrentImageIndex(images.length)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSave = async () => {
    if (images.length === 0 || !user) return

    try {
      const document = {
        userId: user.id,
        title: documentTitle || `Document ${new Date().toLocaleDateString()}`,
        images: images.map(img => img.processedImage),
        image: images[0].processedImage, // For backward compatibility
        ocrText: images.map(img => img.ocrText).filter(t => t).join('\n\n'),
        createdAt: new Date().toISOString(),
      }

      await saveDocument(document)
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving document:', error)
      alert('Failed to save document')
    }
  }

  const handleRemoveImage = (imageId) => {
    const newImages = images.filter(img => img.id !== imageId)
    setImages(newImages)
    if (newImages.length > 0) {
      setCurrentImageIndex(Math.min(currentImageIndex, newImages.length - 1))
    }
  }

  const handleUpdateImage = (imageId, updates) => {
    setImages(images.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    ))
  }

  const handleOCRUpdate = (imageId, ocrText) => {
    handleUpdateImage(imageId, { ocrText, hasOCR: !!ocrText })
  }

  const handleGeneratePDF = async (includeOCR = false) => {
    if (images.length === 0) {
      alert('No images to generate PDF')
      return
    }

    setIsGeneratingPDF(true)
    try {
      const imageList = images.map(img => img.processedImage)
      const allOCRText = includeOCR 
        ? images.map((img, index) => `Page ${index + 1}:\n${img.ocrText || '(No OCR text)'}`).join('\n\n')
        : ''

      const pdf = await generatePDF(imageList, {
        title: documentTitle || 'Document',
        includeText: includeOCR,
        ocrText: allOCRText,
      })

      const filename = `${documentTitle || 'document'}.pdf`
      downloadPDF(pdf, filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
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
        {images.length === 0 ? (
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

            {/* Image List/Thumbnails */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pages ({images.length})</h3>
                <button
                  onClick={() => setShowCamera(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg touch-target transition-colors flex items-center gap-2"
                >
                  <FaPlus />
                  Add Page
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    className={`relative border-2 rounded-lg overflow-hidden cursor-pointer ${
                      currentImageIndex === index ? 'border-primary-600' : 'border-gray-200'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={img.processedImage}
                      alt={`Page ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                      {index + 1}
                    </div>
                    {img.hasOCR && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded">
                        OCR
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveImage(img.id)
                      }}
                      className="absolute bottom-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Image Editor */}
            {images[currentImageIndex] && (
              <>
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
                  image={images[currentImageIndex].processedImage}
                  onImageChange={(newImage) => {
                    handleUpdateImage(images[currentImageIndex].id, { processedImage: newImage })
                  }}
                />

                {/* OCR Panel */}
                <OCRPanel
                  image={images[currentImageIndex].processedImage}
                  onTextExtracted={(text) => handleOCRUpdate(images[currentImageIndex].id, text)}
                  extractedText={images[currentImageIndex].ocrText}
                />

                {/* Annotation Tools */}
                <AnnotationTools
                  image={images[currentImageIndex].processedImage}
                  onAnnotatedImageChange={(newImage) => {
                    handleUpdateImage(images[currentImageIndex].id, { processedImage: newImage })
                  }}
                />
              </>
            )}

            {/* PDF Generation Buttons */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Generate PDF</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => handleGeneratePDF(false)}
                  disabled={isGeneratingPDF || images.length === 0}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg touch-target transition-colors flex items-center justify-center gap-2"
                >
                  {isGeneratingPDF ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <FaFilePdf />
                  )}
                  PDF (Images Only)
                </button>
                <button
                  onClick={() => handleGeneratePDF(true)}
                  disabled={isGeneratingPDF || images.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg touch-target transition-colors flex items-center justify-center gap-2"
                >
                  {isGeneratingPDF ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <FaFilePdf />
                  )}
                  PDF (With OCR)
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowCamera(true)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg touch-target transition-colors"
              >
                Add More Pages
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

      {/* Edge Selector Modal */}
      {showEdgeSelector && images[currentImageIndex] && (
        <EdgeSelector
          image={images[currentImageIndex].processedImage}
          onCrop={(croppedImage) => {
            handleUpdateImage(images[currentImageIndex].id, { processedImage: croppedImage })
            setShowEdgeSelector(false)
          }}
          onCancel={() => setShowEdgeSelector(false)}
        />
      )}
    </div>
  )
}

