'use client'

import { useState, useEffect } from 'react'
import {
  adjustBrightness,
  adjustContrast,
  convertToGrayscale,
  convertToBlackWhite,
} from '@/lib/image-processing'
import { FaSun, FaAdjust, FaImage, FaBolt } from 'react-icons/fa'

export default function ImageEditor({ image, onImageChange }) {
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(1)
  const [colorMode, setColorMode] = useState('color') // color, grayscale, blackwhite
  const [processedImage, setProcessedImage] = useState(image)

  useEffect(() => {
    if (!image) return

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // Apply brightness
      if (brightness !== 0) {
        imageData = adjustBrightness(imageData, brightness)
      }

      // Apply contrast
      if (contrast !== 1) {
        imageData = adjustContrast(imageData, contrast)
      }

      // Apply color mode
      if (colorMode === 'grayscale') {
        imageData = convertToGrayscale(imageData)
      } else if (colorMode === 'blackwhite') {
        imageData = convertToBlackWhite(imageData)
      }

      ctx.putImageData(imageData, 0, 0)
      const newImage = canvas.toDataURL('image/jpeg', 0.9)
      setProcessedImage(newImage)
      if (onImageChange) {
        onImageChange(newImage)
      }
    }
    img.src = image
  }, [image, brightness, contrast, colorMode, onImageChange])

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Image Enhancement</h2>

      {/* Preview */}
      <div className="mb-6">
        <img
          src={processedImage || image}
          alt="Processed document"
          className="w-full rounded-lg border border-gray-200"
        />
      </div>

      {/* Brightness Control */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <FaSun className="text-yellow-500" />
          Brightness: {brightness > 0 ? '+' : ''}{brightness}
        </label>
        <input
          type="range"
          min="-50"
          max="50"
          value={brightness}
          onChange={(e) => setBrightness(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer touch-target"
        />
      </div>

      {/* Contrast Control */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <FaAdjust className="text-blue-500" />
          Contrast: {contrast.toFixed(1)}x
        </label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={contrast}
          onChange={(e) => setContrast(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer touch-target"
        />
      </div>

      {/* Color Mode */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
          <FaImage className="text-purple-500" />
          Color Mode
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setColorMode('color')}
            className={`flex-1 py-2 px-4 rounded-lg touch-target transition-colors ${
              colorMode === 'color'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Color
          </button>
          <button
            onClick={() => setColorMode('grayscale')}
            className={`flex-1 py-2 px-4 rounded-lg touch-target transition-colors ${
              colorMode === 'grayscale'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Grayscale
          </button>
          <button
            onClick={() => setColorMode('blackwhite')}
            className={`flex-1 py-2 px-4 rounded-lg touch-target transition-colors ${
              colorMode === 'blackwhite'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaBolt className="inline mr-1" />
            B&W
          </button>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setBrightness(0)
          setContrast(1)
          setColorMode('color')
        }}
        className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg touch-target transition-colors"
      >
        Reset
      </button>
    </div>
  )
}

