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

  // Add OCR text as invisible layer for searchability (spread across pages)
  if (includeText && ocrText) {
    pdf.setTextColor(255, 255, 255) // White text (invisible)
    pdf.setFontSize(1)
    
    // Split OCR text by page markers if present
    const pageSections = ocrText.split(/Page \d+:/)
    const lines = ocrText.split('\n')
    
    let currentPage = 0
    let yPos = margin + 5
    
    lines.forEach((line) => {
      // Check if this is a page marker
      if (line.match(/^Page \d+:/)) {
        // Move to next page
        if (currentPage < images.length - 1) {
          currentPage++
          pdf.setPage(currentPage + 1) // +1 because pages are 1-indexed
          yPos = margin + 5
        }
        return
      }
      
      if (line.trim()) {
        // Check if we need a new page
        if (yPos > pageHeight - margin - 10) {
          if (currentPage < images.length - 1) {
            currentPage++
            pdf.setPage(currentPage + 1)
            yPos = margin + 5
          } else {
            return // No more pages
          }
        }
        
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

