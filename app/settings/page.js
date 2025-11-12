'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { FaArrowLeft, FaUser, FaCog, FaTrash, FaSignOutAlt } from 'react-icons/fa'

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout, loading: authLoading } = useAuth()
  const [storageInfo, setStorageInfo] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      checkStorage()
    }
  }, [user, authLoading, router])

  const checkStorage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      setStorageInfo({
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      })
    }
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleClearStorage = async () => {
    if (!confirm('Are you sure you want to clear all stored data? This cannot be undone.')) {
      return
    }

    try {
      // Clear IndexedDB
      const deleteReq = indexedDB.deleteDatabase('PaperFlyDB')
      deleteReq.onsuccess = () => {
        alert('Storage cleared successfully')
        logout()
        router.push('/')
      }
      deleteReq.onerror = () => {
        alert('Failed to clear storage')
      }
    } catch (error) {
      console.error('Error clearing storage:', error)
      alert('Failed to clear storage')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container-mobile py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="touch-target p-2 text-gray-700 hover:text-gray-900"
              aria-label="Go back"
            >
              <FaArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold flex-1">Settings</h1>
          </div>
        </div>
      </div>

      <div className="container-mobile py-6">
        {/* User Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary-100 rounded-full p-4">
              <FaUser className="text-primary-600" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user?.username}</h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Storage Info */}
        {storageInfo && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <FaCog className="text-primary-600" size={20} />
              <h2 className="text-lg font-semibold">Storage</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used:</span>
                <span className="text-gray-900">{formatBytes(storageInfo.usage)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available:</span>
                <span className="text-gray-900">
                  {formatBytes(storageInfo.quota - storageInfo.usage)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{
                    width: `${(storageInfo.usage / storageInfo.quota) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleClearStorage}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg touch-target transition-colors flex items-center justify-center gap-3"
          >
            <FaTrash />
            Clear All Data
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-lg touch-target transition-colors flex items-center justify-center gap-3"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>

        {/* App Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>PaperFly v1.0.0</p>
          <p className="mt-2">100% Client-Side • Your Data Stays Private</p>
        </div>
      </div>
    </div>
  )
}

