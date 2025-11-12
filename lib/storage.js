// IndexedDB storage utilities for documents and user data

const DB_NAME = 'PaperFlyDB'
const DB_VERSION = 1
const STORE_DOCUMENTS = 'documents'
const STORE_USERS = 'users'

let db = null

// Initialize IndexedDB
export async function initDB() {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = event.target.result

      // Create documents store
      if (!database.objectStoreNames.contains(STORE_DOCUMENTS)) {
        const documentStore = database.createObjectStore(STORE_DOCUMENTS, {
          keyPath: 'id',
          autoIncrement: true,
        })
        documentStore.createIndex('userId', 'userId', { unique: false })
        documentStore.createIndex('title', 'title', { unique: false })
        documentStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // Create users store
      if (!database.objectStoreNames.contains(STORE_USERS)) {
        const userStore = database.createObjectStore(STORE_USERS, {
          keyPath: 'id',
        })
        userStore.createIndex('email', 'email', { unique: true })
        userStore.createIndex('username', 'username', { unique: true })
      }
    }
  })
}

// Document operations
export async function saveDocument(document) {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_DOCUMENTS], 'readwrite')
    const store = transaction.objectStore(STORE_DOCUMENTS)
    const request = store.put({
      ...document,
      createdAt: document.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getDocument(id) {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_DOCUMENTS], 'readonly')
    const store = transaction.objectStore(STORE_DOCUMENTS)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllDocuments(userId) {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_DOCUMENTS], 'readonly')
    const store = transaction.objectStore(STORE_DOCUMENTS)
    const index = store.index('userId')
    const request = index.getAll(userId)

    request.onsuccess = () => {
      const documents = request.result.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      resolve(documents)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function deleteDocument(id) {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_DOCUMENTS], 'readwrite')
    const store = transaction.objectStore(STORE_DOCUMENTS)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// User operations
export async function saveUser(user) {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_USERS], 'readwrite')
    const store = transaction.objectStore(STORE_USERS)
    const request = store.put({
      ...user,
      createdAt: user.createdAt || new Date().toISOString(),
    })

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getUserByEmail(email) {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_USERS], 'readonly')
    const store = transaction.objectStore(STORE_USERS)
    const index = store.index('email')
    const request = index.get(email)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getUserByUsername(username) {
  const database = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_USERS], 'readonly')
    const store = transaction.objectStore(STORE_USERS)
    const index = store.index('username')
    const request = index.get(username)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Simple password hashing (for demo purposes - in production, use proper hashing)
function simpleHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString()
}

// Session management using localStorage
export function setSession(user) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('paperfly_session', JSON.stringify(user))
  }
}

export function getSession() {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('paperfly_session')
    return session ? JSON.parse(session) : null
  }
  return null
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('paperfly_session')
  }
}

// Authentication helpers
export async function registerUser({ username, email, password }) {
  // Check if user exists
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    throw new Error('User with this email already exists')
  }

  const existingUsername = await getUserByUsername(username)
  if (existingUsername) {
    throw new Error('Username already taken')
  }

  // Create new user
  const userId = Date.now().toString()
  const hashedPassword = simpleHash(password)

  const user = {
    id: userId,
    username,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  }

  await saveUser(user)
  setSession({ id: user.id, username: user.username, email: user.email })
  return user
}

export async function loginUser({ email, password }) {
  const user = await getUserByEmail(email)
  if (!user) {
    throw new Error('Invalid email or password')
  }

  const hashedPassword = simpleHash(password)
  if (user.password !== hashedPassword) {
    throw new Error('Invalid email or password')
  }

  setSession({ id: user.id, username: user.username, email: user.email })
  return { id: user.id, username: user.username, email: user.email }
}

