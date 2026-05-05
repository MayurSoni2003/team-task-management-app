const prisma = require('../config/db');

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, projectId, assignedTo } = req.body;
    const { userId } = req.user;

    // Assignment constraint via transaction
    const [membership, task] = await prisma.$transaction(async (tx) => {
      let assigneeMembership = null;
      if (assignedTo) {
        assigneeMembership = await tx.projectMember.findUnique({
          where: { userId_projectId: { userId: assignedTo, projectId } }
        });
        if (!assigneeMembership) {
          throw new Error('NOT_A_MEMBER');
        }
      }

      const newTask = await tx.task.create({
        data: {
          title,
          description,
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
          projectId,
          assignedTo,
          createdBy: userId,
        },
      });

      return [assigneeMembership, newTask];
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    if (error.message === 'NOT_A_MEMBER') {
      return res.status(400).json({ success: false, message: 'User is not a member of this project' });
    }
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/tasks?projectId=
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ success: false, message: 'projectId query parameter is required' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [tasks, totalTasks] = await prisma.$transaction([
      prisma.task.findMany({
        where: { projectId },
        take: limit,
        skip: skip,
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.task.count({ where: { projectId } })
    ]);

    res.status(200).json({ 
      success: true, 
      tasks,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalTasks / limit),
        totalTasks
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PATCH /api/tasks/:taskId
const updateTask = async (req, res) => {
  try {
    // req.task and req.projectRole are populated by taskAccess.middleware.js
    const task = req.task;
    const projectRole = req.projectRole;
    const { userId } = req.user;
    
    const { status, title, description, priority, dueDate, assignedTo } = req.body;

    const isAdmin = projectRole === 'ADMIN';
    const isAssignee = task.assignedTo === userId;

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ success: false, message: 'Forbidden - You can only update tasks assigned to you' });
    }

    const updateData = {};

    if (status) updateData.status = status;

    if (isAdmin) {
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (priority) updateData.priority = priority;
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
      if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    } else if (title || description || priority || dueDate || assignedTo) {
      return res.status(403).json({ success: false, message: 'Forbidden - Members can only update status' });
    }

    // If assigning to a new user, verify membership within transaction
    let updatedTask;
    if (updateData.assignedTo) {
      updatedTask = await prisma.$transaction(async (tx) => {
        const assigneeMembership = await tx.projectMember.findUnique({
          where: { userId_projectId: { userId: updateData.assignedTo, projectId: task.projectId } }
        });
        if (!assigneeMembership) {
          throw new Error('NOT_A_MEMBER');
        }
        return await tx.task.update({
          where: { id: task.id },
          data: updateData,
        });
      });
    } else {
      updatedTask = await prisma.task.update({
        where: { id: task.id },
        data: updateData,
      });
    }

    res.status(200).json({ success: true, task: updatedTask });
  } catch (error) {
    if (error.message === 'NOT_A_MEMBER') {
      return res.status(400).json({ success: false, message: 'User is not a member of this project' });
    }
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/tasks/:taskId
const deleteTask = async (req, res) => {
  try {
    const task = req.task;

    // We assume checkProjectRole('ADMIN') is used after taskAccessMiddleware in route definition
    // So if it gets here, they are an admin.
    
    await prisma.task.delete({ where: { id: task.id } });

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };
