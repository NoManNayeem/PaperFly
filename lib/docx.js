// DOCX generation using docx library

import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, WidthType } from 'docx'
import { saveAs } from 'file-saver'

// Convert base64 image to buffer
function base64ToBuffer(base64) {
  const base64Data = base64.split(',')[1] || base64
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return Buffer.from(bytes)
}

// Get image dimensions from base64
function getImageDimensions(base64) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.src = base64
  })
}

export async function generateDOCX(document, options = {}) {
  const {
    title = 'Document',
    includeImages = true,
    includeText = true,
  } = options

  const children = []

  // Add title
  if (title) {
    children.push(
      new Paragraph({
        text: title,
        heading: 'Heading1',
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    )
  }

  // Add images and text
  const images = Array.isArray(document.images) ? document.images : [document.image]
  
  for (let i = 0; i < images.length; i++) {
    if (includeImages && images[i]) {
      try {
        const imageBuffer = base64ToBuffer(images[i])
        const dimensions = await getImageDimensions(images[i])
        
        // Calculate size to fit page (A4 width ~595 points)
        const maxWidth = 500
        const ratio = Math.min(maxWidth / dimensions.width, 1)
        const width = dimensions.width * ratio
        const height = dimensions.height * ratio

        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: width,
                  height: height,
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          })
        )
      } catch (error) {
        console.error('Error adding image to DOCX:', error)
      }
    }

    // Add OCR text if available
    if (includeText && document.ocrText) {
      const textLines = document.ocrText.split('\n')
      textLines.forEach((line) => {
        if (line.trim()) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 22, // 11pt
                }),
              ],
              spacing: { after: 100 },
            })
          )
        }
      })
    }
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  })

  return doc
}

export async function downloadDOCX(document, filename = 'document.docx', options = {}) {
  const docx = await generateDOCX(document, options)
  const blob = await Packer.toBlob(docx)
  saveAs(blob, filename)
}

export async function generateDOCXFromDocument(document) {
  return downloadDOCX(
    document,
    `${document.title || 'document'}.docx`,
    {
      includeImages: true,
      includeText: true,
    }
  )
}

