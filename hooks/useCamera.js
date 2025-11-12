'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export function useCamera() {
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const facingModeRef = useRef('environment')

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startCamera = useCallback(async (facingMode = 'environment') => {
    setIsLoading(true)
    setError(null)
    setIsVideoReady(false)
    facingModeRef.current = facingMode

    // Stop existing stream first
    stopCamera()

    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser. Please use a modern browser with camera support.')
      }

      // Check if we're on HTTPS or localhost (required for camera access)
      const isSecureContext = window.isSecureContext || 
        window.location.protocol === 'https:' || 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1'
      
      if (!isSecureContext) {
        throw new Error('Camera access requires HTTPS. Please access this site via HTTPS or localhost.')
      }

      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = mediaStream
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setIsVideoReady(false)
        
        // Wait for video to be ready with metadata
        await new Promise((resolve, reject) => {
          const video = videoRef.current
          if (!video) {
            reject(new Error('Video element not available'))
            return
          }

          const checkReady = () => {
            if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
              setIsVideoReady(true)
              resolve()
            }
          }

          if (video.readyState >= 2) {
            checkReady()
          } else {
            video.onloadedmetadata = () => {
              checkReady()
            }
            video.onloadeddata = () => {
              checkReady()
            }
            // Timeout after 5 seconds
            setTimeout(() => {
              if (video.readyState < 2) {
                reject(new Error('Video loading timeout'))
              }
            }, 5000)
          }
        })
      }
      setIsLoading(false)
    } catch (err) {
      let errorMessage = 'Failed to access camera'
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.'
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found. Please connect a camera and try again.'
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Camera is already in use by another application.'
      } else if (err.message) {
        errorMessage = err.message
      }
      setError(errorMessage)
      setIsLoading(false)
      console.error('Error accessing camera:', err)
    }
  }, [stopCamera])

  const captureImage = useCallback(() => {
    if (!videoRef.current || !streamRef.current) {
      console.error('Video ref or stream not available')
      return null
    }

    const video = videoRef.current
    
    // Wait for video to be ready
    if (video.readyState < 2) {
      console.error('Video not ready (readyState:', video.readyState, ')')
      return null
    }

    // Check if video has valid dimensions
    const width = video.videoWidth || video.clientWidth
    const height = video.videoHeight || video.clientHeight
    
    if (!width || !height || width === 0 || height === 0) {
      console.error('Video dimensions not available:', { width, height })
      return null
    }

    try {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      
      // Check if video is mirrored (front camera), if so, flip it back
      const currentFacingMode = streamRef.current?.getVideoTracks()[0]?.getSettings().facingMode
      const isMirrored = currentFacingMode === 'user'
      if (isMirrored) {
        ctx.translate(width, 0)
        ctx.scale(-1, 1)
      }
      
      ctx.drawImage(video, 0, 0, width, height)

      const imageData = canvas.toDataURL('image/jpeg', 0.9)
      
      if (!imageData || imageData === 'data:,') {
        console.error('Failed to generate image data')
        return null
      }

      return imageData
    } catch (error) {
      console.error('Error capturing image:', error)
      return null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    videoRef,
    stream,
    error,
    isLoading,
    isVideoReady,
    startCamera,
    stopCamera,
    captureImage,
  }
}

