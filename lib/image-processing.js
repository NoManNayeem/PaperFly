// Image processing utilities for edge detection and enhancement

// Simple edge detection using Canny-like algorithm
export function detectEdges(imageData) {
  const width = imageData.width
  const height = imageData.height
  const data = imageData.data
  const output = new ImageData(width, height)
  const outputData = output.data

  // Convert to grayscale first
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    outputData[i] = gray
    outputData[i + 1] = gray
    outputData[i + 2] = gray
    outputData[i + 3] = data[i + 3]
  }

  // Apply Sobel operator for edge detection
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0
      let gy = 0

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4
          const gray = outputData[idx]
          const kernelIdx = (ky + 1) * 3 + (kx + 1)
          gx += gray * sobelX[kernelIdx]
          gy += gray * sobelY[kernelIdx]
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy)
      const idx = (y * width + x) * 4
      const edge = Math.min(255, magnitude)
      outputData[idx] = edge
      outputData[idx + 1] = edge
      outputData[idx + 2] = edge
    }
  }

  return output
}

// Find document corners using edge detection
export function findDocumentCorners(imageData) {
  const edges = detectEdges(imageData)
  const width = edges.width
  const height = edges.height
  const data = edges.data

  // Find corners by looking for high edge density in corners
  const cornerSize = Math.min(width, height) * 0.1
  const corners = []

  // Top-left
  let maxDensity = 0
  let bestCorner = { x: 0, y: 0 }
  for (let y = 0; y < cornerSize; y++) {
    for (let x = 0; x < cornerSize; x++) {
      const idx = (y * width + x) * 4
      const density = data[idx]
      if (density > maxDensity) {
        maxDensity = density
        bestCorner = { x, y }
      }
    }
  }
  corners.push(bestCorner)

  // Top-right
  maxDensity = 0
  bestCorner = { x: width - 1, y: 0 }
  for (let y = 0; y < cornerSize; y++) {
    for (let x = width - cornerSize; x < width; x++) {
      const idx = (y * width + x) * 4
      const density = data[idx]
      if (density > maxDensity) {
        maxDensity = density
        bestCorner = { x, y }
      }
    }
  }
  corners.push(bestCorner)

  // Bottom-left
  maxDensity = 0
  bestCorner = { x: 0, y: height - 1 }
  for (let y = height - cornerSize; y < height; y++) {
    for (let x = 0; x < cornerSize; x++) {
      const idx = (y * width + x) * 4
      const density = data[idx]
      if (density > maxDensity) {
        maxDensity = density
        bestCorner = { x, y }
      }
    }
  }
  corners.push(bestCorner)

  // Bottom-right
  maxDensity = 0
  bestCorner = { x: width - 1, y: height - 1 }
  for (let y = height - cornerSize; y < height; y++) {
    for (let x = width - cornerSize; x < width; x++) {
      const idx = (y * width + x) * 4
      const density = data[idx]
      if (density > maxDensity) {
        maxDensity = density
        bestCorner = { x, y }
      }
    }
  }
  corners.push(bestCorner)

  return corners
}

// Perspective correction using corner points
export function perspectiveTransform(imageData, corners, outputWidth, outputHeight) {
  const canvas = document.createElement('canvas')
  canvas.width = outputWidth
  canvas.height = outputHeight
  const ctx = canvas.getContext('2d')

  const srcCorners = [
    { x: corners[0].x, y: corners[0].y }, // top-left
    { x: corners[1].x, y: corners[1].y }, // top-right
    { x: corners[2].x, y: corners[2].y }, // bottom-left
    { x: corners[3].x, y: corners[3].y }, // bottom-right
  ]

  const dstCorners = [
    { x: 0, y: 0 },
    { x: outputWidth, y: 0 },
    { x: 0, y: outputHeight },
    { x: outputWidth, y: outputHeight },
  ]

  // Create source image
  const srcCanvas = document.createElement('canvas')
  srcCanvas.width = imageData.width
  srcCanvas.height = imageData.height
  const srcCtx = srcCanvas.getContext('2d')
  srcCtx.putImageData(imageData, 0, 0)

  // Calculate transformation matrix
  const matrix = calculatePerspectiveMatrix(srcCorners, dstCorners)

  // Apply transformation
  ctx.setTransform(
    matrix[0], matrix[1],
    matrix[2], matrix[3],
    matrix[4], matrix[5]
  )

  ctx.drawImage(srcCanvas, 0, 0)

  return ctx.getImageData(0, 0, outputWidth, outputHeight)
}

// Calculate perspective transformation matrix
function calculatePerspectiveMatrix(src, dst) {
  // Simplified perspective transformation
  // For a full implementation, use a proper perspective transform algorithm
  const scaleX = (dst[1].x - dst[0].x) / (src[1].x - src[0].x)
  const scaleY = (dst[2].y - dst[0].y) / (src[2].y - src[0].y)

  return [
    scaleX, 0,
    0, scaleY,
    dst[0].x - src[0].x * scaleX,
    dst[0].y - src[0].y * scaleY,
  ]
}

// Image enhancement functions
export function adjustBrightness(imageData, factor) {
  // Create a copy to avoid mutating original
  const data = new Uint8ClampedArray(imageData.data)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] + factor)) // R
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + factor)) // G
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + factor)) // B
  }
  return new ImageData(data, imageData.width, imageData.height)
}

export function adjustContrast(imageData, factor) {
  // Create a copy to avoid mutating original
  const data = new Uint8ClampedArray(imageData.data)
  const intercept = 128 * (1 - factor)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] * factor + intercept))
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor + intercept))
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor + intercept))
  }
  return new ImageData(data, imageData.width, imageData.height)
}

export function convertToGrayscale(imageData) {
  // Create a copy to avoid mutating original
  const data = new Uint8ClampedArray(imageData.data)
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    data[i] = gray
    data[i + 1] = gray
    data[i + 2] = gray
  }
  return new ImageData(data, imageData.width, imageData.height)
}

export function convertToBlackWhite(imageData, threshold = 128) {
  // Create a copy to avoid mutating original
  const data = new Uint8ClampedArray(imageData.data)
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    const value = gray > threshold ? 255 : 0
    data[i] = value
    data[i + 1] = value
    data[i + 2] = value
  }
  return new ImageData(data, imageData.width, imageData.height)
}

// Auto-crop document from image
export async function autoCropDocument(imageSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const corners = findDocumentCorners(imageData)

      // Calculate bounding box
      const minX = Math.min(...corners.map((c) => c.x))
      const maxX = Math.max(...corners.map((c) => c.x))
      const minY = Math.min(...corners.map((c) => c.y))
      const maxY = Math.max(...corners.map((c) => c.y))

      // Crop and apply perspective correction
      const width = maxX - minX
      const height = maxY - minY

      const croppedCanvas = document.createElement('canvas')
      croppedCanvas.width = width
      croppedCanvas.height = height
      const croppedCtx = croppedCanvas.getContext('2d')

      // Draw cropped image
      croppedCtx.drawImage(
        canvas,
        minX,
        minY,
        width,
        height,
        0,
        0,
        width,
        height
      )

      resolve(croppedCanvas.toDataURL('image/jpeg', 0.9))
    }
    img.src = imageSrc
  })
}

