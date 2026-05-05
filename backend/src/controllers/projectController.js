const prisma = require('../config/db');

// POST /api/projects
const createProject = async (req, res) => {
  try {
    const { name } = req.body;
    const { userId } = req.user;

    // Use Prisma transaction to ensure both project and member are created or neither
    const [project] = await prisma.$transaction([
      prisma.project.create({
        data: {
          name,
          createdBy: userId,
          members: {
            create: {
              userId,
              role: 'ADMIN',
            },
          },
        },
        include: { members: true },
      }),
    ]);

    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/projects
const getProjects = async (req, res) => {
  try {
    const { userId } = req.user;

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
      },
    });

    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/projects/:projectId/members
const addMember = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { email, role } = req.body;

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: userToAdd.id,
          projectId,
        },
      },
    });

    if (existingMember) {
      return res.status(400).json({ success: false, message: 'User is already a member' });
    }

    const newMember = await prisma.projectMember.create({
      data: {
        userId: userToAdd.id,
        projectId,
        role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
      },
    });

    res.status(201).json({ success: true, member: newMember });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/projects/:projectId/members/:userId
const removeMember = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { userId } = req.params;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.createdBy === userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove the project creator' });
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!existingMember) {
      return res.status(404).json({ success: false, message: 'Member not found in project' });
    }

    await prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    res.status(200).json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { createProject, getProjects, addMember, removeMember };
