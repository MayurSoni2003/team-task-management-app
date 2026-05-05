import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';

const TaskBoard = ({ projectId, role, members, onTaskChanged }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50; 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tasks?projectId=${projectId}&page=${page}&limit=${limit}`);
      setTasks(response.data.tasks);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId, page]);

  const handleTaskSaved = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    fetchTasks();
    onTaskChanged(); 
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(t => t.status === status);
  };

  if (loading && tasks.length === 0) return (
    <div className="flex justify-center py-10">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2v1m-6 4h.01M15 13h.01M10 17h.01" /></svg>
          Task Board
        </h2>
        {role === 'ADMIN' && (
          <button 
            onClick={handleCreateTask}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-semibold shadow-sm transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Add Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TO DO Column */}
        <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-200 shadow-inner flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs flex items-center">
              <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></span>
              To Do
            </h3>
            <span className="bg-white text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              {getTasksByStatus('TODO').length}
            </span>
          </div>
          <div className="flex-1 space-y-3">
            {getTasksByStatus('TODO').map(task => (
              <TaskCard key={task.id} task={task} role={role} onTaskChanged={handleTaskSaved} onEdit={handleEditTask} />
            ))}
            {getTasksByStatus('TODO').length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">No tasks</div>
            )}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-200 shadow-inner flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              In Progress
            </h3>
            <span className="bg-white text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              {getTasksByStatus('IN_PROGRESS').length}
            </span>
          </div>
          <div className="flex-1 space-y-3">
            {getTasksByStatus('IN_PROGRESS').map(task => (
              <TaskCard key={task.id} task={task} role={role} onTaskChanged={handleTaskSaved} onEdit={handleEditTask} />
            ))}
            {getTasksByStatus('IN_PROGRESS').length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">No tasks</div>
            )}
          </div>
        </div>

        {/* DONE Column */}
        <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-200 shadow-inner flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-xs flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
              Done
            </h3>
            <span className="bg-white text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
              {getTasksByStatus('DONE').length}
            </span>
          </div>
          <div className="flex-1 space-y-3">
            {getTasksByStatus('DONE').map(task => (
              <TaskCard key={task.id} task={task} role={role} onTaskChanged={handleTaskSaved} onEdit={handleEditTask} />
            ))}
            {getTasksByStatus('DONE').length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">No tasks</div>
            )}
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-slate-600 text-sm font-medium">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-slate-200 bg-white text-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
          >
            Next
          </button>
        </div>
      )}

      {isModalOpen && (
        <TaskModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          task={editingTask} 
          projectId={projectId} 
          members={members}
          onSave={handleTaskSaved} 
        />
      )}
    </div>
  );
};

export default TaskBoard;
