'use client'

import { useState, useRef, useEffect } from 'react'
import { FaPen, FaHighlighter, FaShapes, FaSignature, FaTimes } from 'react-icons/fa'

export default function AnnotationTools({ image, onAnnotatedImageChange }) {
  const [tool, setTool] = useState(null) // 'pen', 'highlight', 'shape', 'signature'
  const [color, setColor] = useState('#000000')
  const [lineWidth, setLineWidth] = useState(3)
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState(null)

  useEffect(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
    }
    img.src = image
  }, [image])

  const getMousePos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const getTouchPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0] || e.changedTouches[0]
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    }
  }

  const startDraw = (pos) => {
    setIsDrawing(true)
    setStartPos(pos)
    const ctx = canvasRef.current.getContext('2d')
    ctx.strokeStyle = tool === 'highlight' ? color + '80' : color
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  const draw = (pos) => {
    if (!isDrawing || !tool) return

    const ctx = canvasRef.current.getContext('2d')
    ctx.beginPath()

    if (tool === 'pen' || tool === 'highlight') {
      if (startPos) {
        ctx.moveTo(startPos.x, startPos.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
        setStartPos(pos)
      }
    } else if (tool === 'shape' && startPos) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        ctx.strokeStyle = color
        ctx.strokeRect(
          startPos.x,
          startPos.y,
          pos.x - startPos.x,
          pos.y - startPos.y
        )
      }
      img.src = image
    }
  }

  const endDraw = () => {
    setIsDrawing(false)
    setStartPos(null)
    if (canvasRef.current && onAnnotatedImageChange) {
      const annotatedImage = canvasRef.current.toDataURL('image/jpeg', 0.9)
      onAnnotatedImageChange(annotatedImage)
    }
  }

  const handleMouseDown = (e) => {
    if (tool) startDraw(getMousePos(e))
  }

  const handleMouseMove = (e) => {
    if (isDrawing) draw(getMousePos(e))
  }

  const handleMouseUp = () => {
    endDraw()
  }

  const handleTouchStart = (e) => {
    e.preventDefault()
    if (tool) startDraw(getTouchPos(e))
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    if (isDrawing) draw(getTouchPos(e))
  }

  const handleTouchEnd = (e) => {
    e.preventDefault()
    endDraw()
  }

  const addSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.font = '48px Arial'
    ctx.fillStyle = color
    ctx.fillText('Signature', canvas.width / 2 - 100, canvas.height / 2)
    if (onAnnotatedImageChange) {
      const annotatedImage = canvas.toDataURL('image/jpeg', 0.9)
      onAnnotatedImageChange(annotatedImage)
    }
  }

  const clearAnnotations = () => {
    if (!image) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      if (onAnnotatedImageChange) {
        onAnnotatedImageChange(image)
      }
    }
    img.src = image
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Annotations</h2>
        {tool && (
          <button
            onClick={() => setTool(null)}
            className="touch-target p-2 text-gray-600 hover:text-gray-800"
            aria-label="Close tool"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Canvas */}
      <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full max-h-96 cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Tools */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => setTool('pen')}
          className={`p-3 rounded-lg touch-target transition-colors ${
            tool === 'pen'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-label="Pen tool"
        >
          <FaPen />
        </button>
        <button
          onClick={() => setTool('highlight')}
          className={`p-3 rounded-lg touch-target transition-colors ${
            tool === 'highlight'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-label="Highlighter tool"
        >
          <FaHighlighter />
        </button>
        <button
          onClick={() => setTool('shape')}
          className={`p-3 rounded-lg touch-target transition-colors ${
            tool === 'shape'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-label="Shape tool"
        >
          <FaShapes />
        </button>
        <button
          onClick={addSignature}
          className="p-3 rounded-lg touch-target transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
          aria-label="Add signature"
        >
          <FaSignature />
        </button>
      </div>

      {/* Color and Size Controls */}
      {tool && (
        <div className="space-y-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 rounded-lg touch-target"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size: {lineWidth}px
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-full touch-target"
            />
          </div>
        </div>
      )}

      <button
        onClick={clearAnnotations}
        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg touch-target transition-colors"
      >
        Clear Annotations
      </button>
    </div>
  )
}

