import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { assignmentAPI } from '../../../services/api';
import { 
  ArrowLeft, 
  Star, 
  Calendar, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  User,
  Flag
} from 'lucide-react';

const TaskDetails = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await assignmentAPI.getById(taskId);
      setTask(response.data.assignment);
    } catch (error) {
      console.error('Failed to fetch task:', error);
      setError('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Task Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'This task does not exist'}</p>
          <Link 
            to="/child/tasks"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  const daysUntilDue = Math.ceil(
    (new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysUntilDue < 0;
  const canSubmit = task.status === 'pending';
  const isSubmitted = task.status === 'submitted';
  const isCompleted = task.status === 'completed';
  const isRejected = task.status === 'rejected';

  const getStatusBadge = () => {
    if (isCompleted) {
      return {
        text: 'Completed ✓',
        color: 'bg-green-100 text-green-700 border-green-500',
        icon: CheckCircle
      };
    }
    if (isSubmitted) {
      return {
        text: 'Waiting for Review',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-500',
        icon: Clock
      };
    }
    if (isRejected) {
      return {
        text: 'Needs Improvement',
        color: 'bg-red-100 text-red-700 border-red-500',
        icon: AlertCircle
      };
    }
    if (isOverdue) {
      return {
        text: 'Overdue',
        color: 'bg-red-100 text-red-700 border-red-500',
        icon: AlertCircle
      };
    }
    return {
      text: 'To Do',
      color: 'bg-blue-100 text-blue-700 border-blue-500',
      icon: Calendar
    };
  };

  const getPriorityColor = () => {
    switch (task.priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Tasks
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color} bg-white/90`}>
                    <StatusIcon className="w-4 h-4" />
                    {statusBadge.text}
                  </span>
                  {task.priority && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor()}`}>
                      <Flag className="w-3 h-3 inline mr-1" />
                      {task.priority.toUpperCase()}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-3">
                  {task.task_name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <span className="flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5" fill="white" />
                    <strong>{task.points_reward}</strong> Points
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Due: {new Date(task.due_date).toLocaleDateString()}
                    {!isOverdue && daysUntilDue >= 0 && (
                      <span className="text-sm">
                        ({daysUntilDue === 0 ? 'Today' : `${daysUntilDue} days`})
                      </span>
                    )}
                  </span>
                </div>
              </div>
              
              {task.requires_photo && (
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  <span className="font-medium">Photo Required</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Overdue Warning */}
            {isOverdue && canSubmit && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">This task is overdue!</p>
                    <p className="text-red-700 text-sm">
                      Complete it as soon as possible to avoid losing points.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection Feedback */}
            {isRejected && task.feedback && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900 mb-2">
                      💬 Feedback from Parent:
                    </p>
                    <p className="text-red-800">{task.feedback}</p>
                    <p className="text-red-600 text-sm mt-2">
                      Please make improvements and resubmit.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                📋 Task Description
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {task.description}
              </p>
            </div>

            {/* Parent Notes */}
            {task.parent_notes && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">
                  📝 Parent's Instructions:
                </h3>
                <p className="text-blue-800 whitespace-pre-line">
                  {task.parent_notes}
                </p>
              </div>
            )}

            {/* Task Info Grid */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <InfoCard
                icon={Calendar}
                label="Assigned Date"
                value={new Date(task.created_at).toLocaleDateString()}
              />
              <InfoCard
                icon={User}
                label="Category"
                value={task.category || 'General'}
              />
              <InfoCard
                icon={Clock}
                label="Status"
                value={task.status}
                valueClass="capitalize"
              />
            </div>

            {/* Submission Info (if submitted) */}
            {(isSubmitted || isCompleted) && task.submitted_at && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-3">
                  📤 Your Submission
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Submitted:</strong>{' '}
                    {new Date(task.submitted_at).toLocaleString()}
                  </p>
                  {task.submission_notes && (
                    <p>
                      <strong>Your Notes:</strong> {task.submission_notes}
                    </p>
                  )}
                  {task.submission_photo && (
                    <div className="mt-3">
                      <strong className="block mb-2">Photo Proof:</strong>
                      <img
                        src={task.submission_photo}
                        alt="Task submission"
                        className="w-full max-w-md rounded-lg shadow"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Completion Info (if completed) */}
            {isCompleted && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900 mb-2">
                      🎉 Task Completed!
                    </p>
                    <p className="text-green-800 text-sm mb-2">
                      You earned <strong>{task.points_reward} points</strong>!
                    </p>
                    {task.approved_at && (
                      <p className="text-green-700 text-xs">
                        Approved on: {new Date(task.approved_at).toLocaleString()}
                      </p>
                    )}
                    {task.feedback && (
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="font-medium text-green-900 mb-1">
                          💬 Parent's Feedback:
                        </p>
                        <p className="text-green-800">{task.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Waiting for Review */}
            {isSubmitted && (
              <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded text-center">
                <Clock className="w-12 h-12 mx-auto text-yellow-600 mb-2" />
                <p className="font-semibold text-yellow-900 mb-1">
                  Waiting for Parent Review
                </p>
                <p className="text-yellow-700 text-sm">
                  Your parent will review your submission soon!
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {canSubmit && (
                <Link
                  to={`/child/tasks/${taskId}/submit`}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-center hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Submit This Task 🚀
                </Link>
              )}

              {isRejected && (
                <Link
                  to={`/child/tasks/${taskId}/submit`}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold text-center hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Resubmit Task 🔄
                </Link>
              )}

              {(isSubmitted || isCompleted) && (
                <Link
                  to="/child/tasks"
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-center hover:bg-gray-50 transition-colors"
                >
                  Back to Tasks
                </Link>
              )}
            </div>

            {/* Helpful Tips for Pending Tasks */}
            {canSubmit && (
              <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                <h3 className="font-semibold text-purple-900 mb-2">
                  💡 Tips for Success:
                </h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Read the description carefully</li>
                  <li>• Follow parent's instructions</li>
                  {task.requires_photo && (
                    <li>• Take a clear photo showing the completed task</li>
                  )}
                  <li>• Double-check your work before submitting</li>
                  <li>• Add notes to explain what you did</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component
const InfoCard = ({ icon: Icon, label, value, valueClass = '' }) => (
  <div className="p-4 bg-gray-50 rounded-xl">
    <div className="flex items-center gap-2 text-gray-600 mb-2">
      <Icon className="w-4 h-4" />
      <p className="text-sm font-medium">{label}</p>
    </div>
    <p className={`text-gray-900 font-semibold ${valueClass}`}>{value}</p>
  </div>
);

export default TaskDetails;
