import { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';

/**
 * AvatarUpload Component
 * Handles avatar image upload with preview
 * 
 * @param {Object} props
 * @param {string} props.currentAvatar - Current avatar URL
 * @param {Function} props.onUpload - Callback when image is selected
 * @param {Function} props.onDelete - Callback when avatar is deleted
 * @param {string} props.size - Size variant ('sm', 'md', 'lg')
 */
export default function AvatarUpload({ 
  currentAvatar, 
  onUpload, 
  onDelete,
  size = 'lg'
}) {
  const [preview, setPreview] = useState(currentAvatar || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Call upload callback
    if (onUpload) {
      onUpload(file);
    }
  };

  const handleDelete = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onDelete) {
      onDelete();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar Display */}
      <div className="relative group">
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg`}>
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-100">
              <User className={`${iconSizes[size]} text-primary-600`} />
            </div>
          )}
        </div>

        {/* Overlay Buttons */}
        <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
            <button
              onClick={handleClick}
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
              title="Change avatar"
            >
              <Camera className="w-5 h-5 text-gray-700" />
            </button>

            {preview && (
              <button
                onClick={handleDelete}
                className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                title="Remove avatar"
              >
                <X className="w-5 h-5 text-red-600" />
              </button>
            )}
          </div>
        </div>

        {/* Upload Indicator */}
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button */}
      <button
        onClick={handleClick}
        disabled={uploading}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        <Upload className="w-4 h-4 mr-2" />
        {preview ? 'Change Photo' : 'Upload Photo'}
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center">
        JPG, PNG or GIF. Max size 5MB.
      </p>
    </div>
  );
}

/**
 * Example Usage:
 * 
 * <AvatarUpload
 *   currentAvatar={user.avatar_url}
 *   onUpload={(file) => handleAvatarUpload(file)}
 *   onDelete={() => handleAvatarDelete()}
 *   size="lg"
 * />
 */
