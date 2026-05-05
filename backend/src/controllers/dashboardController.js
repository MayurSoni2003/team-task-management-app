const prisma = require('../config/db');

// GET /api/dashboard/:projectId
const getDashboardStats = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { userId } = req.user;

    // Check if user is a member of the project
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } }
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: 'Forbidden - Not a member of this project' });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
    });

    const totalTasks = tasks.length;
    
    const byStatus = {
      TODO: tasks.filter(t => t.status === 'TODO').length,
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      DONE: tasks.filter(t => t.status === 'DONE').length,
    };

    const tasksPerUserMap = {};
    let overdueTasks = 0;
    const now = new Date();

    tasks.forEach(task => {
      // Overdue logic: if dueDate exists, is before now, and status is not DONE
      if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'DONE') {
        overdueTasks++;
      }

      // Tasks per user
      if (task.assignedTo) {
        tasksPerUserMap[task.assignedTo] = (tasksPerUserMap[task.assignedTo] || 0) + 1;
      }
    });

    const tasksPerUser = Object.keys(tasksPerUserMap).map(id => ({
      userId: id,
      count: tasksPerUserMap[id]
    }));

    res.status(200).json({
      success: true,
      totalTasks,
      byStatus,
      tasksPerUser,
      overdueTasks
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getDashboardStats };
