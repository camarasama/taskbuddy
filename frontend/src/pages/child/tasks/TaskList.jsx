import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function EditTask() {
  return (
    <div className="p-8">
      <Link to="/parent/tasks" className="inline-flex items-center text-sm text-gray-600 mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Link>
      <h1 className="text-2xl font-bold">Edit Task - Coming Soon</h1>
    </div>
  );
}