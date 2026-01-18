import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentAPI } from '../../../services/api';
import { 
  ArrowLeft, 
  Upload, 
  Camera, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

const SubmitTask = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    photo: null,
    notes: ''
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await assignmentAPI.getById(taskId);
      setTask(response.data.assignment);
    } catch (err) {
      console.error('Failed to fetch task:', err);
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file) => {
    setError('');

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB');
      return;
    }

    setFormData({ ...formData, photo: file });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setFormData({ ...formData, photo: null });
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (task?.requires_photo && !formData.photo) {
      setError('A photo is required for this task');
      return;
    }

    try {
      setSubmitting(true);

      // Create FormData for file upload
      const submitData = new FormData();
      if (formData.photo) {
        submitData.append('photo', formData.photo);
      }
      submitData.append('notes', formData.notes);
      submitData.append('submitted_at', new Date().toISOString());

      await assignmentAPI.submit(taskId, submitData);

      setSuccess(true);

      // Show success message then redirect
      setTimeout(() => {
        navigate('/child/tasks', { 
          state: { message: 'Task submitted successfully! 🎉' }
        });
      }, 2000);

    } catch (err) {
      console.error('Submission failed:', err);
      setError(err.response?.data?.message || 'Failed to submit task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h2>
          <button
            onClick={() => navigate('/child/tasks')}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center animate-bounce-in">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Task Submitted! 🎉</h2>
          <p className="text-gray-600 mb-4">Great job! Your parent will review it soon.</p>
          <div className="text-4xl mb-4">⭐</div>
          <p className="text-gray-500 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Task Info */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Submit: {task.task_name}
            </h1>
            <p className="text-gray-600 mb-4">{task.description}</p>
            <div className="flex items-center gap-4">
              <span className="text-yellow-500 font-bold flex items-center gap-1">
                <Camera className="w-5 h-5" />
                {task.points_reward} Points
              </span>
              {task.requires_photo && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  📸 Photo Required
                </span>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload Photo {task.requires_photo && <span className="text-red-500">*</span>}
              </label>

              {!photoPreview ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-700 font-medium mb-2">
                    Drag and drop your photo here
                  </p>
                  <p className="text-gray-500 text-sm mb-4">or</p>
                  <label className="inline-block">
                    <span className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-700 transition-colors">
                      Choose File
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-400 text-xs mt-4">
                    JPG, PNG or GIF • Max 5MB
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white p-2 rounded-lg text-sm">
                    ✅ Photo ready to submit
                  </div>
                </div>
              )}
            </div>

            {/* Completion Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Completion Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes about how you completed this task..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <p className="text-gray-400 text-xs mt-2">
                {formData.notes.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || (task.requires_photo && !formData.photo)}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Task 🚀
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Helpful Tips */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl">
            <h3 className="font-semibold text-blue-900 mb-2">📝 Tips for a great submission:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Make sure your photo clearly shows the completed task</li>
              <li>• Take the photo in good lighting</li>
              <li>• Add notes to explain anything special you did</li>
              <li>• Double-check everything before submitting!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitTask;
