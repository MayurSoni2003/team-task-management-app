import React, { useState } from 'react';
import api from '../../services/api';

const MemberList = ({ project, role, onMemberAdded, onMemberRemoved }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [email, setEmail] = useState('');
  const [newRole, setNewRole] = useState('MEMBER');
  const [error, setError] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/projects/${project.id}/members`, { email, role: newRole });
      setEmail('');
      setIsAdding(false);
      onMemberAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/projects/${project.id}/members/${userId}`);
      onMemberRemoved();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          Team Members
        </h2>
        {role === 'ADMIN' && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors"
          >
            {isAdding ? 'Cancel' : '+ Add'}
          </button>
        )}
      </div>

      {isAdding && (
        <div className="p-4 border-b border-slate-100 bg-white">
          <form onSubmit={handleAdd} className="space-y-3">
            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
            <input
              type="email"
              placeholder="User Email"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
              Add Member
            </button>
          </form>
        </div>
      )}

      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {project.members.map(member => (
          <div key={member.userId} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs mr-3">
                {(member.user?.name || member.userId).substring(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {member.user?.name || member.userId}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{member.role} &middot; {member.user?.email}</p>
              </div>
            </div>
            {role === 'ADMIN' && member.userId !== project.createdBy && (
              <button 
                onClick={() => handleRemove(member.userId)}
                className="text-red-500 text-xs font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberList;
