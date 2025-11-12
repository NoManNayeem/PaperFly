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

  useEffect(() => {
    if (image && canvasRef.current) {
      drawImage()
    }
  }, [image, corners])

  const drawImage = () => {
    if (!canvasRef.current || !image) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Set canvas size to match container
      const container = canvas.parentElement
      const maxWidth = container.clientWidth
      const maxHeight = container.clientHeight - 100 // Leave space for controls

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

      canvas.width = canvasWidth
      canvas.height = canvasHeight

      // Draw image
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

      // Draw corner points
      const cornerRadius = 12
      corners.forEach((corner, index) => {
        const x = corner.x * canvasWidth
        const y = corner.y * canvasHeight

        // Draw line to next corner
        const nextIndex = index < 3 ? index + 1 : 0
        const nextCorner = corners[nextIndex]
        const nextX = nextCorner.x * canvasWidth
        const nextY = nextCorner.y * canvasHeight

        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(nextX, nextY)
        ctx.stroke()
        ctx.setLineDash([])

        // Draw corner point
        ctx.fillStyle = selectedCorner === index ? '#ef4444' : '#3b82f6'
        ctx.beginPath()
        ctx.arc(x, y, cornerRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }

    img.src = image
  }

  const getMousePos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / rect.width * canvas.width,
      y: (e.clientY - rect.top) / rect.height * canvas.height,
    }
  }

  const findNearestCorner = (x, y) => {
    let minDist = Infinity
    let nearestIndex = -1

    corners.forEach((corner, index) => {
      const cornerX = corner.x * canvasRef.current.width
      const cornerY = corner.y * canvasRef.current.height
      const dist = Math.sqrt(
        Math.pow(x - cornerX, 2) + Math.pow(y - cornerY, 2)
      )
      if (dist < 30 && dist < minDist) {
        minDist = dist
        nearestIndex = index
      }
    })

    return nearestIndex
  }

  const handleMouseDown = (e) => {
    const pos = getMousePos(e)
    const cornerIndex = findNearestCorner(pos.x, pos.y)
    if (cornerIndex !== -1) {
      setSelectedCorner(cornerIndex)
      setIsDragging(true)
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && selectedCorner !== null) {
      const pos = getMousePos(e)
      const canvas = canvasRef.current
      const newCorners = [...corners]
      newCorners[selectedCorner] = {
        x: Math.max(0, Math.min(1, pos.x / canvas.width)),
        y: Math.max(0, Math.min(1, pos.y / canvas.height)),
      }
      setCorners(newCorners)
    }
  }

  const handleMouseUp = () => {
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

      // Calculate destination dimensions
      const width = Math.max(
        Math.abs(srcCorners[1].x - srcCorners[0].x),
        Math.abs(srcCorners[3].x - srcCorners[2].x)
      )
      const height = Math.max(
        Math.abs(srcCorners[2].y - srcCorners[0].y),
        Math.abs(srcCorners[3].y - srcCorners[1].y)
      )

      canvas.width = width
      canvas.height = height

      // Apply perspective transformation
      const dstCorners = [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: 0, y: height },
        { x: width, y: height },
      ]

      // Use canvas transform for perspective correction
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(dstCorners[0].x, dstCorners[0].y)
      ctx.lineTo(dstCorners[1].x, dstCorners[1].y)
      ctx.lineTo(dstCorners[3].x, dstCorners[3].y)
      ctx.lineTo(dstCorners[2].x, dstCorners[2].y)
      ctx.closePath()
      ctx.clip()

      // Draw transformed image
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height)
      ctx.restore()

      const croppedImage = canvas.toDataURL('image/jpeg', 0.9)
      if (onCrop) {
        onCrop(croppedImage)
      }
    }
    img.src = image
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
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <div className="relative max-w-full max-h-full">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="max-w-full max-h-full cursor-crosshair border-2 border-white rounded-lg"
            style={{ touchAction: 'none' }}
          />
        </div>
      </div>

      <div className="bg-black bg-opacity-75 p-4">
        <div className="container-mobile">
          <p className="text-white text-sm text-center mb-4">
            Drag the blue corners to adjust the document edges
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReset}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg touch-target transition-colors flex items-center gap-2"
            >
              <FaUndo />
              Reset
            </button>
            <button
              onClick={handleCrop}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg touch-target transition-colors flex items-center gap-2"
            >
              <FaCheck />
              Apply
            </button>
            <button
              onClick={onCancel}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg touch-target transition-colors flex items-center gap-2"
            >
              <FaTimes />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

