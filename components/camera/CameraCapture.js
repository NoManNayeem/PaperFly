'use client'

import { useEffect, useRef } from 'react'
import { useCamera } from '@/hooks/useCamera'
import { FaCamera, FaSyncAlt, FaStop } from 'react-icons/fa'

export default function CameraCapture({ onCapture, onClose }) {
  const { videoRef, stream, error, isLoading, startCamera, stopCamera, captureImage } = useCamera()
  const facingModeRef = useRef('environment')

  useEffect(() => {
    startCamera(facingModeRef.current) // Use back camera by default
    return () => {
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const handleCapture = () => {
    if (!stream) {
      console.error('No camera stream available')
      return
    }
    const imageData = captureImage()
    if (imageData && onCapture) {
      onCapture(imageData)
    } else {
      console.error('Failed to capture image')
    }
  }

  const handleSwitchCamera = async () => {
    stopCamera()
    // Toggle between front and back camera
    facingModeRef.current = facingModeRef.current === 'user' ? 'environment' : 'user'
    await startCamera(facingModeRef.current)
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold mb-2">Camera Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg touch-target"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
        />
        
        {/* Overlay guides */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-white border-dashed rounded-lg w-11/12 max-w-md aspect-[3/4] shadow-lg" />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black bg-opacity-75 p-6">
        <div className="flex items-center justify-center gap-6">
          {/* Switch Camera Button */}
          <button
            onClick={handleSwitchCamera}
            disabled={isLoading}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-4 touch-target transition-colors"
            aria-label="Switch camera"
          >
            <FaSyncAlt size={24} />
          </button>

          {/* Capture Button */}
          <button
            onClick={handleCapture}
            disabled={isLoading || !stream}
            className="bg-white rounded-full p-6 touch-target shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Capture photo"
          >
            <FaCamera size={32} className="text-gray-800" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-4 touch-target transition-colors"
            aria-label="Close camera"
          >
            <FaStop size={24} />
          </button>
        </div>

        {isLoading && (
          <p className="text-white text-center mt-4">Starting camera...</p>
        )}
      </div>
    </div>
  )
}

