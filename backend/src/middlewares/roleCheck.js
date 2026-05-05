const prisma = require('../config/db');

const checkProjectRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const { userId } = req.user;
      // Project ID can come from params or body
      const projectId = req.params.projectId || req.params.id || req.body.projectId;

      if (!projectId) {
        return res.status(400).json({ success: false, message: 'Project ID is required' });
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({ success: false, message: 'Forbidden - Not a member of this project' });
      }

      if (requiredRole === 'ADMIN' && membership.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden - Admin access required' });
      }

      // If they need MEMBER access, being ADMIN also works (handled implicitly as any membership satisfies 'MEMBER' if ADMIN check passes above)
      req.projectRole = membership.role;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
};

module.exports = checkProjectRole;
