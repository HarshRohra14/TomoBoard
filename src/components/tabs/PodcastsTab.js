import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Mic,
  Upload,
  Download,
  Share2,
  Trash2,
  Clock,
  Calendar,
  User,
  Headphones
} from 'lucide-react';

const PodcastsTab = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  // Mock podcasts data
  const podcasts = [
    {
      id: 1,
      title: 'Team Standup - January 15th',
      description: 'Daily standup meeting recording with development updates and blockers discussion.',
      duration: '15:45',
      host: 'John Doe',
      recordedAt: '2024-01-15T09:00:00Z',
      size: '12.4 MB',
      listens: 23,
      waveform: Array.from({ length: 100 }, () => Math.random() * 100),
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    },
    {
      id: 2,
      title: 'Product Discovery Session',
      description: 'Customer interview session focusing on user pain points and feature requests.',
      duration: '32:18',
      host: 'Jane Smith',
      recordedAt: '2024-01-14T14:30:00Z',
      size: '28.7 MB',
      listens: 45,
      waveform: Array.from({ length: 100 }, () => Math.random() * 100),
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    },
    {
      id: 3,
      title: 'Design Review Meeting',
      description: 'Weekly design review covering new mockups and design system updates.',
      duration: '28:52',
      host: 'Mike Johnson',
      recordedAt: '2024-01-13T16:15:00Z',
      size: '25.1 MB',
      listens: 18,
      waveform: Array.from({ length: 100 }, () => Math.random() * 100),
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    },
    {
      id: 4,
      title: 'Client Presentation Rehearsal',
      description: 'Practice session for upcoming client presentation with feedback and improvements.',
      duration: '41:33',
      host: 'Sarah Wilson',
      recordedAt: '2024-01-12T11:00:00Z',
      size: '36.8 MB',
      listens: 12,
      waveform: Array.from({ length: 100 }, () => Math.random() * 100),
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
    }
  ];

  const filteredPodcasts = podcasts.filter(podcast =>
    podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    podcast.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePlayPause = (podcast) => {
    if (selectedPodcast?.id !== podcast.id) {
      setSelectedPodcast(podcast);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        setRecordedChunks(chunks);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [selectedPodcast]);

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
          <input
            type="text"
            placeholder="Search podcasts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-80"
          />
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                <span>Start Recording</span>
              </>
            )}
          </button>
          
          <button className="btn-secondary flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Upload Audio</span>
          </button>
        </div>
      </motion.div>

      <div className="flex-1 flex gap-6">
        {/* Podcasts List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Podcasts & Recordings ({filteredPodcasts.length})
          </h2>

          <div className="space-y-4">
            {filteredPodcasts.map((podcast, index) => (
              <motion.div
                key={podcast.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`card transition-all hover:shadow-md ${
                  selectedPodcast?.id === podcast.id ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Play Button */}
                  <button
                    onClick={() => handlePlayPause(podcast)}
                    className="flex-shrink-0 w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    {isPlaying && selectedPodcast?.id === podcast.id ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5 ml-1" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {podcast.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {podcast.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
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

                    {/* Waveform Visualization */}
                    <div className="flex items-center space-x-1 mb-3 h-8">
                      {podcast.waveform.slice(0, 50).map((height, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-colors ${
                            selectedPodcast?.id === podcast.id && isPlaying
                              ? 'bg-primary-600'
                              : 'bg-gray-300'
                          }`}
                          style={{ height: `${Math.max(height / 4, 4)}px` }}
                        />
                      ))}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{podcast.host}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{podcast.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Headphones className="h-3 w-3" />
                          <span>{podcast.listens} listens</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(podcast.recordedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredPodcasts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Mic className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No podcasts found
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'Record your first audio or upload a podcast to get started'}
              </p>
            </div>
          )}
        </motion.div>

        {/* Audio Player */}
        {selectedPodcast && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-96 space-y-6"
          >
            {/* Now Playing */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Now Playing</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    {selectedPodcast.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Hosted by {selectedPodcast.host}
                  </p>
                </div>

                {/* Waveform */}
                <div className="flex items-center space-x-1 h-16 bg-gray-50 rounded-lg p-2">
                  {selectedPodcast.waveform.map((height, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-colors cursor-pointer ${
                        i < (currentTime / duration) * 100
                          ? 'bg-primary-600'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      style={{ height: `${Math.max(height / 2, 8)}px` }}
                      onClick={(e) => {
                        const percent = i / 100;
                        const newTime = percent * duration;
                        setCurrentTime(newTime);
                        if (audioRef.current) {
                          audioRef.current.currentTime = newTime;
                        }
                      }}
                    />
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div
                    className="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-primary-600 rounded-full transition-all"
                      style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{formatTime(currentTime)}</span>
                    <span>{selectedPodcast.duration}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center space-x-4">
                  <button className="text-gray-600 hover:text-primary-600">
                    <SkipBack className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-1" />
                    )}
                  </button>
                  
                  <button className="text-gray-600 hover:text-primary-600">
                    <SkipForward className="h-5 w-5" />
                  </button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center space-x-3">
                  <button onClick={toggleMute} className="text-gray-600 hover:text-primary-600">
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Podcast Details */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Episode Details</h3>
              
              <div className="space-y-3 text-sm">
                <p className="text-gray-700">{selectedPodcast.description}</p>
                
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <p className="font-medium">{selectedPodcast.duration}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">File Size:</span>
                    <p className="font-medium">{selectedPodcast.size}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Listens:</span>
                    <p className="font-medium">{selectedPodcast.listens}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Recorded:</span>
                    <p className="font-medium">
                      {formatDate(selectedPodcast.recordedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
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

      {/* Hidden Audio Element */}
      {selectedPodcast && (
        <audio
          ref={audioRef}
          src={selectedPodcast.audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          autoPlay={isPlaying}
        />
      )}
    </div>
  );
};

export default PodcastsTab;
