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
        const video = videoRef.current
        video.srcObject = mediaStream
        setIsVideoReady(false)
        
        // Wait for video to be ready and playing
        await new Promise((resolve, reject) => {
          if (!video) {
            reject(new Error('Video element not available'))
            return
          }

          let resolved = false
          const timeout = setTimeout(() => {
            if (!resolved) {
              resolved = true
              reject(new Error('Video loading timeout'))
            }
          }, 10000) // 10 second timeout

          const checkReady = () => {
            // Check if video has valid dimensions and is ready to play
            if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
              // Try to play the video (required for some mobile browsers)
              const playPromise = video.play()
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    if (!resolved) {
                      resolved = true
                      clearTimeout(timeout)
                      setIsVideoReady(true)
                      resolve()
                    }
                  })
                  .catch((playError) => {
                    // Even if play fails, if video has dimensions, we can still capture
                    if (video.videoWidth > 0 && video.videoHeight > 0) {
                      if (!resolved) {
                        resolved = true
                        clearTimeout(timeout)
                        setIsVideoReady(true)
                        resolve()
                      }
                    } else {
                      if (!resolved) {
                        resolved = true
                        clearTimeout(timeout)
                        reject(new Error('Video play failed: ' + playError.message))
                      }
                    }
                  })
              } else {
                // Fallback for browsers that don't return a promise
                if (!resolved) {
                  resolved = true
                  clearTimeout(timeout)
                  setIsVideoReady(true)
                  resolve()
                }
              }
            }
          }

          // Try immediate check
          if (video.readyState >= 2) {
            checkReady()
          }

          // Listen for multiple events to ensure we catch when video is ready
          video.onloadedmetadata = () => {
            checkReady()
          }
          video.onloadeddata = () => {
            checkReady()
          }
          video.oncanplay = () => {
            checkReady()
          }
          video.oncanplaythrough = () => {
            checkReady()
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
    
    // Wait for video to be ready (HAVE_CURRENT_DATA or higher)
    if (video.readyState < 2) {
      console.error('Video not ready (readyState:', video.readyState, ')')
      return null
    }

    // Use actual video dimensions (preferred) or fallback to element dimensions
    let width = video.videoWidth
    let height = video.videoHeight
    
    // Fallback if video dimensions not available (shouldn't happen if video is ready)
    if (!width || !height || width === 0 || height === 0) {
      width = video.clientWidth || 640
      height = video.clientHeight || 480
      console.warn('Using fallback dimensions:', { width, height })
    }

    try {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      
      // Ensure canvas context is valid
      if (!ctx) {
        console.error('Failed to get canvas context')
        return null
      }
      
      // Check if video is mirrored (front camera), if so, flip it back in captured image
      const currentFacingMode = streamRef.current?.getVideoTracks()[0]?.getSettings().facingMode
      const isMirrored = currentFacingMode === 'user'
      
      if (isMirrored) {
        // Flip horizontally for front camera
        ctx.translate(width, 0)
        ctx.scale(-1, 1)
      }
      
      // Draw the video frame to canvas
      ctx.drawImage(video, 0, 0, width, height)

      // Convert canvas to image data
      const imageData = canvas.toDataURL('image/jpeg', 0.9)
      
      // Validate the image data
      if (!imageData || imageData === 'data:,') {
        console.error('Failed to generate image data - empty result')
        return null
      }

      // Check if image data is valid (should start with data:image)
      if (!imageData.startsWith('data:image')) {
        console.error('Invalid image data format:', imageData.substring(0, 50))
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

