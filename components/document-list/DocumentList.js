'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FaTrash, FaFilePdf, FaFileWord, FaEye, FaDownload } from 'react-icons/fa'
import { generatePDFFromDocument, downloadPDF } from '@/lib/pdf'
import { generateDOCXFromDocument } from '@/lib/docx'

export default function DocumentList({ documents, onDelete, onRefresh }) {
  const [exporting, setExporting] = useState(null)

  const handleExportPDF = async (document) => {
    setExporting(`pdf-${document.id}`)
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

  const handleExportDOCX = async (document) => {
    setExporting(`docx-${document.id}`)
    try {
      await generateDOCXFromDocument(document)
    } catch (error) {
      console.error('Error exporting DOCX:', error)
      alert('Failed to export DOCX')
    } finally {
      setExporting(null)
    }
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <p className="text-gray-600">No documents found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div
          key={document.id}
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {document.title || 'Untitled Document'}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(document.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => onDelete(document.id)}
                className="touch-target p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Delete document"
              >
                <FaTrash size={16} />
              </button>
            </div>

            {document.image && (
              <div className="mb-3">
                <img
                  src={document.image}
                  alt={document.title}
                  className="w-full h-48 object-contain rounded-lg border border-gray-200 bg-gray-50"
                />
              </div>
            )}

            {document.ocrText && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {document.ocrText.substring(0, 100)}
                  {document.ocrText.length > 100 ? '...' : ''}
                </p>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <Link
                href={`/documents/view?id=${document.id}`}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg touch-target transition-colors text-center text-sm flex items-center justify-center gap-2"
              >
                <FaEye />
                View
              </Link>
              <button
                onClick={() => handleExportPDF(document)}
                disabled={exporting === `pdf-${document.id}`}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg touch-target transition-colors text-sm flex items-center justify-center gap-2"
              >
                <FaFilePdf />
                PDF
              </button>
              <button
                onClick={() => handleExportDOCX(document)}
                disabled={exporting === `docx-${document.id}`}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg touch-target transition-colors text-sm flex items-center justify-center gap-2"
              >
                <FaFileWord />
                DOCX
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

