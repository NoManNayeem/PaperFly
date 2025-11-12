// PDF generation using jsPDF

import { jsPDF } from 'jspdf'

export async function generatePDF(images, options = {}) {
  const {
    title = 'Document',
    includeText = false,
    ocrText = '',
    pageSize = 'a4',
    orientation = 'portrait',
  } = options

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize,
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const contentWidth = pageWidth - 2 * margin
  const contentHeight = pageHeight - 2 * margin

  // Add title if provided
  if (title) {
    pdf.setFontSize(16)
    pdf.text(title, margin, margin + 10)
  }

  // Add images sequentially
  for (let index = 0; index < images.length; index++) {
    if (index > 0) {
      pdf.addPage()
    }

    const imageSrc = images[index]
    
    // Load image and add to PDF
    await new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        try {
          const imgWidth = img.width
          const imgHeight = img.height
          const ratio = Math.min(
            contentWidth / (imgWidth * 0.264583),
            contentHeight / (imgHeight * 0.264583)
          )
          const width = imgWidth * 0.264583 * ratio
          const height = imgHeight * 0.264583 * ratio
          const x = (pageWidth - width) / 2
          const y = index === 0 && title ? margin + 15 : margin

          pdf.addImage(imageSrc, 'JPEG', x, y, width, height, undefined, 'FAST')
          resolve()
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = imageSrc
    })
  }

  // Add OCR text as invisible layer for searchability
  if (includeText && ocrText) {
    pdf.setTextColor(255, 255, 255) // White text (invisible)
    pdf.setFontSize(1)
    const lines = ocrText.split('\n')
    let yPos = margin + 5
    lines.forEach((line) => {
      if (line.trim()) {
        pdf.text(line, margin, yPos, {
          maxWidth: contentWidth,
        })
        yPos += 2
      }
    })
  }

  return pdf
}

export function downloadPDF(pdf, filename = 'document.pdf') {
  pdf.save(filename)
}

export async function generatePDFFromDocument(document) {
  const images = Array.isArray(document.images) ? document.images : [document.image]
  return await generatePDF(images, {
    title: document.title || 'Document',
    includeText: true,
    ocrText: document.ocrText || '',
  })
}

