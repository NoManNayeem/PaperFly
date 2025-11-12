// Tesseract.js OCR wrapper

import { createWorker } from 'tesseract.js'

let worker = null

export async function initOCR() {
  if (!worker) {
    worker = await createWorker('eng')
  }
  return worker
}

export async function recognizeText(imageSrc, language = 'eng', onProgress = null) {
  try {
    const ocrWorker = await initOCR()
    
    // Set language if different
    if (language !== 'eng') {
      await ocrWorker.loadLanguage(language)
      await ocrWorker.initialize(language)
    }

    const result = await ocrWorker.recognize(imageSrc, {
      logger: onProgress || (() => {}),
    })

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words,
      lines: result.data.lines,
      paragraphs: result.data.paragraphs,
    }
  } catch (error) {
    console.error('OCR Error:', error)
    throw new Error('Failed to recognize text: ' + error.message)
  }
}

export async function getAvailableLanguages() {
  try {
    const ocrWorker = await initOCR()
    const languages = await ocrWorker.getAvailableLanguages()
    return languages
  } catch (error) {
    console.error('Error getting languages:', error)
    return ['eng'] // Default to English
  }
}

export async function terminateOCR() {
  if (worker) {
    await worker.terminate()
    worker = null
  }
}

