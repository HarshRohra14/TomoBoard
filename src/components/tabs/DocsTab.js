import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  FileText,
  Image,
  Download,
  Share2,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  User,
  Folder,
  Grid,
  List,
  Filter
} from 'lucide-react';

const DocsTab = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // Mock documents data
  const documents = [
    {
      id: 1,
      title: 'Project Requirements Document',
      type: 'document',
      content: 'This document outlines the comprehensive requirements for our upcoming project...',
      author: 'John Doe',
      lastModified: '2024-01-15T10:30:00Z',
      size: '2.4 MB',
      views: 45,
      folder: 'Projects',
      tags: ['requirements', 'project', 'planning']
    },
    {
      id: 2,
      title: 'Design System Guidelines',
      type: 'document',
      content: 'Our design system provides a unified approach to creating consistent user interfaces...',
      author: 'Jane Smith',
      lastModified: '2024-01-14T15:45:00Z',
      size: '1.8 MB',
      views: 32,
      folder: 'Design',
      tags: ['design', 'guidelines', 'ui']
    },
    {
      id: 3,
      title: 'Meeting Notes - Sprint Planning',
      type: 'notes',
      content: 'Sprint planning meeting notes from January 13th. Key decisions and action items...',
      author: 'Mike Johnson',
      lastModified: '2024-01-13T14:20:00Z',
      size: '456 KB',
      views: 28,
      folder: 'Meetings',
      tags: ['meeting', 'sprint', 'planning']
    },
    {
      id: 4,
      title: 'API Documentation',
      type: 'technical',
      content: 'Complete API documentation including endpoints, parameters, and examples...',
      author: 'Sarah Wilson',
      lastModified: '2024-01-12T11:15:00Z',
      size: '3.2 MB',
      views: 67,
      folder: 'Technical',
      tags: ['api', 'documentation', 'technical']
    },
    {
      id: 5,
      title: 'Marketing Strategy Q1 2024',
      type: 'presentation',
      content: 'Comprehensive marketing strategy for the first quarter of 2024...',
      author: 'David Brown',
      lastModified: '2024-01-11T16:30:00Z',
      size: '5.1 MB',
      views: 23,
      folder: 'Marketing',
      tags: ['marketing', 'strategy', 'q1']
    }
  ];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || doc.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'notes':
        return Edit3;
      case 'technical':
        return FileText;
      case 'presentation':
        return Image;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'document':
        return 'bg-blue-100 text-blue-800';
      case 'notes':
        return 'bg-green-100 text-green-800';
      case 'technical':
        return 'bg-purple-100 text-purple-800';
      case 'presentation':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-80"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field w-40"
          >
            <option value="all">All Types</option>
            <option value="document">Documents</option>
            <option value="notes">Notes</option>
            <option value="technical">Technical</option>
            <option value="presentation">Presentations</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Document</span>
          </button>
        </div>
      </motion.div>

      <div className="flex-1 flex gap-6">
        {/* Documents List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Documents ({filteredDocs.length})
            </h2>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.map((doc, index) => {
                const TypeIcon = getTypeIcon(doc.type);
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`card cursor-pointer transition-all hover:shadow-md ${
                      selectedDoc?.id === doc.id ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div className="flex items-start space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(doc.type)}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {doc.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {doc.folder}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {doc.content}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{doc.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{doc.views} views</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {formatDate(doc.lastModified)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-primary-600">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-primary-600">
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocs.map((doc, index) => {
                const TypeIcon = getTypeIcon(doc.type);
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className={`card cursor-pointer transition-all hover:shadow-md ${
                      selectedDoc?.id === doc.id ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${getTypeColor(doc.type)}`}>
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {doc.title}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {doc.content}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>{doc.author}</span>
                        <span>{formatDate(doc.lastModified)}</span>
                        <span>{doc.size}</span>
                        <div className="flex items-center space-x-2">
                          <button className="text-gray-400 hover:text-primary-600">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-primary-600">
                            <Share2 className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {filteredDocs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FileText className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents found
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first document to get started'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Document Preview */}
        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-96 space-y-6"
          >
            {/* Document Info */}
            <div className="card">
              <div className="flex items-start space-x-3 mb-4">
                <div className={`p-3 rounded-lg ${getTypeColor(selectedDoc.type)}`}>
                  {React.createElement(getTypeIcon(selectedDoc.type), { className: "h-6 w-6" })}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {selectedDoc.title}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedDoc.folder}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Author:</span>
                  <span className="font-medium">{selectedDoc.author}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Modified:</span>
                  <span className="font-medium">{formatDate(selectedDoc.lastModified)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Size:</span>
                  <span className="font-medium">{selectedDoc.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Views:</span>
                  <span className="font-medium">{selectedDoc.views}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                <button className="btn-primary flex-1 flex items-center justify-center space-x-2">
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button className="btn-secondary flex items-center justify-center space-x-2">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
                <button className="btn-secondary flex items-center justify-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Document Content Preview */}
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-3">Preview</h4>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {selectedDoc.content}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="card">
              <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedDoc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DocsTab;
