'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getDocument, deleteDocument } from '@/lib/storage'
import { generatePDFFromDocument, downloadPDF } from '@/lib/pdf'
import { generateDOCXFromDocument } from '@/lib/docx'
import { FaArrowLeft, FaFilePdf, FaFileWord, FaTrash, FaDownload } from 'react-icons/fa'

export default function DocumentDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    const id = searchParams.get('id')
    if (user && id) {
      loadDocument(id)
    }
  }, [user, authLoading, searchParams, router])

  const loadDocument = async (id) => {
    try {
      setLoading(true)
      const doc = await getDocument(parseInt(id))
      if (doc && doc.userId === user.id) {
        setDocument(doc)
      } else {
        router.push('/documents')
      }
    } catch (error) {
      console.error('Error loading document:', error)
      router.push('/documents')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      await deleteDocument(document.id)
      router.push('/documents')
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document')
    }
  }

  const handleExportPDF = async () => {
    setExporting('pdf')
    try {
      const pdf = await generatePDFFromDocument(document)
      downloadPDF(pdf, `${document.title || 'document'}.pdf`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF')
    } finally {
      setExporting(null)
    }
  }

  const handleExportDOCX = async () => {
    setExporting('docx')
    try {
      await generateDOCXFromDocument(document)
    } catch (error) {
      console.error('Error exporting DOCX:', error)
      alert('Failed to export DOCX')
    } finally {
      setExporting(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!document) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container-mobile py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="touch-target p-2 text-gray-700 hover:text-gray-900"
              aria-label="Go back"
            >
              <FaArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold flex-1 text-center">
              {document.title || 'Untitled Document'}
            </h1>
            <button
              onClick={handleDelete}
              className="touch-target p-2 text-red-600 hover:text-red-700"
              aria-label="Delete document"
            >
              <FaTrash size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="container-mobile py-6">
        {/* Document Image */}
        {document.image && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <img
              src={document.image}
              alt={document.title}
              className="w-full rounded-lg border border-gray-200"
            />
          </div>
        )}

        {/* OCR Text */}
        {document.ocrText && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Extracted Text</h2>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <p className="whitespace-pre-wrap text-gray-800">{document.ocrText}</p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Document Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="text-gray-900">
                {new Date(document.createdAt).toLocaleString()}
              </span>
            </div>
            {document.updatedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Updated:</span>
                <span className="text-gray-900">
                  {new Date(document.updatedAt).toLocaleString()}
                </span>
              </div>
            )}
            {document.ocrText && (
              <div className="flex justify-between">
                <span className="text-gray-600">Text Length:</span>
                <span className="text-gray-900">{document.ocrText.length} characters</span>
              </div>
            )}
          </div>
        </div>

        {/* Export Actions */}
        <div className="space-y-3">
          <button
            onClick={handleExportPDF}
            disabled={exporting === 'pdf'}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg touch-target transition-colors flex items-center justify-center gap-3"
          >
            <FaFilePdf size={20} />
            Export as PDF
            {exporting === 'pdf' && <FaDownload className="animate-bounce" />}
          </button>

          <button
            onClick={handleExportDOCX}
            disabled={exporting === 'docx'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg touch-target transition-colors flex items-center justify-center gap-3"
          >
            <FaFileWord size={20} />
            Export as DOCX
            {exporting === 'docx' && <FaDownload className="animate-bounce" />}
          </button>
        </div>
      </div>
    </div>
  )
}

