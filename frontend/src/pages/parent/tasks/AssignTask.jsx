import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../services/api';
import {
  ArrowLeft,
  Users,
  UserCheck,
  UserX,
  Save,
  AlertCircle,
  Award,
  Calendar,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

export default function AssignTask() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [children, setChildren] = useState([]);
  const [existingAssignments, setExistingAssignments] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [taskId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📤 Fetching task and children data...');
      
      // Fetch task details
      const taskRes = await api.get(`/tasks/${taskId}`);
      const taskData = taskRes.data.data?.task || taskRes.data.data || taskRes.data;
      
      console.log('✅ Task loaded:', taskData);
      setTask(taskData);
      
      // Fetch user's family
      const familiesRes = await api.get('/families');
      const families = familiesRes.data.data?.families || familiesRes.data.data || [];
      
      if (families.length === 0) {
        setError('No family found. Please create a family first.');
        return;
      }
      
      const familyId = families[0].family_id;
      
      // Fetch family members (children only)
      const membersRes = await api.get(`/families/${familyId}/members`);
      const members = membersRes.data.data?.members || membersRes.data.data || [];
      
      // Filter only children
      const childrenOnly = members.filter(member => member.role === 'child');
      
      console.log('✅ Children loaded:', childrenOnly.length);
      setChildren(childrenOnly);
      
      // Fetch existing assignments
      try {
        const assignmentsRes = await api.get(`/tasks/${taskId}/assignments`);
        const assignments = assignmentsRes.data.data?.assignments || 
                           assignmentsRes.data.data || 
                           assignmentsRes.data.assignments || 
                           [];
        
        console.log('✅ Existing assignments:', assignments.length);
        setExistingAssignments(assignments);
        
        // Pre-select already assigned children
        const assignedChildIds = assignments.map(a => a.child_id || a.user_id).filter(Boolean);
        setSelectedChildren(assignedChildIds);
      } catch (err) {
        console.warn('No existing assignments or error:', err);
        setExistingAssignments([]);
      }
      
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChild = (childId) => {
    setSelectedChildren(prev => {
      if (prev.includes(childId)) {
        return prev.filter(id => id !== childId);
      } else {
        return [...prev, childId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedChildren.length === 0) {
      alert('Please select at least one child to assign this task to.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      console.log('📤 Assigning task to children:', selectedChildren);
      
      // Assign task to selected children
      const payload = {
        child_ids: selectedChildren
      };
      
      await api.post(`/tasks/${taskId}/assign`, payload);
      
      console.log('✅ Task assigned successfully');
      
      navigate(`/parent/tasks/${taskId}`, {
        state: { message: 'Task assigned successfully!' }
      });
      
    } catch (err) {
      console.error('❌ Error assigning task:', err);
      setError(err.response?.data?.message || 'Failed to assign task');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !task) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchData}
              className="text-sm underline mt-1 hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
        <Link
          to="/parent/tasks"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Tasks
        </Link>
      </div>
    );
  }

  const isChildAssigned = (childId) => {
    return existingAssignments.some(a => (a.child_id || a.user_id) === childId);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          to={`/parent/tasks/${taskId}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Task Details
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Assign Task</h1>
        <p className="text-gray-600 mt-2">Select which children should complete this task</p>
      </div>

      {/* Task Summary Card */}
      {task && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            {task.title || task.task_name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center text-gray-700">
              <Award className="w-4 h-4 mr-2 text-primary-600" />
              <span><strong>{task.points_reward}</strong> points reward</span>
            </div>
            {task.deadline && (
              <div className="flex items-center text-gray-700">
                <Calendar className="w-4 h-4 mr-2 text-primary-600" />
                <span>Due: {new Date(task.deadline).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assignment Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          {/* Children List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Select Children
            </h3>

            {children.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <UserX className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No children in your family yet</p>
                <Link
                  to="/parent/family/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Add Child
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {children.map(child => {
                  const childId = child.user_id || child.child_id;
                  const isSelected = selectedChildren.includes(childId);
                  const alreadyAssigned = isChildAssigned(childId);
                  
                  return (
                    <div
                      key={childId}
                      className={`flex items-center p-4 rounded-lg border-2 transition-colors ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`child-${childId}`}
                        checked={isSelected}
                        onChange={() => handleToggleChild(childId)}
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label
                        htmlFor={`child-${childId}`}
                        className="ml-3 flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {child.full_name || child.name || 'Unknown'}
                            </p>
                            {child.email && (
                              <p className="text-sm text-gray-500">{child.email}</p>
                            )}
                          </div>
                          {alreadyAssigned && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Already Assigned
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selection Summary */}
          {children.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <UserCheck className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    {selectedChildren.length} {selectedChildren.length === 1 ? 'child' : 'children'} selected
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {selectedChildren.length === 0 
                      ? 'Please select at least one child to assign this task'
                      : `This task will be assigned to the selected ${selectedChildren.length === 1 ? 'child' : 'children'}`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving || selectedChildren.length === 0 || children.length === 0}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Assign Task
                </>
              )}
            </button>
            <Link
              to={`/parent/tasks/${taskId}`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 Assignment Tips</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• You can assign the same task to multiple children</li>
          <li>• Each child will track their progress independently</li>
          <li>• Children already assigned are marked with a green badge</li>
          <li>• You can add more children to this task later</li>
          <li>• Children will receive a notification when assigned</li>
        </ul>
      </div>
    </div>
  );
}
