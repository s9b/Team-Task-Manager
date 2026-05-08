const router = require('express').Router();
const { body } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const { createTask, getMyTasks, getProjectTasks, updateTask, deleteTask } = require('../controllers/taskController');

const taskCreateRules = [
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }).withMessage('Title max 200 chars'),
  body('projectId').notEmpty().withMessage('Project ID is required'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid date'),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']).withMessage('Invalid status'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority'),
];

const taskUpdateRules = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }).withMessage('Title max 200 chars'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Due date must be a valid date'),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']).withMessage('Invalid status'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority'),
];

router.post('/', authenticate, taskCreateRules, createTask);
router.get('/', authenticate, getMyTasks);
router.get('/project/:projectId', authenticate, getProjectTasks);
router.put('/:id', authenticate, taskUpdateRules, updateTask);
router.delete('/:id', authenticate, deleteTask);

module.exports = router;
