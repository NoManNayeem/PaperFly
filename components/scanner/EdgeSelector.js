'use client'

import { useState, useRef, useEffect } from 'react'
import { FaCheck, FaTimes, FaUndo } from 'react-icons/fa'

export default function EdgeSelector({ image, onCrop, onCancel }) {
  const canvasRef = useRef(null)
  const [corners, setCorners] = useState([
    { x: 0.1, y: 0.1 }, // top-left
    { x: 0.9, y: 0.1 }, // top-right
    { x: 0.1, y: 0.9 }, // bottom-left
    { x: 0.9, y: 0.9 }, // bottom-right
  ])
  const [selectedCorner, setSelectedCorner] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [imageScale, setImageScale] = useState({ scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 })
  const containerRef = useRef(null)
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  useEffect(() => {
    if (image && canvasRef.current) {
      drawImage()
    }
  }, [image, corners, selectedCorner])

  useEffect(() => {
    // Prevent scrolling and zooming on touch
    const preventDefault = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault() // Prevent pinch zoom
      }
    }
    
    document.addEventListener('touchmove', preventDefault, { passive: false })
    document.addEventListener('touchstart', preventDefault, { passive: false })
    
    return () => {
      document.removeEventListener('touchmove', preventDefault)
      document.removeEventListener('touchstart', preventDefault)
    }
  }, [])

  const drawImage = () => {
    if (!canvasRef.current || !image) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Set canvas size to match container - use full viewport on mobile
      const container = containerRef.current || canvas.parentElement
      const maxWidth = container.clientWidth || window.innerWidth
      const maxHeight = (container.clientHeight || window.innerHeight) - 120 // Leave space for controls

      const imgAspect = img.width / img.height
      const containerAspect = maxWidth / maxHeight

      let canvasWidth, canvasHeight
      if (imgAspect > containerAspect) {
        canvasWidth = maxWidth
        canvasHeight = maxWidth / imgAspect
      } else {
        canvasHeight = maxHeight
        canvasWidth = maxHeight * imgAspect
      }

      // Use device pixel ratio for crisp rendering on mobile
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvasWidth * dpr
      canvas.height = canvasHeight * dpr
      canvas.style.width = `${canvasWidth}px`
      canvas.style.height = `${canvasHeight}px`
      
      ctx.scale(dpr, dpr)

      // Store scale for coordinate conversion
      setImageScale({
        scaleX: canvasWidth / img.width,
        scaleY: canvasHeight / img.height,
        offsetX: 0,
        offsetY: 0,
      })

      // Draw image
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

      // Draw corner points with larger touch targets on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      const cornerRadius = isMobile ? 20 : 12
      const touchRadius = isMobile ? 40 : 30

      corners.forEach((corner, index) => {
        const x = corner.x * canvasWidth
        const y = corner.y * canvasHeight

        // Draw line to next corner
        const nextIndex = index < 3 ? index + 1 : 0
        const nextCorner = corners[nextIndex]
        const nextX = nextCorner.x * canvasWidth
        const nextY = nextCorner.y * canvasHeight

        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = isMobile ? 3 : 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(nextX, nextY)
        ctx.stroke()
        ctx.setLineDash([])

        // Draw corner point with larger size on mobile
        ctx.fillStyle = selectedCorner === index ? '#ef4444' : '#3b82f6'
        ctx.beginPath()
        ctx.arc(x, y, cornerRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = isMobile ? 3 : 2
        ctx.stroke()
        
        // Draw touch target area (invisible but helps with touch detection)
        if (isMobile) {
          ctx.globalAlpha = 0.1
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(x, y, touchRadius, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1.0
        }
      })
    }

    img.src = image
  }

  const getEventPos = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    // Account for device pixel ratio
    const dpr = window.devicePixelRatio || 1
    const scaleX = canvas.width / (rect.width * dpr)
    const scaleY = canvas.height / (rect.height * dpr)
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const findNearestCorner = (x, y) => {
    if (!canvasRef.current) return -1
    
    let minDist = Infinity
    let nearestIndex = -1
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const touchRadius = isMobile ? 40 : 30

    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    const canvasWidth = canvas.width / dpr
    const canvasHeight = canvas.height / dpr

    corners.forEach((corner, index) => {
      const cornerX = corner.x * canvasWidth
      const cornerY = corner.y * canvasHeight
      const dist = Math.sqrt(
        Math.pow(x - cornerX, 2) + Math.pow(y - cornerY, 2)
      )
      if (dist < touchRadius && dist < minDist) {
        minDist = dist
        nearestIndex = index
      }
    })

    return nearestIndex
  }

  const handleStart = (e) => {
    e.preventDefault()
    const pos = getEventPos(e)
    const cornerIndex = findNearestCorner(pos.x, pos.y)
    if (cornerIndex !== -1) {
      setSelectedCorner(cornerIndex)
      setIsDragging(true)
    }
  }

  const handleMove = (e) => {
    if (isDragging && selectedCorner !== null) {
      e.preventDefault()
      const pos = getEventPos(e)
      const canvas = canvasRef.current
      if (!canvas) return
      
      const dpr = window.devicePixelRatio || 1
      const canvasWidth = canvas.width / dpr
      const canvasHeight = canvas.height / dpr
      
      const newCorners = [...corners]
      newCorners[selectedCorner] = {
        x: Math.max(0.05, Math.min(0.95, pos.x / canvasWidth)),
        y: Math.max(0.05, Math.min(0.95, pos.y / canvasHeight)),
      }
      setCorners(newCorners)
    }
  }

  const handleEnd = (e) => {
    e.preventDefault()
    setIsDragging(false)
    setSelectedCorner(null)
  }

  const handleCrop = () => {
    if (!image) return

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Calculate source corners in image coordinates
      const srcCorners = corners.map((corner) => ({
        x: corner.x * img.width,
        y: corner.y * img.height,
      }))

      // Calculate destination dimensions using perspective transform
      // Get the width and height of the quadrilateral
      const topWidth = Math.sqrt(
        Math.pow(srcCorners[1].x - srcCorners[0].x, 2) +
        Math.pow(srcCorners[1].y - srcCorners[0].y, 2)
      )
      const bottomWidth = Math.sqrt(
        Math.pow(srcCorners[3].x - srcCorners[2].x, 2) +
        Math.pow(srcCorners[3].y - srcCorners[2].y, 2)
      )
      const leftHeight = Math.sqrt(
        Math.pow(srcCorners[2].x - srcCorners[0].x, 2) +
        Math.pow(srcCorners[2].y - srcCorners[0].y, 2)
      )
      const rightHeight = Math.sqrt(
        Math.pow(srcCorners[3].x - srcCorners[1].x, 2) +
        Math.pow(srcCorners[3].y - srcCorners[1].y, 2)
      )

      const width = Math.max(topWidth, bottomWidth)
      const height = Math.max(leftHeight, rightHeight)

      canvas.width = width
      canvas.height = height

      // Apply perspective transformation using getPerspectiveTransform
      const dstCorners = [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: 0, y: height },
        { x: width, y: height },
      ]

      // Use a proper perspective transform
      const transform = getPerspectiveTransform(srcCorners, dstCorners)
      
      ctx.save()
      ctx.setTransform(
        transform[0], transform[1],
        transform[2], transform[3],
        transform[4], transform[5]
      )
      ctx.drawImage(img, 0, 0)
      ctx.restore()

      const croppedImage = canvas.toDataURL('image/jpeg', 0.9)
      if (onCrop) {
        onCrop(croppedImage)
      }
    }
    img.src = image
  }

  // Calculate perspective transformation matrix
  const getPerspectiveTransform = (src, dst) => {
    // Simplified perspective transform
    // For better results, you could use a full 3x3 matrix
    const scaleX = (dst[1].x - dst[0].x) / (src[1].x - src[0].x)
    const scaleY = (dst[2].y - dst[0].y) / (src[2].y - src[0].y)
    const offsetX = dst[0].x - src[0].x * scaleX
    const offsetY = dst[0].y - src[0].y * scaleY

    return [scaleX, 0, 0, scaleY, offsetX, offsetY]
  }

  const handleReset = () => {
    setCorners([
      { x: 0.1, y: 0.1 },
      { x: 0.9, y: 0.1 },
      { x: 0.1, y: 0.9 },
      { x: 0.9, y: 0.9 },
    ])
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col"
      style={{
        width: '100vw',
        height: '100dvh',
        maxHeight: '100vh',
        touchAction: 'none',
      }}
    >
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden"
        style={{
          minHeight: 0,
          paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            onTouchCancel={handleEnd}
            className="max-w-full max-h-full border-2 border-white rounded-lg"
            style={{ 
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
          />
        </div>
      </div>

      <div 
        className="bg-black bg-opacity-75 flex-shrink-0"
        style={{
          padding: '1rem',
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="container-mobile">
          <p className="text-white text-xs sm:text-sm text-center mb-3 sm:mb-4">
            {isMobile ? 'Tap and drag the blue corners' : 'Drag the blue corners to adjust the document edges'}
          </p>
          <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
            <button
              onClick={handleReset}
              className="bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg touch-target transition-colors flex items-center gap-2 text-sm sm:text-base min-w-[80px]"
            >
              <FaUndo size={16} />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={handleCrop}
              className="bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg touch-target transition-colors flex items-center gap-2 text-sm sm:text-base min-w-[80px]"
            >
              <FaCheck size={16} />
              <span className="hidden sm:inline">Apply</span>
            </button>
            <button
              onClick={onCancel}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg touch-target transition-colors flex items-center gap-2 text-sm sm:text-base min-w-[80px]"
            >
              <FaTimes size={16} />
              <span className="hidden sm:inline">Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

