// Tesseract.js OCR wrapper

import { createWorker } from 'tesseract.js'

let worker = null
let isInitializing = false

export async function initOCR() {
  if (worker) {
    return worker
  }

  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return worker
  }

  isInitializing = true
  try {
    // Configure worker options for Next.js static export
    const workerOptions = {
      logger: (m) => {
        if (m.status === 'loading tesseract core') {
          console.log('Loading Tesseract core...')
        } else if (m.status === 'initializing tesseract') {
          console.log('Initializing Tesseract...')
        } else if (m.status === 'loading language traineddata') {
          console.log('Loading language data...')
        } else if (m.status === 'initializing api') {
          console.log('Initializing API...')
        }
      },
    }

    worker = await createWorker('eng', 1, workerOptions)
    console.log('OCR worker initialized successfully')
    return worker
  } catch (error) {
    console.error('Failed to initialize OCR worker:', error)
    isInitializing = false
    throw error
  } finally {
    isInitializing = false
  }
}

export async function recognizeText(imageSrc, language = 'eng', onProgress = null) {
  try {
    // Ensure worker is initialized
    const ocrWorker = await initOCR()
    
    if (!ocrWorker) {
      throw new Error('OCR worker not available')
    }

    // Set language if different from default
    if (language !== 'eng') {
      try {
        await ocrWorker.loadLanguage(language)
        await ocrWorker.initialize(language)
      } catch (langError) {
        console.warn(`Failed to load language ${language}, using English:`, langError)
        // Continue with English
      }
    }

    // Convert image to blob if it's a data URL
    let imageToProcess = imageSrc
    if (imageSrc.startsWith('data:')) {
      // Data URL is fine, Tesseract can handle it
      imageToProcess = imageSrc
    }

    const result = await ocrWorker.recognize(imageToProcess, {
      logger: onProgress || ((m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
        }
      }),
    })

    if (!result || !result.data) {
      throw new Error('OCR returned empty result')
    }

    return {
      text: result.data.text || '',
      confidence: result.data.confidence || 0,
      words: result.data.words || [],
      lines: result.data.lines || [],
      paragraphs: result.data.paragraphs || [],
    }
  } catch (error) {
    console.error('OCR Error:', error)
    throw new Error('Failed to recognize text: ' + (error.message || 'Unknown error'))
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

