const express = require('express');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkProjectRole = require('../middlewares/roleCheck');
const taskAccessMiddleware = require('../middlewares/taskAccess.middleware');
const validate = require('../middlewares/validate.middleware');
const { createTaskSchema, updateTaskSchema } = require('../utils/validators');

const router = express.Router();

router.use(authMiddleware);

router.post('/', validate(createTaskSchema), checkProjectRole('ADMIN'), createTask);
router.get('/', getTasks); 

router.patch('/:taskId', validate(updateTaskSchema), taskAccessMiddleware, updateTask);
router.delete('/:taskId', taskAccessMiddleware, checkProjectRole('ADMIN'), deleteTask); 

module.exports = router;
