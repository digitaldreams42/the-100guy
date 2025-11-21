// app/admin/dashboard/media/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Search, Download, Trash2, Image, File, Video, Filter, AlertCircle, X, Check, Loader2 } from 'lucide-react';
import Button from '../../../../components/ui/Button';

export default function MediaManagement() {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [notification, setNotification] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch media items
    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const typeParam = selectedType !== 'all' ? `?type=${selectedType}` : '';
                const response = await fetch(`/api/media${typeParam}`);
                if (response.ok) {
                    const data = await response.json();
                    setMediaItems(data);
                } else {
                    throw new Error('Failed to fetch media items');
                }
            } catch (error) {
                showNotification('Error loading media: ' + error.message, 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchMedia();
    }, [selectedType]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const filteredMedia = mediaItems.filter(item => {
        const matchesSearch = item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (item.altText && item.altText.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesType = selectedType === 'all' || item.type === selectedType;
        
        return matchesSearch && matchesType;
    });

    const handleFileUpload = async (files) => {
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'media');
                formData.append('altText', file.name);
                formData.append('description', `Uploaded on ${new Date().toLocaleDateString()}`);

                const response = await fetch('/api/media', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();

                if (response.ok) {
                    // Add the new media item to the list
                    setMediaItems(prev => [result, ...prev]);
                } else {
                    throw new Error(result.message || `Failed to upload ${file.name}`);
                }
            }

            showNotification(`${files.length} file(s) uploaded successfully!`);
        } catch (error) {
            showNotification('Error uploading files: ' + error.message, 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileInputChange = (e) => {
        handleFileUpload(Array.from(e.target.files));
        // Reset the input to allow selecting the same file again
        e.target.value = '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFileUpload(Array.from(e.dataTransfer.files));
    };

    const handleDeleteMedia = async (mediaId, publicId) => {
        if (window.confirm('Are you sure you want to delete this media item?')) {
            try {
                const response = await fetch(`/api/media?id=${mediaId}&publicId=${publicId}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (response.ok) {
                    setMediaItems(mediaItems.filter(item => item.id !== mediaId));
                    showNotification('Media item deleted successfully!');
                } else {
                    throw new Error(result.message || 'Failed to delete media item');
                }
            } catch (error) {
                showNotification('Error deleting media: ' + error.message, 'error');
            }
        }
    };

    const handleBulkDelete = () => {
        if (selectedFiles.length > 0 && window.confirm(`Are you sure you want to delete ${selectedFiles.length} media item(s)?`)) {
            selectedFiles.forEach(async (mediaId) => {
                const mediaItem = mediaItems.find(item => item.id === mediaId);
                if (mediaItem) {
                    await fetch(`/api/media?id=${mediaId}&publicId=${mediaItem.publicId}`, {
                        method: 'DELETE'
                    });
                }
            });
            
            setMediaItems(mediaItems.filter(item => !selectedFiles.includes(item.id)));
            setSelectedFiles([]);
            showNotification(`${selectedFiles.length} media item(s) deleted!`);
        }
    };

    const toggleSelectMedia = (mediaId) => {
        if (selectedFiles.includes(mediaId)) {
            setSelectedFiles(selectedFiles.filter(id => id !== mediaId));
        } else {
            setSelectedFiles([...selectedFiles, mediaId]);
        }
    };

    const selectAllMedia = () => {
        if (selectedFiles.length === filteredMedia.length) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles(filteredMedia.map(item => item.id));
        }
    };

    const getTypeIcon = (type, format) => {
        if (type === 'image') {
            return <Image className="w-8 h-8 text-blue-500" />;
        } else if (type === 'video') {
            return <Video className="w-8 h-8 text-purple-500" />;
        } else {
            return <File className="w-8 h-8 text-gray-500" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
                    notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {notification.message}
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                        variant="primary" 
                        className="flex items-center"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Files
                            </>
                        )}
                    </Button>
                    {selectedFiles.length > 0 && (
                        <Button 
                            variant="destructive" 
                            className="flex items-center"
                            onClick={handleBulkDelete}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Selected ({selectedFiles.length})
                        </Button>
                    )}
                </div>
            </div>

            {/* Upload area - Drag and drop */}
            <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-8 bg-gray-50 hover:bg-gray-100 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                    Drag and drop files here
                </p>
                <p className="text-gray-500 mb-4">
                    or click to browse files
                </p>
                <p className="text-sm text-gray-400">
                    Supports images, videos, and other file types
                </p>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    className="hidden"
                    multiple
                />
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search media..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="all">All Types</option>
                        <option value="image">Images</option>
                        <option value="video">Videos</option>
                        <option value="raw">Documents</option>
                    </select>
                </div>
            </div>

            {/* Media Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="ml-2 text-gray-600">Loading media...</p>
                </div>
            ) : (
                <>
                    {filteredMedia.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No media items found</p>
                            <p className="text-gray-400 mt-2">Upload files to get started</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center mb-4">
                                <input
                                    type="checkbox"
                                    checked={selectedFiles.length === filteredMedia.length && filteredMedia.length > 0}
                                    onChange={selectAllMedia}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    {selectedFiles.length} of {filteredMedia.length} selected
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredMedia.map((media) => (
                                    <div 
                                        key={media.id} 
                                        className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${
                                            selectedFiles.includes(media.id) ? 'border-blue-500' : 'border-transparent'
                                        }`}
                                    >
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFiles.includes(media.id)}
                                                    onChange={() => toggleSelectMedia(media.id)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <button
                                                    onClick={() => handleDeleteMedia(media.id, media.publicId)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            
                                            <div className="flex justify-center items-center h-40 mb-4">
                                                {getTypeIcon(media.type, media.format)}
                                            </div>
                                            
                                            <div className="flex justify-center mb-3">
                                                <a 
                                                    href={media.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </a>
                                            </div>
                                            
                                            <div className="text-center">
                                                <h3 className="font-medium text-gray-900 truncate" title={media.originalName}>
                                                    {media.originalName}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatFileSize(media.size)} • {media.type}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}