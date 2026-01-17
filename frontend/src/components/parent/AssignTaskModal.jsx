import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { X, User, Calendar, CheckSquare, AlertCircle } from 'lucide-react';

export default function AssignTaskModal({ isOpen, onClose, task, onSuccess }) {
  const [children, setChildren] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchChildren();
      // Set default due date from task if available
      if (task?.due_date) {
        setDueDate(task.due_date.split('T')[0]);
      }
    }
  }, [isOpen, task]);

  const fetchChildren = async () => {
    try {
      const response = await api.get('/families/members');
      const members = response.data.data || [];
      const childMembers = members.filter(m => m.role === 'child');
      setChildren(childMembers);
    } catch (err) {
      console.error('Error fetching children:', err);
      setError('Failed to load family members');
    }
  };

  const handleChildToggle = (childId) => {
    setSelectedChildren(prev => {
      if (prev.includes(childId)) {
        return prev.filter(id => id !== childId);
      } else {
        return [...prev, childId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedChildren.length === children.length) {
      setSelectedChildren([]);
    } else {
      setSelectedChildren(children.map(c => c.user_id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedChildren.length === 0) {
      setError('Please select at least one child');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Assign task to each selected child
      const assignments = selectedChildren.map(childId => ({
        task_id: task.task_id,
        assigned_to: childId,
        ...(dueDate && { due_date: dueDate }),
        ...(notes && { notes })
      }));

      // Send assignment requests
      await Promise.all(
        assignments.map(assignment =>
          api.post('/assignments', assignment)
        )
      );

      // Success
      onSuccess?.(selectedChildren.length);
      handleClose();
    } catch (err) {
      console.error('Error assigning task:', err);
      setError(err.response?.data?.message || 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedChildren([]);
    setDueDate('');
    setNotes('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign Task</h2>
            <p className="text-sm text-gray-600 mt-1">{task?.task_name}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Task Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Points:</span>
                <span className="ml-2 font-medium text-gray-900">{task?.points_reward}</span>
              </div>
              <div>
                <span className="text-gray-600">Priority:</span>
                <span className={`ml-2 font-medium capitalize ${
                  task?.priority === 'high' ? 'text-red-600' :
                  task?.priority === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {task?.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Select Children */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Select Children *
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {selectedChildren.length === children.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {children.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No children in family</p>
                <p className="text-sm mt-1">Add children to assign tasks</p>
              </div>
            ) : (
              <div className="space-y-2">
                {children.map(child => (
                  <label
                    key={child.user_id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedChildren.includes(child.user_id)
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedChildren.includes(child.user_id)}
                      onChange={() => handleChildToggle(child.user_id)}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        {child.profile_picture ? (
                          <img
                            src={child.profile_picture}
                            alt={child.full_name}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                            <span className="text-sm font-semibold text-primary-600">
                              {child.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{child.full_name}</p>
                          <p className="text-sm text-gray-600">
                            {child.total_points || 0} points • {child.active_tasks || 0} active tasks
                          </p>
                        </div>
                      </div>
                    </div>
                    {selectedChildren.includes(child.user_id) && (
                      <CheckSquare className="w-5 h-5 text-primary-600" />
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Due Date Override */}
          <div className="mb-6">
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date (Optional Override)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                id="due_date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to use task's default due date
            </p>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Any special instructions for this assignment..."
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading || selectedChildren.length === 0}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  Assign to {selectedChildren.length} {selectedChildren.length === 1 ? 'Child' : 'Children'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
