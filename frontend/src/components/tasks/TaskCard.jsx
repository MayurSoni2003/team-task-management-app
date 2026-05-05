import React, { useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const TaskCard = ({ task, role, onTaskChanged, onEdit }) => {
  const { user } = useContext(AuthContext);

  const isAdmin = role === 'ADMIN';
  const isAssignee = task.assignedTo === user?.id;
  const canUpdateStatus = isAdmin || isAssignee;

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await api.patch(`/tasks/${task.id}`, { status: newStatus });
      onTaskChanged();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      onTaskChanged();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const priorityStyles = {
    LOW: 'bg-slate-100 text-slate-600 border-slate-200',
    MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
    HIGH: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-slate-800 leading-tight">{task.title}</h4>
        {isAdmin && (
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
            <button onClick={() => onEdit(task)} className="p-1 text-slate-400 hover:text-blue-600 transition-colors rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button onClick={handleDelete} className="p-1 text-slate-400 hover:text-red-600 transition-colors rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        )}
      </div>
      
      {task.description && (
        <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}
      
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <div className="flex items-center text-xs text-slate-600 font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
          <svg className="w-3.5 h-3.5 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          {task.assignee ? task.assignee.name || task.assignee.id.substring(0,6) : 'Unassigned'}
        </div>
        
        {canUpdateStatus ? (
          <select 
            value={task.status}
            onChange={handleStatusChange}
            className="text-xs font-semibold text-slate-700 border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer shadow-sm hover:border-slate-400 transition-colors"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-slate-600">
            {task.status.replace('_', ' ')}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
