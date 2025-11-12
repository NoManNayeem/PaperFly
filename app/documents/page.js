'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getAllDocuments, deleteDocument } from '@/lib/storage'
import DocumentList from '@/components/document-list/DocumentList'
import { FaArrowLeft, FaSearch } from 'react-icons/fa'

export default function DocumentsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [documents, setDocuments] = useState([])
  const [filteredDocuments, setFilteredDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadDocuments()
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDocuments(documents)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = documents.filter(
        (doc) =>
          doc.title?.toLowerCase().includes(query) ||
          doc.ocrText?.toLowerCase().includes(query)
      )
      setFilteredDocuments(filtered)
    }
  }, [searchQuery, documents])

  const loadDocuments = async () => {
    if (!user) return

    try {
      setLoading(true)
      const docs = await getAllDocuments(user.id)
      setDocuments(docs)
      setFilteredDocuments(docs)
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
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="touch-target p-2 text-gray-700 hover:text-gray-900"
              aria-label="Go back"
            >
              <FaArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold flex-1">My Documents</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-target"
            />
          </div>
        </div>
      </div>

      <div className="container-mobile py-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <DocumentList
          documents={filteredDocuments}
          onDelete={handleDelete}
          onRefresh={loadDocuments}
        />
      </div>
    </div>
  )
}

