import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import MemberList from '../components/projects/MemberList';
import TaskBoard from '../components/tasks/TaskBoard';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { user } = useContext(AuthContext);
  
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('MEMBER');

  const fetchData = async () => {
    try {
      setLoading(true);
      const statsRes = await api.get(`/dashboard/${projectId}`);
      setStats(statsRes.data);

      const projRes = await api.get('/projects');
      const currentProject = projRes.data.projects.find(p => p.id === projectId);
      if (currentProject) {
        setProject(currentProject);
        const membership = currentProject.members.find(m => m.userId === user.id);
        if (membership) {
          setRole(membership.role);
        }
      }
    } catch (err) {
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId, user.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) return <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg m-4">{error}</div>;
  if (!project) return <div className="text-center py-20 text-slate-500">Project not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Navigation Breadcrumb */}
      <div className="mb-6">
        <Link to="/projects" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Back to Projects
        </Link>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{project.name}</h1>
          <div className="flex items-center space-x-3 text-sm">
            <span className={`px-2.5 py-1 rounded-full font-semibold text-xs ${role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
              Role: {role}
            </span>
            <span className="text-slate-500 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Created by {project.createdBy === user.id ? 'you' : 'another user'}
            </span>
          </div>
        </div>
        
        {/* Quick Stats Summary in Header */}
        {stats && (
          <div className="flex space-x-6 text-center">
            <div>
              <p className="text-3xl font-bold text-slate-800">{stats.totalTasks}</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Tasks</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600">{stats.overdueTasks}</p>
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mt-1">Overdue</p>
            </div>
          </div>
        )}
      </div>

      {/* Dashboard Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">To Do</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.byStatus.TODO}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-full text-yellow-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.byStatus.IN_PROGRESS}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full text-blue-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Done</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.byStatus.DONE}</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-full text-emerald-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Task Board */}
        <div className="lg:col-span-3">
          <TaskBoard 
            projectId={project.id} 
            role={role} 
            members={project.members}
            onTaskChanged={fetchData} 
          />
        </div>

        {/* Right Column: Members List */}
        <div className="lg:col-span-1">
          <MemberList 
            project={project} 
            role={role} 
            onMemberAdded={fetchData} 
            onMemberRemoved={fetchData} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
