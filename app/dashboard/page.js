'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getAllDocuments, deleteDocument } from '@/lib/storage'
import DocumentList from '@/components/document-list/DocumentList'
import { FaCamera, FaSignOutAlt, FaFileAlt } from 'react-icons/fa'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, loading: authLoading } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadDocuments()
    }
  }, [user, authLoading, router])

  const loadDocuments = async () => {
    if (!user) return

    try {
      setLoading(true)
      const docs = await getAllDocuments(user.id)
      setDocuments(docs)
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      await deleteDocument(id)
      await loadDocuments()
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (authLoading || loading) {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">PaperFly</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="touch-target p-2 text-gray-700 hover:text-gray-900"
              aria-label="Logout"
            >
              <FaSignOutAlt size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="container-mobile py-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link
            href="/scan"
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl p-6 shadow-lg touch-target transition-colors"
          >
            <div className="flex flex-col items-center justify-center">
              <FaCamera size={32} className="mb-2" />
              <span className="font-semibold">New Scan</span>
            </div>
          </Link>
          <Link
            href="/documents"
            className="bg-white hover:bg-gray-50 text-gray-800 rounded-xl p-6 shadow-lg touch-target transition-colors border-2 border-gray-200"
          >
            <div className="flex flex-col items-center justify-center">
              <FaFileAlt size={32} className="mb-2 text-primary-600" />
              <span className="font-semibold">Documents</span>
            </div>
          </Link>
        </div>

        {/* Settings Link */}
        <div className="mb-6">
          <Link
            href="/settings"
            className="block bg-white hover:bg-gray-50 text-gray-800 rounded-xl p-4 shadow-lg touch-target transition-colors border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">Settings</span>
              <span className="text-gray-400">›</span>
            </div>
          </Link>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-bold text-primary-600">{documents.length}</p>
              <p className="text-sm text-gray-600">Total Documents</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-600">
                {documents.filter((d) => d.ocrText).length}
              </p>
              <p className="text-sm text-gray-600">With OCR</p>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Documents</h2>
            {documents.length > 0 && (
              <Link
                href="/documents"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            )}
          </div>

          {documents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FaFileAlt size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No documents yet</p>
              <Link
                href="/scan"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg touch-target transition-colors"
              >
                Start Scanning
              </Link>
            </div>
          ) : (
            <DocumentList
              documents={documents.slice(0, 5)}
              onDelete={handleDelete}
              onRefresh={loadDocuments}
            />
          )}
        </div>
      </div>
    </div>
  )
}

