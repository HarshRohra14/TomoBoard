import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Play,
  Pause,
  Volume2,
  Maximize,
  Share2,
  Download,
  Trash2,
  Eye,
  Clock,
  Calendar
} from 'lucide-react';

const VideosTab = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock video data
  const videos = [
    {
      id: 1,
      title: 'Project Kickoff Meeting',
      thumbnail: 'https://via.placeholder.com/300x180/3b82f6/white?text=Video+1',
      duration: '45:32',
      uploadDate: '2024-01-15',
      views: 23,
      size: '124 MB',
      type: 'Meeting Recording'
    },
    {
      id: 2,
      title: 'Design Review Session',
      thumbnail: 'https://via.placeholder.com/300x180/10b981/white?text=Video+2',
      duration: '28:15',
      uploadDate: '2024-01-14',
      views: 15,
      size: '89 MB',
      type: 'Design Review'
    },
    {
      id: 3,
      title: 'Product Demo',
      thumbnail: 'https://via.placeholder.com/300x180/f59e0b/white?text=Video+3',
      duration: '12:45',
      uploadDate: '2024-01-13',
      views: 45,
      size: '67 MB',
      type: 'Demo'
    },
    {
      id: 4,
      title: 'Team Training Workshop',
      thumbnail: 'https://via.placeholder.com/300x180/ef4444/white?text=Video+4',
      duration: '1:15:20',
      uploadDate: '2024-01-12',
      views: 32,
      size: '256 MB',
      type: 'Training'
    }
  ];

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header Actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-80"
          />
        </div>
        
        <button className="btn-primary flex items-center space-x-2">
          <Upload className="h-4 w-4" />
          <span>Upload Video</span>
        </button>
      </motion.div>

      <div className="flex-1 flex gap-6">
        {/* Video Library */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Video Library ({filteredVideos.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`card cursor-pointer transition-all hover:shadow-md ${
                  selectedVideo?.id === video.id ? 'ring-2 ring-primary-500' : ''
                }`}
                onClick={() => handleVideoSelect(video)}
              >
                {/* Video Thumbnail */}
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>

                {/* Video Info */}
                <div className="mt-3">
                  <h3 className="font-medium text-gray-900 truncate">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{video.type}</p>
                  
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{video.views} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{video.size}</span>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-primary-600">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-primary-600">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Play className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No videos found
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Upload your first video to get started'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Video Player */}
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-96 space-y-6"
          >
            {/* Player */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Now Playing</h3>
              
              <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                <img
                  src={selectedVideo.thumbnail}
                  alt={selectedVideo.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={togglePlayPause}
                    className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-1" />
                    )}
                  </button>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button onClick={togglePlayPause}>
                      {isPlaying ? (
                        <Pause className="h-5 w-5 text-gray-600" />
                      ) : (
                        <Play className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                    <Volume2 className="h-5 w-5 text-gray-600" />
                    <div className="w-20 h-1 bg-gray-200 rounded-full">
                      <div className="w-3/4 h-full bg-primary-600 rounded-full"></div>
                    </div>
                  </div>
                  <button>
                    <Maximize className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                <div className="w-full h-1 bg-gray-200 rounded-full">
                  <div className="w-1/3 h-full bg-primary-600 rounded-full"></div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>15:30</span>
                  <span>{selectedVideo.duration}</span>
                </div>
              </div>
            </div>

            {/* Video Details */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Video Details</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {selectedVideo.title}
                  </h4>
                  <p className="text-sm text-gray-600">{selectedVideo.type}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium">{selectedVideo.duration}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">File Size:</span>
                    <p className="font-medium">{selectedVideo.size}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Views:</span>
                    <p className="font-medium">{selectedVideo.views}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Uploaded:</span>
                    <p className="font-medium">
                      {new Date(selectedVideo.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                  <button className="btn-primary flex-1 flex items-center justify-center space-x-2">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                  <button className="btn-secondary flex items-center justify-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VideosTab;
