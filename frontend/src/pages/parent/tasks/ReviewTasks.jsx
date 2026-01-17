import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Award,
  Image as ImageIcon,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';

const SubmissionCard = ({ submission, onApprove, onReject }) => {
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    setProcessing(true);
    await onApprove(submission.assignment_id);
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      alert('Please provide feedback for rejection');
      return;
    }
    setProcessing(true);
    await onReject(submission.assignment_id, feedback);
    setProcessing(false);
    setShowRejectModal(false);
    setFeedback('');
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {submission.task_name}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <User className="w-4 h-4 mr-1" />
              {submission.child_name}
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </span>
        </div>

        {/* Task Details */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            Submitted: {new Date(submission.completed_at).toLocaleString()}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Award className="w-4 h-4 mr-2" />
            Points: {submission.points_reward}
          </div>
        </div>

        {/* Submission Note */}
        {submission.submission_note && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Submission Note:</p>
            <p className="text-sm text-gray-600">{submission.submission_note}</p>
          </div>
        )}

        {/* Photo */}
        {submission.photo_url && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Submitted Photo:</p>
            <div 
              onClick={() => setShowPhotoModal(true)}
              className="relative cursor-pointer group"
            >
              <img
                src={submission.photo_url}
                alt="Task submission"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleApprove}
            disabled={processing}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={processing}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </button>
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPhotoModal(false)}
        >
          <div className="max-w-4xl w-full">
            <img
              src={submission.photo_url}
              alt="Task submission full"
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowPhotoModal(false)}
              className="mt-4 w-full px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reject Submission</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide feedback explaining why this submission is being rejected:
            </p>
            
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="E.g., The room needs to be cleaner, please organize the toys..."
            />

            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleReject}
                disabled={processing || !feedback.trim()}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Rejecting...' : 'Reject & Send Feedback'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setFeedback('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function ReviewTasks() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assignments/pending');
      setSubmissions(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending submissions:', err);
      setError('Failed to load pending submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (assignmentId) => {
    try {
      await api.put(`/assignments/${assignmentId}/approve`);
      
      // Remove from list
      setSubmissions(prev => prev.filter(s => s.assignment_id !== assignmentId));
      
      setSuccessMessage('Task approved! Points awarded to child.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error approving submission:', err);
      alert(err.response?.data?.message || 'Failed to approve submission');
    }
  };

  const handleReject = async (assignmentId, feedback) => {
    try {
      await api.put(`/assignments/${assignmentId}/reject`, {
        rejection_reason: feedback
      });
      
      // Remove from list
      setSubmissions(prev => prev.filter(s => s.assignment_id !== assignmentId));
      
      setSuccessMessage('Task rejected. Feedback sent to child.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error rejecting submission:', err);
      alert(err.response?.data?.message || 'Failed to reject submission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/parent/tasks"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Tasks
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Review Task Submissions</h1>
        <p className="text-gray-600 mt-2">
          Approve or reject completed tasks from your children
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{submissions.length}</p>
            <p className="text-sm text-gray-600">Pending Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">
              {submissions.reduce((sum, s) => sum + (s.points_reward || 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Total Points at Stake</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {new Set(submissions.map(s => s.child_id)).size}
            </p>
            <p className="text-sm text-gray-600">Children Waiting</p>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600 mb-6">
            No pending task submissions to review at the moment.
          </p>
          <Link
            to="/parent/tasks"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Back to Tasks
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {submissions.map(submission => (
            <SubmissionCard
              key={submission.assignment_id}
              submission={submission}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {/* Quick Tips */}
      {submissions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Review Tips</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Click on photos to view them in full size</li>
            <li>• Provide specific feedback when rejecting to help children improve</li>
            <li>• Approved tasks award points immediately</li>
            <li>• Rejected tasks can be resubmitted by children</li>
          </ul>
        </div>
      )}
    </div>
  );
}
