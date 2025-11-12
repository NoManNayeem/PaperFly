'use client'

import { useState, useEffect } from 'react'
import { recognizeText } from '@/lib/ocr'
import { FaSearch, FaSpinner, FaEdit } from 'react-icons/fa'

export default function OCRPanel({ image, onTextExtracted, extractedText: initialText }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [text, setText] = useState(initialText || '')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (initialText) {
      setText(initialText)
    }
  }, [initialText])

  const handleExtractText = async () => {
    if (!image) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const result = await recognizeText(
        image,
        'eng',
        (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        }
      )

      setText(result.text)
      if (onTextExtracted) {
        onTextExtracted(result.text)
      }
    } catch (error) {
      console.error('OCR Error:', error)
      alert('Failed to extract text. Please try again.')
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FaSearch className="text-primary-600" />
          OCR Text Extraction
        </h2>
        {!isProcessing && text && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="touch-target p-2 text-primary-600 hover:text-primary-700"
            aria-label="Edit text"
          >
            <FaEdit />
          </button>
        )}
      </div>

      {isProcessing && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FaSpinner className="animate-spin text-primary-600" />
            <span className="text-sm text-gray-600">Extracting text... {progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {!text && !isProcessing && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No text extracted yet</p>
          <button
            onClick={handleExtractText}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg touch-target transition-colors"
          >
            Extract Text
          </button>
        </div>
      )}

      {text && (
        <div className="mb-4">
          {isEditing ? (
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                if (onTextExtracted) {
                  onTextExtracted(e.target.value)
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[200px] touch-target"
              placeholder="Extracted text will appear here..."
            />
          ) : (
            <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 min-h-[200px] max-h-[400px] overflow-y-auto">
              <p className="whitespace-pre-wrap text-gray-800">{text}</p>
            </div>
          )}
        </div>
      )}

      {text && !isProcessing && (
        <button
          onClick={handleExtractText}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg touch-target transition-colors"
        >
          Re-extract Text
        </button>
      )}
    </div>
  )
}

