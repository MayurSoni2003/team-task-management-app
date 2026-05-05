const express = require('express');
const { createProject, getProjects, addMember, removeMember } = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkProjectRole = require('../middlewares/roleCheck');
const validate = require('../middlewares/validate.middleware');
const { createProjectSchema } = require('../utils/validators');

const router = express.Router();

// Apply auth middleware to all project routes
router.use(authMiddleware);

router.post('/', validate(createProjectSchema), createProject);
router.get('/', getProjects);

// Admin-only routes
router.post('/:projectId/members', checkProjectRole('ADMIN'), addMember);
router.delete('/:projectId/members/:userId', checkProjectRole('ADMIN'), removeMember);

module.exports = router;
