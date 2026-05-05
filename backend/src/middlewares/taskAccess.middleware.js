const prisma = require('../config/db');

const taskAccessMiddleware = async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const { userId } = req.user;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const membership = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: task.projectId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: 'Forbidden - Not a member of this project' });
    }

    req.task = task;
    req.projectRole = membership.role;
    
    next();
  } catch (error) {
    console.error('Task access error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = taskAccessMiddleware;
